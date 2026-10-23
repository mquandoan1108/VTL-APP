import React from 'react';
import { Fuel, FileSpreadsheet, Activity, History, ArrowRightLeft, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/calculator';

interface HeaderProps {
  currentDieselPrice: number;
  baseDieselPrice: number;
  petrolimexZone: 1 | 2;
  onOpenFuelTable: () => void;
  onOpenApiChecker: () => void;
  onOpenHistory: () => void;
  onOpenComparison: () => void;
  onOpenPhuLuc1?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDieselPrice,
  baseDieselPrice,
  petrolimexZone,
  onOpenFuelTable,
  onOpenApiChecker,
  onOpenHistory,
  onOpenComparison,
  onOpenPhuLuc1,
}) => {
  const diffPercent = ((currentDieselPrice - baseDieselPrice) / baseDieselPrice) * 100;
  const isUp = diffPercent >= 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/40 border border-red-400/30">
              <span className="text-white font-black text-lg tracking-wider">VT</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white leading-tight">
                  Viettel Logistics
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                  Phụ lục 1 &amp; 2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden xs:block">
                Tính giá vốn vận chuyển Xe Nóng &amp; Xe Lạnh • Biến động dầu PVOIL
              </p>
            </div>
          </div>

          {/* Quick Fuel Price Badge & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fuel Price Pill */}
            <button
              onClick={onOpenFuelTable}
              className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 transition-all text-left group"
              title="Xem bảng giá xăng dầu PVOIL chi tiết"
            >
              <div className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">PVOIL DO 0,05S (V{petrolimexZone})</span>
                  <span
                    className={`text-[10px] font-semibold px-1 rounded ${
                      isUp ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {isUp ? '+' : ''}{diffPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-400">
                  {formatCurrency(currentDieselPrice)}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">/lít</span>
                </div>
              </div>
            </button>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {onOpenPhuLuc1 && (
                <button
                  onClick={onOpenPhuLuc1}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition"
                  title="Xem và chỉnh sửa bảng giá Phụ lục 1 (Xe Nóng)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Bảng Phụ lục 1</span>
                </button>
              )}

              <button
                onClick={onOpenComparison}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>So sánh xe</span>
              </button>

              <button
                onClick={onOpenApiChecker}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
                title="Kiểm tra kết nối API PVOIL 103.21.120.100"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">API PVOIL</span>
              </button>

              <button
                onClick={onOpenHistory}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Lịch sử tính cước"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
