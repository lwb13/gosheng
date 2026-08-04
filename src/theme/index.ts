/* ================================================================
 * Go神 设计系统 — 唯一数据源
 * 所有页面/组件统一从此文件引用颜色、字号、间距、圆角
 * ================================================================ */

import { Dimensions } from 'react-native';



/* ────────── 屏幕尺寸 ────────── */
var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;

/* ────────── 颜色色板 ────────── */
export var C = {
  /* 背景 */
  bg: '#0D0D1A',
  bgSecondary: '#12122A',
  card: '#181830',
  cardAlt: '#1E1E3A',
  input: '#1A1A32',

  /* 强调 */
  accent: '#FF6B00',
  gold: '#F0C060',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3',

  /* 文字 */
  white: '#FFFFFF',
  gray: '#8E8E9E',
  gray2: '#5A5A72',

  /* 边框 */
  border: '#252540',
  borderLight: '#1E1E3A',

  /* 磨损色阶 */
  wearFactoryNew: '#4CAF50',
  wearMinimalWear: '#8BC34A',
  wearFieldTested: '#FFC107',
  wearWellWorn: '#FF9800',
  wearBattleScarred: '#F44336',
} as const;

/* ────────── 磨损中文映射 ────────── */
export var WEAR_MAP: Record<string, string> = {
  '崭新出厂': C.wearFactoryNew,
  '略有磨损': C.wearMinimalWear,
  '久经沙场': C.wearFieldTested,
  '破损不堪': C.wearWellWorn,
  '战痕累累': C.wearBattleScarred,
};

/* ────────── 字号阶梯 ────────── */
export var F = {
  xs: 10,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 17,
  xxl: 20,
  xxxl: 22,
  price: 24,
  icon: 32,
} as const;

/* ────────── 字重 ────────── */
export var W = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/* ────────── 间距 (4px 基准网格) ────────── */
export var S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/* ────────── 圆角 ────────── */
export var R = {
  xs: 3,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  full: 9999,
} as const;

/* ────────── 页面布局 ────────── */
export var PAGE_PAD = S.lg; // 16px 页面水平边距
export var CARD_GAP = S.sm; // 8px  卡片间距

/* ────────── 商品网格尺寸 ────────── */
export var GRID_3_COL = (screenW - 16 * 2 - CARD_GAP * 2) / 3; // 首页3列卡片宽
export var GRID_2_COL = (screenW - 16 * 2 - CARD_GAP) / 2;      // 快捷入口宽

/* ────────── 工具函数 ────────── */
export function fmtPrice(n: number): string {
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ────────── 屏幕工具 ────────── */
export { screenW, screenH };
