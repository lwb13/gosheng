/* ================================================================
 * 出售页 — 发布饰品出售 + 我的在售列表
 * 结构: 顶部标题 → 发布表单卡 → 我的在售列表
 * ================================================================ */

import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import {
  useAppTheme, ColorScheme, getWearMap,
  F, W, R, S, PAGE_PAD,
} from '../../theme';
import ProductCard from '../../components/ProductCard';
import SectionHeader from '../../components/SectionHeader';

/* ────────── 静态数据 ────────── */
type SellItem = { id: string; name: string; price: number; wear: string; stock: number };

var _ownedInit: SellItem[] = [
  { id: 'o1', name: 'AWP | 龙王', price: 1280.5, wear: '崭新出厂', stock: 1 },
  { id: 'o2', name: 'AK-47 | 火蛇', price: 3560.0, wear: '略有磨损', stock: 1 },
  { id: 'o3', name: 'M4A4 | 咆哮', price: 8999.9, wear: '久经沙场', stock: 1 },
  { id: 'o4', name: 'USP-S | 击杀确认', price: 560.0, wear: '崭新出厂', stock: 1 },
  { id: 'o5', name: '格洛克18型 | 水灵', price: 320.8, wear: '略有磨损', stock: 1 },
];

var _sellingInit: SellItem[] = [
  { id: 's1', name: 'AWP | 红线', price: 420.5, wear: '战痕累累', stock: 1 },
  { id: 's2', name: 'P250 | 富兰克林', price: 230.0, wear: '久经沙场', stock: 1 },
];

/* ────────── 样式工厂 ────────── */
function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    scrollInner: { paddingTop: S.lg, paddingBottom: S.xxxl },

    header: { paddingHorizontal: PAGE_PAD, paddingBottom: S.md },
    headerTitle: { fontSize: F.xxxl, fontWeight: W.bold, color: C.white },

    /* 发布表单卡片 */
    formCard: {
      marginHorizontal: PAGE_PAD, padding: S.lg,
      borderRadius: R.xl, backgroundColor: C.card, marginBottom: S.xl,
    },
    formTitle: { fontSize: F.xl, fontWeight: W.bold, color: C.white, marginBottom: S.lg },
    label: { fontSize: F.sm, color: C.gray, marginBottom: S.sm },

    /* 饰品选择横滚 */
    pickerScroll: { marginBottom: S.lg },
    pickerItem: {
      width: 128, marginRight: S.sm, padding: S.sm,
      borderRadius: R.md, backgroundColor: C.cardAlt,
      borderWidth: 1.5, borderColor: 'transparent',
    },
    pickerItemOn: { borderColor: C.accent },
    pickerThumb: {
      width: '100%', aspectRatio: 1, borderRadius: R.sm,
      backgroundColor: C.border, justifyContent: 'center', alignItems: 'center',
      marginBottom: S.sm,
    },
    pickerThumbIcon: { fontSize: 26, opacity: 0.5 },
    pickerName: { fontSize: F.sm, fontWeight: W.medium, color: C.white, marginBottom: S.xs },
    pickerWearRow: { flexDirection: 'row', alignItems: 'center' },
    pickerDot: { width: 8, height: 8, borderRadius: R.full, marginRight: S.xs },
    pickerWear: { fontSize: F.xs, color: C.gray },

    /* 价格输入 */
    priceRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.input, borderRadius: R.lg,
      paddingHorizontal: S.md, height: 48, marginBottom: S.lg,
    },
    priceUnit: { fontSize: F.base, fontWeight: W.bold, color: C.gold, marginRight: S.xs },
    priceInput: { flex: 1, fontSize: F.base, color: C.gold, padding: 0 },

    /* CTA */
    submitBtn: {
      height: 48, borderRadius: R.lg, backgroundColor: C.accent,
      justifyContent: 'center', alignItems: 'center',
    },
    submitTxt: { fontSize: F.base, fontWeight: W.semibold, color: '#FFFFFF' },
    submitDim: { opacity: 0.4 },

    listInner: { paddingTop: S.xs },
  });
}

/* ================================================================
 * 主组件
 * ================================================================ */
export default function SellScreen() {
  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);
  var wearMap = useMemo(function () { return getWearMap(C); }, [C]);

  var _owned = useState<SellItem[]>(_ownedInit);
  var owned = _owned[0];
  var setOwned = _owned[1];

  var _selling = useState<SellItem[]>(_sellingInit);
  var selling = _selling[0];
  var setSelling = _selling[1];

  var _sel = useState('');
  var selectedId = _sel[0];
  var setSelectedId = _sel[1];

  var _price = useState('');
  var priceStr = _price[0];
  var setPrice = _price[1];

  var selected = owned.find(function (it) { return it.id === selectedId; }) || null;

  /* ── 发布出售 ── */
  function handlePublish() {
    var sel = selected;
    if (!sel) { Alert.alert('提示', '请先选择要出售的饰品'); return; }
    var num = parseFloat(priceStr);
    if (!priceStr || isNaN(num) || num <= 0) { Alert.alert('提示', '请输入有效的出售价格'); return; }

    var newItem: SellItem = {
      id: 'sell-' + sel.id + '-' + selling.length,
      name: sel.name,
      price: num,
      wear: sel.wear,
      stock: sel.stock,
    };
    var removeId = sel.id;

    setSelling(function (prev) { return [newItem, ...prev]; });
    setOwned(function (prev) { return prev.filter(function (it) { return it.id !== removeId; }); });
    setSelectedId('');
    setPrice('');
  }

  return (
    <View style={_s.root}>
      <ScrollView
        style={_s.scroll}
        contentContainerStyle={_s.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={_s.header}>
          <Text style={_s.headerTitle}>出售</Text>
        </View>

        {/* ── 发布出售表单 ── */}
        <View style={_s.formCard}>
          <Text style={_s.formTitle}>发布出售</Text>

          <Text style={_s.label}>选择饰品</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={_s.pickerScroll}
          >
            {owned.map(function (it) {
              var isOn = it.id === selectedId;
              return (
                <TouchableOpacity
                  key={it.id}
                  style={[_s.pickerItem, isOn && _s.pickerItemOn]}
                  activeOpacity={0.7}
                  onPress={function () { setSelectedId(it.id); }}
                >
                  <View style={_s.pickerThumb}>
                    <Text style={_s.pickerThumbIcon}>🖼️</Text>
                  </View>
                  <Text style={_s.pickerName} numberOfLines={1}>{it.name}</Text>
                  <View style={_s.pickerWearRow}>
                    <View style={[_s.pickerDot, { backgroundColor: wearMap[it.wear] || C.border }]} />
                    <Text style={_s.pickerWear}>{it.wear}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={_s.label}>出售价格</Text>
          <View style={_s.priceRow}>
            <Text style={_s.priceUnit}>¥</Text>
            <TextInput
              style={_s.priceInput}
              value={priceStr}
              onChangeText={setPrice}
              placeholder="输入价格"
              placeholderTextColor={C.gray2}
              keyboardType="decimal-pad"
            />
          </View>

          <TouchableOpacity
            style={[_s.submitBtn, (!selected || !priceStr) && _s.submitDim]}
            activeOpacity={0.85}
            onPress={handlePublish}
          >
            <Text style={_s.submitTxt}>发布出售</Text>
          </TouchableOpacity>
        </View>

        {/* ── 我的在售 ── */}
        <SectionHeader title={'我的在售 (' + selling.length + ')'} />

        <View style={_s.listInner}>
          {selling.map(function (it) {
            return (
              <ProductCard
                key={it.id}
                name={it.name}
                price={it.price}
                wear={it.wear}
                stock={it.stock}
                horizontal
                actionLabel="下架"
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
