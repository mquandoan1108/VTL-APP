import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Printer,
  Check,
  TrendingUp,
  Snowflake,
  Container,
  Compass,
  ArrowRight,
  BookmarkPlus,
  ShieldCheck,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { CalculationResult, CalculationInput } from '../types/logistics';
import { MIN_KM_THRESHOLD } from '../data/pricingData';
import { VIETNAM_PROVINCES } from '../data/provinces';
import { formatCurrency, formatNumber } from '../utils/calculator';

interface PriceResultCardProps {
  result: CalculationResult;
  input: CalculationInput;
  onOpenQuotation: () => void;
  onSaveToHistory: () => void;
  onOpenComparison: () => void;
}

export const PriceResultCard: React.FC<PriceResultCardProps> = ({
  result,
  input,
  onOpenQuotation,
  onSaveToHistory,
  onOpenComparison,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const fromProvince = VIETNAM_PROVINCES.find((p) => p.id === input.fromProvinceId);
  const toProvince = VIETNAM_PROVINCES.find((p) => p.id === input.toProvinceId);

  const handleCopyQuotationText = () => {
    const text = `🚛 BÁO GIÁ VẬN CHUYỂN VIETTEL LOGISTICS
--------------------------------------
• Phương tiện: ${result.vehicle.name} (${result.vehicle.tonnageLabel})
• Lộ trình: ${fromProvince?.name || 'Điểm đi'} ➔ ${toProvince?.name || 'Điểm đến'}
• Phân loại tuyến: ${result.routeDescription}
• Cự ly: ${result.km} km ${result.isUnder75Km ? '(≤ 75km: Áp dụng giá tối thiểu)' : ''}
• Đơn giá cước G₁: ${formatCurrency(result.adjustedSelectedRateG1)}/km (Gốc G₀: ${formatCurrency(result.baseSelectedRateG0)}/km)
• Giá dầu PVOIL DO 0,05S: ${formatCurrency(result.currentDieselPrice)}/lít (Gốc: ${formatCurrency(result.baseDieselPrice)}/lít, bù: +${(result.dieselDiffRatio * 100).toFixed(2)}%)
• Cước cơ sở: ${formatCurrency(result.appliedDistanceCharge)}
${result.coolingCost > 0 ? `• CP Chạy lạnh (${input.coolingHours}h): ${formatCurrency(result.coolingCost)}\n` : ''}${result.retentionCost > 0 ? `• Phí lưu ca xe (${input.retentionDays} ngày): ${formatCurrency(result.retentionCost)}\n` : ''}• Tổng trước VAT: ${formatCurrency(result.subtotalBeforeVat)}
• VAT (${input.vatRate}%): ${formatCurrency(result.vatAmount)}
👉 TỔNG THANH TOÁN: ${formatCurrency(result.totalWithVat)}
--------------------------------------
Biểu giá căn cứ theo ${result.vehicle.category === 'truck_reefer' ? 'Phụ lục 2 (Xe Lạnh)' : 'Phụ lục 1 (Xe Nóng)'} Viettel Logistics & Dữ liệu PVOIL.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    onSaveToHistory();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl shadow-md p-5 sm:p-6 text-slate-800 space-y-5 sticky top-24">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
              Kết Quả Tính Giá Cước Viettel
            </div>
            <div className="text-sm font-bold text-slate-900">
              {result.vehicle.name}
            </div>
          </div>
        </div>

        {/* 75km Threshold Badge */}
        {result.isUnder75Km && result.vehicle.minPriceG0 > 0 ? (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
            Giá tối thiểu (≤ 75km)
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Theo đơn giá/km ({result.km}km)
          </span>
        )}
      </div>

      {/* Primary Price Display */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF9F5] border border-stone-200/90 shadow-xs">
        <div className="text-xs text-slate-500 font-medium">
          Tổng cước vận chuyển {input.vatRate > 0 ? `(Đã gồm ${input.vatRate}% VAT)` : '(Chưa gồm VAT)'}:
        </div>
        <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight my-1 flex items-baseline gap-1">
          <span className="text-[#EE0033] font-mono">{formatCurrency(Math.round(result.totalWithVat))}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-stone-200">
          <span>Đơn giá bình quân thực tế:</span>
          <span className="font-mono font-bold text-slate-800">
            {formatCurrency(Math.round(result.unitPricePerKmEffective))}/km
          </span>
        </div>
      </div>

      {/* Route & Vehicle Summary Capsule */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-2 text-xs">
        <div className="flex items-center justify-between font-semibold">
          <span className="text-slate-500">Lộ trình:</span>
          <span className="text-slate-900 flex items-center gap-1.5 font-bold">
            {fromProvince?.name || 'Điểm đi'}
            <ArrowRight className="w-3 h-3 text-red-600" />
            {toProvince?.name || 'Điểm đến'}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-500">
          <span>Phân loại tuyến:</span>
          <span className="font-semibold">
            {result.isNorthSouthRoute ? (
              <span className="text-red-600 font-bold">Tuyến Trục Bắc - Nam</span>
            ) : (
              <span className="text-emerald-700 font-bold">Cận Vùng / Nội Vùng (Bắc-Bắc, Trung-Trung, Nam-Nam)</span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-500">
          <span>Chiều kết nối:</span>
          <span className="text-slate-800 font-medium">
            {input.direction === 'chieu_ra'
              ? 'Chiều ra (Nam ➔ Bắc / Chiều đi)'
              : input.direction === 'chieu_vao'
              ? 'Chiều vào (Bắc ➔ Nam / Chiều về)'
              : 'Toàn trình (2 chiều)'}
          </span>
        </div>
      </div>

      {/* Cost Breakdown Details */}
      <div className="space-y-2 text-xs">
        <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
          <span>Chi tiết cước &amp; Bù dầu:</span>
          <span className="text-[10px] text-red-600 font-normal">
            {result.vehicle.category === 'truck_reefer' ? 'Phụ lục 2 (Xe Lạnh)' : 'Phụ lục 1 (Xe Nóng)'}
          </span>
        </div>

        {/* 1. Base Rate */}
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span>Đơn giá cơ sở gốc (G₀):</span>
            <span className="text-slate-800 font-bold">{formatCurrency(result.baseSelectedRateG0)}/km</span>
          </div>
          {result.baseMinPriceG0 > 0 && (
            <div className="flex items-center justify-between text-slate-500">
              <span>Giá tối thiểu cơ sở (G₀,min):</span>
              <span className="text-slate-800">{formatCurrency(result.baseMinPriceG0)}</span>
            </div>
          )}
        </div>

        {/* 2. Fuel Escalation Formula PVOIL */}
        <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 space-y-1.5">
          <div className="flex items-center justify-between font-medium text-red-800">
            <span className="flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-red-600" />
              Bù giá dầu PVOIL ({formatCurrency(result.currentDieselPrice)}/lít):
            </span>
            <span className="font-bold text-red-700">
              +{formatNumber(result.oilAdjustmentRate * 100, 2)}%
            </span>
          </div>
          <div className="text-[11px] text-slate-600 leading-snug">
            Tỷ lệ tăng dầu: ({formatNumber(result.currentDieselPrice, 0)} - {formatNumber(result.baseDieselPrice, 0)}) / {formatNumber(result.baseDieselPrice, 0)} = +{(result.dieselDiffRatio * 100).toFixed(2)}% (k = {result.effectiveOilFactorK})
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-red-100 text-slate-700">
            <span>Đơn giá áp dụng chốt (G₁):</span>
            <span className="font-bold text-slate-900">{formatCurrency(result.adjustedSelectedRateG1)}/km</span>
          </div>
          {result.adjustedMinPriceG1 > 0 && (
            <div className="flex items-center justify-between text-slate-700">
              <span>Giá tối thiểu sau bù dầu (G₁,min):</span>
              <span className="font-bold text-red-700">{formatCurrency(result.adjustedMinPriceG1)}</span>
            </div>
          )}
        </div>

        {/* 3. Distance multiplication */}
        <div className="flex items-center justify-between py-1 px-2 text-slate-700">
          <span>
            {result.isUnder75Km && result.adjustedMinPriceG1 > 0
              ? `Cước cự ly (${result.km}km ≤ ${MIN_KM_THRESHOLD}km áp dụng Min):`
              : `Cước cự ly (${result.km}km x ${formatCurrency(result.adjustedSelectedRateG1)}/km):`}
          </span>
          <span className="font-bold text-slate-900">{formatCurrency(result.appliedDistanceCharge)}</span>
        </div>

        {/* 4. Cooling fee */}
        {result.coolingCost > 0 && (
          <div className="flex items-center justify-between py-1 px-2 text-cyan-800 bg-cyan-50 border border-cyan-100 rounded-lg">
            <span className="flex items-center gap-1">
              <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
              Chi phí chạy lạnh ({input.coolingHours} giờ):
            </span>
            <span className="font-bold">{formatCurrency(result.coolingCost)}</span>
          </div>
        )}

        {/* 5. Retention fee */}
        {result.retentionCost > 0 && (
          <div className="flex items-center justify-between py-1 px-2 text-rose-800 bg-rose-50 border border-rose-100 rounded-lg">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              Phí lưu ca xe ({input.retentionDays} ngày):
            </span>
            <span className="font-bold">{formatCurrency(result.retentionCost)}</span>
          </div>
        )}

        {/* 6. VAT */}
        {input.vatRate > 0 && (
          <div className="flex items-center justify-between py-1 px-2 text-slate-500 border-t border-stone-200">
            <span>Thuế GTGT ({input.vatRate}% VAT):</span>
            <span className="font-medium text-slate-800">{formatCurrency(result.vatAmount)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          onClick={handleCopyQuotationText}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-[#EE0033] to-red-600 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm transition shadow-sm shadow-red-600/30 active:scale-[0.99]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Đã sao chép báo giá!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Sao chép báo giá (Gửi Zalo / Email)</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenQuotation}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-red-50/50 text-slate-700 hover:text-red-700 border border-stone-200 hover:border-red-300 text-xs font-semibold transition shadow-xs active:scale-[0.99]"
          >
            <Printer className="w-3.5 h-3.5 text-red-600" />
            <span>Mẫu In Báo Giá</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-slate-700 hover:text-slate-900 border border-stone-200 hover:border-stone-300 text-xs font-semibold transition shadow-xs active:scale-[0.99]"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã lưu!</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-3.5 h-3.5 text-red-600" />
                <span>Lưu lịch sử</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={onOpenComparison}
          className="w-full text-center text-xs text-slate-500 hover:text-red-600 py-1 transition font-medium"
        >
          🔍 So sánh cước tuyến này với các loại xe khác →
        </button>
      </div>
    </div>
  );
};
