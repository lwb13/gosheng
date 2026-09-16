/* ================================================================
 * 看盘页 — 分析中心（性价比榜 / 横盘预警 / 捡漏雷达 / 流动性 / 鲸鱼动向）
 * 结构: 顶部标题 → 分段切换 → 对应排名列表（复用 ProductCard 横版 + 名次角标 + 指标标签）
 * ================================================================ */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import {
  useAppTheme, ColorScheme, F, W, R, S, PAGE_PAD,
} from '../../theme';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import ProductCard from '../../components/ProductCard';

/* ────────── 磨损 英文→中文 ────────── */
var _wearMap: Record<string, string> = {
  'Factory New': '崭新出厂',
  'Minimal Wear': '略有磨损',
  'Field-Tested': '久经沙场',
  'Well-Worn': '破损不堪',
  'Battle-Scarred': '战痕累累',
};

/* ────────── 统一的分析项类型（各接口返回字段略有差异，按需填充） ────────── */
interface AnalysisItem {
  name: string;
  imageUrl: string;
  price: number;
  stock: number;
  score?: number;          // 性价比指数（在售量÷价格）
  signal?: string;         // 横盘/变盘信号
  volatilityPct?: number;  // 波动率（%）
  discountPct?: number;    // 捡漏：低于近期均价的比例（%）
  liquidity?: number;      // 流动性 0-100
  liquidityLevel?: string; // 高/中/低
  whaleSignal?: string;    // 鲸鱼动向：大额挂单墙信号
}

var _segments = ['性价比榜', '横盘预警', '捡漏雷达', '流动性', '鲸鱼动向'] as const;

function parseName(rawName: string) {
  var m = rawName.match(/\(([^)]*)\)\s*$/);
  var wearEn = m ? m[1] : '';
  var wear = _wearMap[wearEn] || wearEn;
  var name = m ? rawName.slice(0, m.index).trim() : rawName;
  return { name: name, wear: wear };
}

function subtitleFor(segment: string): string {
  if (segment === '性价比榜') return '在售量 ÷ 价格，越大越划算（价低量大）· 价格暂为 Steam 美元';
  if (segment === '横盘预警') return '近 30 天波动率 <5% 视为横盘，放量突破上下轨时发出变盘信号';
  if (segment === '捡漏雷达') return '当前价低于近 30 天均价 10% 以上，提示低估机会';
  if (segment === '流动性') return '综合在售量与日成交量的 0-100 分，越高越好卖';
  return '监控高价值饰品的挂单墙，单档挂单量骤增视为大资金进出（每 ~90 秒刷新）';
}

/* 按分段给每个饰品生成指标标签 */
function tagFor(segment: string, it: AnalysisItem, C: ColorScheme): { text: string; color: string } | null {
  if (segment === '性价比榜') {
    return it.score != null ? { text: '指数 ' + it.score, color: C.gold } : null;
  }
  if (segment === '横盘预警') {
    if (it.signal === '突破上轨' || it.signal === '跌破下轨') {
      return { text: it.signal + ' ⚠', color: C.danger };
    }
    if (it.signal === '横盘中') {
      return { text: '横盘 · 波动 ' + it.volatilityPct + '%', color: C.warning };
    }
    return null;
  }
  if (segment === '捡漏雷达') {
    return it.discountPct != null ? { text: '低估 ' + it.discountPct + '%', color: C.success } : null;
  }
  if (segment === '流动性') {
    if (it.liquidity == null) return null;
    var color = it.liquidityLevel === '高' ? C.success : (it.liquidityLevel === '中' ? C.warning : C.gray2);
    return { text: '流动性 ' + it.liquidity + ' · ' + it.liquidityLevel, color: color };
  }
  if (segment === '鲸鱼动向') {
    if (!it.whaleSignal) return null;
    var isSell = it.whaleSignal.indexOf('卖墙') !== -1;
    return { text: it.whaleSignal, color: isSell ? C.danger : C.success };
  }
  return null;
}

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    scrollInner: { paddingTop: S.lg, paddingBottom: S.xxxl },

    header: { paddingHorizontal: PAGE_PAD, paddingBottom: S.md },
    headerTitle: { fontSize: F.xxxl, fontWeight: W.bold, color: C.white, marginBottom: S.xs },
    headerSub: { fontSize: F.sm, color: C.gray, lineHeight: 1.5 },

    segRow: {
      flexDirection: 'row', flexWrap: 'wrap', gap: S.sm,
      paddingHorizontal: PAGE_PAD, marginBottom: S.md,
    },
    seg: {
      paddingVertical: 5, paddingHorizontal: S.md,
      borderRadius: R.full, backgroundColor: C.border,
    },
    segOn: { backgroundColor: C.accent },
    segTxt: { fontSize: F.md, color: C.gray, fontWeight: W.medium },
    segTxtOn: { color: '#FFFFFF', fontWeight: W.semibold },

    loadingTxt: { color: C.gray, textAlign: 'center', paddingVertical: 24 },
    emptyTxt: { color: C.gray2, textAlign: 'center', paddingVertical: 24, paddingHorizontal: PAGE_PAD },
    updatedTxt: { fontSize: F.xs, color: C.gray2, textAlign: 'center', paddingBottom: S.md },
  });
}

export default function RankScreen() {
  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);

  var _seg = useState('性价比榜');
  var segment = _seg[0];
  var setSegment = _seg[1];

  var _rank = useState<AnalysisItem[]>([]);
  var rank = _rank[0]; var setRank = _rank[1];

  var _side = useState<AnalysisItem[]>([]);
  var side = _side[0]; var setSide = _side[1];

  var _under = useState<AnalysisItem[]>([]);
  var under = _under[0]; var setUnder = _under[1];

  var _liq = useState<AnalysisItem[]>([]);
  var liq = _liq[0]; var setLiq = _liq[1];

  var _whale = useState<AnalysisItem[]>([]);
  var whale = _whale[0]; var setWhale = _whale[1];

  var _loading = useState(false);
  var loading = _loading[0]; var setLoading = _loading[1];

  var _refreshing = useState(false);
  var refreshing = _refreshing[0]; var setRefreshing = _refreshing[1];

  var _updatedAt = useState(0);
  var updatedAt = _updatedAt[0]; var setUpdatedAt = _updatedAt[1];

  function load() {
    setLoading(true);
    Promise.all([
      axios.get(API_BASE_URL + '/api/market/rank?count=30', { timeout: 20000 }),
      axios.get(API_BASE_URL + '/api/analysis/sideways', { timeout: 20000 }),
      axios.get(API_BASE_URL + '/api/analysis/undervalue', { timeout: 20000 }),
      axios.get(API_BASE_URL + '/api/analysis/liquidity', { timeout: 20000 }),
      axios.get(API_BASE_URL + '/api/analysis/whales', { timeout: 20000 }),
    ]).then(function (rs) {
      setRank(rs[0].data.items || []);
      setSide(rs[1].data.items || []);
      setUnder(rs[2].data.items || []);
      setLiq(rs[3].data.items || []);
      setWhale(rs[4].data.items || []);
      var t = rs[1].data.updatedAt || rs[2].data.updatedAt || rs[3].data.updatedAt || rs[4].data.updatedAt || 0;
      setUpdatedAt(t);
    }).catch(function () {
      /* 加载失败保留旧列表 */
    }).then(function () {
      setLoading(false);
      setRefreshing(false);
    });
  }

  useEffect(function () { load(); }, []);

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  var currentItems: AnalysisItem[] =
    segment === '性价比榜' ? rank :
    segment === '横盘预警' ? side :
    segment === '捡漏雷达' ? under :
    segment === '流动性' ? liq : whale;

  var updatedLabel = '';
  if (updatedAt) {
    var d = new Date(updatedAt);
    var hh = ('0' + d.getHours()).slice(-2);
    var mm = ('0' + d.getMinutes()).slice(-2);
    updatedLabel = '数据更新于 ' + hh + ':' + mm;
  }

  return (
    <View style={_s.root}>
      <ScrollView
        style={_s.scroll}
        contentContainerStyle={_s.scrollInner}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gray} />
        }
      >
        <View style={_s.header}>
          <Text style={_s.headerTitle}>看盘</Text>
          <Text style={_s.headerSub}>{subtitleFor(segment)}</Text>
        </View>

        <View style={_s.segRow}>
          {_segments.map(function (s) {
            var isOn = s === segment;
            return (
              <TouchableOpacity
                key={s}
                style={[_s.seg, isOn && _s.segOn]}
                activeOpacity={0.7}
                onPress={function () { setSegment(s); }}
              >
                <Text style={[_s.segTxt, isOn && _s.segTxtOn]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {updatedLabel ? <Text style={_s.updatedTxt}>{updatedLabel}</Text> : null}

        {loading && currentItems.length === 0 ? (
          <Text style={_s.loadingTxt}>加载中...</Text>
        ) : currentItems.length === 0 ? (
          <Text style={_s.emptyTxt}>
            {segment === '性价比榜'
              ? '暂无数据，下拉刷新重试'
              : '暂无命中项（后端首次扫描需约 1-2 分钟），下拉刷新重试'}
          </Text>
        ) : (
          currentItems.map(function (it, idx) {
            var parsed = parseName(it.name);
            var tag = tagFor(segment, it, C);
            return (
              <ProductCard
                key={it.name + idx}
                name={parsed.name}
                price={it.price}
                wear={parsed.wear}
                stock={it.stock}
                imageUrl={it.imageUrl}
                horizontal
                rank={idx + 1}
                tagText={tag ? tag.text : undefined}
                tagColor={tag ? tag.color : undefined}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
