/* ================================================================
 * Go神 设计系统 — 暗黑/白天双主题
 * ================================================================ */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { Dimensions } from 'react-native';

/* ────────── 屏幕尺寸 ────────── */
var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;

/* ────────── 颜色色板类型 ────────── */
export interface ColorScheme {
  bg: string;
  bgSecondary: string;
  card: string;
  cardAlt: string;
  input: string;
  accent: string;
  gold: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  white: string;
  gray: string;
  gray2: string;
  border: string;
  borderLight: string;
  wearFactoryNew: string;
  wearMinimalWear: string;
  wearFieldTested: string;
  wearWellWorn: string;
  wearBattleScarred: string;
}

/* ────────── 暗黑主题 ────────── */
export var C_dark: ColorScheme = {
  bg: '#0D0D1A',
  bgSecondary: '#12122A',
  card: '#181830',
  cardAlt: '#1E1E3A',
  input: '#1A1A32',
  accent: '#FF6B00',
  gold: '#F0C060',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3',
  white: '#FFFFFF',
  gray: '#8E8E9E',
  gray2: '#5A5A72',
  border: '#252540',
  borderLight: '#1E1E3A',
  wearFactoryNew: '#4CAF50',
  wearMinimalWear: '#8BC34A',
  wearFieldTested: '#FFC107',
  wearWellWorn: '#FF9800',
  wearBattleScarred: '#F44336',
};

/* ────────── 白天主题 ────────── */
export var C_light: ColorScheme = {
  bg: '#F2F2F7',
  bgSecondary: '#FAFAFE',
  card: '#FFFFFF',
  cardAlt: '#F0F0F5',
  input: '#ECECF2',
  accent: '#FF6B00',
  gold: '#C88820',
  success: '#4CAF50',
  warning: '#F5A623',
  danger: '#E53935',
  info: '#1976D2',
  white: '#1A1A2E',
  gray: '#6E6E82',
  gray2: '#9E9EB0',
  border: '#DCDCE8',
  borderLight: '#ECECF2',
  wearFactoryNew: '#43A047',
  wearMinimalWear: '#7CB342',
  wearFieldTested: '#F5A623',
  wearWellWorn: '#EF6C00',
  wearBattleScarred: '#E53935',
};

/* ────────── 默认导出暗黑主题 (兼容旧 import { C } 方式) ────────── */
export var C = C_dark;

/* ────────── 磨损中文映射 ────────── */
export function getWearMap(C: ColorScheme): Record<string, string> {
  return {
    '崭新出厂': C.wearFactoryNew,
    '略有磨损': C.wearMinimalWear,
    '久经沙场': C.wearFieldTested,
    '破损不堪': C.wearWellWorn,
    '战痕累累': C.wearBattleScarred,
  };
}

/* static fallback */
export var WEAR_MAP = getWearMap(C_dark);

/* ────────── 字号阶梯 ────────── */
export var F = {
  xs: 10, sm: 12, md: 13, base: 14, lg: 15,
  xl: 17, xxl: 20, xxxl: 22, price: 24, icon: 32,
} as const;

/* ────────── 字重 ────────── */
export var W = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/* ────────── 间距 ────────── */
export var S = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
} as const;

/* ────────── 圆角 ────────── */
export var R = {
  xs: 3, sm: 6, md: 8, lg: 10, xl: 12, xxl: 16, full: 9999,
} as const;

/* ────────── 页面布局 ────────── */
export var PAGE_PAD = S.lg;
export var CARD_GAP = S.sm;
export var GRID_3_COL = (screenW - 16 * 2 - CARD_GAP * 2) / 3;
export var GRID_2_COL = (screenW - 16 * 2 - CARD_GAP) / 2;

/* ────────── 工具函数 ────────── */
export function fmtPrice(n: number): string {
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export { screenW, screenH };

/* ================================================================
 * ThemeContext — 全局主题切换
 * ================================================================ */
export interface ThemeContextValue {
  C: ColorScheme;
  isDark: boolean;
  toggleTheme: () => void;
}

var ThemeContext = createContext<ThemeContextValue>({
  C: C_dark,
  isDark: true,
  toggleTheme: function () {},
});

export function ThemeProvider(props: { children: React.ReactNode }) {
  var _sd = useState(true);
  var isDark = _sd[0];
  var setIsDark = _sd[1];

  var value = useMemo<ThemeContextValue>(function () {
    return {
      C: isDark ? C_dark : C_light,
      isDark: isDark,
      toggleTheme: function () { setIsDark(function (v) { return !v; }); },
    };
  }, [isDark]);

  return React.createElement(ThemeContext.Provider, { value: value }, props.children);
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
