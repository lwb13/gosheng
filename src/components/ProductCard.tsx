/* ================================================================
 * ProductCard — 可复用商品卡片 (双主题)
 * ================================================================ */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  useAppTheme, ColorScheme, getWearMap,
  F, W, R, S, fmtPrice, GRID_3_COL, CARD_GAP,
} from '../theme';

export interface ProductCardProps {
  name: string;
  price: number;
  wear: string;
  stock: number;
  horizontal?: boolean;
  actionLabel?: string;
  onPress?: () => void;
  onAction?: () => void;
}

/* ────────── 样式工厂 ────────── */
function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    /* 竖版网格 */
    card: {
      width: GRID_3_COL,
      backgroundColor: C.card,
      borderRadius: R.md,
      overflow: 'hidden',
      marginBottom: CARD_GAP,
    },
    cardImg: {
      width: '100%', aspectRatio: 1,
      backgroundColor: C.cardAlt,
      justifyContent: 'center', alignItems: 'center',
    },
    cardImgTxt: { fontSize: F.icon, opacity: 0.4 },
    cardBody: { padding: S.sm },
    cardRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: S.xs,
    },

    /* 横版列表 */
    hCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.card, borderRadius: R.md,
      padding: S.sm, marginHorizontal: 16, marginBottom: S.sm,
    },
    hThumb: {
      width: 80, height: 80, borderRadius: R.md,
      backgroundColor: C.cardAlt,
      justifyContent: 'center', alignItems: 'center',
    },
    hThumbIcon: { fontSize: 36, opacity: 0.4 },
    hInfo: { flex: 1, marginLeft: S.md, marginRight: S.sm },
    hName: {
      fontSize: F.lg, fontWeight: W.medium,
      color: C.white, marginBottom: S.xs,
    },
    hMeta: {
      flexDirection: 'row', alignItems: 'center',
      gap: S.sm, marginBottom: S.xs,
    },

    /* 通用 */
    wearTag: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: R.xs },
    wearTxt: { fontSize: F.xs, color: '#fff', fontWeight: W.semibold },
    stockTxt: { fontSize: F.xs, color: C.gray2 },
    name: {
      fontSize: F.sm, color: C.white,
      fontWeight: W.medium, marginBottom: S.xs,
    },
    price: { fontSize: F.base, fontWeight: W.bold, color: C.gold },
    priceUnit: { fontSize: F.sm, fontWeight: W.regular },

    actionBtn: {
      paddingHorizontal: S.md, paddingVertical: S.xs,
      borderRadius: R.sm, backgroundColor: C.accent,
    },
    actionTxt: { fontSize: F.sm, fontWeight: W.semibold, color: '#FFFFFF' },
  });
}

/* ================================================================
 * 组件
 * ================================================================ */
export default function ProductCard(props: ProductCardProps) {
  var p = props;
  var isH = !!p.horizontal;

  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);
  var wearMap = useMemo(function () { return getWearMap(C); }, [C]);
  var wc = wearMap[p.wear] || C.border;

  if (isH) {
    return (
      <TouchableOpacity style={_s.hCard} activeOpacity={0.8} onPress={p.onPress}>
        <View style={_s.hThumb}>
          <Text style={_s.hThumbIcon}>🖼️</Text>
        </View>
        <View style={_s.hInfo}>
          <Text style={_s.hName} numberOfLines={1}>{p.name}</Text>
          <View style={_s.hMeta}>
            <View style={[_s.wearTag, { backgroundColor: wc }]}>
              <Text style={_s.wearTxt}>{p.wear}</Text>
            </View>
            <Text style={_s.stockTxt}>在售 {p.stock}</Text>
          </View>
          <Text style={_s.price}>
            <Text style={_s.priceUnit}>¥ </Text>
            {fmtPrice(p.price)}
          </Text>
        </View>
        {p.actionLabel ? (
          <TouchableOpacity style={_s.actionBtn} activeOpacity={0.7} onPress={p.onAction}>
            <Text style={_s.actionTxt}>{p.actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={_s.card} activeOpacity={0.8} onPress={p.onPress}>
      <View style={_s.cardImg}>
        <Text style={_s.cardImgTxt}>🖼️</Text>
      </View>
      <View style={_s.cardBody}>
        <View style={_s.cardRow}>
          <View style={[_s.wearTag, { backgroundColor: wc }]}>
            <Text style={_s.wearTxt}>{p.wear}</Text>
          </View>
          <Text style={_s.stockTxt}>在售 {p.stock}</Text>
        </View>
        <Text style={_s.name} numberOfLines={1}>{p.name}</Text>
        <Text style={_s.price}>
          <Text style={_s.priceUnit}>¥ </Text>
          {fmtPrice(p.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
