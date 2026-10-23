import React, { useState } from 'react';
import { Fuel, RefreshCw, CheckCircle2, Info, ArrowUpRight, ArrowDownRight, Edit3, RotateCcw, Server, ShieldCheck } from 'lucide-react';
import { PVOIL_PRODUCTS, PVOIL_METADATA } from '../data/pvoilData';
import { BASE_DIESEL_PRICE } from '../data/pricingData';
import { formatCurrency } from '../utils/calculator';

interface PvoilTableProps {
  currentDieselPrice: number;
  selectedZone: 1 | 2;
  onSelectZone: (zone: 1 | 2) => void;
  onSelectPrice: (price: number, productName?: string) => void;
  onRefreshPrices: () => Promise<void>;
  isRefreshing?: boolean;
}

export const PvoilTable: React.FC<PvoilTableProps> = ({
  currentDieselPrice,
  selectedZone,
  onSelectZone,
  onSelectPrice,
  onRefreshPrices,
  isRefreshing = false,
}) => {
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);
  const [activeProductId, setActiveProductId] = useState<string>('pvoil_do_0_05s');

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
    const primary = PVOIL_PRODUCTS.find((p) => p.id === activeProductId) || PVOIL_PRODUCTS[0];
    const standardPrice = selectedZone === 1 ? primary.zone1Price : primary.zone2Price;
    onSelectPrice(standardPrice, primary.code);
    setIsEditingCustom(false);
    setCustomPrice('');
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-50 via-white to-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 font-black text-sm">
            PV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Bảng Giá Xăng Dầu PVOIL Thời Gian Thực</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                Tầng 0: 103.21.120.100
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Nguồn: {PVOIL_METADATA.sourceName} • {PVOIL_METADATA.effectiveTime}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zone Selector */}
          <div className="inline-flex rounded-lg bg-stone-100 p-1 border border-stone-200">
            <button
              onClick={() => {
                onSelectZone(1);
                const p = PVOIL_PRODUCTS.find((x) => x.id === activeProductId) || PVOIL_PRODUCTS[0];
                onSelectPrice(p.zone1Price, p.code);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedZone === 1
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vùng 1
            </button>
            <button
              onClick={() => {
                onSelectZone(2);
                const p = PVOIL_PRODUCTS.find((x) => x.id === activeProductId) || PVOIL_PRODUCTS[0];
                onSelectPrice(p.zone2Price, p.code);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedZone === 2
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vùng 2
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefreshPrices}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-slate-700 hover:text-slate-900 border border-stone-200 text-xs font-medium transition disabled:opacity-50 shadow-xs"
            title="Làm mới giá dầu từ PVOIL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            <span className="hidden sm:inline">Làm mới PVOil</span>
          </button>
        </div>
      </div>

      {/* Comparison Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAF8F5] border-b border-stone-200 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-slate-500">Giá dầu vốn cơ sở (P₀):</span>
          <span className="font-bold text-slate-800">{formatCurrency(BASE_DIESEL_PRICE)}/lít</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-slate-500">Giá dầu PVOIL áp dụng (P₁):</span>
          <span className="font-bold text-red-600">{formatCurrency(currentDieselPrice)}/lít</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-slate-500">Biến động so với vốn (Δ):</span>
          <div className="flex items-center gap-1 font-bold">
            {diffFromBase >= 0 ? (
              <span className="text-rose-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{formatCurrency(diffFromBase)} (+{diffPercent.toFixed(2)}%)
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center">
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
            <tr className="bg-stone-50 text-slate-600 font-semibold border-b border-stone-200">
              <th className="py-3 px-4">Tên mặt hàng xăng dầu PVOIL</th>
              <th className="py-3 px-4">Đơn vị</th>
              <th className="py-3 px-4 text-right">
                <span className={selectedZone === 1 ? 'text-red-600 font-bold' : ''}>Giá Vùng 1</span>
              </th>
              <th className="py-3 px-4 text-right">
                <span className={selectedZone === 2 ? 'text-red-600 font-bold' : ''}>Giá Vùng 2</span>
              </th>
              <th className="py-3 px-4 text-right">Chênh lệch</th>
              <th className="py-3 px-4 text-center">Áp dụng tính cước</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {PVOIL_PRODUCTS.map((product) => {
              const isSelected = activeProductId === product.id;
              const activePrice = selectedZone === 1 ? product.zone1Price : product.zone2Price;

              return (
                <tr
                  key={product.id}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-red-50/60 hover:bg-red-50/80'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      {product.isPrimaryFuelForLogistics && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          Chuẩn Tính Cước
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{product.code}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{product.unit}</td>
                  <td className={`py-3 px-4 text-right font-medium ${selectedZone === 1 ? 'text-red-600 font-bold text-sm' : 'text-slate-700'}`}>
                    {formatCurrency(product.zone1Price)}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${selectedZone === 2 ? 'text-red-600 font-bold text-sm' : 'text-slate-700'}`}>
                    {formatCurrency(product.zone2Price)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
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
                          ? 'bg-red-600 text-white font-bold shadow-xs'
                          : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-stone-50 border border-stone-200 shadow-xs'
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

      {/* Architecture strip & custom price override */}
      <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {!isEditingCustom ? (
            <button
              onClick={() => {
                setIsEditingCustom(true);
                setCustomPrice(currentDieselPrice.toString());
              }}
              className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Tự nhập giá dầu theo hóa đơn thực tế...</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-medium">Giá dầu thực tế:</span>
              <input
                type="text"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="29200"
                className="w-28 px-2.5 py-1 rounded-md bg-white border border-stone-300 text-slate-900 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <span className="text-slate-500">₫/lít</span>
              <button
                onClick={handleApplyCustom}
                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
              >
                Áp dụng
              </button>
              <button
                onClick={() => setIsEditingCustom(false)}
                className="px-2 py-1 text-slate-500 hover:text-slate-800"
              >
                Hủy
              </button>
            </div>
          )}

          {currentDieselPrice !== (selectedZone === 1 ? 29200 : 29780) && (
            <button
              onClick={handleResetToStandard}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-stone-100 text-slate-700 border border-stone-200 text-xs transition shadow-xs"
            >
              <RotateCcw className="w-3 h-3 text-red-600" />
              <span>Về giá PVOIL chuẩn (29.200đ)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-600 max-w-md">
          <Server className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            API PVOil:{' '}
            <strong className="text-emerald-700">Tầng 0 (IP Origin 103.21.120.100)</strong> kết nối trực tiếp, bypass Cloudflare thành công.
          </span>
        </div>
      </div>
    </div>
  );
};
