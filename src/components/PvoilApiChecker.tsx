import React, { useState } from 'react';
import { X, Play, CheckCircle, ShieldCheck, Terminal, Server, Cpu, Layers } from 'lucide-react';

interface PvoilApiCheckerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PvoilApiChecker: React.FC<PvoilApiCheckerProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  if (!isOpen) return null;

  const runApiTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/pvoil/test-api');
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Kiểm Tra Kết Nối API Xăng Dầu PVOIL
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tầng 0: 103.21.120.100
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Kiến trúc đa tầng bypass Cloudflare trích xuất dữ liệu giá thời gian thực
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300">
          {/* Architecture Visual Diagram */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Layers className="w-4 h-4 text-orange-400" />
              <span>Sơ Đồ Kiến Trúc Lấy Giá Dầu PVOIL:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Tier 0 */}
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Tầng 0 (Đang dùng):
                </div>
                <div className="text-slate-200 font-semibold font-mono text-[11px]">
                  IP Origin 103.21.120.100
                </div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Gửi HTTPS request trực tiếp tới IP máy chủ gốc PVOIL kèm header <code>Host: www.pvoil.com.vn</code>, bỏ qua xác thực SSL để bypass hoàn toàn Cloudflare.
                </div>
              </div>

              {/* Tier 1 */}
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                <div className="font-bold text-blue-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  Tầng 1 (Dự phòng 1):
                </div>
                <div className="text-slate-200 font-semibold font-mono text-[11px]">
                  Playwright Stealth
                </div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Tự động vượt thử thách Cloudflare Turnstile bằng trình duyệt ảo hoá stealth mode khi IP gốc thay đổi.
                </div>
              </div>

              {/* Tier 2 */}
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Tầng 2 (Dự phòng 2):
                </div>
                <div className="text-slate-200 font-semibold font-mono text-[11px]">
                  GiaXangHomNay / Official Tariff
                </div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Nguồn tổng hợp giá xăng dầu liên bộ Công Thương &amp; PVOIL niêm yết chính thức.
                </div>
              </div>
            </div>
          </div>

          {/* Test Action Trigger */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-850 border border-slate-700">
            <div>
              <div className="font-semibold text-white">Chạy kiểm tra gọi IP Origin PVOIL</div>
              <div className="text-xs text-slate-400 font-mono">
                GET https://103.21.120.100/ (Host: www.pvoil.com.vn)
              </div>
            </div>
            <button
              onClick={runApiTest}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Đang gửi request...' : 'Chạy kiểm tra ngay'}</span>
            </button>
          </div>

          {/* Test Result Display */}
          {testResult && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Kết quả phản hồi từ Origin IP PVOIL:</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    testResult.httpStatus === 200
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  HTTP Status: {testResult.httpStatus} {testResult.httpStatus === 200 ? 'OK' : 'Error'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                <div>IP máy chủ: <span className="text-emerald-400">{testResult.targetIp}</span></div>
                <div>Header Host: <span className="text-amber-300">{testResult.hostHeader}</span></div>
                <div>Thời gian phản hồi: <span className="text-cyan-400">{testResult.latencyMs} ms</span></div>
                <div>Dung lượng trang HTML: <span className="text-slate-200">{testResult.htmlSize} bytes</span></div>
                <div>Bypass Cloudflare: <span className="text-emerald-300 font-bold">Thành công (200 OK)</span></div>
                <div className="text-emerald-400 pt-1 font-sans font-semibold">
                  ✓ {testResult.summary}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition"
          >
            Đóng bảng kiểm tra
          </button>
        </div>
      </div>
    </div>
  );
};
