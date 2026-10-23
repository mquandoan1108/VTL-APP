import { ProvinceInfo, ConnectionDirection, ConnectionType } from '../types/logistics';

// Danh sách 63 tỉnh thành Việt Nam với phân vùng Bắc/Trung/Nam và Vùng 1/Vùng 2 Petrolimex
// (Theo quy định Petrolimex: Vùng 2 là các địa bàn xa cảng, xa kho đầu mối, hải đảo, vùng sâu vùng xa)
export const VIETNAM_PROVINCES: ProvinceInfo[] = [
  // --- MIỀN BẮC ---
  { id: 'HN', name: 'Hà Nội', code: '01', region: 'Bac', petrolimexZone: 1 },
  { id: 'HP', name: 'Hải Phòng', code: '31', region: 'Bac', petrolimexZone: 1 },
  { id: 'QN', name: 'Quảng Ninh', code: '14', region: 'Bac', petrolimexZone: 1 },
  { id: 'BN', name: 'Bắc Ninh', code: '99', region: 'Bac', petrolimexZone: 1 },
  { id: 'HY', name: 'Hưng Yên', code: '89', region: 'Bac', petrolimexZone: 1 },
  { id: 'HD', name: 'Hải Dương', code: '34', region: 'Bac', petrolimexZone: 1 },
  { id: 'VP', name: 'Vĩnh Phúc', code: '88', region: 'Bac', petrolimexZone: 1 },
  { id: 'TN', name: 'Thái Nguyên', code: '20', region: 'Bac', petrolimexZone: 1 },
  { id: 'BG', name: 'Bắc Giang', code: '98', region: 'Bac', petrolimexZone: 1 },
  { id: 'PT', name: 'Phú Thọ', code: '19', region: 'Bac', petrolimexZone: 1 },
  { id: 'ND', name: 'Nam Định', code: '18', region: 'Bac', petrolimexZone: 1 },
  { id: 'NB', name: 'Ninh Bình', code: '35', region: 'Bac', petrolimexZone: 1 },
  { id: 'HNA', name: 'Hà Nam', code: '90', region: 'Bac', petrolimexZone: 1 },
  { id: 'TB', name: 'Thái Bình', code: '17', region: 'Bac', petrolimexZone: 1 },
  { id: 'LS', name: 'Lạng Sơn', code: '12', region: 'Bac', petrolimexZone: 2 },
  { id: 'LC', name: 'Lào Cai', code: '24', region: 'Bac', petrolimexZone: 2 },
  { id: 'YB', name: 'Yên Bái', code: '21', region: 'Bac', petrolimexZone: 2 },
  { id: 'TQ', name: 'Tuyên Quang', code: '22', region: 'Bac', petrolimexZone: 2 },
  { id: 'HG', name: 'Hà Giang', code: '23', region: 'Bac', petrolimexZone: 2 },
  { id: 'CB', name: 'Cao Bằng', code: '11', region: 'Bac', petrolimexZone: 2 },
  { id: 'BK', name: 'Bắc Kạn', code: '97', region: 'Bac', petrolimexZone: 2 },
  { id: 'HB', name: 'Hòa Bình', code: '28', region: 'Bac', petrolimexZone: 2 },
  { id: 'SL', name: 'Sơn La', code: '26', region: 'Bac', petrolimexZone: 2 },
  { id: 'DB', name: 'Điện Biên', code: '27', region: 'Bac', petrolimexZone: 2 },
  { id: 'LCU', name: 'Lai Châu', code: '25', region: 'Bac', petrolimexZone: 2 },

  // --- MIỀN TRUNG & TÂY NGUYÊN ---
  { id: 'DN', name: 'Đà Nẵng', code: '43', region: 'Trung', petrolimexZone: 1 },
  { id: 'TTH', name: 'Thừa Thiên Huế', code: '75', region: 'Trung', petrolimexZone: 1 },
  { id: 'QNA', name: 'Quảng Nam', code: '92', region: 'Trung', petrolimexZone: 1 },
  { id: 'QNG', name: 'Quảng Ngãi', code: '76', region: 'Trung', petrolimexZone: 1 },
  { id: 'BDH', name: 'Bình Định', code: '77', region: 'Trung', petrolimexZone: 1 },
  { id: 'PY', name: 'Phú Yên', code: '78', region: 'Trung', petrolimexZone: 1 },
  { id: 'KH', name: 'Khánh Hòa', code: '79', region: 'Trung', petrolimexZone: 1 },
  { id: 'NT', name: 'Ninh Thuận', code: '85', region: 'Trung', petrolimexZone: 1 },
  { id: 'BT', name: 'Bình Thuận', code: '86', region: 'Trung', petrolimexZone: 1 },
  { id: 'TH', name: 'Thanh Hóa', code: '36', region: 'Trung', petrolimexZone: 1 },
  { id: 'NA', name: 'Nghệ An', code: '37', region: 'Trung', petrolimexZone: 1 },
  { id: 'HT', name: 'Hà Tĩnh', code: '38', region: 'Trung', petrolimexZone: 1 },
  { id: 'QB', name: 'Quảng Bình', code: '73', region: 'Trung', petrolimexZone: 1 },
  { id: 'QT', name: 'Quảng Trị', code: '74', region: 'Trung', petrolimexZone: 1 },
  { id: 'KT', name: 'Kon Tum', code: '82', region: 'Trung', petrolimexZone: 2 },
  { id: 'GL', name: 'Gia Lai', code: '81', region: 'Trung', petrolimexZone: 2 },
  { id: 'DL', name: 'Đắk Lắk', code: '47', region: 'Trung', petrolimexZone: 2 },
  { id: 'DNO', name: 'Đắk Nông', code: '48', region: 'Trung', petrolimexZone: 2 },
  { id: 'LD', name: 'Lâm Đồng', code: '49', region: 'Trung', petrolimexZone: 2 },

  // --- MIỀN NAM & ĐỒNG BẰNG SÔNG CỬU LONG ---
  { id: 'SG', name: 'TP. Hồ Chí Minh', code: '50', region: 'Nam', petrolimexZone: 1 },
  { id: 'BD', name: 'Bình Dương', code: '61', region: 'Nam', petrolimexZone: 1 },
  { id: 'DON', name: 'Đồng Nai', code: '60', region: 'Nam', petrolimexZone: 1 },
  { id: 'BRVT', name: 'Bà Rịa - Vũng Tàu', code: '72', region: 'Nam', petrolimexZone: 1 },
  { id: 'LA', name: 'Long An', code: '62', region: 'Nam', petrolimexZone: 1 },
  { id: 'TG', name: 'Tiền Giang', code: '63', region: 'Nam', petrolimexZone: 1 },
  { id: 'BTRE', name: 'Bến Tre', code: '71', region: 'Nam', petrolimexZone: 1 },
  { id: 'VL', name: 'Vĩnh Long', code: '64', region: 'Nam', petrolimexZone: 1 },
  { id: 'TV', name: 'Trà Vinh', code: '84', region: 'Nam', petrolimexZone: 1 },
  { id: 'CT', name: 'Cần Thơ', code: '65', region: 'Nam', petrolimexZone: 1 },
  { id: 'HGIA', name: 'Hậu Giang', code: '95', region: 'Nam', petrolimexZone: 1 },
  { id: 'ST', name: 'Sóc Trăng', code: '83', region: 'Nam', petrolimexZone: 1 },
  { id: 'BL', name: 'Bạc Liêu', code: '94', region: 'Nam', petrolimexZone: 1 },
  { id: 'CM', name: 'Cà Mau', code: '69', region: 'Nam', petrolimexZone: 2 },
  { id: 'AG', name: 'An Giang', code: '67', region: 'Nam', petrolimexZone: 1 },
  { id: 'KG', name: 'Kiên Giang', code: '68', region: 'Nam', petrolimexZone: 2 },
  { id: 'DT', name: 'Đồng Tháp', code: '66', region: 'Nam', petrolimexZone: 1 },
  { id: 'TNINH', name: 'Tây Ninh', code: '70', region: 'Nam', petrolimexZone: 1 },
  { id: 'BP', name: 'Bình Phước', code: '93', region: 'Nam', petrolimexZone: 2 },
];

// Thứ tự địa lý từ Bắc vào Nam (để xác định chiều ra / chiều vào)
const NORTH_TO_SOUTH_ORDER: string[] = [
  // Miền núi phía Bắc
  'HG', 'CB', 'LCU', 'DB', 'LC', 'SL', 'YB', 'TQ', 'BK', 'LS', 'TN',
  // Đồng bằng Bắc Bộ
  'PT', 'VP', 'BG', 'HN', 'BN', 'QN', 'HP', 'HD', 'HY', 'HNA', 'TB', 'ND', 'NB', 'HB',
  // Bắc Trung Bộ
  'TH', 'NA', 'HT', 'QB', 'QT', 'TTH',
  // Duyên hải Nam Trung Bộ & Tây Nguyên
  'DN', 'QNA', 'KT', 'QNG', 'GL', 'BDH', 'DL', 'PY', 'KH', 'DNO', 'LD', 'NT', 'BT',
  // Đông Nam Bộ
  'BP', 'TNINH', 'BD', 'DON', 'SG', 'BRVT',
  // Tây Nam Bộ
  'LA', 'TG', 'DT', 'BTRE', 'VL', 'CT', 'TV', 'AG', 'HGIA', 'ST', 'BL', 'KG', 'CM',
];

// Ma trận khoảng cách ước tính giữa các trung tâm logistics chính (Km)
const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  SG: {
    HN: 1720, HP: 1780, DN: 960, BD: 35, DON: 45, BRVT: 85, LA: 50, TG: 75,
    CT: 165, CM: 305, DL: 350, KH: 430, BDH: 650, TH: 1560, NA: 1420,
    QN: 1850, BN: 1740, HY: 1710, TNINH: 95, BP: 110,
  },
  HN: {
    SG: 1720, HP: 120, QN: 155, BN: 35, HY: 40, HD: 60, VP: 55, TN: 80,
    PT: 90, ND: 90, NB: 95, TH: 160, NA: 300, HT: 350, QB: 500, DN: 770,
    KH: 1300, CT: 1880, DL: 1400, BD: 1700, DON: 1690, BRVT: 1790,
  },
  HP: {
    HN: 120, SG: 1780, QN: 60, HD: 45, BN: 95, HY: 90, ND: 85, NB: 115,
    DN: 820, TH: 200, NA: 340,
  },
  DN: {
    HN: 770, SG: 960, HP: 820, TTH: 100, QNA: 65, QNG: 135, BDH: 300,
    KH: 520, DL: 550, NA: 470, TH: 610, BD: 940, DON: 930,
  },
  BD: {
    SG: 35, DON: 30, BRVT: 95, LA: 75, CT: 195, HN: 1700, HP: 1760, DN: 940,
  },
  DON: {
    SG: 45, BD: 30, BRVT: 70, LA: 85, CT: 205, HN: 1690, HP: 1750, DN: 930,
  },
  CT: {
    SG: 165, LA: 125, TG: 105, VL: 40, ST: 60, BL: 110, CM: 180, AG: 65,
    KG: 115, HN: 1880, DN: 1120,
  },
  BRVT: {
    SG: 85, DON: 70, BD: 95, HN: 1790, HP: 1850, DN: 1030,
  },
};

/**
 * Phân loại chính xác tuyến đường theo yêu cầu:
 * - CHỈ CÓ từ Nam ra Bắc, hoặc Bắc vào Nam thì mới sử dụng đơn giá Bắc - Nam
 * - Còn từ Bắc vào Trung, Trung vào Nam, Nam ra Trung, Trung ra Bắc thì là ĐƠN GIÁ CẬN VÙNG / NỘI VÙNG
 */
export function detectDirectionAndConnection(
  fromId: string,
  toId: string
): {
  direction: ConnectionDirection;
  connectionType: ConnectionType;
  isNorthSouthRoute: boolean;
  routeType: 'bac_nam' | 'can_vung_noi_vung';
  routeDescription: string;
  suggestedKm: number;
} {
  const fromProv = VIETNAM_PROVINCES.find((p) => p.id === fromId) || VIETNAM_PROVINCES[0];
  const toProv = VIETNAM_PROVINCES.find((p) => p.id === toId) || VIETNAM_PROVINCES[0];

  const fromRegion = fromProv.region; // 'Bac' | 'Trung' | 'Nam'
  const toRegion = toProv.region;

  // 1. Kiểm tra có phải tuyến Bắc - Nam không (CHỈ KHI kết nối giữa Miền Nam và Miền Bắc)
  const isSouthToNorth = fromRegion === 'Nam' && toRegion === 'Bac';
  const isNorthToSouth = fromRegion === 'Bac' && toRegion === 'Nam';
  const isNorthSouthRoute = isSouthToNorth || isNorthToSouth;

  let direction: ConnectionDirection = 'chieu_ra';
  let routeType: 'bac_nam' | 'can_vung_noi_vung' = 'can_vung_noi_vung';
  let routeDescription = '';
  let connectionType: ConnectionType = 'lien_tinh_vung';

  if (isSouthToNorth) {
    // Nam ra Bắc: Tuyến Bắc Nam Chiều ra
    direction = 'chieu_ra';
    routeType = 'bac_nam';
    connectionType = 'truc_bac_nam';
    routeDescription = `Tuyến Bắc - Nam: Chiều Ra (${fromProv.name} [Nam] ➔ ${toProv.name} [Bắc])`;
  } else if (isNorthToSouth) {
    // Bắc vào Nam: Tuyến Bắc Nam Chiều vào
    direction = 'chieu_vao';
    routeType = 'bac_nam';
    connectionType = 'truc_bac_nam';
    routeDescription = `Tuyến Bắc - Nam: Chiều Vào (${fromProv.name} [Bắc] ➔ ${toProv.name} [Nam])`;
  } else {
    // Tất cả các trường hợp còn lại: Bắc vào Trung, Trung vào Nam, Nam ra Trung, Trung ra Bắc, nội miền
    routeType = 'can_vung_noi_vung';

    if (fromId === toId) {
      connectionType = 'noi_tinh_vung';
      direction = 'chieu_ra';
      routeDescription = `Nội Tỉnh / Nội Vùng (${fromProv.name})`;
    } else if (fromRegion === 'Trung' && toRegion === 'Bac') {
      connectionType = 'lien_tinh_vung';
      direction = 'chieu_ra';
      routeDescription = `Cận Vùng: Trung ra Bắc (${fromProv.name} [Trung] ➔ ${toProv.name} [Bắc])`;
    } else if (fromRegion === 'Nam' && toRegion === 'Trung') {
      connectionType = 'lien_tinh_vung';
      direction = 'chieu_ra';
      routeDescription = `Cận Vùng: Nam ra Trung (${fromProv.name} [Nam] ➔ ${toProv.name} [Trung])`;
    } else if (fromRegion === 'Bac' && toRegion === 'Trung') {
      connectionType = 'lien_tinh_vung';
      direction = 'chieu_vao';
      routeDescription = `Cận Vùng: Bắc vào Trung (${fromProv.name} [Bắc] ➔ ${toProv.name} [Trung])`;
    } else if (fromRegion === 'Trung' && toRegion === 'Nam') {
      connectionType = 'lien_tinh_vung';
      direction = 'chieu_vao';
      routeDescription = `Cận Vùng: Trung vào Nam (${fromProv.name} [Trung] ➔ ${toProv.name} [Nam])`;
    } else if (fromRegion === 'Bac' && toRegion === 'Bac') {
      connectionType = 'noi_tinh_vung';
      const fromIndex = NORTH_TO_SOUTH_ORDER.indexOf(fromId);
      const toIndex = NORTH_TO_SOUTH_ORDER.indexOf(toId);
      direction = fromIndex > toIndex ? 'chieu_ra' : 'chieu_vao';
      routeDescription = `Đơn giá Cận Vùng / Nội Vùng: Bắc ➔ Bắc (${fromProv.name} ➔ ${toProv.name})`;
    } else if (fromRegion === 'Trung' && toRegion === 'Trung') {
      connectionType = 'noi_tinh_vung';
      const fromIndex = NORTH_TO_SOUTH_ORDER.indexOf(fromId);
      const toIndex = NORTH_TO_SOUTH_ORDER.indexOf(toId);
      direction = fromIndex > toIndex ? 'chieu_ra' : 'chieu_vao';
      routeDescription = `Đơn giá Cận Vùng / Nội Vùng: Trung ➔ Trung (${fromProv.name} ➔ ${toProv.name})`;
    } else if (fromRegion === 'Nam' && toRegion === 'Nam') {
      connectionType = 'noi_tinh_vung';
      const fromIndex = NORTH_TO_SOUTH_ORDER.indexOf(fromId);
      const toIndex = NORTH_TO_SOUTH_ORDER.indexOf(toId);
      direction = fromIndex > toIndex ? 'chieu_ra' : 'chieu_vao';
      routeDescription = `Đơn giá Cận Vùng / Nội Vùng: Nam ➔ Nam (${fromProv.name} ➔ ${toProv.name})`;
    } else {
      connectionType = 'lien_tinh_vung';
      // Cùng miền hoặc liền kề
      const fromIndex = NORTH_TO_SOUTH_ORDER.indexOf(fromId);
      const toIndex = NORTH_TO_SOUTH_ORDER.indexOf(toId);
      direction = fromIndex > toIndex ? 'chieu_ra' : 'chieu_vao';
      routeDescription = `Đơn giá Cận Vùng / Nội Vùng (${fromProv.name} ➔ ${toProv.name})`;
    }
  }

  // Tra cứu khoảng cách mẫu
  let km = 100;
  if (fromId === toId) {
    km = 35;
  } else if (DISTANCE_MATRIX[fromId]?.[toId]) {
    km = DISTANCE_MATRIX[fromId][toId];
  } else if (DISTANCE_MATRIX[toId]?.[fromId]) {
    km = DISTANCE_MATRIX[toId][fromId];
  } else {
    const fromIndex = NORTH_TO_SOUTH_ORDER.indexOf(fromId);
    const toIndex = NORTH_TO_SOUTH_ORDER.indexOf(toId);
    const diff = Math.abs(fromIndex - toIndex);
    if (diff <= 2) km = 45;
    else if (diff <= 6) km = 120;
    else if (diff <= 15) km = 350;
    else if (diff <= 30) km = 750;
    else km = 1650;
  }

  return {
    direction,
    connectionType,
    isNorthSouthRoute,
    routeType,
    routeDescription,
    suggestedKm: km,
  };
}
