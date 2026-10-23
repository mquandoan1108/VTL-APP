import React, { useState } from 'react';
import { Fuel, RefreshCw, CheckCircle2, Info, ArrowUpRight, ArrowDownRight, Edit3, RotateCcw, AlertTriangle } from 'lucide-react';
import { PetrolimexProduct } from '../types/logistics';
import { PETROLIMEX_PRODUCTS, PETROLIMEX_METADATA } from '../data/petrolimexData';
import { BASE_DIESEL_PRICE } from '../data/pricingData';
import { formatCurrency } from '../utils/calculator';

interface PetrolimexTableProps {
  currentDieselPrice: number;
  selectedZone: 1 | 2;
  onSelectZone: (zone: 1 | 2) => void;
  onSelectPrice: (price: number, productName?: string) => void;
  onRefreshPrices: () => Promise<void>;
  isRefreshing?: boolean;
}

export const PetrolimexTable: React.FC<PetrolimexTableProps> = ({
  currentDieselPrice,
  selectedZone,
  onSelectZone,
  onSelectPrice,
  onRefreshPrices,
  isRefreshing = false,
}) => {
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);
  const [activeProductId, setActiveProductId] = useState<string>('do_0_05s');

  const diffFromBase = currentDieselPrice - BASE_DIESEL_PRICE;
  const diffPercent = (diffFromBase / BASE_DIESEL_PRICE) * 100;

  const handleApplyCustom = () => {
    const val = parseFloat(customPrice.replace(/[^0-9]/g, ''));
    if (!isNaN(val) && val > 0) {
      onSelectPrice(val, 'Giá tùy chỉnh');
      setIsEditingCustom(false);
    }
  };

  const handleResetToStandard = () => {
    const primary = PETROLIMEX_PRODUCTS.find((p) => p.id === activeProductId) || PETROLIMEX_PRODUCTS[0];
    const standardPrice = selectedZone === 1 ? primary.zone1Price : primary.zone2Price;
    onSelectPrice(standardPrice, primary.code);
    setIsEditingCustom(false);
    setCustomPrice('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">Bảng Giá Xăng Dầu Petrolimex Niêm Yết</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Chính thức
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kỳ điều hành {PETROLIMEX_METADATA.effectiveTime} • Nguồn: {PETROLIMEX_METADATA.sourceName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zone Selector */}
          <div className="inline-flex rounded-lg bg-slate-800 p-1 border border-slate-700/80">
            <button
              onClick={() => {
                onSelectZone(1);
                const p = PETROLIMEX_PRODUCTS.find((x) => x.id === activeProductId) || PETROLIMEX_PRODUCTS[0];
                onSelectPrice(p.zone1Price, p.code);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedZone === 1
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vùng 1 (Đô thị / Gần cảng)
            </button>
            <button
              onClick={() => {
                onSelectZone(2);
                const p = PETROLIMEX_PRODUCTS.find((x) => x.id === activeProductId) || PETROLIMEX_PRODUCTS[0];
                onSelectPrice(p.zone2Price, p.code);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedZone === 2
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vùng 2 (Xa cảng / Miền núi)
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefreshPrices}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition disabled:opacity-50"
            title="Kiểm tra và làm mới dữ liệu giá xăng dầu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Comparison Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/60 border-b border-slate-800 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <span className="text-slate-400">Giá dầu vốn cơ sở (P₀):</span>
          <span className="font-bold text-slate-200">{formatCurrency(BASE_DIESEL_PRICE)}/lít</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <span className="text-slate-400">Giá dầu hiện tại áp dụng (P₁):</span>
          <span className="font-bold text-amber-400">{formatCurrency(currentDieselPrice)}/lít</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <span className="text-slate-400">Biến động xăng dầu (Δ):</span>
          <div className="flex items-center gap-1 font-bold">
            {diffFromBase >= 0 ? (
              <span className="text-rose-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{formatCurrency(diffFromBase)} (+{diffPercent.toFixed(2)}%)
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {formatCurrency(diffFromBase)} ({diffPercent.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fuel Price Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-850/80 text-slate-400 font-semibold border-b border-slate-800">
              <th className="py-3 px-4">Tên mặt hàng xăng dầu</th>
              <th className="py-3 px-4">Đơn vị</th>
              <th className="py-3 px-4 text-right">
                <span className={selectedZone === 1 ? 'text-amber-400 font-bold' : ''}>Giá Vùng 1</span>
              </th>
              <th className="py-3 px-4 text-right">
                <span className={selectedZone === 2 ? 'text-amber-400 font-bold' : ''}>Giá Vùng 2</span>
              </th>
              <th className="py-3 px-4 text-right">Chênh lệch</th>
              <th className="py-3 px-4 text-center">Áp dụng tính cước</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {PETROLIMEX_PRODUCTS.map((product) => {
              const isSelected = activeProductId === product.id;
              const activePrice = selectedZone === 1 ? product.zone1Price : product.zone2Price;

              return (
                <tr
                  key={product.id}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-amber-500/10 hover:bg-amber-500/15'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-white">{product.name}</div>
                      {product.isPrimaryFuelForLogistics && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Chuẩn Viettel Post
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{product.code}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{product.unit}</td>
                  <td className={`py-3 px-4 text-right font-medium ${selectedZone === 1 ? 'text-amber-300 font-bold text-sm' : 'text-slate-300'}`}>
                    {formatCurrency(product.zone1Price)}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${selectedZone === 2 ? 'text-amber-300 font-bold text-sm' : 'text-slate-300'}`}>
                    {formatCurrency(product.zone2Price)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    +{formatCurrency(product.priceDiff)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setActiveProductId(product.id);
                        onSelectPrice(activePrice, product.code);
                        setIsEditingCustom(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isSelected && !isEditingCustom && currentDieselPrice === activePrice
                          ? 'bg-amber-500 text-slate-950 font-bold shadow'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {isSelected && !isEditingCustom && currentDieselPrice === activePrice ? (
                        <span className="flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đang dùng
                        </span>
                      ) : (
                        'Chọn giá này'
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Manual Fuel Price Override & Zone Explanation Footer */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Custom Price Input */}
        <div className="flex items-center gap-2">
          {!isEditingCustom ? (
            <button
              onClick={() => {
                setIsEditingCustom(true);
                setCustomPrice(currentDieselPrice.toString());
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Tự nhập giá dầu theo hóa đơn thực tế...</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">Nhập giá dầu thực tế:</span>
              <input
                type="text"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="29250"
                className="w-28 px-2.5 py-1 rounded-md bg-slate-800 border border-amber-500/50 text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-slate-400">₫/lít</span>
              <button
                onClick={handleApplyCustom}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                Áp dụng
              </button>
              <button
                onClick={() => setIsEditingCustom(false)}
                className="px-2 py-1 text-slate-400 hover:text-white"
              >
                Hủy
              </button>
            </div>
          )}

          {currentDieselPrice !== (selectedZone === 1 ? 29250 : 29830) && (
            <button
              onClick={handleResetToStandard}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              title="Đặt lại về giá DO 0,05S chuẩn Petrolimex"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Về giá chuẩn (29.250đ)</span>
            </button>
          )}
        </div>

        {/* Zone Rule Note */}
        <div className="flex items-center gap-1.5 text-slate-400 max-w-md">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            Theo phụ lục hợp đồng, giá tính cước mặc định sử dụng mặt hàng{' '}
            <strong className="text-white">Dầu DO 0,05S-II</strong>.
          </span>
        </div>
      </div>
    </div>
  );
};
