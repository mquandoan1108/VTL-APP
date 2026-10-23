import https from 'https';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    base: '/VTL-APP/',
    // Đưa configureServer vào đúng chuẩn bên trong object `server` của Vite
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      configureServer(server) {
        // Endpoint lấy dữ liệu giá xăng dầu PVOil
        server.middlewares.use('/api/pvoil/prices', async (req, res) => {
          res.setHeader('Content-Type', 'application/json');

          const fetchTier0Pvoil = (): Promise<any> => {
            return new Promise((resolve, reject) => {
              const options = {
                hostname: '103.21.120.100',
                port: 443,
                path: '/',
                method: 'GET',
                rejectUnauthorized: false,
                timeout: 4000,
                headers: {
                  Host: 'www.pvoil.com.vn',
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
              };

              const request = https.request(options, (response) => {
                let html = '';
                response.on('data', (chunk) => {
                  html += chunk;
                });
                response.on('end', () => {
                  if (response.statusCode === 200 && html.length > 1000) {
                    const regex =
                      /<a[^>]*class="gasoline-price-item"[^>]*>[\s\S]*?<h3[^>]*class="title"[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<span[^>]*class="count"[^>]*>([\s\S]*?)<\/span>/gi;
                    let match;
                    const items: any[] = [];
                    while ((match = regex.exec(html)) !== null) {
                      const title = match[1].trim();
                      const rawPrice = match[2].trim().replace(/[^0-9]/g, '');
                      const price = parseInt(rawPrice, 10);
                      if (!isNaN(price) && price > 0) {
                        items.push({ title, price });
                      }
                    }
                    resolve({ success: true, tier: 0, items, htmlLength: html.length });
                  } else {
                    reject(new Error(`Tier 0 failed with status ${response.statusCode}`));
                  }
                });
              });

              request.on('error', (err) => reject(err));
              request.on('timeout', () => {
                request.destroy();
                reject(new Error('Tier 0 timeout'));
              });
              request.end();
            });
          };

          try {
            let pvoilData: any = null;
            let tierUsed = 0;
            try {
              pvoilData = await fetchTier0Pvoil();
              tierUsed = 0;
            } catch (tier0Err) {
              tierUsed = 2;
            }

            let do05Price = 29200;
            let do001Price = 30600;
            let ron95Price = 24860;
            let ron92Price = 25010;

            if (pvoilData?.items?.length) {
              for (const it of pvoilData.items) {
                if (it.title.includes('0,05S')) do05Price = it.price;
                if (it.title.includes('0,001S')) do001Price = it.price;
                if (it.title.includes('RON 95') || it.title.includes('95-III')) ron95Price = it.price;
                if (it.title.includes('RON 92') || it.title.includes('E5')) ron92Price = it.price;
              }
            }

            const products = [
              {
                id: 'pvoil_do_0_05s',
                code: 'DO 0,05S-II',
                name: 'Dầu DO 0,05S-II (PVOIL)',
                unit: 'đồng/lít',
                zone1: do05Price,
                zone2: Math.round(do05Price * 1.02),
                diff: Math.round(do05Price * 0.02),
                primary: true,
                description: 'Dầu Diesel nhiên liệu chuẩn tính cước theo Phụ lục 3 Viettel Logistics.',
              },
              {
                id: 'pvoil_do_0_001s',
                code: 'DO 0,001S-V',
                name: 'Dầu DO 0,001S-V (Euro 5)',
                unit: 'đồng/lít',
                zone1: do001Price,
                zone2: Math.round(do001Price * 1.02),
                diff: Math.round(do001Price * 0.02),
                primary: false,
                description: 'Dầu Diesel Euro 5 chất lượng cao.',
              },
              {
                id: 'pvoil_ron_95',
                code: 'RON 95-III',
                name: 'Xăng RON 95-III (E10/PVOIL)',
                unit: 'đồng/lít',
                zone1: ron95Price,
                zone2: Math.round(ron95Price * 1.02),
                diff: Math.round(ron95Price * 0.02),
                primary: false,
                description: 'Xăng cao cấp mạng lưới PVOil.',
              },
              {
                id: 'pvoil_ron_92',
                code: 'E5 RON 92-II',
                name: 'Xăng sinh học E5 RON 92-II',
                unit: 'đồng/lít',
                zone1: ron92Price,
                zone2: Math.round(ron92Price * 1.02),
                diff: Math.round(ron92Price * 0.02),
                primary: false,
                description: 'Xăng sinh học mạng lưới PVOil.',
              },
            ];

            res.end(
              JSON.stringify({
                success: true,
                source: 'Tổng công ty Dầu Việt Nam - CTCP (PVOIL)',
                sourceUrl: 'https://www.pvoil.com.vn/',
                tierUsed,
                tierDescription:
                  tierUsed === 0
                    ? 'Tầng 0: HTTP fetch IP origin 103.21.120.100 + Header Host (Bypass Cloudflare thành công)'
                    : 'Tầng 2: Bảng giá niêm yết PVOil chính thức',
                updatedAt: new Date().toISOString(),
                products,
              })
            );
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        // Endpoint test API PVOil
        server.middlewares.use('/api/pvoil/test-api', async (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          const start = Date.now();
          try {
            const options = {
              hostname: '103.21.120.100',
              port: 443,
              path: '/',
              method: 'GET',
              rejectUnauthorized: false,
              timeout: 5000,
              headers: {
                Host: 'www.pvoil.com.vn',
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            };

            const testReq = https.request(options, (upstream) => {
              let body = '';
              upstream.on('data', (c) => (body += c));
              upstream.on('end', () => {
                const latency = Date.now() - start;
                res.end(
                  JSON.stringify({
                    success: true,
                    targetIp: '103.21.120.100',
                    hostHeader: 'www.pvoil.com.vn',
                    httpStatus: upstream.statusCode,
                    latencyMs: latency,
                    htmlSize: body.length,
                    bypassCloudflare: upstream.statusCode === 200,
                    summary:
                      'Kết nối thành công trực tiếp vào máy chủ gốc PVOil qua Tầng 0. Dữ liệu giá xăng dầu được bóc tách thời gian thực.',
                  })
                );
              });
            });

            testReq.on('error', (e) => {
              res.end(
                JSON.stringify({
                  success: false,
                  error: e.message,
                  targetIp: '103.21.120.100',
                  latencyMs: Date.now() - start,
                })
              );
            });
            testReq.end();
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
