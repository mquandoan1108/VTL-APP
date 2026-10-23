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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Bảng So Sánh Giá Cước Tất Cả Các Loại Xe
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tuyến: <span className="text-amber-300 font-semibold">{fromProvince?.name} ➔ {toProvince?.name}</span> ({input.km} km) • Giá dầu: <span className="text-slate-200">{formatCurrency(input.currentDieselPrice)}/lít</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                  <th className="py-3 px-3">Loại xe &amp; Tải trọng</th>
                  <th className="py-3 px-3">Nhóm</th>
                  <th className="py-3 px-3 text-right">Giá Min G₁</th>
                  <th className="py-3 px-3 text-right">Đơn giá G₁/km</th>
                  <th className="py-3 px-3 text-right font-bold text-amber-400">Tổng Cước (Chưa VAT)</th>
                  <th className="py-3 px-3 text-right font-bold text-white">Tổng Sau VAT</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {vehicleList.map((v) => {
                  const isCurrent = v.id === input.vehicleId;
                  const res = calculateFreightPrice(
                    {
                      ...input,
                      vehicleId: v.id,
                      vehicleCategory: v.category,
                      driverCount: v.driverCount,
                    },
                    vehicleList
                  );

                  return (
                    <tr
                      key={v.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-amber-500/10 font-medium'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{v.name}</div>
                        <div className="text-[11px] text-slate-400">{v.tonnageLabel}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            v.category === 'truck_reefer'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {v.category === 'truck_reefer' ? <Snowflake className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                          {v.category === 'truck_reefer'
                            ? `PL2 - Xe lạnh (${v.driverCount} lái)`
                            : `PL1 - Xe nóng (${v.driverCount} lái)`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        {formatCurrency(res.adjustedMinPriceG1)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        {formatCurrency(res.adjustedSelectedRateG1)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-400 text-sm">
                        {formatCurrency(res.subtotalBeforeVat)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white text-sm">
                        {formatCurrency(res.totalWithVat)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs">
                            <Check className="w-3 h-3" /> Đang chọn
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectVehicle(v.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
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
        <div className="p-4 bg-slate-850 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
