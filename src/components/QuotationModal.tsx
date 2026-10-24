import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, UserCheck, Lock, Copy, Check, ArrowRight } from 'lucide-react';
import { CalculationResult, CalculationInput } from '../types/logistics';
import { VIETNAM_PROVINCES } from '../data/provinces';
import { DIRECTION_LABELS, CONNECTION_TYPE_LABELS, MIN_KM_THRESHOLD } from '../data/pricingData';
import { formatCurrency, formatNumber } from '../utils/calculator';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  input: CalculationInput;
  initialMode?: 'customer' | 'internal';
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  result,
  input,
  initialMode = 'customer',
}) => {
  const [mode, setMode] = useState<'customer' | 'internal'>(initialMode);
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const fromProvince = VIETNAM_PROVINCES.find((p) => p.id === input.fromProvinceId);
  const toProvince = VIETNAM_PROVINCES.find((p) => p.id === input.toProvinceId);
  const directionInfo = DIRECTION_LABELS[input.direction];
  const connectionInfo = CONNECTION_TYPE_LABELS[input.connectionType];

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleCopyCurrent = () => {
    let text = '';
    if (mode === 'customer') {
      text = `🚛 BÁO GIÁ VẬN CHUYỂN VIETTEL LOGISTICS
------------------------------------------------
• Phương tiện: ${result.vehicle.name} (${result.vehicle.tonnageLabel})
• Lộ trình: ${fromProvince?.name || 'Điểm đi'} ➔ ${toProvince?.name || 'Điểm đến'}
• Phân loại tuyến: ${result.routeDescription}
• Cự ly: ${result.km} km ${result.isUnder75Km ? '(Áp dụng cự ly tối thiểu)' : ''}
👉 TỔNG TIỀN: ${formatCurrency(result.customerTotalWithVat)} ${input.vatRate > 0 ? `(Đã gồm ${input.vatRate}% VAT)` : ''}
------------------------------------------------
Viettel Logistics trân trọng kính báo!`;
    } else {
      text = `📋 BẢNG CHIẾT TÍNH GIÁ CƯỚC NỘI BỘ - VIETTEL LOGISTICS
------------------------------------------------
• Phương tiện: ${result.vehicle.name} (${result.vehicle.tonnageLabel})
• Lộ trình: ${fromProvince?.name || 'Điểm đi'} ➔ ${toProvince?.name || 'Điểm đến'}
• Phân loại tuyến: ${result.routeDescription}
• Cự ly: ${result.km} km
• Đơn giá gốc G₀: ${formatCurrency(result.baseSelectedRateG0)}/km
• Giá dầu PVOIL DO 0,05S: ${formatCurrency(result.currentDieselPrice)}/lít (Gốc: ${formatCurrency(result.baseDieselPrice)}/lít, bù: +${(result.dieselDiffRatio * 100).toFixed(2)}%)
• Đơn giá chốt G₁: ${formatCurrency(result.adjustedSelectedRateG1)}/km
• Cước cự ly cơ sở: ${formatCurrency(result.appliedDistanceCharge)}
${result.coolingCost > 0 ? `• Phí chạy lạnh (${input.coolingHours}h): ${formatCurrency(result.coolingCost)}\n` : ''}${result.retentionCost > 0 ? `• Phí lưu ca xe (${input.retentionDays} ngày): ${formatCurrency(result.retentionCost)}\n` : ''}• Giá vốn gốc (trước VAT): ${formatCurrency(result.subtotalBeforeVat)}
• Mức lợi nhuận (${result.profitMarginPercent}%): +${formatCurrency(result.profitAmount)}
• Giá bán trước VAT: ${formatCurrency(result.customerSubtotalBeforeVat)}
• Thuế GTGT (${input.vatRate}%): ${formatCurrency(result.customerVatAmount)}
👉 TỔNG BÁO KHÁCH HÀNG: ${formatCurrency(result.customerTotalWithVat)}
------------------------------------------------
Viettel Logistics.`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-3xl my-6 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Controls Bar */}
        <div className="p-3 sm:p-4 bg-[#FAF8F5] border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'customer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${mode === 'customer' ? 'text-red-600' : ''}`} />
              <span>Báo Giá Khách Hàng</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('internal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'internal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${mode === 'internal' ? 'text-red-600' : ''}`} />
              <span>Chiết Tính Nội Bộ</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={handleCopyCurrent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold text-xs transition"
              title="Sao chép nội dung văn bản này"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sao chép</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EE0033] hover:bg-red-700 text-white font-bold text-xs transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Văn Bản</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-slate-700 hover:bg-stone-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div
          ref={printAreaRef}
          className="p-6 sm:p-10 bg-white text-slate-900 font-sans text-xs sm:text-sm print:p-0 print:m-0 print:bg-white print:text-black overflow-y-auto max-h-[75vh]"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-extrabold text-base sm:text-lg uppercase tracking-tight text-[#EE0033]">
                  CÔNG TY TNHH MTV LOGISTICS VIETTEL
                </div>
                <div className="text-xs font-semibold text-slate-600 uppercase">
                  {mode === 'customer'
                    ? 'TRUNG TÂM KINH DOANH VẬN TẢI TOÀN QUỐC'
                    : 'PHÒNG TÀI CHÍNH • BỘ PHẬN ĐIỀU HÀNH VẬN TẢI'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Địa chỉ: Tòa nhà Viettel, Số 1 Giang Văn Minh, Ba Đình, Hà Nội
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Mã phiếu: VT-{Date.now().toString().slice(-6)}</div>
                <div className="text-xs font-medium text-slate-700">Ngày lập: {today}</div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. VIEW DÀNH CHO KHÁCH HÀNG (STRICTLY REQUIRED 5 FIELDS - NO INTERNAL BASE) */}
          {/* ========================================================================= */}
          {mode === 'customer' ? (
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center my-4">
                <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-wide">
                  THÔNG BÁO BÁO GIÁ CƯỚC VẬN CHUYỂN
                </h1>
                <div className="text-xs text-slate-500 mt-1">
                  Kính gửi Quý Khách hàng / Quý Đối tác
                </div>
              </div>

              {/* 5 Required Specifications Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <tbody>
                    {/* Item 1: Phương tiện */}
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <td className="w-1/3 py-3 px-4 font-bold text-slate-600">
                        1. Phương tiện:
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        {result.vehicle.name} ({result.vehicle.tonnageLabel})
                      </td>
                    </tr>

                    {/* Item 2: Lộ trình */}
                    <tr className="border-b border-slate-200">
                      <td className="py-3 px-4 font-bold text-slate-600">
                        2. Lộ trình:
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span>{fromProvince?.name || 'Điểm đi'}</span>
                        <ArrowRight className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{toProvince?.name || 'Điểm đến'}</span>
                      </td>
                    </tr>

                    {/* Item 3: Phân loại tuyến */}
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-600">
                        3. Phân loại tuyến:
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {result.routeDescription}
                      </td>
                    </tr>

                    {/* Item 4: Cự ly */}
                    <tr className="border-b border-slate-200">
                      <td className="py-3 px-4 font-bold text-slate-600">
                        4. Cự ly:
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {result.km} Km {result.isUnder75Km ? '(Áp dụng cự ly tối thiểu)' : ''}
                      </td>
                    </tr>

                    {/* Item 5: Tổng tiền (có lợi nhuận) */}
                    <tr className="bg-red-50/90 text-red-950 font-bold">
                      <td className="py-4 px-4 font-extrabold uppercase text-xs sm:text-sm">
                        5. Tổng tiền (có lợi nhuận):
                      </td>
                      <td className="py-4 px-4 text-base sm:text-xl font-black text-[#EE0033] font-mono">
                        {formatCurrency(result.customerTotalWithVat)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Price Details Note */}
              {input.vatRate > 0 && (
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Chi tiết giá:</span>
                  <div className="space-x-4">
                    <span>Cước trước thuế: <strong className="text-slate-800">{formatCurrency(result.customerSubtotalBeforeVat)}</strong></span>
                    <span>VAT ({input.vatRate}%): <strong className="text-slate-800">{formatCurrency(result.customerVatAmount)}</strong></span>
                  </div>
                </div>
              )}

              {/* Customer Terms */}
              <div className="text-[11px] text-slate-600 space-y-1.5 pt-2">
                <div className="font-bold text-slate-700 uppercase tracking-wide">Điều khoản thương mại:</div>
                <div>- Giá cước đã bao gồm chi phí nhiên liệu, cầu đường, phà bến, tài xế theo đúng phương án vận chuyển tiêu chuẩn.</div>
                <div>- Thời gian hiệu lực báo giá: Trong vòng 15 ngày kể từ ngày ban hành.</div>
                <div>- Viettel Logistics cam kết giám sát hành trình GPS 24/7 và đảm bảo an toàn tuyệt đối cho hàng hóa trong suốt lộ trình.</div>
              </div>

              {/* Customer Signature Blocks */}
              <div className="grid grid-cols-2 text-center text-xs mt-8 pt-4 border-t border-slate-300">
                <div>
                  <div className="font-bold uppercase text-slate-800">ĐẠI DIỆN KHÁCH HÀNG</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</div>
                  <div className="h-20"></div>
                </div>
                <div>
                  <div className="font-bold uppercase text-slate-800">ĐẠI DIỆN VIETTEL LOGISTICS</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký duyệt và đóng dấu)</div>
                  <div className="h-20"></div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* 2. VIEW DÀNH CHO NỘI BỘ (CHỈ BÁO GIÁ GỐC VÀ CẤU THÀNH ĐƠN GIÁ ĐÓ) */
            /* ========================================================================= */
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center my-4">
                <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-wide">
                  PHIẾU CHIẾT TÍNH GIÁ CƯỚC GỐC &amp; ĐƠN GIÁ NỘI BỘ
                </h1>
                <div className="text-xs italic text-slate-600 mt-1">
                  (Căn cứ {result.vehicle.category === 'truck_reefer' ? 'Phụ lục 2: Bảng giá vốn xe lạnh' : 'Phụ lục 1: Bảng giá vốn xe nóng'} &amp; Dữ liệu PVOIL 103.21.120.100)
                </div>
              </div>

              {/* Section 1: Route & Vehicle Info */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="font-bold text-xs uppercase text-slate-700 mb-2 border-b border-slate-200 pb-1">
                  1. THÔNG TIN CHUYẾN XE &amp; LỘ TRÌNH VẬN CHUYỂN
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-500">Phương tiện: </span>
                    <strong className="text-slate-900">{result.vehicle.name} ({result.vehicle.tonnageLabel})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Loại hình: </span>
                    <strong className="text-slate-900">
                      {result.vehicle.category === 'truck_reefer' ? 'Xe đông lạnh chuyên dụng' : 'Xe nóng thùng kín'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Lộ trình: </span>
                    <strong className="text-slate-900">{fromProvince?.name} ➔ {toProvince?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Cự ly: </span>
                    <strong className="text-slate-900">{result.km} Km</strong>
                    {result.isUnder75Km && (
                      <span className="ml-1 text-red-700 font-semibold">(≤ 75km: Áp dụng giá tối thiểu)</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Phân loại tuyến: </span>
                    <strong className="text-slate-900">{result.routeDescription}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Đơn giá áp dụng: </span>
                    <strong className="text-slate-900">
                      {result.isNorthSouthRoute ? 'Đơn giá Bắc - Nam' : 'Đơn giá Cận Vùng / Nội Vùng'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 2: Fuel Escalation Formula */}
              <div className="bg-red-50/50 p-4 rounded-lg border border-red-200 text-xs">
                <div className="font-bold uppercase text-red-900 mb-2 border-b border-red-200 pb-1">
                  2. CÔNG THỨC ĐIỀU CHỈNH BIẾN ĐỘNG XĂNG DẦU PVOIL
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-red-200 text-slate-900">
                    G₁ = G₀ ± G₀ * {result.effectiveOilFactorK} * Tỷ lệ tăng giảm dầu DO 0,05S
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>• Giá dầu cơ sở (P₀): <strong>{formatCurrency(result.baseDieselPrice)}/lít</strong></div>
                    <div>• Giá dầu PVOIL (P₁): <strong>{formatCurrency(result.currentDieselPrice)}/lít</strong></div>
                    <div>• Biến động giá dầu (Δ): <strong>+{(result.dieselDiffRatio * 100).toFixed(2)}%</strong></div>
                    <div>• Tỷ lệ điều chỉnh cước: <strong>+{(result.oilAdjustmentRate * 100).toFixed(2)}%</strong></div>
                  </div>
                </div>
              </div>

              {/* Section 3: Cost Breakdown Table */}
              <div>
                <div className="font-bold text-xs uppercase text-slate-700 mb-2">
                  3. BẢNG CẤU THÀNH ĐƠN GIÁ &amp; CHI PHÍ GỐC NỘI BỘ (ĐVT: ĐỒNG)
                </div>
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 py-2 px-3 text-left">Hạng mục cấu thành</th>
                      <th className="border border-slate-300 py-2 px-3 text-center">ĐVT</th>
                      <th className="border border-slate-300 py-2 px-3 text-right">Mức gốc (G₀)</th>
                      <th className="border border-slate-300 py-2 px-3 text-right">Sau bù dầu (G₁)</th>
                      <th className="border border-slate-300 py-2 px-3 text-right font-bold">Thành tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 py-2 px-3">
                        Giá tối thiểu (Min Price)
                      </td>
                      <td className="border border-slate-300 py-2 px-3 text-center">Chuyến</td>
                      <td className="border border-slate-300 py-2 px-3 text-right">{formatCurrency(result.baseMinPriceG0)}</td>
                      <td className="border border-slate-300 py-2 px-3 text-right">{formatCurrency(result.adjustedMinPriceG1)}</td>
                      <td className="border border-slate-300 py-2 px-3 text-right">
                        {result.isUnder75Km ? formatCurrency(result.adjustedMinPriceG1) : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 py-2 px-3">
                        Đơn giá cự ly ({result.km} km)
                      </td>
                      <td className="border border-slate-300 py-2 px-3 text-center">Đồng/Km</td>
                      <td className="border border-slate-300 py-2 px-3 text-right">{formatCurrency(result.baseSelectedRateG0)}</td>
                      <td className="border border-slate-300 py-2 px-3 text-right">{formatCurrency(result.adjustedSelectedRateG1)}</td>
                      <td className="border border-slate-300 py-2 px-3 text-right font-medium">
                        {formatCurrency(result.appliedDistanceCharge)}
                      </td>
                    </tr>
                    {result.directionFactor !== 1.0 && (
                      <tr>
                        <td className="border border-slate-300 py-2 px-3" colSpan={4}>
                          Điều chỉnh hệ số chiều ({directionInfo.label} - x{result.directionFactor})
                        </td>
                        <td className="border border-slate-300 py-2 px-3 text-right font-medium">
                          {formatCurrency(result.directionCharge)}
                        </td>
                      </tr>
                    )}
                    {result.coolingCost > 0 && (
                      <tr>
                        <td className="border border-slate-300 py-2 px-3" colSpan={4}>
                          Chi phí chạy máy lạnh ({input.coolingHours}h x {result.vehicle.coolingFuelPerHour}L/h x {formatCurrency(result.currentDieselPrice)})
                        </td>
                        <td className="border border-slate-300 py-2 px-3 text-right font-medium">
                          {formatCurrency(result.coolingCost)}
                        </td>
                      </tr>
                    )}
                    {result.retentionCost > 0 && (
                      <tr>
                        <td className="border border-slate-300 py-2 px-3" colSpan={4}>
                          Phí lưu ca xe ({input.retentionDays} ngày)
                        </td>
                        <td className="border border-slate-300 py-2 px-3 text-right font-medium">
                          {formatCurrency(result.retentionCost)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold">
                      <td className="border border-slate-300 py-2.5 px-3" colSpan={4}>
                        TỔNG GIÁ VỐN GỐC NỘI BỘ (CHƯA VAT)
                      </td>
                      <td className="border border-slate-300 py-2.5 px-3 text-right text-slate-900 text-sm font-bold">
                        {formatCurrency(result.subtotalBeforeVat)}
                      </td>
                    </tr>
                    {result.profitMarginPercent > 0 && (
                      <tr className="bg-emerald-50/60 font-semibold text-emerald-900">
                        <td className="border border-slate-300 py-2 px-3" colSpan={4}>
                          Mức lợi nhuận mong muốn (+{result.profitMarginPercent}%)
                        </td>
                        <td className="border border-slate-300 py-2 px-3 text-right text-emerald-700 font-bold">
                          +{formatCurrency(result.profitAmount)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-stone-50 font-semibold">
                      <td className="border border-slate-300 py-2 px-3" colSpan={4}>
                        GIÁ BÁN TRƯỚC VAT
                      </td>
                      <td className="border border-slate-300 py-2 px-3 text-right font-bold">
                        {formatCurrency(result.customerSubtotalBeforeVat)}
                      </td>
                    </tr>
                    {input.vatRate > 0 && (
                      <tr>
                        <td className="border border-slate-300 py-2 px-3" colSpan={4}>
                          Thuế giá trị gia tăng ({input.vatRate}% VAT)
                        </td>
                        <td className="border border-slate-300 py-2 px-3 text-right">
                          {formatCurrency(result.customerVatAmount)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-red-50 font-bold text-red-900 text-sm">
                      <td className="border border-slate-300 py-3 px-3 uppercase" colSpan={4}>
                        TỔNG CỘNG THANH TOÁN (ĐÃ GỒM LỢI NHUẬN &amp; VAT)
                      </td>
                      <td className="border border-slate-300 py-3 px-3 text-right text-base text-red-700 font-extrabold">
                        {formatCurrency(result.customerTotalWithVat)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Internal Signatures */}
              <div className="grid grid-cols-2 text-center text-xs mt-8 pt-4 border-t border-slate-300">
                <div>
                  <div className="font-bold uppercase text-slate-800">NGƯỜI LẬP BIỂU</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</div>
                  <div className="h-20"></div>
                </div>
                <div>
                  <div className="font-bold uppercase text-slate-800">PHÒNG TÀI CHÍNH / GIÁM ĐỐC</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký duyệt và đóng dấu)</div>
                  <div className="h-20"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-between no-print">
          <div className="text-xs text-slate-500">
            {mode === 'customer'
              ? 'Bản báo giá khách hàng (ẩn giá vốn nội bộ)'
              : 'Bản chiết tính nội bộ (đầy đủ chi phí & công thức)'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EE0033] hover:bg-red-700 text-white font-bold text-xs transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>In Văn Bản Này</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-slate-800 font-semibold text-xs transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
