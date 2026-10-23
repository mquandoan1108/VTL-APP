export type VehicleCategory = 'truck_reefer' | 'truck_dry';

export type ConnectionCategory = 'noi_vung_noi_tinh' | 'bac_nam_can_vung';

export type ConnectionType = 'noi_tinh_vung' | 'can_vung' | 'lien_tinh_vung' | 'truc_bac_nam';

export type ConnectionDirection = 'chieu_ra' | 'chieu_vao' | 'toan_trinh';

export type RouteType = 'bac_nam' | 'can_vung_noi_vung';

export interface VehicleOption {
  id: string;
  stt?: number;
  name: string;
  category: VehicleCategory;
  driverCount: 1 | 2; // 1 lái/xe hoặc 2 lái/xe
  connectionCategory: ConnectionCategory; // 'Nội Vùng, Nội Tỉnh' hoặc 'Bắc Nam, Cận Vùng'
  tonnageKg: number;
  tonnageLabel: string;
  weightClass: '<8000' | '8001-18000' | '>18000';
  kmStandard?: number; // KM tiêu chuẩn theo Phụ lục 1 & 2
  specialType?: 'standard' | 'cua_khau' | 'ngat_lanh'; // Tiêu chuẩn, Cửa khẩu, hoặc Ngắt lạnh
  
  // Biểu giá cơ sở G0 theo Phụ lục 1 & 2 (ĐVT: Đồng/Km)
  minPriceG0: number; // Giá tối thiểu
  nearRegionTwoWayG0: number; // Giá hai chiều Cận vùng / Nội vùng
  nearRegionOutG0: number; // Đơn giá chiều đi Cận vùng / Nội vùng
  nearRegionInG0: number; // Đơn giá chiều về Cận vùng / Nội vùng

  northSouthOutG0: number; // Bắc - Nam Chiều ra
  northSouthInG0: number; // Bắc - Nam Chiều Vào
  northSouthTwoWayG0: number; // Bắc - Nam Hai chiều

  oilFactorK: number; // 0.25 cho <8000kg; 0.3 cho 8001-18000kg; 0.4 cho >18000kg
  coolingFuelPerHour?: number; // Định mức máy lạnh (lít dầu/giờ)
  description?: string;
  note?: string;
}

export interface ProvinceInfo {
  id: string;
  name: string;
  code: string;
  region: 'Bac' | 'Trung' | 'Nam';
  petrolimexZone: 1 | 2;
}

export interface PetrolimexProduct {
  id: string;
  code: string;
  name: string;
  unit: string;
  zone1Price: number;
  zone2Price: number;
  priceDiff: number;
  isPrimaryFuelForLogistics?: boolean;
  description?: string;
}

export interface CalculationInput {
  vehicleId: string;
  vehicleCategory: VehicleCategory;
  driverCount: 1 | 2;
  connectionCategory?: ConnectionCategory; // 'noi_vung_noi_tinh' | 'bac_nam_can_vung'
  connectionType: ConnectionType;
  direction: ConnectionDirection;
  fromProvinceId: string;
  toProvinceId: string;
  km: number;
  currentDieselPrice: number;
  baseDieselPrice: number;
  oilFactorOverride?: number;
  coolingHours?: number; // Số giờ chạy lạnh
  retentionDays?: number; // Số ngày lưu ca
  vatRate: number; // 0, 8, hoặc 10%
  petrolimexZone: 1 | 2;
  directionFactorOverride?: number;
}

export interface CalculationResult {
  vehicle: VehicleOption;
  km: number;
  isUnder75Km: boolean;
  baseDieselPrice: number;
  currentDieselPrice: number;
  dieselDiffRatio: number;
  effectiveOilFactorK: number;
  oilAdjustmentRate: number; // k * dieselDiffRatio
  
  // Route classification & rates
  routeType: RouteType;
  routeDescription: string;
  isNorthSouthRoute: boolean;

  // Base rate G0 áp dụng
  baseMinPriceG0: number;
  baseSelectedRateG0: number; // Đơn giá G0 tương ứng với tuyến & chiều

  // Adjusted rates G1
  adjustedMinPriceG1: number;
  adjustedSelectedRateG1: number; // Đơn giá G1 tương ứng sau bù dầu PVOIL

  // Cước chặng chính
  calculatedDistanceCharge: number;
  appliedDistanceCharge: number;
  
  // Hệ số chiều
  directionFactor: number;
  directionCharge: number;
  
  // Phí phụ
  coolingCost: number;
  retentionCost: number;
  
  subtotalBeforeVat: number;
  vatAmount: number;
  totalWithVat: number;
  
  unitPricePerKmEffective: number;
  summaryText: string;
}
