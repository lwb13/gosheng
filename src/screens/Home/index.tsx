/* ================================================================
 * Go神 商城首页
 * 结构: 分类Tab → 搜索栏 → 2×2功能入口 → 最新上架 → 商品网格
 * ================================================================ */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { C, F, W, R, S, PAGE_PAD, CARD_GAP, GRID_2_COL } from '../../theme';
import SearchBar from '../../components/SearchBar';
import SectionHeader from '../../components/SectionHeader';
import ProductCard from '../../components/ProductCard';

/* ────────── 静态数据 ────────── */
var _tabs = ['买饰品', '租饰品', '竞价'] as const;

var _entries = [
  { id: 'e1', label: '匕首市场', icon: '🔪' },
  { id: 'e2', label: '手套市场', icon: '🧤' },
  { id: 'e3', label: '武库上新', icon: '📦' },
  { id: 'e4', label: '红皮专区', icon: '🔴' },
];

var _products = [
  { id: 'p1', name: 'AWP | 龙王', price: 1280.5, wear: '崭新出厂', stock: 234 },
  { id: 'p2', name: 'AK-47 | 火蛇', price: 3560.0, wear: '略有磨损', stock: 89 },
  { id: 'p3', name: 'M4A4 | 咆哮', price: 8999.9, wear: '久经沙场', stock: 12 },
  { id: 'p4', name: 'USP-S | 击杀确认', price: 560.0, wear: '崭新出厂', stock: 567 },
  { id: 'p5', name: '格洛克18型 | 水灵', price: 320.8, wear: '略有磨损', stock: 341 },
  { id: 'p6', name: '沙漠之鹰 | 炽热之焰', price: 890.0, wear: '破损不堪', stock: 156 },
];

/* ================================================================
 * 主组件
 * ================================================================ */
export default function HomeScreen() {
  var _s1 = useState('买饰品');
  var activeTab = _s1[0];
  var setTab = _s1[1];

  var _s2 = useState('');
  var keyword = _s2[0];
  var setKeyword = _s2[1];

  return (
    <View style={_s.root}>
      <ScrollView
        style={_s.scroll}
        contentContainerStyle={_s.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* ──────── 分类Tab ──────── */}
        <View style={_s.tabs}>
          {_tabs.map(function (tab) {
            var isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={[_s.tab, isActive && _s.tabOn]}
                onPress={() => setTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[_s.tabTxt, isActive && _s.tabTxtOn]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ──────── 搜索框 ──────── */}
        <SearchBar value={keyword} onChangeText={setKeyword} />

        {/* ──────── 2×2 功能入口 ──────── */}
        <View style={_s.entryGrid}>
          {_entries.map(function (e) {
            return (
              <TouchableOpacity key={e.id} style={_s.entryCard} activeOpacity={0.7}>
                <View style={_s.entryIconBox}>
                  <Text style={_s.entryIcon}>{e.icon}</Text>
                </View>
                <Text style={_s.entryLabel}>{e.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ──────── 最新上架 ──────── */}
        <SectionHeader title="最新上架" linkText="查看全部 >" />

        {/* ──────── 商品网格 ──────── */}
        <View style={_s.grid}>
          {_products.map(function (p) {
            return (
              <ProductCard
                key={p.id}
                name={p.name}
                price={p.price}
                wear={p.wear}
                stock={p.stock}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

/* ────────── 样式 ────────── */
var _s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollInner: { paddingTop: S.lg, paddingBottom: S.xxxl },

  /* ── 分类Tab ── */
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: PAGE_PAD,
    gap: CARD_GAP,
    marginBottom: S.md,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: R.full,
    backgroundColor: C.border,
  },
  tabOn: { backgroundColor: C.accent },
  tabTxt: { fontSize: F.md, color: C.gray, fontWeight: W.medium },
  tabTxtOn: { fontSize: F.md, color: C.white, fontWeight: W.semibold },

  /* ── 2×2 功能入口 ── */
  entryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PAGE_PAD,
    gap: CARD_GAP,
    marginBottom: S.xl,
  },
  entryCard: {
    width: GRID_2_COL,
    height: 72,
    borderRadius: R.lg,
    backgroundColor: C.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: S.lg,
  },
  entryIconBox: {
    width: 44,
    height: 44,
    borderRadius: R.xl,
    backgroundColor: C.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: S.md,
  },
  entryIcon: { fontSize: F.icon },
  entryLabel: { fontSize: F.lg, fontWeight: W.semibold, color: C.white },

  /* ── 商品网格 ── */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PAGE_PAD,
    gap: CARD_GAP,
  },
});
