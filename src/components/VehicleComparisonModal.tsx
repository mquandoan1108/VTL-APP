import React from 'react';
import { X, ArrowRight, Check, Container, Truck, Snowflake } from 'lucide-react';
import { CalculationInput, VehicleOption } from '../types/logistics';
import { VEHICLE_OPTIONS } from '../data/pricingData';
import { VIETNAM_PROVINCES } from '../data/provinces';
import { calculateFreightPrice, formatCurrency } from '../utils/calculator';

interface VehicleComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: CalculationInput;
  onSelectVehicle: (vehicleId: string) => void;
  vehicles?: VehicleOption[];
}

export const VehicleComparisonModal: React.FC<VehicleComparisonModalProps> = ({
  isOpen,
  onClose,
  input,
  onSelectVehicle,
  vehicles,
}) => {
  if (!isOpen) return null;

  const vehicleList = (vehicles || VEHICLE_OPTIONS).filter(
    (v) => !['dry_2500kg', 'dry_5000kg', 'dry_8000kg', 'dry_28000kg'].includes(v.id)
  );

  const fromProvince = VIETNAM_PROVINCES.find((p) => p.id === input.fromProvinceId);
  const toProvince = VIETNAM_PROVINCES.find((p) => p.id === input.toProvinceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Bảng So Sánh Giá Cước Tất Cả Các Loại Xe
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tuyến: <span className="text-[#EE0033] font-semibold">{fromProvince?.name} ➔ {toProvince?.name}</span> ({input.km} km) • Giá dầu: <span className="text-slate-800 font-semibold">{formatCurrency(input.currentDieselPrice)}/lít</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-slate-700 hover:bg-stone-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-white">
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-stone-50 text-slate-700 font-semibold border-b border-stone-200">
                  <th className="py-3 px-3">Loại xe &amp; Tải trọng</th>
                  <th className="py-3 px-3">Loại hình kết nối</th>
                  <th className="py-3 px-3 text-right">KM Chuẩn</th>
                  <th className="py-3 px-3 text-right">Giá Min G₁</th>
                  <th className="py-3 px-3 text-right">Đơn giá G₁/km</th>
                  <th className="py-3 px-3 text-right font-bold text-red-600">Tổng Cước (Chưa VAT)</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-900">Tổng Sau VAT</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {vehicleList.map((v) => {
                  const isCurrent = v.id === input.vehicleId;
                  const res = calculateFreightPrice(
                    {
                      ...input,
                      vehicleId: v.id,
                      vehicleCategory: v.category,
                      driverCount: v.driverCount,
                      connectionCategory: v.connectionCategory,
                    },
                    vehicleList
                  );

                  return (
                    <tr
                      key={v.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-red-50/70 font-medium'
                          : 'hover:bg-stone-50/80'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {v.category === 'truck_reefer' ? (
                            <Snowflake className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          ) : (
                            <Truck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          )}
                          <span>{v.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{v.tonnageLabel} ({v.driverCount} lái)</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            v.connectionCategory === 'noi_vung_noi_tinh'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {v.connectionCategory === 'noi_vung_noi_tinh' ? 'Nội Vùng, Nội Tỉnh' : 'Bắc Nam, Cận Vùng'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {v.kmStandard ? `${v.kmStandard.toLocaleString('vi-VN')} km` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 font-mono">
                        {res.adjustedMinPriceG1 > 0 ? formatCurrency(res.adjustedMinPriceG1) : '-'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 font-mono">
                        {formatCurrency(res.adjustedSelectedRateG1)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-red-600 text-sm font-mono">
                        {formatCurrency(res.subtotalBeforeVat)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm font-mono">
                        {formatCurrency(res.totalWithVat)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EE0033] text-white font-bold text-xs shadow-sm">
                            <Check className="w-3 h-3" /> Đang chọn
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectVehicle(v.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold border border-stone-300 transition"
                          >
                            Chọn xe này
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-slate-800 font-semibold text-xs sm:text-sm transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
