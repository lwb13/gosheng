/* ================================================================
 * 库存页 — 展示用户拥有的 CS:GO 饰品
 * 结构: 顶部导航 → 磨损筛选横滚 → FlatList 横向卡片列表
 * ================================================================ */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { C, F, W, R, S, PAGE_PAD, WEAR_MAP } from '../../theme';
import ProductCard from '../../components/ProductCard';

/* ────────── 磨损筛选 ────────── */
var _filters = [
  { key: 'all', label: '全部', color: C.gray2 },
  { key: '崭新出厂', label: '崭新出厂', color: WEAR_MAP['崭新出厂'] },
  { key: '略有磨损', label: '略有磨损', color: WEAR_MAP['略有磨损'] },
  { key: '久经沙场', label: '久经沙场', color: WEAR_MAP['久经沙场'] },
  { key: '破损不堪', label: '破损不堪', color: WEAR_MAP['破损不堪'] },
  { key: '战痕累累', label: '战痕累累', color: WEAR_MAP['战痕累累'] },
];

/* ────────── 静态库存数据 ────────── */
var _inventoryItems = [
  { id: 'i01', name: 'AWP | 龙王', price: 1280.5, wear: '崭新出厂', stock: 1 },
  { id: 'i02', name: 'AK-47 | 火蛇', price: 3560.0, wear: '略有磨损', stock: 1 },
  { id: 'i03', name: 'M4A4 | 咆哮', price: 8999.9, wear: '久经沙场', stock: 1 },
  { id: 'i04', name: 'USP-S | 击杀确认', price: 560.0, wear: '崭新出厂', stock: 2 },
  { id: 'i05', name: '格洛克18型 | 水灵', price: 320.8, wear: '略有磨损', stock: 1 },
  { id: 'i06', name: '沙漠之鹰 | 炽热之焰', price: 890.0, wear: '破损不堪', stock: 1 },
  { id: 'i07', name: 'AWP | 红线', price: 420.5, wear: '战痕累累', stock: 1 },
  { id: 'i08', name: 'M4A1-S | 守护者', price: 680.0, wear: '崭新出厂', stock: 1 },
  { id: 'i09', name: 'P250 | 富兰克林', price: 230.0, wear: '久经沙场', stock: 3 },
  { id: 'i10', name: 'AWP | 二西莫夫', price: 1560.0, wear: '战痕累累', stock: 1 },
];

export default function InventoryScreen() {
  var _s1 = useState('all');
  var activeFilter = _s1[0];
  var setFilter = _s1[1];

  /* 按筛选条件过滤 */
  var filteredItems = activeFilter === 'all'
    ? _inventoryItems
    : _inventoryItems.filter(function (item) { return item.wear === activeFilter; });

  /* FlatList 渲染函数 */
  var renderItem = useCallback(
    function (info: { item: typeof _inventoryItems[0] }) {
      var item = info.item;
      return (
        <ProductCard
          name={item.name}
          price={item.price}
          wear={item.wear}
          stock={item.stock}
          horizontal
          actionLabel="出售"
        />
      );
    },
    [],
  );

  var keyExtractor = useCallback(
    function (item: typeof _inventoryItems[0]) { return item.id; },
    [],
  );

  return (
    <View style={_s.root}>
      {/* ──────── 顶部导航 ──────── */}
      <View style={_s.header}>
        <Text style={_s.headerTitle}>我的库存</Text>
        <View style={_s.headerActions}>
          <TouchableOpacity style={_s.headerBtn} activeOpacity={0.7}>
            <Text style={_s.headerBtnIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={_s.headerBtn} activeOpacity={0.7}>
            <Text style={_s.headerBtnIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ──────── 磨损筛选横滚 ──────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={_s.filterScroll}
      >
        {_filters.map(function (f) {
          var isActive = f.key === activeFilter;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                _s.filterChip,
                isActive && { backgroundColor: f.color },
              ]}
              activeOpacity={0.7}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[_s.filterTxt, isActive && _s.filterTxtOn]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ──────── 列表统计 ──────── */}
      <View style={_s.statsBar}>
        <Text style={_s.statsTxt}>
          共 <Text style={_s.statsNum}>{filteredItems.length}</Text> 件饰品
        </Text>
        <Text style={_s.statsTxt}>
          总价值 <Text style={_s.statsValue}>¥ {filteredItems.reduce(function (s, i) { return s + i.price * i.stock; }, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</Text>
        </Text>
      </View>

      {/* ──────── 列表 ──────── */}
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={_s.listInner}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={_s.empty}>
          <Text style={_s.emptyIcon}>📦</Text>
          <Text style={_s.emptyTitle}>暂无该磨损等级的饰品</Text>
          <Text style={_s.emptySub}>去市场看看有没有心仪的饰品吧</Text>
        </View>
      )}
    </View>
  );
}

/* ────────── 样式 ────────── */
var _s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  /* -- 顶部导航 -- */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: S.sm,
    paddingBottom: S.md,
  },
  headerTitle: {
    fontSize: F.xxxl,
    fontWeight: W.bold,
    color: C.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: S.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: R.full,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnIcon: {
    fontSize: F.lg,
  },

  /* -- 筛选横滚 -- */
  filterScroll: {
    paddingHorizontal: 16,
    paddingBottom: S.md,
    gap: S.sm,
  },
  filterChip: {
    paddingVertical: S.xs,
    paddingHorizontal: S.lg,
    borderRadius: R.full,
    backgroundColor: C.border,
  },
  filterTxt: {
    fontSize: F.md,
    color: C.gray,
    fontWeight: W.medium,
  },
  filterTxtOn: {
    color: C.white,
    fontWeight: W.semibold,
  },

  /* -- 统计条 -- */
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: S.sm,
  },
  statsTxt: {
    fontSize: F.sm,
    color: C.gray,
  },
  statsNum: {
    fontSize: F.sm,
    fontWeight: W.bold,
    color: C.white,
  },
  statsValue: {
    fontSize: F.sm,
    fontWeight: W.bold,
    color: C.gold,
  },

  /* -- 列表 -- */
  listInner: {
    paddingTop: S.xs,
    paddingBottom: S.xxl,
  },

  /* -- 空状态 -- */
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: S.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: F.xl,
    fontWeight: W.semibold,
    color: C.white,
    marginBottom: S.sm,
  },
  emptySub: {
    fontSize: F.base,
    color: C.gray,
  },
});
