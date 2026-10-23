import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Truck,
  Snowflake,
  Users,
  Edit3,
  Save,
  RotateCcw,
  Check,
  HelpCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { VehicleOption, VehicleCategory } from '../types/logistics';
import { BASE_DIESEL_PRICE } from '../data/pricingData';
import { formatCurrency, formatNumber } from '../utils/calculator';

interface PhuLucViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleOption[];
  onSaveVehicles: (updated: VehicleOption[]) => void;
  onResetVehicles: () => void;
  onSelectVehicle?: (vehicleId: string) => void;
  currentDieselPrice?: number;
  initialTab?: VehicleCategory;
}

export const PhuLucViewerModal: React.FC<PhuLucViewerModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onSaveVehicles,
  onResetVehicles,
  onSelectVehicle,
  currentDieselPrice = 29200,
  initialTab = 'truck_dry',
}) => {
  const [activeCategory, setActiveCategory] = useState<VehicleCategory>(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicles, setEditedVehicles] = useState<VehicleOption[]>(vehicles);

  // Sync state when props change
  React.useEffect(() => {
    setEditedVehicles(vehicles);
  }, [vehicles]);

  if (!isOpen) return null;

  // Filter out duplicate legacy aliases
  const cleanList = editedVehicles.filter(
    (v) =>
      !['dry_2500kg', 'dry_5000kg', 'dry_8000kg', 'dry_28000kg', 'reefer_2d_2500kg', 'reefer_2d_5000kg', 'reefer_1d_2500kg', 'reefer_1d_5000kg', 'reefer_2d_28000kg', 'dry_2d_2500kg', 'dry_1d_2500kg'].includes(v.id)
  );

  const handleCellChange = (id: string, field: keyof VehicleOption, value: number) => {
    setEditedVehicles((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return { ...v, [field]: value };
        }
        return v;
      })
    );
  };

  const handleSave = () => {
    onSaveVehicles(editedVehicles);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục toàn bộ bảng giá Phụ lục 1 và Phụ lục 2 về giá gốc mặc định của Viettel Logistics?')) {
      onResetVehicles();
      setIsEditing(false);
    }
  };

  // Group definitions for Phụ lục 1 (Xe Nóng)
  const phuLuc1Groups = [
    {
      groupTitle: '1. Xe Nóng 2 lái/xe — Nội Vùng, Nội Tỉnh',
      badge: '2 Lái / Xe',
      vehicles: cleanList.filter((v) => v.category === 'truck_dry' && v.driverCount === 2 && v.connectionCategory === 'noi_vung_noi_tinh'),
    },
    {
      groupTitle: '2. Xe Nóng 1 lái/xe — Nội Vùng, Nội Tỉnh',
      badge: '1 Lái / Xe',
      vehicles: cleanList.filter((v) => v.category === 'truck_dry' && v.driverCount === 1 && v.connectionCategory === 'noi_vung_noi_tinh'),
    },
    {
      groupTitle: '3. Xe Nóng 2 lái/xe — Bắc Nam, Cận Vùng',
      badge: '2 Lái / Tuyến Trục',
      vehicles: cleanList.filter((v) => v.category === 'truck_dry' && v.driverCount === 2 && v.connectionCategory === 'bac_nam_can_vung'),
    },
    {
      groupTitle: '4. Xe Nóng 1 lái/xe — Bắc Nam, Cận Vùng',
      badge: '1 Lái / Tuyến Trục',
      vehicles: cleanList.filter((v) => v.category === 'truck_dry' && v.driverCount === 1 && v.connectionCategory === 'bac_nam_can_vung'),
    },
  ];

  // Group definitions for Phụ lục 2 (Xe Lạnh)
  const phuLuc2Groups = [
    {
      groupTitle: '1. Xe lạnh 2 lái/xe (<8000) — Nội Vùng, Nội Tỉnh',
      badge: '2 Lái / Xe',
      vehicles: cleanList.filter((v) => v.category === 'truck_reefer' && v.driverCount === 2 && v.connectionCategory === 'noi_vung_noi_tinh'),
    },
    {
      groupTitle: '2. Xe lạnh 1 lái/xe (<8000) — Nội Vùng, Nội Tỉnh',
      badge: '1 Lái / Xe',
      vehicles: cleanList.filter((v) => v.category === 'truck_reefer' && v.driverCount === 1 && v.connectionCategory === 'noi_vung_noi_tinh'),
    },
    {
      groupTitle: '3. Xe lạnh 2 lái/xe (8001-18000 & >18000) — Bắc Nam, Cận Vùng',
      badge: '2 Lái / Tuyến Trục',
      vehicles: cleanList.filter((v) => v.category === 'truck_reefer' && v.driverCount === 2 && v.connectionCategory === 'bac_nam_can_vung' && v.specialType !== 'ngat_lanh'),
    },
    {
      groupTitle: '4. Xe lạnh 1 lái/xe — Bắc Nam, Cận Vùng',
      badge: '1 Lái / Tuyến Trục',
      vehicles: cleanList.filter((v) => v.category === 'truck_reefer' && v.driverCount === 1 && v.connectionCategory === 'bac_nam_can_vung' && v.specialType !== 'ngat_lanh'),
    },
    {
      groupTitle: '5. Xe lạnh 2 lái/xe (Ngắt lạnh) — Bắc Nam, Cận Vùng',
      badge: 'Ngắt Lạnh (2 Lái)',
      vehicles: cleanList.filter((v) => v.category === 'truck_reefer' && v.driverCount === 2 && v.connectionCategory === 'bac_nam_can_vung' && v.specialType === 'ngat_lanh'),
    },
    {
      groupTitle: '6. Xe lạnh 1 lái/xe (ngắt lạnh) — Bắc Nam, Cận Vùng',
      badge: 'Ngắt Lạnh (1 Lái)',
      vehicles: cleanList.filter((v) => v.category === 'truck_reefer' && v.driverCount === 1 && v.connectionCategory === 'bac_nam_can_vung' && v.specialType === 'ngat_lanh'),
    },
  ];

  const activeGroups = activeCategory === 'truck_dry' ? phuLuc1Groups : phuLuc2Groups;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FBF9F5] border border-stone-200 w-full max-w-7xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs ${
              activeCategory === 'truck_dry'
                ? 'bg-red-50 border border-red-200 text-red-600'
                : 'bg-cyan-50 border border-cyan-200 text-cyan-700'
            }`}>
              {activeCategory === 'truck_dry' ? <Truck className="w-6 h-6" /> : <Snowflake className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide">
                  {activeCategory === 'truck_dry'
                    ? 'PHỤ LỤC 1: BẢNG GIÁ VỐN VẬN CHUYỂN XE NÓNG'
                    : 'PHỤ LỤC 2: BẢNG GIÁ VỐN VẬN CHUYỂN XE LẠNH'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                  Biểu giá chuẩn Viettel
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                <span>
                  Giá dầu vốn: <strong className="text-slate-800 font-mono">21.860 đ/lít</strong>
                </span>
                <span>•</span>
                <span>
                  Giá dầu hiện tại: <strong className="text-red-600 font-mono font-bold">{formatNumber(currentDieselPrice, 0)} đ/lít</strong>
                </span>
                <span>•</span>
                <span>ĐVT: <strong className="text-slate-800">Đồng/Km</strong> (Chưa VAT)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Switcher & Toolbar */}
        <div className="p-3 sm:p-4 bg-[#FAF8F5] border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs for Phụ lục 1 vs Phụ lục 2 */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              onClick={() => setActiveCategory('truck_dry')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 transition ${
                activeCategory === 'truck_dry'
                  ? 'bg-gradient-to-r from-red-600 to-[#EE0033] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Phụ Lục 1: Xe Nóng (Thùng kín / bạt)</span>
            </button>
            <button
              onClick={() => setActiveCategory('truck_reefer')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 transition ${
                activeCategory === 'truck_reefer'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Snowflake className="w-4 h-4" />
              <span>Phụ Lục 2: Xe Lạnh (Đông mát)</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 text-slate-700 border border-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-red-600" />
                  Chỉnh sửa giá gốc
                </button>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
                  title="Khôi phục về bảng gốc Viettel Logistics"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Khôi phục gốc</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditedVehicles(vehicles);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-stone-100 text-slate-600 border border-stone-200 rounded-lg text-xs font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu thay đổi
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 text-slate-800 font-bold border-b border-stone-200">
                  <th rowSpan={2} className="p-2 border-r border-stone-200 w-12 text-center">STT</th>
                  <th rowSpan={2} className="p-2 border-r border-stone-200 min-w-[150px]">Trọng tải xe (Kg)</th>
                  <th rowSpan={2} className="p-2 border-r border-stone-200 min-w-[130px]">Loại hình kết nối</th>
                  <th rowSpan={2} className="p-2 border-r border-stone-200 min-w-[95px] text-right">KM tiêu chuẩn</th>
                  <th rowSpan={2} className="p-2 border-r border-stone-200 min-w-[105px] text-right">Giá tối thiểu</th>
                  <th rowSpan={2} className="p-2 border-r border-stone-200 min-w-[85px] text-right">Giá hai chiều</th>
                  <th rowSpan={2} className="p-2 border-r border-stone-200 min-w-[85px] text-right">Đơn giá chiều đi</th>
                  <th rowSpan={2} className="p-2 border-r border-stone-200 min-w-[85px] text-right">Đơn giá chiều về</th>
                  <th colSpan={3} className="p-2 border-r border-stone-200 text-center bg-red-50 text-red-700">
                    Bắc - Nam (Đồng/Km)
                  </th>
                  <th rowSpan={2} className="p-2 border-r border-stone-200 text-center w-14">Hệ số k</th>
                  {onSelectVehicle && (
                    <th rowSpan={2} className="p-2 text-center w-24">Áp dụng</th>
                  )}
                </tr>
                <tr className="bg-stone-50 text-slate-600 font-semibold border-b border-stone-200 text-[11px]">
                  {activeCategory === 'truck_dry' ? (
                    <>
                      <th className="p-2 border-r border-stone-200 text-right text-rose-700">Chiều vào</th>
                      <th className="p-2 border-r border-stone-200 text-right text-cyan-700">Chiều ra</th>
                      <th className="p-2 border-r border-stone-200 text-right text-red-700 font-bold">Hai chiều</th>
                    </>
                  ) : (
                    <>
                      <th className="p-2 border-r border-stone-200 text-right text-cyan-700">Chiều ra</th>
                      <th className="p-2 border-r border-stone-200 text-right text-rose-700">Chiều Vào</th>
                      <th className="p-2 border-r border-stone-200 text-right text-red-700 font-bold">Hai chiều</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-slate-700">
                {activeGroups.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {/* Section Header Row */}
                    <tr className="bg-stone-100/90 border-y border-stone-200 font-bold text-slate-900">
                      <td colSpan={onSelectVehicle ? 13 : 12} className="p-2.5 px-3 text-xs bg-[#F5F2EB]">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-red-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                              {gIdx + 1}
                            </span>
                            <span className="text-slate-900">{group.groupTitle}</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 border border-stone-200 font-semibold">
                            {group.badge}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Vehicle Rows */}
                    {group.vehicles.map((v, idx) => (
                      <tr key={v.id} className="hover:bg-stone-50 transition">
                        <td className="p-2 text-center font-mono text-slate-500 border-r border-stone-100">
                          {idx + 1}
                        </td>
                        <td className="p-2 font-bold text-slate-900 border-r border-stone-100">
                          <div className="flex items-center gap-1.5">
                            {v.category === 'truck_reefer' ? (
                              <Snowflake className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                            ) : (
                              <Truck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            )}
                            <span>{v.tonnageLabel}</span>
                          </div>
                          {v.specialType === 'cua_khau' && (
                            <span className="text-[10px] text-amber-700 font-normal">Cửa khẩu</span>
                          )}
                          {v.specialType === 'ngat_lanh' && (
                            <span className="text-[10px] text-cyan-700 font-normal">Ngắt lạnh</span>
                          )}
                        </td>

                        <td className="p-2 text-slate-600 border-r border-stone-100">
                          {v.connectionCategory === 'noi_vung_noi_tinh' ? 'Nội Vùng, Nội Tỉnh' : 'Bắc Nam, Cận Vùng'}
                        </td>

                        {/* KM tiêu chuẩn */}
                        <td className="p-2 border-r border-stone-100 text-right font-mono text-slate-700">
                          {v.kmStandard ? formatNumber(v.kmStandard, 0) : '-'}
                        </td>

                        {/* Giá tối thiểu */}
                        <td className="p-2 border-r border-stone-100 text-right font-mono">
                          {v.minPriceG0 > 0 ? (
                            isEditing ? (
                              <input
                                type="number"
                                value={v.minPriceG0}
                                onChange={(e) =>
                                  handleCellChange(v.id, 'minPriceG0', Number(e.target.value) || 0)
                                }
                                className="w-24 px-1.5 py-0.5 bg-white border border-stone-300 rounded text-right text-slate-900 font-mono text-xs focus:ring-1 focus:ring-red-500"
                              />
                            ) : (
                              <span className="text-red-700 font-semibold">
                                {formatCurrency(v.minPriceG0)}
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Giá hai chiều */}
                        <td className="p-2 border-r border-stone-100 text-right font-mono">
                          {v.connectionCategory === 'noi_vung_noi_tinh' ? (
                            isEditing ? (
                              <input
                                type="number"
                                value={v.nearRegionTwoWayG0}
                                onChange={(e) =>
                                  handleCellChange(v.id, 'nearRegionTwoWayG0', Number(e.target.value) || 0)
                                }
                                className="w-20 px-1.5 py-0.5 bg-white border border-stone-300 rounded text-right text-slate-900 font-mono text-xs focus:ring-1 focus:ring-red-500"
                              />
                            ) : (
                              formatNumber(v.nearRegionTwoWayG0)
                            )
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Đơn giá chiều đi */}
                        <td className="p-2 border-r border-stone-100 text-right font-mono">
                          {v.connectionCategory === 'noi_vung_noi_tinh' ? (
                            isEditing ? (
                              <input
                                type="number"
                                value={v.nearRegionOutG0}
                                onChange={(e) =>
                                  handleCellChange(v.id, 'nearRegionOutG0', Number(e.target.value) || 0)
                                }
                                className="w-20 px-1.5 py-0.5 bg-white border border-stone-300 rounded text-right text-slate-900 font-mono text-xs focus:ring-1 focus:ring-red-500"
                              />
                            ) : (
                              formatNumber(v.nearRegionOutG0)
                            )
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Đơn giá chiều về */}
                        <td className="p-2 border-r border-stone-100 text-right font-mono">
                          {v.connectionCategory === 'noi_vung_noi_tinh' ? (
                            isEditing ? (
                              <input
                                type="number"
                                value={v.nearRegionInG0}
                                onChange={(e) =>
                                  handleCellChange(v.id, 'nearRegionInG0', Number(e.target.value) || 0)
                                }
                                className="w-20 px-1.5 py-0.5 bg-white border border-stone-300 rounded text-right text-slate-900 font-mono text-xs focus:ring-1 focus:ring-red-500"
                              />
                            ) : (
                              formatNumber(v.nearRegionInG0)
                            )
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Cột Bắc - Nam: Phụ lục 1 là Vào, Ra, 2C; Phụ lục 2 là Ra, Vào, 2C */}
                        {activeCategory === 'truck_dry' ? (
                          <>
                            {/* Bắc - Nam: Chiều vào */}
                            <td className="p-2 border-r border-stone-100 text-right font-mono text-rose-700">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={v.northSouthInG0}
                                  onChange={(e) =>
                                    handleCellChange(v.id, 'northSouthInG0', Number(e.target.value) || 0)
                                  }
                                  className="w-20 px-1.5 py-0.5 bg-white border border-rose-300 rounded text-right text-slate-900 font-mono text-xs focus:ring-1 focus:ring-rose-500"
                                />
                              ) : (
                                formatNumber(v.northSouthInG0)
                              )}
                            </td>

                            {/* Bắc - Nam: Chiều ra */}
                            <td className="p-2 border-r border-stone-100 text-right font-mono text-cyan-700">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={v.northSouthOutG0}
                                  onChange={(e) =>
                                    handleCellChange(v.id, 'northSouthOutG0', Number(e.target.value) || 0)
                                  }
                                  className="w-20 px-1.5 py-0.5 bg-white border border-cyan-300 rounded text-right text-slate-900 font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                                />
                              ) : (
                                formatNumber(v.northSouthOutG0)
                              )}
                            </td>

                            {/* Bắc - Nam: Hai chiều */}
                            <td className="p-2 border-r border-stone-100 text-right font-mono text-red-700 font-bold">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={v.northSouthTwoWayG0}
                                  onChange={(e) =>
                                    handleCellChange(v.id, 'northSouthTwoWayG0', Number(e.target.value) || 0)
                                  }
                                  className="w-20 px-1.5 py-0.5 bg-white border border-red-300 rounded text-right text-slate-900 font-mono text-xs focus:ring-1 focus:ring-red-500"
                                />
                              ) : (
                                formatNumber(v.northSouthTwoWayG0)
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            {/* Bắc - Nam: Chiều ra */}
                            <td className="p-2 border-r border-stone-100 text-right font-mono text-cyan-700">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={v.northSouthOutG0}
                                  onChange={(e) =>
                                    handleCellChange(v.id, 'northSouthOutG0', Number(e.target.value) || 0)
                                  }
                                  className="w-20 px-1.5 py-0.5 bg-white border border-cyan-300 rounded text-right text-slate-900 font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                                />
                              ) : (
                                formatNumber(v.northSouthOutG0)
                              )}
                            </td>

                            {/* Bắc - Nam: Chiều vào */}
                            <td className="p-2 border-r border-stone-100 text-right font-mono text-rose-700">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={v.northSouthInG0}
                                  onChange={(e) =>
                                    handleCellChange(v.id, 'northSouthInG0', Number(e.target.value) || 0)
                                  }
                                  className="w-20 px-1.5 py-0.5 bg-white border border-rose-300 rounded text-right text-slate-900 font-mono text-xs focus:ring-1 focus:ring-rose-500"
                                />
                              ) : (
                                formatNumber(v.northSouthInG0)
                              )}
                            </td>

                            {/* Bắc - Nam: Hai chiều */}
                            <td className="p-2 border-r border-stone-100 text-right font-mono text-red-700 font-bold">
                              {v.northSouthTwoWayG0 > 0 && v.connectionCategory === 'noi_vung_noi_tinh' ? (
                                formatNumber(v.northSouthTwoWayG0)
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Hệ số k */}
                        <td className="p-2 border-r border-stone-100 text-center font-mono font-bold text-red-600">
                          {v.oilFactorK}
                        </td>

                        {/* Áp dụng */}
                        {onSelectVehicle && (
                          <td className="p-2 text-center">
                            <button
                              onClick={() => {
                                onSelectVehicle(v.id);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-600 text-red-700 hover:text-white text-[11px] font-bold border border-red-200 transition"
                            >
                              Chọn xe
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs text-slate-600 space-y-1 shadow-xs">
            <div className="font-semibold text-slate-800">
              📌 Quy định căn cứ theo hợp đồng Viettel Logistics:
            </div>
            <p>
              • Giá dầu vốn mốc cơ sở: <strong>21.860 đồng/lít</strong> (đã gồm VAT).
            </p>
            <p>
              • Hệ số bù giá dầu <strong>k</strong>: Xe dưới 8.000kg (k = 0,25); Xe từ 8.001kg đến 18.000kg (k = 0,30); Xe trên 18.000kg (k = 0,40).
            </p>
            <p>
              • Các xe thuộc nhóm "Nội Vùng, Nội Tỉnh" có mức Giá tối thiểu cho các chặng cự ly ngắn (≤ 75km).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
