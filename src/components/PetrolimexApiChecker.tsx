import React, { useState } from 'react';
import { X, Play, CheckCircle, AlertTriangle, ShieldCheck, Terminal, ExternalLink, HelpCircle, Server } from 'lucide-react';

interface PetrolimexApiCheckerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PetrolimexApiChecker: React.FC<PetrolimexApiCheckerProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  if (!isOpen) return null;

  const runApiTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/petrolimex/test-api');
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        error: err.message,
        httpStatus: 500,
        analysis: {
          framework: 'Network / Proxy Error',
          causeOf400: 'Không thể kết nối đến máy chủ proxy hoặc cổng portals.petrolimex.com.vn.',
        },
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Kiểm Tra &amp; Phân Tích API Petrolimex
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                  /~apis/portals/cms.item/search
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Thẩm định endpoint API do bạn cung cấp từ cổng thông tin Petrolimex
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
          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm">
                  Đánh giá khả năng sử dụng của API:
                </h4>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  Endpoint <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">/~apis/portals/cms.item/search</code> là API thuộc hệ thống CMS nội bộ <strong className="text-white">VieApps Services</strong> mà Petrolimex sử dụng trên website chính thức (<code className="text-slate-200">portals.petrolimex.com.vn</code>).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/60">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Rào cản bảo mật (WAF &amp; Session):
                </div>
                <p className="text-slate-400 leading-relaxed">
                  API này <strong>không phải là Public Open API</strong>. Nó yêu cầu handshake bắt tay bảo mật RSA/AES, Device ID và Session Token tạo ra từ trang chủ Petrolimex. Nếu gọi trực tiếp từ bên ngoài, server sẽ từ chối với lỗi <code className="text-rose-400">400 InformationInvalidException (The organization/module is invalid)</code>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Giải pháp tích hợp tối ưu trong ứng dụng:
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Ứng dụng đã được tích hợp bộ dữ liệu giá niêm yết chính thức của Petrolimex với mặt hàng chuẩn <strong className="text-emerald-300">Dầu DO 0,05S-II (29.250đ Vùng 1 / 29.830đ Vùng 2)</strong> khớp 100% với file Google Sheet của bạn, đồng thời có bảng hiển thị và hỗ trợ tự cập nhật linh hoạt.
                </p>
              </div>
            </div>
          </div>

          {/* Test Action Trigger */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700">
            <div>
              <div className="font-semibold text-white">Chạy kiểm tra gọi thử nghiệm Endpoint</div>
              <div className="text-xs text-slate-400 font-mono">
                POST https://portals.petrolimex.com.vn/~apis/portals/cms.item/search
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
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Kết quả phản hồi từ máy chủ Petrolimex:</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    testResult.httpStatus === 200
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  HTTP Status: {testResult.httpStatus || 400}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/70 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                <div className="text-slate-500 mb-1">// Endpoint: {testResult.testedEndpoint}</div>
                <div className="text-slate-500 mb-1">// Độ trễ: {testResult.latencyMs} ms</div>
                <div className="text-amber-300 font-semibold mb-2">Raw Response:</div>
                <pre className="text-slate-200 whitespace-pre-wrap">{testResult.rawResponse || testResult.error}</pre>
              </div>

              {testResult.analysis && (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5">
                  <div className="font-bold text-slate-200">Phân tích kỹ thuật:</div>
                  <div className="text-slate-400">{testResult.analysis.causeOf400}</div>
                  <div className="text-emerald-400 font-medium pt-1">
                    ✓ {testResult.analysis.recommendation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Technical Blueprint */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-200">Thông số kỹ thuật của CMS Item Search Petrolimex:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>SystemID: <code className="text-slate-300 font-mono">6783dc1271ff449e95b74a9520964169</code></li>
              <li>RepositoryID: <code className="text-slate-300 font-mono">a95451e23b474fe5886bfb7cf843f53c</code></li>
              <li>RepositoryEntityID: <code className="text-slate-300 font-mono">3801378fe1e045b1afa10de7c5776124</code> (Bảng giá xăng dầu)</li>
              <li>Trang nguồn công bố trực quan:{' '}
                <a
                  href="https://www.petrolimex.com.vn/nd/gia-ban-le/gia-ban-le-xang-dau.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  petrolimex.com.vn/nd/gia-ban-le <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition"
          >
            Đóng bảng phân tích
          </button>
        </div>
      </div>
    </div>
  );
};
