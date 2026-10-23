import React from 'react';
import { X, Trash2, ArrowRight, History, Calendar, ExternalLink } from 'lucide-react';
import { CalculationResult, CalculationInput } from '../types/logistics';
import { VIETNAM_PROVINCES } from '../data/provinces';
import { DIRECTION_LABELS } from '../data/pricingData';
import { formatCurrency } from '../utils/calculator';

export interface HistoryItem {
  id: string;
  timestamp: string;
  input: CalculationInput;
  result: CalculationResult;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoadItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FBF9F5] border-l border-stone-200 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#EE0033] border border-red-200 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Lịch Sử Tính Giá Cước</h3>
              <p className="text-xs text-slate-500">{history.length} chuyến đã lưu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-slate-700 hover:bg-stone-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-[#FBF9F5]">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-2">
              <History className="w-8 h-8 opacity-40 text-stone-300" />
              <p className="font-medium text-slate-600">Chưa có lịch sử tính cước nào được lưu.</p>
              <p className="text-slate-400">Nhấn &quot;Lưu lịch sử&quot; ở thẻ kết quả để lưu lại các báo giá cần xem sau.</p>
            </div>
          ) : (
            history.map((item) => {
              const fromP = VIETNAM_PROVINCES.find((p) => p.id === item.input.fromProvinceId);
              const toP = VIETNAM_PROVINCES.find((p) => p.id === item.input.toProvinceId);
              const dir = DIRECTION_LABELS[item.input.direction];

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onLoadItem(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-red-300 cursor-pointer transition-all space-y-2 group shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {new Date(item.timestamp).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-bold text-[#EE0033] text-sm">
                      {formatCurrency(item.result.totalWithVat)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-[#EE0033] transition">
                    <span>{fromP?.name || 'Điểm đi'}</span>
                    <ArrowRight className="w-3 h-3 text-stone-400" />
                    <span>{toP?.name || 'Điểm đến'}</span>
                    <span className="font-mono text-slate-500 font-normal">({item.result.km} km)</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-stone-100 pt-1.5">
                    <span>{item.result.vehicle.name}</span>
                    <span className="text-stone-400">{dir.label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-stone-200 flex justify-between items-center text-xs">
          {history.length > 0 ? (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ</span>
            </button>
          ) : (
            <span></span>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-slate-800 text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
