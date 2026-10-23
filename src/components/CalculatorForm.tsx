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
} from 'lucide-react';
import {
  VehicleCategory,
  ConnectionType,
  ConnectionDirection,
  CalculationInput,
  VehicleOption,
} from '../types/logistics';
import {
  VEHICLE_OPTIONS,
  MIN_KM_THRESHOLD,
  BASE_DIESEL_PRICE,
} from '../data/pricingData';
import { VIETNAM_PROVINCES, detectDirectionAndConnection } from '../data/provinces';
import { formatCurrency, formatNumber } from '../utils/calculator';

interface CalculatorFormProps {
  input: CalculationInput;
  onChange: (input: CalculationInput) => void;
  currentDieselPrice: number;
  vehicles?: VehicleOption[];
  onOpenPhuLuc1Editor?: () => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  input,
  onChange,
  currentDieselPrice,
  vehicles,
  onOpenPhuLuc1Editor,
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

  // Lọc phương tiện theo loại hình xe và số lái xe (1 lái hoặc 2 lái)
  // Áp dụng cho cả Xe Lạnh (Phụ lục 2) và Xe Nóng (Phụ lục 1)
  const categoryVehicles = effectiveVehicles.filter((v) => {
    if (['dry_2500kg', 'dry_5000kg', 'dry_8000kg', 'dry_28000kg'].includes(v.id)) return false;
    return v.category === input.vehicleCategory && v.driverCount === (input.driverCount || 2);
  });

  const selectedVehicle =
    effectiveVehicles.find((v) => v.id === input.vehicleId) || categoryVehicles[0] || effectiveVehicles[0];

  const fromProvince = VIETNAM_PROVINCES.find((p) => p.id === input.fromProvinceId) || VIETNAM_PROVINCES[0];
  const toProvince = VIETNAM_PROVINCES.find((p) => p.id === input.toProvinceId) || VIETNAM_PROVINCES[0];

  // Tuyến đường & phân loại Bắc Nam vs Cận Vùng
  const routeInfo = detectDirectionAndConnection(input.fromProvinceId, input.toProvinceId);
  const isNorthSouth = routeInfo.isNorthSouthRoute;

  // Xác định đơn giá G0 tương ứng theo Phụ lục 1 / Phụ lục 2
  let currentRateG0: number;
  let columnNameInSheet = '';

  if (isNorthSouth) {
    if (input.direction === 'chieu_ra') {
      currentRateG0 = selectedVehicle.northSouthOutG0;
      columnNameInSheet = 'Bắc - Nam Chiều ra';
    } else if (input.direction === 'chieu_vao') {
      currentRateG0 = selectedVehicle.northSouthInG0;
      columnNameInSheet = 'Bắc - Nam Chiều Vào';
    } else {
      currentRateG0 = selectedVehicle.northSouthTwoWayG0 || Math.round((selectedVehicle.northSouthOutG0 + selectedVehicle.northSouthInG0) / 2);
      columnNameInSheet = 'Bắc - Nam Hai chiều';
    }
  } else {
    if (input.direction === 'chieu_ra') {
      currentRateG0 = selectedVehicle.nearRegionOutG0;
      columnNameInSheet = 'Đơn giá chiều đi (Cận vùng/Nội vùng)';
    } else if (input.direction === 'chieu_vao') {
      currentRateG0 = selectedVehicle.nearRegionInG0;
      columnNameInSheet = 'Đơn giá chiều về (Cận vùng/Nội vùng)';
    } else {
      currentRateG0 = selectedVehicle.nearRegionTwoWayG0;
      columnNameInSheet = 'Giá hai chiều (Cận vùng/Nội vùng)';
    }
  }

  // Đơn giá sau bù giá dầu PVOIL
  const dieselDiffRatio = (currentDieselPrice - (input.baseDieselPrice || BASE_DIESEL_PRICE)) / (input.baseDieselPrice || BASE_DIESEL_PRICE);
  const oilAdjustmentRate = selectedVehicle.oilFactorK * dieselDiffRatio;
  const currentRateG1 = Math.round(currentRateG0 * (1 + oilAdjustmentRate));
  const minPriceG1 = Math.round(selectedVehicle.minPriceG0 * (1 + oilAdjustmentRate));

  // Chuyển loại hình xe (Xe Lạnh <-> Xe Nóng)
  const handleCategoryChange = (cat: VehicleCategory) => {
    const defaultForCat =
      effectiveVehicles.find(
        (v) =>
          v.category === cat &&
          v.driverCount === input.driverCount &&
          !['dry_2500kg', 'dry_5000kg', 'dry_8000kg', 'dry_28000kg'].includes(v.id)
      ) ||
      effectiveVehicles.find((v) => v.category === cat && !['dry_2500kg', 'dry_5000kg', 'dry_8000kg', 'dry_28000kg'].includes(v.id)) ||
      effectiveVehicles[0];

    onChange({
      ...input,
      vehicleCategory: cat,
      vehicleId: defaultForCat.id,
    });
  };

  // Chuyển số lái xe (1 lái / 2 lái)
  const handleDriverCountChange = (count: 1 | 2) => {
    const matching =
      effectiveVehicles.find(
        (v) =>
          v.category === input.vehicleCategory &&
          v.driverCount === count &&
          v.tonnageKg === selectedVehicle.tonnageKg &&
          v.specialType === selectedVehicle.specialType &&
          !['dry_2500kg', 'dry_5000kg', 'dry_8000kg', 'dry_28000kg'].includes(v.id)
      ) ||
      effectiveVehicles.find(
        (v) =>
          v.category === input.vehicleCategory &&
          v.driverCount === count &&
          !['dry_2500kg', 'dry_5000kg', 'dry_8000kg', 'dry_28000kg'].includes(v.id)
      ) ||
      effectiveVehicles[0];

    onChange({
      ...input,
      driverCount: count,
      vehicleId: matching.id,
    });
  };

  // Chọn tỉnh thành & tự động cấu hình theo rule
  const handleSelectProvince = (type: 'from' | 'to', provinceId: string) => {
    const newFromId = type === 'from' ? provinceId : input.fromProvinceId;
    const newToId = type === 'to' ? provinceId : input.toProvinceId;

    const detected = detectDirectionAndConnection(newFromId, newToId);
    const destProvince = VIETNAM_PROVINCES.find((p) => p.id === newToId);

    onChange({
      ...input,
      fromProvinceId: newFromId,
      toProvinceId: newToId,
      direction: detected.direction,
      connectionType: detected.connectionType,
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
      {/* BƯỚC 1: CHỌN LOẠI HÌNH XE (CHỈ CÒN 2 BẢNG GIÁ THEO YÊU CẦU) */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3.5">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              1
            </span>
            Chọn Loại hình xe (2 Bảng giá chính)
          </label>
          <span className="text-xs text-slate-400">Đã bỏ xe cont kéo cảng</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Bảng 1: Xe Lạnh (Phụ lục 2) */}
          <button
            type="button"
            onClick={() => handleCategoryChange('truck_reefer')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              input.vehicleCategory === 'truck_reefer'
                ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/40 shadow-lg'
                : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  input.vehicleCategory === 'truck_reefer'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Snowflake className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Phụ lục 2 Viettel Logistics
              </span>
            </div>
            <div>
              <div className="font-bold text-base text-white">Xe Lạnh (Đông mát)</div>
              <div className="text-xs text-slate-400 mt-1 leading-snug">
                Bảng giá chuẩn 100% từng số theo Phụ lục 2 (2.500kg, 5.000kg, 8.000kg, 28.000kg)
              </div>
            </div>
          </button>

          {/* Bảng 2: Xe Nóng (Phụ lục 1) */}
          <button
            type="button"
            onClick={() => handleCategoryChange('truck_dry')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              input.vehicleCategory === 'truck_dry'
                ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/40 shadow-lg'
                : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  input.vehicleCategory === 'truck_dry'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Phụ lục 1 Viettel Logistics
              </span>
            </div>
            <div>
              <div className="font-bold text-base text-white">Xe Nóng (Thùng kín/bạt)</div>
              <div className="text-xs text-slate-400 mt-1 leading-snug">
                Bảng giá chuẩn theo Phụ lục 1 (2.500kg, 5.000kg, 8.000kg, 28.000kg; 1 lái &amp; 2 lái)
              </div>
            </div>
          </button>
        </div>

        {/* Tùy chọn 1 lái / 2 lái cho xe lạnh (Phụ lục 2) và xe nóng (Phụ lục 1) */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Biểu số lái xe ({input.vehicleCategory === 'truck_reefer' ? 'Phụ lục 2 - Xe Lạnh' : 'Phụ lục 1 - Xe Nóng'}):
          </span>
          <div className="flex items-center gap-2">
            {input.vehicleCategory === 'truck_dry' && onOpenPhuLuc1Editor && (
              <button
                type="button"
                onClick={onOpenPhuLuc1Editor}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Bảng giá Phụ lục 1
              </button>
            )}
            <div className="inline-flex rounded-lg bg-slate-850 p-1 border border-slate-750">
              <button
                type="button"
                onClick={() => handleDriverCountChange(2)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  input.driverCount === 2
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2 Lái / xe
              </button>
              <button
                type="button"
                onClick={() => handleDriverCountChange(1)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  input.driverCount === 1
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1 Lái / xe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BƯỚC 2: CHỌN TRỌNG TẢI XE (KHÔNG THAY ĐỔI TÙY Ý - CHUẨN PHỤ LỤC 2) */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={vehicleSelectId} className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              2
            </span>
            Chọn Trọng tải xe (Cố định chuẩn theo bảng giá)
          </label>
          <span className="text-xs text-slate-400">Không thay đổi tùy ý</span>
        </div>

        <div className="relative">
          <select
            id={vehicleSelectId}
            value={input.vehicleId}
            onChange={(e) => onChange({ ...input, vehicleId: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer pr-10"
          >
            {categoryVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.tonnageLabel} (Giá Min G₀: {formatCurrency(v.minPriceG0)})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {selectedVehicle && (
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400">
              {selectedVehicle.description}
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-slate-300">
              <span>Hệ số bù dầu theo Phụ lục 2:</span>
              <span className="font-mono text-amber-400 font-bold">
                k = {selectedVehicle.oilFactorK} ({selectedVehicle.tonnageKg < 8000 ? '<8000kg: 0.25' : selectedVehicle.tonnageKg <= 18000 ? '8001-18000kg: 0.3' : '>18000kg: 0.4'})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* BƯỚC 3: CHỌN TUYẾN ĐƯỜNG */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3.5">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              3
            </span>
            Chọn Tuyến đường (Tỉnh xuất phát &amp; Tỉnh đến)
          </label>
          <span className="text-xs text-slate-400">Bước 3/5</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Tỉnh Đi */}
          <div className="relative">
            <label htmlFor={fromSelectId} className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Điểm đi:
              </span>
              <span className="font-mono text-[11px] text-amber-400">
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-white flex items-center justify-between hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <span>{fromProvince.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isFromOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-850 border border-slate-700 rounded-xl shadow-2xl z-40 max-h-60 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-slate-700 bg-slate-800">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm tỉnh thành đi..."
                        value={fromSearch}
                        onChange={(e) => setFromSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto divide-y divide-slate-800 text-xs">
                    {filteredFromProvinces.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProvince('from', p.id)}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-800 flex items-center justify-between text-slate-200"
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
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
            <label htmlFor={toSelectId} className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Điểm đến:
              </span>
              <span className="font-mono text-[11px] text-amber-400">
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-white flex items-center justify-between hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <span>{toProvince.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isToOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-850 border border-slate-700 rounded-xl shadow-2xl z-40 max-h-60 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-slate-700 bg-slate-800">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm tỉnh thành đến..."
                        value={toSearch}
                        onChange={(e) => setToSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto divide-y divide-slate-800 text-xs">
                    {filteredToProvinces.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProvince('to', p.id)}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-800 flex items-center justify-between text-slate-200"
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
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
      </div>

      {/* ============================================================== */}
      {/* BƯỚC 4: CHỌN CHIỀU => ĐƯA RA ĐƠN GIÁ ĐÚNG THEO RULE CHỈ ĐỊNH */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              4
            </span>
            Chọn Chiều &amp; Xác định Đơn giá đúng trong bảng
          </label>
          <span className="text-xs text-slate-400">Bước 4/5</span>
        </div>

        {/* Banner phân loại tuyến đường theo rule người dùng */}
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
            isNorthSouth
              ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
              : 'bg-blue-950/20 border-blue-500/40 text-blue-200'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              {isNorthSouth ? 'TUYẾN BẮC - NAM' : 'TUYẾN CẬN VÙNG / NỘI VÙNG'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                isNorthSouth ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-slate-950'
              }`}
            >
              {isNorthSouth ? 'Đơn giá Bắc - Nam' : 'Đơn giá Cận vùng'}
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed text-[11px]">
            {isNorthSouth ? (
              <>
                Kết nối giữa <strong className="text-white">Miền Nam</strong> và{' '}
                <strong className="text-white">Miền Bắc</strong> ➔ Áp dụng cột{' '}
                <strong className="text-amber-300">Bắc - Nam ({input.direction === 'chieu_ra' ? 'Chiều ra' : input.direction === 'chieu_vao' ? 'Chiều Vào' : 'Hai chiều'})</strong> trong bảng.
              </>
            ) : (
              <>
                Tuyến giữa <strong className="text-white">Bắc ➔ Trung, Trung ➔ Nam, Nam ➔ Trung, Trung ➔ Bắc</strong> hoặc nội miền ➔ Áp dụng cột{' '}
                <strong className="text-blue-300">{columnNameInSheet}</strong> trong bảng {input.vehicleCategory === 'truck_reefer' ? 'Phụ lục 2 (Xe Lạnh)' : 'Phụ lục 1 (Xe Nóng)'}.
              </>
            )}
          </p>
        </div>

        {/* Lựa chọn chiều */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Chiều ra */}
          <button
            type="button"
            onClick={() => onChange({ ...input, direction: 'chieu_ra' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              input.direction === 'chieu_ra'
                ? 'bg-amber-500/15 border-amber-500 text-white font-medium ring-1 ring-amber-500/30'
                : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Chiều ra (Nam ➔ Bắc / Đi)</span>
              {input.direction === 'chieu_ra' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div className="text-[10px] text-slate-400">
              {isNorthSouth ? 'Cột: Bắc - Nam Chiều ra' : 'Cột: Đơn giá chiều đi'}
            </div>
          </button>

          {/* Chiều vào */}
          <button
            type="button"
            onClick={() => onChange({ ...input, direction: 'chieu_vao' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              input.direction === 'chieu_vao'
                ? 'bg-amber-500/15 border-amber-500 text-white font-medium ring-1 ring-amber-500/30'
                : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Chiều vào (Bắc ➔ Nam / Về)</span>
              {input.direction === 'chieu_vao' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div className="text-[10px] text-slate-400">
              {isNorthSouth ? 'Cột: Bắc - Nam Chiều Vào' : 'Cột: Đơn giá chiều về'}
            </div>
          </button>

          {/* Toàn trình */}
          <button
            type="button"
            onClick={() => onChange({ ...input, direction: 'toan_trinh' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              input.direction === 'toan_trinh'
                ? 'bg-amber-500/15 border-amber-500 text-white font-medium ring-1 ring-amber-500/30'
                : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Toàn trình (2 Chiều)</span>
              {input.direction === 'toan_trinh' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div className="text-[10px] text-slate-400">
              {isNorthSouth ? 'Cột: Bắc - Nam Hai chiều' : 'Cột: Giá hai chiều'}
            </div>
          </button>
        </div>

        {/* Bảng chốt đơn giá chuẩn trước khi nhân Km */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Đơn giá cơ sở gốc ({columnNameInSheet}):</div>
            <div className="text-sm font-bold text-slate-200">
              {formatCurrency(currentRateG0)}/km
            </div>
          </div>

          <div className="text-right sm:text-left">
            <div className="text-slate-400 text-[11px]">Bù giá dầu PVOIL ({formatNumber(currentDieselPrice, 0)}đ/lít):</div>
            <div className="text-sm font-bold text-amber-400">
              +{formatNumber(oilAdjustmentRate * 100, 2)}% (k = {selectedVehicle.oilFactorK})
            </div>
          </div>

          <div className="w-full sm:w-auto p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between sm:justify-start gap-3">
            <span className="text-amber-300 font-semibold text-xs">👉 Đơn giá chuẩn để nhân Km (G₁):</span>
            <span className="text-base font-extrabold text-amber-400">
              {formatCurrency(currentRateG1)}/km
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BƯỚC 5: NHẬP SỐ KM (NHÂN VỚI ĐƠN GIÁ ĐÃ XÁC ĐỊNH) */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor={kmInputId} className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              5
            </span>
            Nhập Cự ly Km (Nhân với đơn giá chốt)
          </label>
          <span className="text-xs text-slate-400">Bước 5/5</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              id={kmInputId}
              type="number"
              min="1"
              max="5000"
              value={input.km || ''}
              onChange={(e) => onChange({ ...input, km: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Nhập số km..."
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              Km
            </span>
          </div>

          {/* Nút km nhanh */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[35, 75, 120, 350, 770, 960, 1720].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ ...input, km: k })}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                  input.km === k
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-750'
                }`}
              >
                {k} km
              </button>
            ))}
          </div>
        </div>

        {/* Cảnh báo 75km */}
        {input.km <= MIN_KM_THRESHOLD && input.km > 0 ? (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Cự ly {input.km}km (≤ 75km):</strong> Áp dụng{' '}
              <strong className="text-amber-300">Giá tối thiểu {formatCurrency(minPriceG1)}</strong> theo đúng quy định {input.vehicleCategory === 'truck_reefer' ? 'Phụ lục 2' : 'Phụ lục 1'}.
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
            <span>Tính cước: {input.km} km x {formatCurrency(currentRateG1)}/km</span>
            <span className="font-bold text-white text-sm">
              = {formatCurrency(input.km * currentRateG1)}
            </span>
          </div>
        )}
      </div>

      {/* CÁC TRƯỜNG PHỤ PHÍ NẾU CÓ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Phụ phí máy lạnh, lưu ca &amp; Thuế VAT
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Phí máy lạnh nếu xe lạnh */}
          {input.vehicleCategory === 'truck_reefer' && (
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <label htmlFor={coolingHoursInputId} className="block text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Thời gian chạy lạnh (giờ):
              </label>
              <input
                id={coolingHoursInputId}
                type="number"
                min="0"
                step="0.5"
                value={input.coolingHours || 0}
                onChange={(e) =>
                  onChange({ ...input, coolingHours: Math.max(0, parseFloat(e.target.value) || 0) })
                }
                className="w-full bg-slate-800 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <div className="text-[10px] text-cyan-400/80">
                Định mức: {selectedVehicle.coolingFuelPerHour || 2.5}L/h x {formatCurrency(currentDieselPrice)}
              </div>
            </div>
          )}

          {/* Phí lưu ca theo Phụ lục 2 */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 space-y-2">
            <label htmlFor={retentionDaysInputId} className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Số ngày lưu ca xe:
            </label>
            <input
              id={retentionDaysInputId}
              type="number"
              min="0"
              value={input.retentionDays || 0}
              onChange={(e) =>
                onChange({ ...input, retentionDays: Math.max(0, parseInt(e.target.value) || 0) })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="text-[10px] text-slate-400">
              Định mức: {selectedVehicle.tonnageKg <= 5100 ? '>= 1 ngày' : selectedVehicle.tonnageKg <= 13000 ? '>= 3 ngày' : selectedVehicle.tonnageKg <= 18000 ? '>= 4 ngày' : '>= 5 ngày'}
            </div>
          </div>

          {/* Thuế VAT */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              Thuế suất GTGT (VAT):
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 8, 10].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onChange({ ...input, vatRate: rate })}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    input.vatRate === rate
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
