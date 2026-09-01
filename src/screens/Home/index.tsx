/* ================================================================
 * Go神 商城首页
 * 结构: 分类Tab → 搜索栏 → 2×2功能入口 → 最新上架 → 商品网格
 * ================================================================ */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  useAppTheme, ColorScheme,
  F, W, R, S, PAGE_PAD, CARD_GAP, GRID_2_COL,
} from '../../theme';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
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

/* ────────── 磨损 英文→中文 ────────── */
var _wearMap: Record<string, string> = {
  'Factory New': '崭新出厂',
  'Minimal Wear': '略有磨损',
  'Field-Tested': '久经沙场',
  'Well-Worn': '破损不堪',
  'Battle-Scarred': '战痕累累',
};

/* ────────── 后端返回的饰品 ────────── */
interface MarketItem {
  name: string;
  imageUrl: string;
  price: number;
  stock: number;
}

/* 解析市场名：拆出纯名称 + 中文磨损 */
function parseName(rawName: string) {
  var m = rawName.match(/\(([^)]*)\)\s*$/);
  var wearEn = m ? m[1] : '';
  var wear = _wearMap[wearEn] || wearEn;
  var name = m ? rawName.slice(0, m.index).trim() : rawName;
  return { name: name, wear: wear };
}

/* ────────── 样式工厂 ────────── */
function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    root:  { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    scrollInner: { paddingTop: S.lg, paddingBottom: S.xxxl },

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
    tabTxtOn: { fontSize: F.md, color: '#FFFFFF', fontWeight: W.semibold },

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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
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

    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: PAGE_PAD,
      gap: CARD_GAP,
    },
    loadingTxt: { color: C.gray, textAlign: 'center', width: '100%', paddingVertical: 24 },
  });
}

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

  var _s3 = useState<MarketItem[]>([]);
  var items = _s3[0];
  var setItems = _s3[1];

  var _s4 = useState(false);
  var loading = _s4[0];
  var setLoading = _s4[1];

  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);

  /* 从后端拉真实饰品列表 */
  useEffect(function () {
    async function load() {
      setLoading(true);
      try {
        var resp = await axios.get(API_BASE_URL + '/api/market/items?count=50', { timeout: 15000 });
        setItems(resp.data.items || []);
      } catch (e) {
        // 加载失败保持空列表
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <View style={_s.root}>
      <ScrollView
        style={_s.scroll}
        contentContainerStyle={_s.scrollInner}
        showsVerticalScrollIndicator={false}
      >
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

        <SearchBar value={keyword} onChangeText={setKeyword} />

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

        <SectionHeader title="最新上架" linkText="查看全部 >" />

        <View style={_s.grid}>
          {loading ? (
            <Text style={_s.loadingTxt}>加载中...</Text>
          ) : (
            items.map(function (p, idx) {
              var parsed = parseName(p.name);
              return (
                <ProductCard
                  key={p.name + idx}
                  name={parsed.name}
                  price={p.price}
                  wear={parsed.wear}
                  stock={p.stock}
                  imageUrl={p.imageUrl}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
