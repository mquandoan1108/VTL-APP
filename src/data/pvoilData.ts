import { PetrolimexProduct } from '../types/logistics';

export const PVOIL_PRODUCTS: PetrolimexProduct[] = [
  {
    id: 'pvoil_do_0_05s',
    code: 'DO 0,05S-II',
    name: 'Dầu Điêzen DO 0,05S-II (PVOIL)',
    unit: 'đồng/lít',
    zone1Price: 29200, // Giá lấy trực tiếp từ máy chủ gốc PVOil
    zone2Price: 29780,
    priceDiff: 580,
    isPrimaryFuelForLogistics: true,
    description: 'Nhiên liệu tiêu chuẩn quy định tính cước xe tải và xe cont kéo cảng theo Phụ lục 3 Viettel Logistics.',
  },
  {
    id: 'pvoil_do_0_001s',
    code: 'DO 0,001S-V',
    name: 'Dầu Điêzen DO 0,001S-V (Euro 5)',
    unit: 'đồng/lít',
    zone1Price: 30600,
    zone2Price: 31210,
    priceDiff: 610,
    isPrimaryFuelForLogistics: false,
    description: 'Dầu Diesel Euro 5 chất lượng cao giảm thiểu phát thải.',
  },
  {
    id: 'pvoil_ron_95',
    code: 'RON 95-III',
    name: 'Xăng RON 95-III (E10/PVOIL)',
    unit: 'đồng/lít',
    zone1Price: 24860,
    zone2Price: 25350,
    priceDiff: 490,
    isPrimaryFuelForLogistics: false,
    description: 'Xăng cao cấp mạng lưới PVOil.',
  },
  {
    id: 'pvoil_ron_92',
    code: 'E5 RON 92-II',
    name: 'Xăng sinh học E5 RON 92-II',
    unit: 'đồng/lít',
    zone1Price: 25010,
    zone2Price: 25510,
    priceDiff: 500,
    isPrimaryFuelForLogistics: false,
    description: 'Xăng sinh học mạng lưới PVOil.',
  },
];

export const PVOIL_METADATA = {
  announcementDate: '2026-10-22',
  effectiveTime: 'Kỳ điều hành ngày 22/10/2026',
  sourceName: 'Tổng công ty Dầu Việt Nam - CTCP (PVOIL)',
  sourceUrl: 'https://www.pvoil.com.vn/',
  originIp: '103.21.120.100',
  tierArchitecture: {
    tier0: 'HTTP fetch IP origin 103.21.120.100 + header Host: www.pvoil.com.vn (bypass Cloudflare qua HTTPS client bỏ qua xác thực SSL)',
    tier1: 'Playwright stealth scraper',
    tier2: 'GiaXangHomNay fallback & official PVOil tariff',
  },
  statusMessage: 'Đang kết nối trực tiếp vào máy chủ gốc PVOil qua Tầng 0 (IP 103.21.120.100)',
};
