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
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-white space-y-5 sticky top-24">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Kết Quả Tính Giá Cước
            </div>
            <div className="text-sm font-bold text-white">
              {result.vehicle.name}
            </div>
          </div>
        </div>

        {/* 75km Threshold Badge */}
        {result.isUnder75Km ? (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Giá tối thiểu (≤ 75km)
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Theo đơn giá/km ({result.km}km)
          </span>
        )}
      </div>

      {/* Primary Price Display */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 border border-slate-750 shadow-inner">
        <div className="text-xs text-slate-400 font-medium">
          Tổng cước vận chuyển ước tính {input.vatRate > 0 ? `(Đã gồm ${input.vatRate}% VAT)` : '(Chưa gồm VAT)'}:
        </div>
        <div className="text-2xl sm:text-4xl font-extrabold text-amber-400 tracking-tight my-1">
          {formatCurrency(result.totalWithVat)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Đơn giá bình quân thực tế:</span>
          <span className="font-mono font-bold text-slate-200">
            {formatCurrency(result.unitPricePerKmEffective)}/km
          </span>
        </div>
      </div>

      {/* Route & Vehicle Summary Capsule */}
      <div className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between font-semibold">
          <span className="text-slate-300">Lộ trình:</span>
          <span className="text-amber-300 flex items-center gap-1.5 font-bold">
            {fromProvince?.name || 'Điểm đi'}
            <ArrowRight className="w-3 h-3 text-slate-400" />
            {toProvince?.name || 'Điểm đến'}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Phân loại tuyến:</span>
          <span className="text-slate-200 font-medium">
            {result.isNorthSouthRoute ? (
              <span className="text-amber-300 font-bold">Tuyến Trục Bắc - Nam</span>
            ) : (
              <span className="text-blue-300 font-bold">Cận Vùng / Nội Vùng</span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Chiều kết nối:</span>
          <span className="text-slate-200 font-medium">
            {input.direction === 'chieu_ra'
              ? 'Chiều ra (Nam ➔ Bắc)'
              : input.direction === 'chieu_vao'
              ? 'Chiều vào (Bắc ➔ Nam)'
              : 'Toàn trình (2 chiều)'}
          </span>
        </div>
      </div>

      {/* Cost Breakdown Details */}
      <div className="space-y-2 text-xs">
        <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
          Chi tiết đơn giá &amp; Công thức {result.vehicle.category === 'truck_reefer' ? 'Phụ lục 2' : 'Phụ lục 1'}:
        </div>

        {/* 1. Đơn giá cơ sở đúng theo tuyến */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Đơn giá cơ sở gốc (G₀):</span>
            <span className="text-slate-200 font-bold">{formatCurrency(result.baseSelectedRateG0)}/km</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Giá tối thiểu cơ sở (G₀,min):</span>
            <span className="text-slate-200">{formatCurrency(result.baseMinPriceG0)}</span>
          </div>
        </div>

        {/* 2. Fuel Escalation Formula PVOIL */}
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
          <div className="flex items-center justify-between font-medium text-amber-300">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Bù giá dầu PVOIL ({formatCurrency(result.currentDieselPrice)}/lít):
            </span>
            <span className="font-bold">
              +{formatNumber(result.oilAdjustmentRate * 100, 2)}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            Tỷ lệ tăng dầu: ({formatNumber(result.currentDieselPrice, 0)} - {formatNumber(result.baseDieselPrice, 0)}) / {formatNumber(result.baseDieselPrice, 0)} = +{(result.dieselDiffRatio * 100).toFixed(2)}% (k = {result.effectiveOilFactorK})
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-amber-500/10 text-slate-300">
            <span>Đơn giá áp dụng chốt (G₁):</span>
            <span className="font-bold text-amber-400">{formatCurrency(result.adjustedSelectedRateG1)}/km</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Giá tối thiểu sau bù dầu (G₁,min):</span>
            <span className="font-bold text-amber-400">{formatCurrency(result.adjustedMinPriceG1)}</span>
          </div>
        </div>

        {/* 3. Distance multiplication */}
        <div className="flex items-center justify-between py-1 px-2 text-slate-300">
          <span>
            {result.isUnder75Km
              ? `Cước cự ly (${result.km}km ≤ ${MIN_KM_THRESHOLD}km áp dụng Min):`
              : `Cước cự ly (${result.km}km x ${formatCurrency(result.adjustedSelectedRateG1)}/km):`}
          </span>
          <span className="font-bold text-white">{formatCurrency(result.appliedDistanceCharge)}</span>
        </div>

        {/* 4. Two-way */}
        {result.directionFactor !== 1.0 && (
          <div className="flex items-center justify-between py-1 px-2 text-slate-300">
            <span>Hệ số toàn trình 2 chiều (x{result.directionFactor}):</span>
            <span className="font-bold text-white">{formatCurrency(result.directionCharge)}</span>
          </div>
        )}

        {/* 5. Cooling fee */}
        {result.coolingCost > 0 && (
          <div className="flex items-center justify-between py-1 px-2 text-cyan-300 bg-cyan-950/20 rounded-lg">
            <span className="flex items-center gap-1">
              <Snowflake className="w-3.5 h-3.5" />
              Chi phí chạy lạnh ({input.coolingHours} giờ):
            </span>
            <span className="font-bold">{formatCurrency(result.coolingCost)}</span>
          </div>
        )}

        {/* 6. Vehicle retention fee */}
        {result.retentionCost > 0 && (
          <div className="flex items-center justify-between py-1 px-2 text-rose-300 bg-rose-950/20 rounded-lg">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Phí lưu ca xe ({input.retentionDays} ngày):
            </span>
            <span className="font-bold">{formatCurrency(result.retentionCost)}</span>
          </div>
        )}

        {/* 7. VAT */}
        {input.vatRate > 0 && (
          <div className="flex items-center justify-between py-1 px-2 text-slate-400 border-t border-slate-800">
            <span>Thuế GTGT ({input.vatRate}% VAT):</span>
            <span className="font-medium text-slate-200">{formatCurrency(result.vatAmount)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          onClick={handleCopyQuotationText}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20"
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
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Mẫu In Báo Giá</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã lưu!</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Lưu lịch sử</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={onOpenComparison}
          className="w-full text-center text-xs text-slate-400 hover:text-amber-400 py-1 transition"
        >
          🔍 So sánh cước tuyến này với các loại xe khác →
        </button>
      </div>
    </div>
  );
};
