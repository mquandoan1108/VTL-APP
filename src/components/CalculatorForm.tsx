import React, { useState, useId } from 'react';
import {
  Truck,
  Snowflake,
  MapPin,
  Compass,
  Clock,
  Calendar,
  Percent,
  Search,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Info,
  Check,
  Users,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  VehicleCategory,
  ConnectionType,
  ConnectionDirection,
  ConnectionCategory,
  CalculationInput,
  VehicleOption,
} from '../types/logistics';
import {
  VEHICLE_OPTIONS,
  MIN_KM_THRESHOLD,
  BASE_DIESEL_PRICE,
  getVehiclesByFilters,
} from '../data/pricingData';
import { VIETNAM_PROVINCES, detectDirectionAndConnection } from '../data/provinces';
import { formatCurrency, formatNumber } from '../utils/calculator';

interface CalculatorFormProps {
  input: CalculationInput;
  onChange: (input: CalculationInput) => void;
  currentDieselPrice: number;
  vehicles?: VehicleOption[];
  onOpenPhuLucModal?: (category?: VehicleCategory) => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  input,
  onChange,
  currentDieselPrice,
  vehicles,
  onOpenPhuLucModal,
}) => {
  const fromSelectId = useId();
  const toSelectId = useId();
  const vehicleSelectId = useId();
  const kmInputId = useId();
  const coolingHoursInputId = useId();
  const retentionDaysInputId = useId();

  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const effectiveVehicles = vehicles || VEHICLE_OPTIONS;

  // Tỉnh đi & đến
  const fromProvince = VIETNAM_PROVINCES.find((p) => p.id === input.fromProvinceId) || VIETNAM_PROVINCES[0];
  const toProvince = VIETNAM_PROVINCES.find((p) => p.id === input.toProvinceId) || VIETNAM_PROVINCES[0];

  // Tuyến đường & phân loại Bắc Nam vs Cận Vùng
  const routeInfo = detectDirectionAndConnection(input.fromProvinceId, input.toProvinceId);
  const isNorthSouth = routeInfo.isNorthSouthRoute;

  // Xác định Loại hình kết nối hiện hành: ưu tiên input.connectionCategory, nếu chưa có thì lấy theo xe hiện tại hoặc routeInfo
  const currentVehicle =
    effectiveVehicles.find((v) => v.id === input.vehicleId) ||
    effectiveVehicles.find((v) => v.category === input.vehicleCategory) ||
    effectiveVehicles[0];

  const activeConnectionCategory: ConnectionCategory =
    input.connectionCategory || currentVehicle.connectionCategory || (isNorthSouth ? 'bac_nam_can_vung' : 'noi_vung_noi_tinh');

  const activeDriverCount = input.driverCount || currentVehicle.driverCount || 2;
  const isReeferCoolingOff = Boolean(input.isReeferCoolingOff || currentVehicle.specialType === 'ngat_lanh');

  // Lọc phương tiện phù hợp theo 4 tiêu chí
  const availableVehicles = getVehiclesByFilters(
    effectiveVehicles,
    input.vehicleCategory,
    activeConnectionCategory,
    activeDriverCount,
    isReeferCoolingOff
  );

  // Đảm bảo xe đã chọn thuộc danh sách khả dụng
  const selectedVehicle =
    availableVehicles.find((v) => v.id === input.vehicleId) ||
    availableVehicles[0] ||
    currentVehicle;

  // Xác định đơn giá G0 tương ứng theo bảng giá Phụ lục 1 / Phụ lục 2
  let currentRateG0 = 0;
  let columnNameInSheet = '';

  if (activeConnectionCategory === 'bac_nam_can_vung' || isNorthSouth) {
    if (input.direction === 'chieu_ra') {
      currentRateG0 = selectedVehicle.northSouthOutG0;
      columnNameInSheet = input.vehicleCategory === 'truck_dry' ? 'Bắc - Nam Chiều ra' : 'Bắc - Nam Chiều ra';
    } else if (input.direction === 'chieu_vao') {
      currentRateG0 = selectedVehicle.northSouthInG0;
      columnNameInSheet = input.vehicleCategory === 'truck_dry' ? 'Bắc - Nam Chiều vào' : 'Bắc - Nam Chiều Vào';
    } else {
      currentRateG0 =
        selectedVehicle.northSouthTwoWayG0 > 0
          ? selectedVehicle.northSouthTwoWayG0
          : Math.round((selectedVehicle.northSouthOutG0 + selectedVehicle.northSouthInG0) / 2);
      columnNameInSheet = 'Bắc - Nam Hai chiều';
    }
  } else {
    // Nội Vùng, Nội Tỉnh (Bao gồm Bắc-Bắc, Trung-Trung, Nam-Nam)
    if (input.direction === 'chieu_ra') {
      currentRateG0 = selectedVehicle.nearRegionOutG0;
      columnNameInSheet = 'Đơn giá chiều đi (Nội vùng, Cận vùng)';
    } else if (input.direction === 'chieu_vao') {
      currentRateG0 = selectedVehicle.nearRegionInG0;
      columnNameInSheet = 'Đơn giá chiều về (Nội vùng, Cận vùng)';
    } else {
      currentRateG0 = selectedVehicle.nearRegionTwoWayG0;
      columnNameInSheet = 'Giá hai chiều (Nội vùng, Cận vùng)';
    }
  }

  // Đơn giá sau bù giá dầu PVOIL
  const baseDiesel = input.baseDieselPrice || BASE_DIESEL_PRICE;
  const dieselDiffRatio = (currentDieselPrice - baseDiesel) / baseDiesel;
  const oilAdjustmentRate = selectedVehicle.oilFactorK * dieselDiffRatio;
  const currentRateG1 = Math.round(currentRateG0 * (1 + oilAdjustmentRate));
  const minPriceG1 = Math.round(selectedVehicle.minPriceG0 * (1 + oilAdjustmentRate));

  // Chuyển loại hình xe (Xe Nóng <-> Xe Lạnh)
  const handleCategoryChange = (cat: VehicleCategory) => {
    const list = getVehiclesByFilters(effectiveVehicles, cat, activeConnectionCategory, activeDriverCount, isReeferCoolingOff);
    const target = list[0] || effectiveVehicles.find((v) => v.category === cat) || effectiveVehicles[0];

    onChange({
      ...input,
      vehicleCategory: cat,
      vehicleId: target.id,
      connectionCategory: activeConnectionCategory,
    });
  };

  // Chuyển Loại hình kết nối (Nội Vùng, Nội Tỉnh <-> Bắc Nam, Cận Vùng)
  const handleConnectionCategoryChange = (connCat: ConnectionCategory) => {
    const list = getVehiclesByFilters(effectiveVehicles, input.vehicleCategory, connCat, activeDriverCount, isReeferCoolingOff);
    const target = list[0] || effectiveVehicles[0];

    onChange({
      ...input,
      connectionCategory: connCat,
      vehicleId: target.id,
    });
  };

  // Chuyển số lái xe (1 lái / 2 lái)
  const handleDriverCountChange = (count: 1 | 2) => {
    const list = getVehiclesByFilters(effectiveVehicles, input.vehicleCategory, activeConnectionCategory, count, isReeferCoolingOff);
    const sameTonnage = list.find((v) => v.tonnageKg === selectedVehicle.tonnageKg);
    const target = sameTonnage || list[0] || effectiveVehicles[0];

    onChange({
      ...input,
      driverCount: count,
      vehicleId: target.id,
      connectionCategory: activeConnectionCategory,
    });
  };

  // Bật/tắt chế độ Ngắt Lạnh cho Xe Lạnh
  const handleToggleCoolingOff = (coolingOff: boolean) => {
    const list = getVehiclesByFilters(effectiveVehicles, 'truck_reefer', 'bac_nam_can_vung', activeDriverCount, coolingOff);
    const target = list[0] || effectiveVehicles[0];

    onChange({
      ...input,
      isReeferCoolingOff: coolingOff,
      vehicleId: target.id,
      coolingHours: coolingOff ? 0 : input.coolingHours,
    });
  };

  // Chọn tỉnh thành & tự động cấu hình theo rule
  const handleSelectProvince = (type: 'from' | 'to', provinceId: string) => {
    const newFromId = type === 'from' ? provinceId : input.fromProvinceId;
    const newToId = type === 'to' ? provinceId : input.toProvinceId;

    const detected = detectDirectionAndConnection(newFromId, newToId);
    const destProvince = VIETNAM_PROVINCES.find((p) => p.id === newToId);

    // Tự động gợi ý loại hình kết nối:
    // Nếu là tuyến Bắc - Nam (Nam ra Bắc hoặc Bắc vào Nam) -> 'bac_nam_can_vung'
    // Nếu là Bắc -> Bắc, Trung -> Trung, Nam -> Nam hoặc nội miền -> 'noi_vung_noi_tinh'
    const suggestedConnCat: ConnectionCategory = detected.isNorthSouthRoute ? 'bac_nam_can_vung' : 'noi_vung_noi_tinh';

    let newVehicleId = input.vehicleId;
    const currentVeh = effectiveVehicles.find((v) => v.id === input.vehicleId);
    if (currentVeh && currentVeh.connectionCategory !== suggestedConnCat) {
      const matchedList = getVehiclesByFilters(effectiveVehicles, input.vehicleCategory, suggestedConnCat, activeDriverCount, isReeferCoolingOff);
      if (matchedList.length > 0) {
        newVehicleId = matchedList[0].id;
      }
    }

    onChange({
      ...input,
      fromProvinceId: newFromId,
      toProvinceId: newToId,
      direction: detected.direction,
      connectionType: detected.connectionType,
      connectionCategory: suggestedConnCat,
      vehicleId: newVehicleId,
      km: detected.suggestedKm,
      petrolimexZone: destProvince?.petrolimexZone || 1,
    });

    if (type === 'from') setIsFromOpen(false);
    if (type === 'to') setIsToOpen(false);
  };

  const filteredFromProvinces = VIETNAM_PROVINCES.filter(
    (p) =>
      p.name.toLowerCase().includes(fromSearch.toLowerCase()) ||
      p.code.includes(fromSearch)
  );

  const filteredToProvinces = VIETNAM_PROVINCES.filter(
    (p) =>
      p.name.toLowerCase().includes(toSearch.toLowerCase()) ||
      p.code.includes(toSearch)
  );

  return (
    <div className="space-y-5">
      {/* ============================================================== */}
      {/* BƯỚC 1: CHỌN LOẠI HÌNH XE (PHỤ LỤC 1 VS PHỤ LỤC 2) */}
      {/* ============================================================== */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-red-600/30">
              1
            </span>
            Chọn Loại hình xe &amp; Bảng giá chuẩn
          </label>
          {onOpenPhuLucModal && (
            <button
              type="button"
              onClick={() => onOpenPhuLucModal(input.vehicleCategory)}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition underline-offset-4 hover:underline"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Xem bảng giá gốc Viettel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Phụ lục 1: Xe Nóng */}
          <button
            type="button"
            onClick={() => handleCategoryChange('truck_dry')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              input.vehicleCategory === 'truck_dry'
                ? 'bg-red-50/70 border-red-500 text-slate-900 ring-2 ring-red-500/30 shadow-sm'
                : 'bg-[#FAF8F5] hover:bg-[#F3EFE6] border-stone-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  input.vehicleCategory === 'truck_dry'
                    ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-600/30'
                    : 'bg-stone-200 text-slate-600'
                }`}
              >
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                Phụ lục 1 Viettel
              </span>
            </div>
            <div>
              <div className="font-bold text-base text-slate-900">Xe Nóng (Thùng kín / bạt)</div>
              <div className="text-xs text-slate-500 mt-1 leading-snug">
                Bảng giá vốn vận chuyển xe tải thông thường từ 2.500kg đến 28.000kg (1 lái &amp; 2 lái)
              </div>
            </div>
          </button>

          {/* Phụ lục 2: Xe Lạnh */}
          <button
            type="button"
            onClick={() => handleCategoryChange('truck_reefer')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              input.vehicleCategory === 'truck_reefer'
                ? 'bg-cyan-50/80 border-cyan-500 text-slate-900 ring-2 ring-cyan-500/30 shadow-sm'
                : 'bg-[#FAF8F5] hover:bg-[#F3EFE6] border-stone-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  input.vehicleCategory === 'truck_reefer'
                    ? 'bg-cyan-600 text-white font-bold shadow-sm shadow-cyan-600/30'
                    : 'bg-stone-200 text-slate-600'
                }`}
              >
                <Snowflake className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                Phụ lục 2 Viettel
              </span>
            </div>
            <div>
              <div className="font-bold text-base text-slate-900">Xe Lạnh (Đông mát)</div>
              <div className="text-xs text-slate-500 mt-1 leading-snug">
                Bảng giá vốn vận chuyển xe đông lạnh 2.500kg, 5.000kg, 8.000kg, 28.000kg (chuẩn, cửa khẩu, ngắt lạnh)
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BƯỚC 2: CHỌN LOẠI HÌNH KẾT NỐI & SỐ LÁI XE */}
      {/* ============================================================== */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-red-600/30">
              2
            </span>
            Chọn Loại hình kết nối &amp; Định mức lái xe
          </label>
        </div>

        {/* 2.1 Loại hình kết nối */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-red-600" />
            Loại hình kết nối:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleConnectionCategoryChange('noi_vung_noi_tinh')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeConnectionCategory === 'noi_vung_noi_tinh'
                  ? 'bg-red-50/70 border-red-500 text-slate-900 ring-1 ring-red-400 shadow-xs'
                  : 'bg-[#FAF8F5] hover:bg-[#F3EFE6] border-stone-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-sm text-slate-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <span>Nội Vùng, Nội Tỉnh</span>
                </span>
                {activeConnectionCategory === 'noi_vung_noi_tinh' && (
                  <Check className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className="text-[11px] text-slate-500 leading-snug">
                Áp dụng vận chuyển cự ly ngắn, <strong className="text-slate-800">Bắc ➔ Bắc, Trung ➔ Trung, Nam ➔ Nam</strong> và nội tỉnh. Có mức Giá tối thiểu (KM chuẩn 4.000 - 9.000km).
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleConnectionCategoryChange('bac_nam_can_vung')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeConnectionCategory === 'bac_nam_can_vung'
                  ? 'bg-red-50/70 border-red-500 text-slate-900 ring-1 ring-red-400 shadow-xs'
                  : 'bg-[#FAF8F5] hover:bg-[#F3EFE6] border-stone-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-sm text-slate-900 mb-1">
                <span>Bắc Nam, Cận Vùng</span>
                {activeConnectionCategory === 'bac_nam_can_vung' && (
                  <Check className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className="text-[11px] text-slate-500 leading-snug">
                Áp dụng vận chuyển đường dài theo tuyến trục xuyên suốt Bắc - Nam hoặc liên vùng (KM chuẩn 9.000 - 15.000km).
              </div>
            </button>
          </div>
        </div>

        {/* 2.2 Số lái xe & Chế độ */}
        <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-red-600" />
              Số lái xe:
            </span>
            <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200">
              <button
                type="button"
                onClick={() => handleDriverCountChange(2)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeDriverCount === 2
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2 Lái / xe (Tuyến dài)
              </button>
              <button
                type="button"
                onClick={() => handleDriverCountChange(1)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeDriverCount === 1
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1 Lái / xe (Nội vùng)
              </button>
            </div>
          </div>

          {/* Tùy chọn Ngắt Lạnh cho Xe Lạnh Tuyến Trục */}
          {input.vehicleCategory === 'truck_reefer' && activeConnectionCategory === 'bac_nam_can_vung' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 font-semibold">Chế độ máy lạnh:</span>
              <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => handleToggleCoolingOff(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    !isReeferCoolingOff
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bật lạnh tiêu chuẩn
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleCoolingOff(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    isReeferCoolingOff
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ngắt lạnh (Nhóm 5/6)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* BƯỚC 3: CHỌN TRỌNG TẢI XE (CHUẨN 100% THEO PHỤ LỤC 1 & 2) */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* BƯỚC 3: CHỌN TRỌNG TẢI XE (CHUẨN 100% THEO PHỤ LỤC 1 & 2) */}
      {/* ============================================================== */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <label htmlFor={vehicleSelectId} className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-red-600/30">
              3
            </span>
            Chọn Trọng tải xe (Kg)
          </label>
          <span className="text-xs text-red-600 font-semibold">
            {availableVehicles.length} phương tiện khả dụng trong nhóm
          </span>
        </div>

        {/* Vehicle Selection Chips / Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {availableVehicles.map((v) => {
            const isSelected = v.id === selectedVehicle.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onChange({ ...input, vehicleId: v.id })}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-red-50/70 border-red-500 text-slate-900 ring-1 ring-red-400 shadow-xs'
                    : 'bg-[#FAF8F5] hover:bg-[#F3EFE6] border-stone-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {v.category === 'truck_reefer' ? (
                      <Snowflake className="w-4 h-4 text-cyan-600" />
                    ) : (
                      <Truck className="w-4 h-4 text-red-600" />
                    )}
                    {v.tonnageLabel}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-red-600" />}
                </div>

                <div className="space-y-1 text-[11px] text-slate-500">
                  {v.kmStandard && (
                    <div className="flex items-center justify-between">
                      <span>KM tiêu chuẩn:</span>
                      <span className="font-mono text-slate-700 font-semibold">{formatNumber(v.kmStandard, 0)} km</span>
                    </div>
                  )}
                  {v.minPriceG0 > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Giá tối thiểu G₀:</span>
                      <span className="font-mono text-red-700 font-semibold">{formatCurrency(v.minPriceG0)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Hệ số bù dầu k:</span>
                    <span className="font-mono text-slate-800 font-bold">k = {v.oilFactorK}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Vehicle Spec Banner */}
        {selectedVehicle && (
          <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-slate-500">Xe đang chọn: </span>
              <strong className="text-slate-900">{selectedVehicle.name}</strong> •{' '}
              <span className="text-red-600 font-mono font-bold">Tải trọng: {selectedVehicle.tonnageLabel}</span> (Nhóm {selectedVehicle.weightClass} kg)
            </div>
            <div className="flex items-center gap-3">
              <span>Định mức bù dầu: <strong className="text-red-600 font-mono">k = {selectedVehicle.oilFactorK}</strong></span>
              {selectedVehicle.coolingFuelPerHour !== undefined && selectedVehicle.coolingFuelPerHour > 0 && (
                <span>Định mức máy lạnh: <strong className="text-cyan-700 font-mono">{selectedVehicle.coolingFuelPerHour} lít/h</strong></span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* BƯỚC 4: CHỌN TUYẾN ĐƯỜNG & CHIỀU KẾT NỐI */}
      {/* ============================================================== */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-red-600/30">
              4
            </span>
            Chọn Tuyến đường &amp; Chiều kết nối
          </label>
          <span className="text-xs text-slate-500">Xác định đơn giá tương ứng</span>
        </div>

        {/* Banner phân loại tuyến đường rõ ràng theo quy tắc */}
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
            isNorthSouth
              ? 'bg-red-50/70 border-red-200 text-red-950'
              : 'bg-[#FAF8F5] border-stone-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-red-600" />
              {isNorthSouth ? 'TUYẾN BẮC - NAM' : 'TUYẾN CẬN VÙNG / NỘI VÙNG (BẮC-BẮC, TRUNG-TRUNG, NAM-NAM)'}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                isNorthSouth ? 'bg-red-600 text-white' : 'bg-stone-200 text-slate-800'
              }`}
            >
              {isNorthSouth ? 'Đơn giá Bắc - Nam' : 'Đơn giá Cận Vùng / Nội Vùng'}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed text-[11px]">
            {isNorthSouth ? (
              <>
                Kết nối giữa <strong className="text-slate-900">Miền Nam</strong> và{' '}
                <strong className="text-slate-900">Miền Bắc</strong> ➔ Áp dụng cột{' '}
                <strong className="text-red-700">Bắc - Nam ({input.direction === 'chieu_ra' ? 'Chiều ra' : input.direction === 'chieu_vao' ? 'Chiều Vào' : 'Hai chiều'})</strong> trong bảng giá.
              </>
            ) : (
              <>
                Tuyến <strong className="text-slate-900">Bắc ➔ Bắc, Trung ➔ Trung, Nam ➔ Nam</strong>, hoặc Cận Vùng (Bắc-Trung, Trung-Nam) ➔ Áp dụng{' '}
                <strong className="text-red-700">Đơn giá Cận Vùng / Nội Vùng ({columnNameInSheet})</strong> theo đúng quy định.
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Tỉnh Đi */}
          <div className="relative">
            <label htmlFor={fromSelectId} className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                Điểm xuất phát:
              </span>
              <span className="font-mono text-[11px] text-red-600 font-semibold">
                Miền {fromProvince.region === 'Bac' ? 'Bắc' : fromProvince.region === 'Trung' ? 'Trung' : 'Nam'}
              </span>
            </label>
            <div className="relative">
              <button
                type="button"
                id={fromSelectId}
                onClick={() => {
                  setIsFromOpen(!isFromOpen);
                  setIsToOpen(false);
                }}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-slate-900 flex items-center justify-between hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-xs"
              >
                <span>{fromProvince.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {isFromOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-2xl z-40 max-h-60 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-stone-200 bg-stone-50">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm tỉnh thành đi..."
                        value={fromSearch}
                        onChange={(e) => setFromSearch(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto divide-y divide-stone-100 text-xs">
                    {filteredFromProvinces.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProvince('from', p.id)}
                        className="w-full px-3.5 py-2 text-left hover:bg-stone-50 flex items-center justify-between text-slate-800"
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {p.region === 'Bac' ? 'Miền Bắc' : p.region === 'Trung' ? 'Miền Trung' : 'Miền Nam'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tỉnh Đến */}
          <div className="relative">
            <label htmlFor={toSelectId} className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Điểm giao hàng đến:
              </span>
              <span className="font-mono text-[11px] text-red-600 font-semibold">
                Miền {toProvince.region === 'Bac' ? 'Bắc' : toProvince.region === 'Trung' ? 'Trung' : 'Nam'}
              </span>
            </label>
            <div className="relative">
              <button
                type="button"
                id={toSelectId}
                onClick={() => {
                  setIsToOpen(!isToOpen);
                  setIsFromOpen(false);
                }}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-slate-900 flex items-center justify-between hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-xs"
              >
                <span>{toProvince.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {isToOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-2xl z-40 max-h-60 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-stone-200 bg-stone-50">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm tỉnh thành đến..."
                        value={toSearch}
                        onChange={(e) => setToSearch(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto divide-y divide-stone-100 text-xs">
                    {filteredToProvinces.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProvince('to', p.id)}
                        className="w-full px-3.5 py-2 text-left hover:bg-stone-50 flex items-center justify-between text-slate-800"
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {p.region === 'Bac' ? 'Miền Bắc' : p.region === 'Trung' ? 'Miền Trung' : 'Miền Nam'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lựa chọn Chiều (Chiều ra / Chiều vào / Toàn trình) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Chiều ra */}
          <button
            type="button"
            onClick={() => onChange({ ...input, direction: 'chieu_ra' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              input.direction === 'chieu_ra'
                ? 'bg-red-50/70 border-red-500 text-slate-900 font-medium ring-1 ring-red-400'
                : 'bg-[#FAF8F5] hover:bg-[#F3EFE6] border-stone-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Chiều ra (Nam ➔ Bắc / Chiều đi)</span>
              {input.direction === 'chieu_ra' && <Check className="w-3.5 h-3.5 text-red-600" />}
            </div>
            <div className="text-[10px] text-slate-500">
              {activeConnectionCategory === 'bac_nam_can_vung' || isNorthSouth ? 'Cột: Bắc - Nam Chiều ra' : 'Cột: Đơn giá chiều đi'}
            </div>
          </button>

          {/* Chiều vào */}
          <button
            type="button"
            onClick={() => onChange({ ...input, direction: 'chieu_vao' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              input.direction === 'chieu_vao'
                ? 'bg-red-50/70 border-red-500 text-slate-900 font-medium ring-1 ring-red-400'
                : 'bg-[#FAF8F5] hover:bg-[#F3EFE6] border-stone-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Chiều vào (Bắc ➔ Nam / Chiều về)</span>
              {input.direction === 'chieu_vao' && <Check className="w-3.5 h-3.5 text-red-600" />}
            </div>
            <div className="text-[10px] text-slate-500">
              {activeConnectionCategory === 'bac_nam_can_vung' || isNorthSouth ? 'Cột: Bắc - Nam Chiều vào' : 'Cột: Đơn giá chiều về'}
            </div>
          </button>

          {/* Toàn trình */}
          <button
            type="button"
            onClick={() => onChange({ ...input, direction: 'toan_trinh' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              input.direction === 'toan_trinh'
                ? 'bg-red-50/70 border-red-500 text-slate-900 font-medium ring-1 ring-red-400'
                : 'bg-[#FAF8F5] hover:bg-[#F3EFE6] border-stone-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Toàn trình (2 Chiều)</span>
              {input.direction === 'toan_trinh' && <Check className="w-3.5 h-3.5 text-red-600" />}
            </div>
            <div className="text-[10px] text-slate-500">
              {activeConnectionCategory === 'bac_nam_can_vung' || isNorthSouth ? 'Cột: Bắc - Nam Hai chiều' : 'Cột: Giá hai chiều'}
            </div>
          </button>
        </div>

        {/* Khung chốt đơn giá tương ứng */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-slate-500 text-[11px]">Đơn giá cơ sở gốc ({columnNameInSheet}):</div>
            <div className="text-sm font-bold text-slate-800">
              {formatCurrency(currentRateG0)}/km
            </div>
          </div>

          <div>
            <div className="text-slate-500 text-[11px]">Bù giá dầu PVOIL ({formatNumber(currentDieselPrice, 0)}đ/lít):</div>
            <div className="text-sm font-bold text-red-600">
              +{formatNumber(oilAdjustmentRate * 100, 2)}% (k = {selectedVehicle.oilFactorK})
            </div>
          </div>

          <div className="w-full sm:w-auto p-2 px-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between sm:justify-start gap-3 shadow-xs">
            <span className="text-red-700 font-semibold text-xs">👉 Đơn giá chuẩn để nhân Km (G₁):</span>
            <span className="text-base font-extrabold text-red-700">
              {formatCurrency(currentRateG1)}/km
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BƯỚC 5: NHẬP SỐ KM & CÁC CHI PHÍ PHỤ */}
      {/* ============================================================== */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor={kmInputId} className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-red-600/30">
              5
            </span>
            Nhập Cự ly Km &amp; Thông số bổ sung
          </label>
          <span className="text-xs text-slate-500">Tính toán cước tổng</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Cự ly Km */}
          <div>
            <label htmlFor={kmInputId} className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
              <span>Cự ly thực tế (Km):</span>
              {input.km <= MIN_KM_THRESHOLD && input.km > 0 && selectedVehicle.minPriceG0 > 0 && (
                <span className="text-red-600 text-[10px] font-bold">≤ 75km (Áp dụng Giá Min)</span>
              )}
            </label>
            <div className="relative">
              <input
                id={kmInputId}
                type="number"
                min="1"
                max="5000"
                value={input.km || ''}
                onChange={(e) => onChange({ ...input, km: Number(e.target.value) || 0 })}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 pr-12 font-mono shadow-xs"
                placeholder="Nhập km..."
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                km
              </span>
            </div>
          </div>

          {/* Giờ chạy lạnh (nếu là xe lạnh) */}
          <div>
            <label htmlFor={coolingHoursInputId} className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
              <span>Thời gian chạy lạnh (h):</span>
              <span className="text-cyan-700 text-[10px]">
                {input.vehicleCategory === 'truck_reefer' ? `${selectedVehicle.coolingFuelPerHour || 2.5} lít/h` : 'Xe nóng không áp dụng'}
              </span>
            </label>
            <div className="relative">
              <input
                id={coolingHoursInputId}
                type="number"
                min="0"
                max="120"
                disabled={input.vehicleCategory !== 'truck_reefer' || isReeferCoolingOff}
                value={input.coolingHours ?? 0}
                onChange={(e) => onChange({ ...input, coolingHours: Number(e.target.value) || 0 })}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed pr-12 font-mono shadow-xs"
                placeholder="0"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                giờ
              </span>
            </div>
          </div>

          {/* Số ngày lưu ca */}
          <div>
            <label htmlFor={retentionDaysInputId} className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
              <span>Số ngày lưu ca xe:</span>
              <span className="text-slate-400 text-[10px]">Theo trọng tải xe</span>
            </label>
            <div className="relative">
              <input
                id={retentionDaysInputId}
                type="number"
                min="0"
                max="30"
                value={input.retentionDays ?? 0}
                onChange={(e) => onChange({ ...input, retentionDays: Number(e.target.value) || 0 })}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 pr-12 font-mono shadow-xs"
                placeholder="0"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                ngày
              </span>
            </div>
          </div>
        </div>

        {/* VAT Rate Radio */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Percent className="w-3.5 h-3.5 text-red-600" />
            <span>Thuế suất GTGT (VAT):</span>
          </div>
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            {[0, 8, 10].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onChange({ ...input, vatRate: rate })}
                className={`px-3.5 py-1 font-bold rounded-lg transition text-xs ${
                  input.vatRate === rate
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rate}% VAT
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
