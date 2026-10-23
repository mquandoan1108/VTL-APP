import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Truck,
  Users,
  Edit3,
  Save,
  RotateCcw,
  ClipboardPaste,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { VehicleOption } from '../types/logistics';
import { formatCurrency, formatNumber } from '../utils/calculator';

interface PhuLuc1EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleOption[];
  onSaveVehicles: (updated: VehicleOption[]) => void;
  onResetVehicles: () => void;
}

export const PhuLuc1EditorModal: React.FC<PhuLuc1EditorModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onSaveVehicles,
  onResetVehicles,
}) => {
  const [activeDriverTab, setActiveDriverTab] = useState<1 | 2>(2);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicles, setEditedVehicles] = useState<VehicleOption[]>(vehicles);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Sync state when props change
  React.useEffect(() => {
    setEditedVehicles(vehicles);
  }, [vehicles]);

  if (!isOpen) return null;

  // Filter dry vehicles for the active driver count
  const dryVehicles = editedVehicles.filter(
    (v) =>
      v.category === 'truck_dry' &&
      v.driverCount === activeDriverTab &&
      !['dry_2500kg', 'dry_5000kg', 'dry_8000kg', 'dry_28000kg'].includes(v.id)
  );

  const handleCellChange = (
    id: string,
    field: keyof VehicleOption,
    value: number
  ) => {
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
    if (window.confirm('Khôi phục toàn bộ bảng giá Phụ lục 1 về giá trị mặc định của Viettel Logistics?')) {
      onResetVehicles();
      setIsEditing(false);
    }
  };

  // Parse pasted TSV / CSV from Google Sheets
  const handleParsePaste = () => {
    setPasteError(null);
    setPasteSuccess(false);

    if (!pasteContent.trim()) {
      setPasteError('Vui lòng dán dữ liệu từ bảng Google Sheet.');
      return;
    }

    try {
      const lines = pasteContent
        .trim()
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      // Clean rows and detect numbers
      const updatedList = [...editedVehicles];
      let matchedCount = 0;

      for (const line of lines) {
        // split by tab or comma
        const cells = line.includes('\t')
          ? line.split('\t').map((c) => c.trim().replace(/"/g, ''))
          : line.split(',').map((c) => c.trim().replace(/"/g, ''));

        // Look for tonnage indicator
        const lineText = line.toLowerCase();
        let targetKg: number | null = null;
        let isLocal = false;
        let isBorder = false;

        if (lineText.includes('2500') || lineText.includes('2.500')) targetKg = 2500;
        else if (lineText.includes('5000') || lineText.includes('5.000')) targetKg = 5000;
        else if (lineText.includes('8000') || lineText.includes('8.000')) {
          targetKg = 8000;
          if (lineText.includes('nội vùng') || lineText.includes('noi vung')) isLocal = true;
        } else if (lineText.includes('28000') || lineText.includes('28.000')) {
          targetKg = 28000;
          if (lineText.includes('cửa khẩu') || lineText.includes('cua khau')) isBorder = true;
        }

        // Extract pure numbers from cells
        const numbers = cells
          .map((c) => {
            const clean = c.replace(/[^\d]/g, '');
            return clean ? parseInt(clean, 10) : NaN;
          })
          .filter((n) => !isNaN(n) && n > 100);

        if (targetKg && numbers.length >= 3) {
          // Find matching vehicle
          const matchIndex = updatedList.findIndex((v) => {
            if (v.category !== 'truck_dry' || v.driverCount !== activeDriverTab) return false;
            if (v.tonnageKg !== targetKg) return false;
            if (targetKg === 8000) {
              return isLocal ? v.id.includes('local') : v.id.includes('longhaul');
            }
            if (targetKg === 28000) {
              return isBorder ? v.specialType === 'cua_khau' : v.specialType === 'standard';
            }
            return true;
          });

          if (matchIndex !== -1) {
            matchedCount++;
            // Map detected numbers intelligently
            // Typically: minPrice, near2Way, nearOut, nearIn, nsOut, nsIn, ns2Way
            const item = { ...updatedList[matchIndex] };
            if (numbers[0]) item.minPriceG0 = numbers[0];
            if (numbers[1]) item.nearRegionTwoWayG0 = numbers[1];
            if (numbers[2]) item.nearRegionOutG0 = numbers[2];
            if (numbers[3]) item.nearRegionInG0 = numbers[3];
            if (numbers[4]) item.northSouthOutG0 = numbers[4];
            if (numbers[5]) item.northSouthInG0 = numbers[5];
            if (numbers[6]) item.northSouthTwoWayG0 = numbers[6];

            updatedList[matchIndex] = item;
          }
        }
      }

      if (matchedCount === 0) {
        setPasteError(
          'Không nhận diện được dòng tải trọng nào phù hợp (cần có chứa 2500kg, 5000kg, 8000kg hoặc 28000kg).'
        );
        return;
      }

      setEditedVehicles(updatedList);
      onSaveVehicles(updatedList);
      setPasteSuccess(true);
      setTimeout(() => {
        setShowPasteModal(false);
        setPasteSuccess(false);
        setPasteContent('');
      }, 1200);
    } catch {
      setPasteError('Lỗi xử lý định dạng dữ liệu dán. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  PHỤ LỤC 1: BẢNG GIÁ VỐN VẬN CHUYỂN XE NÓNG
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Viettel Logistics Chuẩn
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Áp dụng cho xe tải thùng bạt / thùng kín tiêu chuẩn (Đơn vị tính: Đồng/Km, Chưa VAT, Mốc dầu DO cơ sở 21.860đ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Switch Drivers & Action buttons */}
        <div className="p-3 sm:p-4 bg-slate-850/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Driver Count Tabs */}
          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-750">
            <button
              onClick={() => setActiveDriverTab(2)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition ${
                activeDriverTab === 2
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              1. Xe nóng 2 lái / xe (Tuyến dài/liên vùng)
            </button>
            <button
              onClick={() => setActiveDriverTab(1)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition ${
                activeDriverTab === 1
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              2. Xe nóng 1 lái / xe (Nội vùng/tuyến ngắn)
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setShowPasteModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
                  Dán từ Google Sheet
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Chỉnh sửa đơn giá
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                  title="Khôi phục mặc định"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditedVehicles(vehicles);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu thay đổi
                </button>
              </>
            )}
          </div>
        </div>

        {/* Informative notice */}
        <div className="px-4 py-2 bg-blue-950/30 border-b border-blue-900/30 flex items-center justify-between text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Mọi thay đổi trên bảng giá Phụ lục 1 sẽ lập tức được áp dụng tự động vào hệ thống tính cước, phiếu báo giá và so sánh xe.
            </span>
          </div>
          {isEditing && (
            <span className="text-amber-400 font-bold animate-pulse">
              ● Đang trong chế độ chỉnh sửa ô
            </span>
          )}
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
                  <th rowSpan={2} className="p-2.5 border-r border-slate-700 w-10 text-center">STT</th>
                  <th rowSpan={2} className="p-2.5 border-r border-slate-700 min-w-[150px]">Trọng tải xe (Kg)</th>
                  <th rowSpan={2} className="p-2.5 border-r border-slate-700 min-w-[130px]">Loại hình kết nối</th>
                  <th rowSpan={2} className="p-2.5 border-r border-slate-700 min-w-[110px] text-right">Giá tối thiểu</th>
                  <th colSpan={3} className="p-2 border-r border-slate-700 text-center bg-slate-800/90 text-amber-300">
                    Cận Vùng / Nội Vùng (Đồng/Km)
                  </th>
                  <th colSpan={3} className="p-2 border-r border-slate-700 text-center bg-slate-800/90 text-cyan-300">
                    Bắc - Nam Tuyến Trục (Đồng/Km)
                  </th>
                  <th rowSpan={2} className="p-2.5 text-center w-14">Hệ số k</th>
                </tr>
                <tr className="bg-slate-850 text-slate-400 font-medium border-b border-slate-700 text-[11px]">
                  <th className="p-2 border-r border-slate-700 text-right">Giá 2 chiều</th>
                  <th className="p-2 border-r border-slate-700 text-right">Chiều đi</th>
                  <th className="p-2 border-r border-slate-700 text-right">Chiều về</th>
                  <th className="p-2 border-r border-slate-700 text-right">Chiều ra</th>
                  <th className="p-2 border-r border-slate-700 text-right">Chiều vào</th>
                  <th className="p-2 border-r border-slate-700 text-right">Hai chiều</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {dryVehicles.map((v, idx) => (
                  <tr key={v.id} className="hover:bg-slate-850/60 transition">
                    <td className="p-2.5 text-center font-mono text-slate-400 border-r border-slate-800">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-bold text-white border-r border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{v.tonnageLabel}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        Nhóm: {v.weightClass} kg
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-400 border-r border-slate-800">
                      {v.tonnageKg <= 8000 && !v.id.includes('longhaul')
                        ? 'Nội Vùng, Nội Tỉnh'
                        : 'Bắc Nam, Cận Vùng'}
                    </td>

                    {/* Giá tối thiểu */}
                    <td className="p-2 border-r border-slate-800 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={v.minPriceG0}
                          onChange={(e) =>
                            handleCellChange(v.id, 'minPriceG0', Number(e.target.value) || 0)
                          }
                          className="w-24 px-1.5 py-1 bg-slate-900 border border-amber-500/60 rounded text-right text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="text-amber-300 font-semibold">
                          {formatCurrency(v.minPriceG0)}
                        </span>
                      )}
                    </td>

                    {/* Cận vùng: Giá hai chiều */}
                    <td className="p-2 border-r border-slate-800 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={v.nearRegionTwoWayG0}
                          onChange={(e) =>
                            handleCellChange(v.id, 'nearRegionTwoWayG0', Number(e.target.value) || 0)
                          }
                          className="w-20 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        formatNumber(v.nearRegionTwoWayG0)
                      )}
                    </td>

                    {/* Cận vùng: Chiều đi */}
                    <td className="p-2 border-r border-slate-800 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={v.nearRegionOutG0}
                          onChange={(e) =>
                            handleCellChange(v.id, 'nearRegionOutG0', Number(e.target.value) || 0)
                          }
                          className="w-20 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        formatNumber(v.nearRegionOutG0)
                      )}
                    </td>

                    {/* Cận vùng: Chiều về */}
                    <td className="p-2 border-r border-slate-800 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={v.nearRegionInG0}
                          onChange={(e) =>
                            handleCellChange(v.id, 'nearRegionInG0', Number(e.target.value) || 0)
                          }
                          className="w-20 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        formatNumber(v.nearRegionInG0)
                      )}
                    </td>

                    {/* Bắc - Nam: Chiều ra */}
                    <td className="p-2 border-r border-slate-800 text-right font-mono text-cyan-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={v.northSouthOutG0}
                          onChange={(e) =>
                            handleCellChange(v.id, 'northSouthOutG0', Number(e.target.value) || 0)
                          }
                          className="w-20 px-1.5 py-1 bg-slate-900 border border-cyan-500/60 rounded text-right text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                        />
                      ) : (
                        formatNumber(v.northSouthOutG0)
                      )}
                    </td>

                    {/* Bắc - Nam: Chiều vào */}
                    <td className="p-2 border-r border-slate-800 text-right font-mono text-cyan-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={v.northSouthInG0}
                          onChange={(e) =>
                            handleCellChange(v.id, 'northSouthInG0', Number(e.target.value) || 0)
                          }
                          className="w-20 px-1.5 py-1 bg-slate-900 border border-cyan-500/60 rounded text-right text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                        />
                      ) : (
                        formatNumber(v.northSouthInG0)
                      )}
                    </td>

                    {/* Bắc - Nam: Hai chiều */}
                    <td className="p-2 border-r border-slate-800 text-right font-mono text-cyan-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={v.northSouthTwoWayG0}
                          onChange={(e) =>
                            handleCellChange(v.id, 'northSouthTwoWayG0', Number(e.target.value) || 0)
                          }
                          className="w-20 px-1.5 py-1 bg-slate-900 border border-cyan-500/60 rounded text-right text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                        />
                      ) : (
                        formatNumber(v.northSouthTwoWayG0)
                      )}
                    </td>

                    {/* Hệ số k */}
                    <td className="p-2 text-center font-mono font-bold text-slate-300">
                      {v.oilFactorK}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Biểu giá gốc $G_0$ được tính toán trên mốc giá dầu DO 0,05S-II chuẩn: <strong className="text-white">21.860 đ/lít</strong>.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-xl border border-slate-700 transition"
          >
            Đóng bảng giá
          </button>
        </div>
      </div>

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-750 w-full max-w-2xl rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-emerald-400" />
                Dán dữ liệu Phụ lục 1 từ Google Sheets
              </h4>
              <button
                onClick={() => setShowPasteModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Mở file Google Sheet tại tab <strong>Phụ lục 1</strong>, chọn vùng dữ liệu các dòng xe (tải trọng, giá tối thiểu, đơn giá các cột), nhấn <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Ctrl + C</kbd> rồi dán vào ô bên dưới:
            </p>
            <textarea
              rows={8}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Dán các dòng copy từ Google Sheet vào đây..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:outline-none mb-3"
            />
            {pasteError && (
              <div className="p-2.5 mb-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pasteError}</span>
              </div>
            )}
            {pasteSuccess && (
              <div className="p-2.5 mb-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Đã cập nhật thành công bảng giá Phụ lục 1! Đang áp dụng...</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleParsePaste}
                disabled={pasteSuccess}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow transition"
              >
                <Check className="w-4 h-4" />
                Nhận diện &amp; Cập nhật tự động
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
