import { CalculationInput, CalculationResult, VehicleOption } from '../types/logistics';
import { VEHICLE_OPTIONS, BASE_DIESEL_PRICE, MIN_KM_THRESHOLD, RETENTION_FEES_BY_WEIGHT } from '../data/pricingData';
import { detectDirectionAndConnection } from '../data/provinces';

export function calculateFreightPrice(input: CalculationInput, customVehicles?: VehicleOption[]): CalculationResult {
  const vehicleList = customVehicles || VEHICLE_OPTIONS;
  const vehicle = vehicleList.find((v) => v.id === input.vehicleId) || vehicleList[0];

  const km = Math.max(0, Number(input.km) || 0);
  const baseDiesel = input.baseDieselPrice || BASE_DIESEL_PRICE;
  const currentDiesel = Math.max(0, Number(input.currentDieselPrice) || BASE_DIESEL_PRICE);

  // 1. Phân loại tuyến đường chính xác:
  // - CHỈ CÓ từ Nam ra Bắc, hoặc Bắc vào Nam thì mới sử dụng đơn giá Bắc - Nam
  // - Còn từ Bắc vào Trung, Trung vào Nam, Nam ra Trung, Trung ra Bắc, nội miền thì là ĐƠN GIÁ CẬN VÙNG / NỘI VÙNG
  const routeInfo = detectDirectionAndConnection(input.fromProvinceId, input.toProvinceId);
  const isNorthSouth = routeInfo.isNorthSouthRoute;
  const routeType = routeInfo.routeType;
  const routeDescription = routeInfo.routeDescription;

  // 2. Tra cứu ĐƠN GIÁ CƠ SỞ G0 ĐÚNG theo bảng Phụ lục 2
  let baseSelectedRateG0: number;

  if (isNorthSouth) {
    // Tuyến Trục Bắc - Nam:
    if (input.direction === 'chieu_ra') {
      baseSelectedRateG0 = vehicle.northSouthOutG0; // Cột Bắc - Nam Chiều ra
    } else if (input.direction === 'chieu_vao') {
      baseSelectedRateG0 = vehicle.northSouthInG0; // Cột Bắc - Nam Chiều Vào
    } else {
      baseSelectedRateG0 = vehicle.northSouthTwoWayG0 || Math.round((vehicle.northSouthOutG0 + vehicle.northSouthInG0) / 2); // Cột Bắc - Nam Hai chiều
    }
  } else {
    // Tuyến Cận Vùng / Nội Vùng (Bắc-Trung, Trung-Nam, Nam-Trung, Trung-Bắc, nội miền):
    if (input.direction === 'chieu_ra') {
      baseSelectedRateG0 = vehicle.nearRegionOutG0; // Cột Đơn giá chiều đi
    } else if (input.direction === 'chieu_vao') {
      baseSelectedRateG0 = vehicle.nearRegionInG0; // Cột Đơn giá chiều về
    } else {
      baseSelectedRateG0 = vehicle.nearRegionTwoWayG0; // Cột Giá hai chiều
    }
  }

  // 3. Tỷ lệ tăng giảm giá dầu PVOIL so với giá vốn mốc cơ sở (21.860đ)
  const dieselDiffRatio = (currentDiesel - baseDiesel) / baseDiesel;

  // 4. Hệ số bù giá nhiên liệu k theo đúng Phụ lục 2:
  // < 8000kg: k = 0.25
  // 8001 - 18000kg: k = 0.30
  // > 18000kg: k = 0.40
  const effectiveOilFactorK = input.oilFactorOverride !== undefined ? input.oilFactorOverride : vehicle.oilFactorK;

  // Tỷ lệ điều chỉnh cước = k * Tỷ lệ tăng giảm dầu
  const oilAdjustmentRate = effectiveOilFactorK * dieselDiffRatio;

  // 5. Đơn giá G1 và Giá tối thiểu G1 sau điều chỉnh dầu PVOIL
  // Công thức: G1 = G0 * (1 + k * delta)
  const baseMinPriceG0 = vehicle.minPriceG0;
  const adjustedMinPriceG1 = Math.round(baseMinPriceG0 * (1 + oilAdjustmentRate));
  const adjustedSelectedRateG1 = Math.round(baseSelectedRateG0 * (1 + oilAdjustmentRate));

  // 6. Xét cự ly km (quy tắc dưới 75km sử dụng giá tối thiểu)
  const isUnder75Km = km <= MIN_KM_THRESHOLD;

  // Tính tiền cước thuần theo km * đơn giá G1
  const calculatedDistanceCharge = Math.round(km * adjustedSelectedRateG1);

  // Áp dụng giá tối thiểu: dưới 75km hoặc khi cước theo km nhỏ hơn min price
  let appliedDistanceCharge: number;
  if (isUnder75Km) {
    appliedDistanceCharge = adjustedMinPriceG1;
  } else {
    appliedDistanceCharge = Math.max(calculatedDistanceCharge, adjustedMinPriceG1);
  }

  const directionFactor = 1.0;
  const directionCharge = appliedDistanceCharge;

  // 7. Chi phí chạy lạnh (nếu là xe lạnh)
  // Công thức trong sheet: CP Chạy lạnh = Giá xăng dầu * định mức máy lạnh * thời gian chạy lạnh
  let coolingCost = 0;
  if (vehicle.category === 'truck_reefer') {
    const hours = Math.max(0, Number(input.coolingHours) || 0);
    const fuelRate = vehicle.coolingFuelPerHour || 2.5; // lít/giờ
    coolingCost = Math.round(currentDiesel * fuelRate * hours);
  }

  // 8. Phí lưu ca xe theo định mức Phụ lục 2
  let retentionCost = 0;
  const days = Math.max(0, Number(input.retentionDays) || 0);
  if (days > 0) {
    const feeTier = RETENTION_FEES_BY_WEIGHT.find((t) => vehicle.tonnageKg <= t.maxTonnageKg) || RETENTION_FEES_BY_WEIGHT[RETENTION_FEES_BY_WEIGHT.length - 1];
    if (days >= feeTier.standardDays) {
      const extraDays = days - feeTier.standardDays + 1;
      if (extraDays >= 3) {
        retentionCost = Math.round(extraDays * feeTier.extendedFeePerDay);
      } else {
        retentionCost = Math.round(extraDays * feeTier.standardFeePerDay);
      }
    }
  }

  // 9. Tổng cước trước VAT
  const subtotalBeforeVat = Math.round(directionCharge + coolingCost + retentionCost);

  // 10. Thuế VAT
  const vatRate = Number(input.vatRate) || 0;
  const vatAmount = Math.round(subtotalBeforeVat * (vatRate / 100));
  const totalWithVat = Math.round(subtotalBeforeVat + vatAmount);

  // 11. Đơn giá bình quân thực tế mỗi km
  const unitPricePerKmEffective = km > 0 ? Math.round(subtotalBeforeVat / km) : 0;

  let summaryText = '';
  if (isUnder75Km) {
    summaryText = `Cự ly ${km}km (≤ ${MIN_KM_THRESHOLD}km): Áp dụng Giá tối thiểu ${formatCurrency(adjustedMinPriceG1)} (đơn giá chuẩn ${formatCurrency(adjustedSelectedRateG1)}/km).`;
  } else {
    summaryText = `Cự ly ${km}km (> ${MIN_KM_THRESHOLD}km): Tính theo đơn giá ${formatCurrency(adjustedSelectedRateG1)}/km x ${km}km = ${formatCurrency(calculatedDistanceCharge)}.`;
  }

  return {
    vehicle,
    km,
    isUnder75Km,
    baseDieselPrice: baseDiesel,
    currentDieselPrice: currentDiesel,
    dieselDiffRatio,
    effectiveOilFactorK,
    oilAdjustmentRate,
    routeType,
    routeDescription,
    isNorthSouthRoute: isNorthSouth,
    baseMinPriceG0,
    baseSelectedRateG0,
    adjustedMinPriceG1,
    adjustedSelectedRateG1,
    calculatedDistanceCharge,
    appliedDistanceCharge,
    directionFactor,
    directionCharge,
    coolingCost,
    retentionCost,
    subtotalBeforeVat,
    vatAmount,
    totalWithVat,
    unitPricePerKmEffective,
    summaryText,
  };
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded) + ' ₫';
}

export function formatNumber(val: number, maxFraction = 2): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: maxFraction,
  }).format(val);
}
