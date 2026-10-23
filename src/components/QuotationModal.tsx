import React, { useRef } from 'react';
import { X, Printer, Download, Share2, Check } from 'lucide-react';
import { CalculationResult, CalculationInput } from '../types/logistics';
import { VIETNAM_PROVINCES } from '../data/provinces';
import { DIRECTION_LABELS, CONNECTION_TYPE_LABELS, MIN_KM_THRESHOLD } from '../data/pricingData';
import { formatCurrency, formatNumber } from '../utils/calculator';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  input: CalculationInput;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  result,
  input,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-3xl my-8 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Controls Bar */}
        <div className="p-4 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between no-print">
          <div className="font-bold text-slate-900 text-sm">
            Mẫu Giấy Báo Giá Vận Chuyển Viettel Logistics
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EE0033] hover:bg-red-700 text-white font-bold text-xs transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>In Báo Giá</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-slate-700 hover:bg-stone-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Standard Clean Paper Layout) */}
        <div
          ref={printAreaRef}
          className="p-6 sm:p-10 bg-white text-slate-900 font-sans text-xs sm:text-sm print:p-0 print:m-0 print:bg-white print:text-black overflow-y-auto"
        >
          {/* Company Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-base sm:text-lg uppercase tracking-tight text-red-700">
                  CÔNG TY TNHH MTV LOGISTICS VIETTEL
                </div>
                <div className="text-xs font-semibold text-slate-600 uppercase">
                  PHÒNG TÀI CHÍNH • BỘ PHẬN ĐIỀU HÀNH VẬN TẢI
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

          {/* Title */}
          <div className="text-center my-6">
            <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-wide">
              PHIẾU TÍNH GIÁ CƯỚC VẬN CHUYỂN
            </h1>
            <div className="text-xs italic text-slate-600 mt-1">
              (Căn cứ theo {result.vehicle.category === 'truck_reefer' ? 'Phụ lục 2: Bảng giá vốn vận chuyển xe lạnh' : 'Phụ lục 1: Bảng giá vốn vận chuyển xe nóng'} &amp; Biến động dầu PVOIL)
            </div>
          </div>

          {/* Section 1: Route & Vehicle Info */}
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="font-bold text-xs uppercase text-slate-700 mb-2 border-b border-slate-200 pb-1">
              1. THÔNG TIN CHUYẾN XE &amp; LỘ TRÌNH VẬN CHUYỂN
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div>
                <span className="text-slate-500">Loại phương tiện: </span>
                <strong className="text-slate-900">{result.vehicle.name} ({result.vehicle.tonnageLabel})</strong>
              </div>
              <div>
                <span className="text-slate-500">Nhóm xe: </span>
                <strong className="text-slate-900">
                  {result.vehicle.category === 'truck_reefer'
                    ? 'Xe đông lạnh chuyên dụng'
                    : 'Xe nóng thùng kín'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Tuyến đường: </span>
                <strong className="text-slate-900">{fromProvince?.name} ➔ {toProvince?.name}</strong>
              </div>
              <div>
                <span className="text-slate-500">Cự ly vận chuyển: </span>
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
                <span className="text-slate-500">Loại đơn giá áp dụng: </span>
                <strong className="text-slate-900">
                  {result.isNorthSouthRoute ? 'Đơn giá Bắc - Nam' : 'Đơn giá Cận Vùng / Nội Vùng'}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 2: Fuel Escalation Formula */}
          <div className="mb-6 bg-red-50/50 p-4 rounded-lg border border-red-200 text-xs">
            <div className="font-bold uppercase text-red-900 mb-2 border-b border-red-200 pb-1">
              2. CÔNG THỨC ĐIỀU CHỈNH BIẾN ĐỘNG XĂNG DẦU (THEO VĂN BẢN)
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div className="font-mono text-[11px] bg-white p-2 rounded border border-red-200 text-slate-900">
                G₁ = G₀ ± G₀ * {result.effectiveOilFactorK} * Tỷ lệ tăng giảm xăng dầu (với xe có tải trọng từ 18001kg trở lên)
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>• Giá dầu vốn cơ sở (P₀): <strong>{formatCurrency(result.baseDieselPrice)}/lít</strong></div>
                <div>• Giá dầu hiện tại PVOIL (P₁): <strong>{formatCurrency(result.currentDieselPrice)}/lít</strong></div>
                <div>• Tỷ lệ biến động giá dầu (Δ): <strong>+{(result.dieselDiffRatio * 100).toFixed(2)}%</strong></div>
                <div>• Tỷ lệ điều chỉnh cước: <strong>+{(result.oilAdjustmentRate * 100).toFixed(2)}%</strong></div>
              </div>
            </div>
          </div>

          {/* Section 3: Cost Breakdown Table */}
          <div className="mb-6">
            <div className="font-bold text-xs uppercase text-slate-700 mb-2">
              3. BẢNG TÍNH GIÁ CƯỚC CHI TIẾT (ĐVT: ĐỒNG)
            </div>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 py-2 px-3 text-left">Nội dung chi phí</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Đơn vị tính</th>
                  <th className="border border-slate-300 py-2 px-3 text-right">Mức cơ sở (G₀)</th>
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
                      Chi phí chạy máy lạnh ({input.coolingHours} giờ x {result.vehicle.coolingFuelPerHour}L/h x {formatCurrency(result.currentDieselPrice)})
                    </td>
                    <td className="border border-slate-300 py-2 px-3 text-right font-medium">
                      {formatCurrency(result.coolingCost)}
                    </td>
                  </tr>
                )}
                {result.retentionCost > 0 && (
                  <tr>
                    <td className="border border-slate-300 py-2 px-3" colSpan={4}>
                      Phí lưu ca xe cont ({input.retentionDays} ngày &gt;1 ngày x 1.500.000đ)
                    </td>
                    <td className="border border-slate-300 py-2 px-3 text-right font-medium">
                      {formatCurrency(result.retentionCost)}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-50 font-semibold">
                  <td className="border border-slate-300 py-2.5 px-3" colSpan={4}>
                    TỔNG CỘNG TIỀN CƯỚC (CHƯA VAT)
                  </td>
                  <td className="border border-slate-300 py-2.5 px-3 text-right text-slate-900 text-sm font-bold">
                    {formatCurrency(result.subtotalBeforeVat)}
                  </td>
                </tr>
                {input.vatRate > 0 && (
                  <tr>
                    <td className="border border-slate-300 py-2 px-3" colSpan={4}>
                      Thuế giá trị gia tăng ({input.vatRate}% VAT)
                    </td>
                    <td className="border border-slate-300 py-2 px-3 text-right">
                      {formatCurrency(result.vatAmount)}
                    </td>
                  </tr>
                )}
                <tr className="bg-red-50 font-bold text-red-900 text-sm">
                  <td className="border border-slate-300 py-3 px-3 uppercase" colSpan={4}>
                    TỔNG CỘNG THANH TOÁN (ĐÃ GỒM THUẾ)
                  </td>
                  <td className="border border-slate-300 py-3 px-3 text-right text-base text-red-700 font-extrabold">
                    {formatCurrency(result.totalWithVat)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="mb-6 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-700">Ghi chú &amp; Điều khoản:</div>
            <div>- Đơn giá trên được lập tại thời điểm giá dầu Diezen cơ sở = 21.860đ/lít.</div>
            <div>- Tuyến Bắc - Bắc, Trung - Trung, Nam - Nam áp dụng Đơn giá Cận Vùng / Nội Vùng theo quy định.</div>
            <div>- Với cự ly dưới 75km, giá cước tối thiểu được áp dụng theo đúng quy định tại {result.vehicle.category === 'truck_reefer' ? 'Phụ lục 2' : 'Phụ lục 1'}.</div>
            <div>- Trong trường hợp nhà nước điều chỉnh giá xăng dầu, hai bên sẽ thực hiện điều chỉnh theo công thức tỷ lệ bù trừ.</div>
          </div>

          {/* Signatures */}
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

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-end no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EE0033] hover:bg-red-700 text-white font-bold text-xs transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>In Bản Báo Giá Này</span>
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
