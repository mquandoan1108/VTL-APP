import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CalculatorForm } from './components/CalculatorForm';
import { PriceResultCard } from './components/PriceResultCard';
import { PvoilTable } from './components/PvoilTable';
import { PvoilApiChecker } from './components/PvoilApiChecker';
import { VehicleComparisonModal } from './components/VehicleComparisonModal';
import { QuotationModal } from './components/QuotationModal';
import { HistoryDrawer, HistoryItem } from './components/HistoryDrawer';
import { PhuLuc1EditorModal } from './components/PhuLuc1EditorModal';
import { CalculationInput, VehicleOption } from './types/logistics';
import {
  BASE_DIESEL_PRICE,
  VEHICLE_OPTIONS,
  getEffectiveVehicleOptions,
  saveEffectiveVehicleOptions,
  resetEffectiveVehicleOptions,
} from './data/pricingData';
import { calculateFreightPrice } from './utils/calculator';
import {
  Fuel,
  Calculator,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // Vehicle options state (customizable via Phụ lục 1 editor)
  const [vehicles, setVehicles] = useState<VehicleOption[]>(() => getEffectiveVehicleOptions());

  // Input state
  const [input, setInput] = useState<CalculationInput>({
    vehicleCategory: 'truck_reefer',
    vehicleId: 'reefer_2d_2500kg', // Phụ lục 2 Viettel Logistics
    driverCount: 2,
    connectionType: 'truc_bac_nam',
    direction: 'chieu_ra',
    fromProvinceId: 'SG',
    toProvinceId: 'HN', // Mẫu Nam -> Bắc (1.720km)
    km: 1720,
    currentDieselPrice: 29200, // Dầu DO 0,05S-II từ máy chủ PVOIL (103.21.120.100)
    baseDieselPrice: BASE_DIESEL_PRICE, // 21860
    coolingHours: 0,
    retentionDays: 0,
    vatRate: 8,
    petrolimexZone: 1,
  });

  // Modal / Drawer visibility states
  const [activeTab, setActiveTab] = useState<'calculator' | 'pvoil'>('calculator');
  const [isApiCheckerOpen, setIsApiCheckerOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPhuLuc1Open, setIsPhuLuc1Open] = useState(false);
  const [isRefreshingFuel, setIsRefreshingFuel] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('vt_logistics_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vt_logistics_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Lấy dữ liệu giá dầu trực tiếp từ API PVOIL khi khởi động
  useEffect(() => {
    fetch('/api/pvoil/prices')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.products) {
          const do05 = data.products.find((p: any) => p.code.includes('0,05S'));
          if (do05) {
            setInput((prev) => ({
              ...prev,
              currentDieselPrice: prev.petrolimexZone === 1 ? do05.zone1 : do05.zone2,
            }));
          }
        }
      })
      .catch(() => {
        // Fallback default 29.200đ is already preset in state
      });
  }, []);

  // Compute calculation result with memoization using active vehicles list
  const result = useMemo(() => {
    return calculateFreightPrice(input, vehicles);
  }, [input, vehicles]);

  // Phụ lục 1 save/reset handlers
  const handleSavePhuLuc1 = (updated: VehicleOption[]) => {
    saveEffectiveVehicleOptions(updated);
    setVehicles(updated);
  };

  const handleResetPhuLuc1 = () => {
    resetEffectiveVehicleOptions();
    setVehicles(getEffectiveVehicleOptions());
  };

  // Handlers
  const handleSelectPrice = (price: number, productName?: string) => {
    setInput((prev) => ({
      ...prev,
      currentDieselPrice: price,
    }));
  };

  const handleSelectZone = (zone: 1 | 2) => {
    setInput((prev) => ({
      ...prev,
      petrolimexZone: zone,
      currentDieselPrice: zone === 1 ? 29200 : 29780,
    }));
  };

  const handleRefreshPrices = async () => {
    setIsRefreshingFuel(true);
    try {
      const res = await fetch('/api/pvoil/prices');
      const data = await res.json();
      if (data && data.products) {
        const do05 = data.products.find((p: any) => p.code.includes('0,05S'));
        if (do05) {
          setInput((prev) => ({
            ...prev,
            currentDieselPrice: prev.petrolimexZone === 1 ? do05.zone1 : do05.zone2,
          }));
        }
      }
    } catch {
      // fallback
    } finally {
      setTimeout(() => setIsRefreshingFuel(false), 500);
    }
  };

  const handleSaveToHistory = () => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      input: { ...input },
      result: { ...result },
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 24)]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setInput(item.input);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        currentDieselPrice={input.currentDieselPrice}
        baseDieselPrice={input.baseDieselPrice}
        petrolimexZone={input.petrolimexZone}
        onOpenFuelTable={() => setActiveTab('pvoil')}
        onOpenApiChecker={() => setIsApiCheckerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenPhuLuc1={() => setIsPhuLuc1Open(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs (Mobile & Desktop friendly) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Quy Trình 5 Bước Tính Giá Cước</span>
            </button>

            <button
              onClick={() => setActiveTab('pvoil')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pvoil'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Bảng Giá Xăng Dầu PVOIL</span>
            </button>

            <button
              onClick={() => setIsPhuLuc1Open(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-amber-300 hover:text-white hover:bg-slate-800 transition"
              title="Xem và chỉnh sửa trực tiếp bảng giá Phụ lục 1 (Xe Nóng)"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Bảng Giá Phụ Lục 1 (Xe Nóng)</span>
            </button>
          </div>

          {/* Quick Notice Badge */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              API PVOIL Tầng 0 (IP 103.21.120.100)
            </span>
          </div>
        </div>

        {/* Content by Active Tab */}
        {activeTab === 'calculator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Input Form (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-5">
              <CalculatorForm
                input={input}
                onChange={setInput}
                currentDieselPrice={input.currentDieselPrice}
                vehicles={vehicles}
                onOpenPhuLuc1Editor={() => setIsPhuLuc1Open(true)}
              />

              {/* Informational Card on Contract Rules */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-xs text-slate-400 space-y-2">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Quy định phân loại tuyến &amp; Đơn giá (Phụ lục 1 &amp; 2):
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 leading-relaxed">
                  <li>
                    <strong className="text-white">Quy tắc đơn giá Bắc - Nam:</strong> CHỈ CÓ từ <strong className="text-amber-300">Nam ra Bắc</strong> hoặc <strong className="text-amber-300">Bắc vào Nam</strong> thì mới sử dụng <strong>Đơn giá Bắc - Nam</strong>.
                  </li>
                  <li>
                    <strong className="text-white">Quy tắc cận vùng:</strong> Các chặng <strong className="text-blue-300">Bắc ➔ Trung, Trung ➔ Nam, Nam ➔ Trung, Trung ➔ Bắc</strong> và nội miền được áp dụng <strong>Đơn giá Cận Vùng / Nội Vùng</strong>.
                  </li>
                  <li>
                    <strong className="text-white">Sau khi xác định đơn giá chuẩn:</strong> Mới nhân với số Km (với cự ly dưới 75km sử dụng <strong>Giá tối thiểu</strong> theo từng loại xe trong bảng).
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Result Card (5 cols on lg) */}
            <div className="lg:col-span-5">
              <PriceResultCard
                result={result}
                input={input}
                onOpenQuotation={() => setIsQuotationOpen(true)}
                onSaveToHistory={handleSaveToHistory}
                onOpenComparison={() => setIsComparisonOpen(true)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <PvoilTable
              currentDieselPrice={input.currentDieselPrice}
              selectedZone={input.petrolimexZone}
              onSelectZone={handleSelectZone}
              onSelectPrice={handleSelectPrice}
              onRefreshPrices={handleRefreshPrices}
              isRefreshing={isRefreshingFuel}
            />

            {/* Callout about PVOil Tier 0 API */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-orange-400" />
                  Kiến trúc API PVOil:{' '}
                  <code className="text-emerald-300 font-mono">Tầng 0: 103.21.120.100 (Host: www.pvoil.com.vn)</code>
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Kiểm tra độ trễ kết nối trực tiếp vào máy chủ gốc PVOil bỏ qua SSL và xác thực Cloudflare, tự động bóc tách dữ liệu giá dầu DO 0,05S-II.
                </p>
              </div>
              <button
                onClick={() => setIsApiCheckerOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0"
              >
                Mở Bảng Kiểm Tra API PVOIL
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Hệ thống tính cước vận chuyển &amp; Bù giá nhiên liệu • Viettel Logistics
          </div>
          <div>
            Căn cứ Phụ lục 1, Phụ lục 2 &amp; Dữ liệu giá xăng dầu Tổng công ty Dầu Việt Nam (PVOIL)
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <PhuLuc1EditorModal
        isOpen={isPhuLuc1Open}
        onClose={() => setIsPhuLuc1Open(false)}
        vehicles={vehicles}
        onSaveVehicles={handleSavePhuLuc1}
        onResetVehicles={handleResetPhuLuc1}
      />

      <PvoilApiChecker
        isOpen={isApiCheckerOpen}
        onClose={() => setIsApiCheckerOpen(false)}
      />

      <VehicleComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        input={input}
        vehicles={vehicles}
        onSelectVehicle={(vehicleId) => {
          const v = vehicles.find((item) => item.id === vehicleId);
          if (v) {
            setInput((prev) => ({
              ...prev,
              vehicleId: v.id,
              vehicleCategory: v.category,
              driverCount: v.driverCount,
            }));
          }
        }}
      />

      <QuotationModal
        isOpen={isQuotationOpen}
        onClose={() => setIsQuotationOpen(false)}
        result={result}
        input={input}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadItem={handleLoadHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
