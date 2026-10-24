import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Printer,
  Check,
  TrendingUp,
  Snowflake,
  Calendar,
  ArrowRight,
  BookmarkPlus,
  Percent,
  UserCheck,
  Lock,
  Layers,
  Info,
} from 'lucide-react';
import { CalculationResult, CalculationInput } from '../types/logistics';
import { MIN_KM_THRESHOLD } from '../data/pricingData';
import { VIETNAM_PROVINCES } from '../data/provinces';
import { formatCurrency, formatNumber } from '../utils/calculator';

interface PriceResultCardProps {
  result: CalculationResult;
  input: CalculationInput;
  onOpenQuotation: (mode?: 'customer' | 'internal') => void;
  onSaveToHistory: () => void;
  onOpenComparison: () => void;
  onSelectProfitMargin?: (margin: number) => void;
}

const PROFIT_OPTIONS = [0, 5, 10, 15, 20, 25];

export const PriceResultCard: React.FC<PriceResultCardProps> = ({
  result,
  input,
  onOpenQuotation,
  onSaveToHistory,
  onOpenComparison,
  onSelectProfitMargin,
}) => {
  const [viewMode, setViewMode] = useState<'customer' | 'internal'>('customer');
  const [copiedCustomer, setCopiedCustomer] = useState(false);
  const [copiedInternal, setCopiedInternal] = useState(false);
  const [saved, setSaved] = useState(false);

  const fromProvince = VIETNAM_PROVINCES.find((p) => p.id === input.fromProvinceId);
  const toProvince = VIETNAM_PROVINCES.find((p) => p.id === input.toProvinceId);

  const activeProfit = input.profitMarginPercent ?? result.profitMarginPercent ?? 10;

  // Copy Báo giá Khách hàng (CHỈ CÓ: Phương tiện, Lộ trình, Phân loại tuyến, Cự ly, Tổng tiền)
  const handleCopyCustomerQuotation = () => {
    const text = `🚛 BÁO GIÁ VẬN CHUYỂN VIETTEL LOGISTICS
------------------------------------------------
• Phương tiện: ${result.vehicle.name} (${result.vehicle.tonnageLabel})
• Lộ trình: ${fromProvince?.name || 'Điểm đi'} ➔ ${toProvince?.name || 'Điểm đến'}
• Phân loại tuyến: ${result.routeDescription}
• Cự ly: ${result.km} km ${result.isUnder75Km ? '(Áp dụng cước cự ly tối thiểu)' : ''}
👉 TỔNG TIỀN: ${formatCurrency(result.customerTotalWithVat)} ${input.vatRate > 0 ? `(Đã gồm ${input.vatRate}% VAT)` : ''}
------------------------------------------------
Viettel Logistics trân trọng kính báo!`;

    navigator.clipboard.writeText(text);
    setCopiedCustomer(true);
    setTimeout(() => setCopiedCustomer(false), 2500);
  };

  // Copy Chiết tính Nội bộ (ĐẦY ĐỦ GIÁ GỐC, G0, G1, BÙ DẦU, PHÍ PHỤ, LỢI NHUẬN)
  const handleCopyInternalQuotation = () => {
    const text = `📋 CHIẾT TÍNH GIÁ CƯỚC NỘI BỘ - VIETTEL LOGISTICS
------------------------------------------------
• Phương tiện: ${result.vehicle.name} (${result.vehicle.tonnageLabel})
• Lộ trình: ${fromProvince?.name || 'Điểm đi'} ➔ ${toProvince?.name || 'Điểm đến'}
• Phân loại tuyến: ${result.routeDescription}
• Cự ly: ${result.km} km
• Đơn giá cơ sở G₀: ${formatCurrency(result.baseSelectedRateG0)}/km
• Giá dầu PVOIL DO 0,05S: ${formatCurrency(result.currentDieselPrice)}/lít (Gốc: ${formatCurrency(result.baseDieselPrice)}/lít, bù: +${(result.dieselDiffRatio * 100).toFixed(2)}%)
• Đơn giá chốt G₁: ${formatCurrency(result.adjustedSelectedRateG1)}/km
• Cước cự ly cơ sở: ${formatCurrency(result.appliedDistanceCharge)}
${result.coolingCost > 0 ? `• Phí chạy lạnh (${input.coolingHours}h): ${formatCurrency(result.coolingCost)}\n` : ''}${result.retentionCost > 0 ? `• Phí lưu ca xe (${input.retentionDays} ngày): ${formatCurrency(result.retentionCost)}\n` : ''}• Giá vốn gốc (trước VAT): ${formatCurrency(result.subtotalBeforeVat)}
• Mức lợi nhuận (${activeProfit}%): +${formatCurrency(result.profitAmount)}
• Giá bán trước VAT: ${formatCurrency(result.customerSubtotalBeforeVat)}
• Thuế GTGT (${input.vatRate}%): ${formatCurrency(result.customerVatAmount)}
👉 TỔNG BÁO KHÁCH HÀNG: ${formatCurrency(result.customerTotalWithVat)}
• Đơn giá bình quân gốc: ${formatCurrency(result.unitPricePerKmEffective)}/km
------------------------------------------------
Căn cứ: ${result.vehicle.category === 'truck_reefer' ? 'Phụ lục 2 (Xe Lạnh)' : 'Phụ lục 1 (Xe Nóng)'} Viettel Logistics.`;

    navigator.clipboard.writeText(text);
    setCopiedInternal(true);
    setTimeout(() => setCopiedInternal(false), 2500);
  };

  const handleSave = () => {
    onSaveToHistory();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl shadow-md p-4 sm:p-6 text-slate-800 space-y-4 sm:space-y-5 sticky top-20">
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider truncate">
              Kết Quả Tính Giá Cước Viettel
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {result.vehicle.name}
            </div>
          </div>
        </div>

        {/* 75km Threshold Badge */}
        {result.isUnder75Km && result.vehicle.minPriceG0 > 0 ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            Giá tối thiểu (≤ 75km)
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            Theo đơn giá/km ({result.km}km)
          </span>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 bg-stone-100/80 rounded-xl border border-stone-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setViewMode('customer')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
            viewMode === 'customer'
              ? 'bg-white text-slate-900 font-bold shadow-xs border border-stone-200/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className={`w-3.5 h-3.5 ${viewMode === 'customer' ? 'text-red-600' : ''}`} />
          <span>Báo giá Khách hàng</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('internal')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
            viewMode === 'internal'
              ? 'bg-white text-slate-900 font-bold shadow-xs border border-stone-200/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className={`w-3.5 h-3.5 ${viewMode === 'internal' ? 'text-red-600' : ''}`} />
          <span>Chiết tính Nội bộ</span>
        </button>
      </div>

      {/* Profit Margin Selector */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-red-50/60 to-orange-50/40 border border-red-200/70 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-red-600" />
            Mức lợi nhuận mong muốn:
          </span>
          <span className="font-bold text-red-600 font-mono">
            +{activeProfit}% {activeProfit > 0 && `(+${formatCurrency(result.profitAmount)})`}
          </span>
        </div>

        {/* Step 5% pill buttons: 0%, 5%, 10%, 15%, 20%, 25% */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {PROFIT_OPTIONS.map((pct) => {
            const isSelected = activeProfit === pct;
            return (
              <button
                key={pct}
                type="button"
                onClick={() => onSelectProfitMargin && onSelectProfitMargin(pct)}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                  isSelected
                    ? 'bg-[#EE0033] text-white shadow-xs scale-[1.02]'
                    : 'bg-white hover:bg-red-50 text-slate-700 border border-stone-200 hover:border-red-300'
                }`}
              >
                {pct === 0 ? '0% Gốc' : `${pct}%`}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: CUSTOMER QUOTATION (STRICTLY REQUIRED 5 FIELDS ONLY) */}
      {viewMode === 'customer' && (
        <div className="space-y-3 animate-fade-in">
          {/* Main Price Box for Customer */}
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Tổng tiền báo khách {activeProfit > 0 ? `(Biên lợi nhuận ${activeProfit}%)` : '(Giá gốc)'}:</span>
              {input.vatRate > 0 && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                  Đã gồm {input.vatRate}% VAT
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight my-1.5 flex items-baseline">
              <span className="text-[#EE0033] font-mono">{formatCurrency(result.customerTotalWithVat)}</span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1.5 border-t border-stone-200/80">
              <span>Đơn giá bình quân:</span>
              <span className="font-mono font-bold text-slate-800">
                {result.km > 0 ? formatCurrency(Math.round(result.customerTotalWithVat / result.km)) : '0 ₫'}/km
              </span>
            </div>
          </div>

          {/* Customer Quote Specification Card */}
          <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2.5 text-xs">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider pb-1 border-b border-stone-100 flex items-center justify-between">
              <span>Thông tin báo giá khách hàng</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                Không hiện giá gốc
              </span>
            </div>

            {/* 1. Phương tiện */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 shrink-0 font-medium">• Phương tiện:</span>
              <span className="text-slate-900 font-bold text-right">
                {result.vehicle.name} ({result.vehicle.tonnageLabel})
              </span>
            </div>

            {/* 2. Lộ trình */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 shrink-0 font-medium">• Lộ trình:</span>
              <span className="text-slate-900 font-bold flex items-center gap-1.5 text-right">
                {fromProvince?.name || 'Điểm đi'}
                <ArrowRight className="w-3 h-3 text-red-600 shrink-0" />
                {toProvince?.name || 'Điểm đến'}
              </span>
            </div>

            {/* 3. Phân loại tuyến */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 shrink-0 font-medium">• Phân loại tuyến:</span>
              <span className="font-semibold text-slate-800 text-right">
                {result.routeDescription}
              </span>
            </div>

            {/* 4. Cự ly */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 shrink-0 font-medium">• Cự ly:</span>
              <span className="font-bold text-slate-900 text-right">
                {result.km} km {result.isUnder75Km ? '(Áp dụng cự ly tối thiểu)' : ''}
              </span>
            </div>

            {/* 5. Tổng tiền (có lợi nhuận) */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/80">
              <span className="text-slate-900 font-bold shrink-0">• Tổng tiền thanh toán:</span>
              <span className="font-black text-red-600 font-mono text-sm text-right">
                {formatCurrency(result.customerTotalWithVat)}
              </span>
            </div>
          </div>

          {/* Copy Button for Customer */}
          <button
            type="button"
            onClick={handleCopyCustomerQuotation}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-[#EE0033] to-red-600 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm transition shadow-sm shadow-red-600/30 active:scale-[0.99]"
          >
            {copiedCustomer ? (
              <>
                <Check className="w-4 h-4" />
                <span>Đã sao chép báo giá Khách hàng!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Sao chép báo giá Khách hàng (Zalo / Mail)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* VIEW MODE 2: INTERNAL BREAKDOWN (SHOWS BASE PRICE & ALL COST COMPONENTS) */}
      {viewMode === 'internal' && (
        <div className="space-y-3 animate-fade-in text-xs">
          {/* Main Price Box for Internal */}
          <div className="p-3.5 rounded-2xl bg-stone-100/70 border border-stone-200">
            <div className="flex items-center justify-between text-slate-600">
              <span>Giá vốn gốc nội bộ:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(result.totalWithVat)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 mt-1">
              <span>Lợi nhuận đề xuất (+{activeProfit}%):</span>
              <span className="font-mono font-bold text-emerald-700">+{formatCurrency(result.profitAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-900 font-extrabold text-sm pt-2 mt-2 border-t border-stone-200">
              <span>Tổng giá bán xuất hóa đơn:</span>
              <span className="text-red-600 font-mono text-base">{formatCurrency(result.customerTotalWithVat)}</span>
            </div>
          </div>

          {/* Detailed Cost Breakdown */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Cấu thành đơn giá &amp; Biến động dầu:</span>
              <span className="text-[10px] text-red-600 font-normal">
                {result.vehicle.category === 'truck_reefer' ? 'Phụ lục 2 (Xe Lạnh)' : 'Phụ lục 1 (Xe Nóng)'}
              </span>
            </div>

            {/* 1. Base Rate G0 */}
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span>Đơn giá cơ sở gốc (G₀):</span>
                <span className="text-slate-900 font-bold">{formatCurrency(result.baseSelectedRateG0)}/km</span>
              </div>
              {result.baseMinPriceG0 > 0 && (
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Giá tối thiểu cơ sở (G₀,min):</span>
                  <span>{formatCurrency(result.baseMinPriceG0)}</span>
                </div>
              )}
            </div>

            {/* 2. Fuel Escalation Formula PVOIL */}
            <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 space-y-1">
              <div className="flex items-center justify-between font-medium text-red-800">
                <span className="flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  Bù giá dầu PVOIL ({formatCurrency(result.currentDieselPrice)}/lít):
                </span>
                <span className="font-bold text-red-700">
                  +{formatNumber(result.oilAdjustmentRate * 100, 2)}%
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Δ dầu: ({formatNumber(result.currentDieselPrice, 0)} - {formatNumber(result.baseDieselPrice, 0)}) / {formatNumber(result.baseDieselPrice, 0)} = +{(result.dieselDiffRatio * 100).toFixed(2)}% (k = {result.effectiveOilFactorK})
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-red-100 text-slate-700 font-medium">
                <span>Đơn giá áp dụng chốt (G₁):</span>
                <span className="font-bold text-slate-900">{formatCurrency(result.adjustedSelectedRateG1)}/km</span>
              </div>
              {result.adjustedMinPriceG1 > 0 && (
                <div className="flex items-center justify-between text-slate-700 text-[11px]">
                  <span>Giá tối thiểu sau bù dầu (G₁,min):</span>
                  <span className="font-bold text-red-700">{formatCurrency(result.adjustedMinPriceG1)}</span>
                </div>
              )}
            </div>

            {/* 3. Distance multiplication */}
            <div className="flex items-center justify-between py-1 px-2 text-slate-700">
              <span>
                {result.isUnder75Km && result.adjustedMinPriceG1 > 0
                  ? `Cước cự ly (≤ ${MIN_KM_THRESHOLD}km áp dụng Min):`
                  : `Cước cự ly (${result.km}km x ${formatCurrency(result.adjustedSelectedRateG1)}/km):`}
              </span>
              <span className="font-bold text-slate-900">{formatCurrency(result.appliedDistanceCharge)}</span>
            </div>

            {/* 4. Cooling fee */}
            {result.coolingCost > 0 && (
              <div className="flex items-center justify-between py-1 px-2 text-cyan-800 bg-cyan-50 border border-cyan-100 rounded-lg">
                <span className="flex items-center gap-1">
                  <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                  Chạy lạnh ({input.coolingHours} giờ):
                </span>
                <span className="font-bold">{formatCurrency(result.coolingCost)}</span>
              </div>
            )}

            {/* 5. Retention fee */}
            {result.retentionCost > 0 && (
              <div className="flex items-center justify-between py-1 px-2 text-rose-800 bg-rose-50 border border-rose-100 rounded-lg">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-600" />
                  Phí lưu ca ({input.retentionDays} ngày):
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

          {/* Copy Button for Internal */}
          <button
            type="button"
            onClick={handleCopyInternalQuotation}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition shadow-sm active:scale-[0.99]"
          >
            {copiedInternal ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Đã sao chép chiết tính nội bộ!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Sao chép chiết tính NỘI BỘ</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenQuotation(viewMode)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-red-50/50 text-slate-700 hover:text-red-700 border border-stone-200 hover:border-red-300 text-xs font-semibold transition shadow-2xs active:scale-[0.99]"
          >
            <Printer className="w-3.5 h-3.5 text-red-600" />
            <span>In Bản Báo Giá</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-slate-700 hover:text-slate-900 border border-stone-200 hover:border-stone-300 text-xs font-semibold transition shadow-2xs active:scale-[0.99]"
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
          type="button"
          onClick={onOpenComparison}
          className="w-full text-center text-xs text-slate-500 hover:text-red-600 py-1 transition font-medium"
        >
          🔍 So sánh cước tuyến này với các loại xe khác →
        </button>
      </div>
    </div>
  );
};
