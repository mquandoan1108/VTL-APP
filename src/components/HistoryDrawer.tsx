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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Lịch Sử Tính Giá Cước</h3>
              <p className="text-xs text-slate-400">{history.length} chuyến đã lưu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs space-y-2">
              <History className="w-8 h-8 opacity-30" />
              <p>Chưa có lịch sử tính cước nào được lưu.</p>
              <p className="text-slate-600">Nhấn &quot;Lưu lịch sử&quot; ở thẻ kết quả để lưu lại các báo giá cần xem sau.</p>
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
                  className="p-3.5 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-750 hover:border-amber-500/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(item.timestamp).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-semibold text-amber-400 text-sm">
                      {formatCurrency(item.result.totalWithVat)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-amber-300 transition">
                    <span>{fromP?.name || 'Điểm đi'}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{toP?.name || 'Điểm đến'}</span>
                    <span className="font-mono text-slate-400 font-normal">({item.result.km} km)</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-1.5">
                    <span>{item.result.vehicle.name}</span>
                    <span className="text-slate-500">{dir.label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
