/* ================================================================
 * 求购页 — 发布求购需求 + 我的求购列表
 * 结构: 顶部标题 → 发布表单卡 → 我的求购列表
 * ================================================================ */

import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import {
  useAppTheme, ColorScheme,
  F, W, R, S, PAGE_PAD,
} from '../../theme';
import ProductCard from '../../components/ProductCard';
import SectionHeader from '../../components/SectionHeader';

/* ────────── 静态数据 ────────── */
type WantItem = { id: string; name: string; price: number; wear: string; stock: number };

var _wearOptions = ['崭新出厂', '略有磨损', '久经沙场', '破损不堪', '战痕累累'];

var _wantInit: WantItem[] = [
  { id: 'w1', name: 'AK-47 | 火蛇', price: 3000.0, wear: '略有磨损', stock: 1 },
  { id: 'w2', name: 'AWP | 二西莫夫', price: 1400.0, wear: '久经沙场', stock: 1 },
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

    /* 文本输入 */
    inputRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.input, borderRadius: R.lg,
      paddingHorizontal: S.md, height: 48, marginBottom: S.lg,
    },
    input: { flex: 1, fontSize: F.base, color: C.white, padding: 0 },
    priceUnit: { fontSize: F.base, fontWeight: W.bold, color: C.gold, marginRight: S.xs },
    priceInput: { flex: 1, fontSize: F.base, color: C.gold, padding: 0 },

    /* 磨损选择 */
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.lg },
    chip: {
      paddingVertical: S.xs, paddingHorizontal: S.lg,
      borderRadius: R.full, backgroundColor: C.border,
    },
    chipOn: { backgroundColor: C.accent },
    chipTxt: { fontSize: F.md, color: C.gray, fontWeight: W.medium },
    chipTxtOn: { color: '#FFFFFF', fontWeight: W.semibold },

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
export default function WantBuyScreen() {
  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);

  var _name = useState('');
  var name = _name[0];
  var setName = _name[1];

  var _price = useState('');
  var priceStr = _price[0];
  var setPrice = _price[1];

  var _wear = useState('崭新出厂');
  var wear = _wear[0];
  var setWear = _wear[1];

  var _want = useState<WantItem[]>(_wantInit);
  var want = _want[0];
  var setWant = _want[1];

  /* ── 发布求购 ── */
  function handlePublish() {
    if (!name.trim()) { Alert.alert('提示', '请输入饰品名称'); return; }
    var num = parseFloat(priceStr);
    if (!priceStr || isNaN(num) || num <= 0) { Alert.alert('提示', '请输入有效的求购价格'); return; }

    var newItem: WantItem = {
      id: 'want-' + Date.now(),
      name: name.trim(),
      price: num,
      wear: wear,
      stock: 1,
    };

    setWant(function (prev) { return [newItem, ...prev]; });
    setName('');
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
          <Text style={_s.headerTitle}>求购</Text>
        </View>

        {/* ── 发布求购表单 ── */}
        <View style={_s.formCard}>
          <Text style={_s.formTitle}>发布求购</Text>

          <Text style={_s.label}>饰品名称</Text>
          <View style={_s.inputRow}>
            <TextInput
              style={_s.input}
              value={name}
              onChangeText={setName}
              placeholder="输入饰品名称，如 AK-47 | 火蛇"
              placeholderTextColor={C.gray2}
            />
          </View>

          <Text style={_s.label}>求购价格</Text>
          <View style={_s.inputRow}>
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

          <Text style={_s.label}>期望磨损</Text>
          <View style={_s.chipRow}>
            {_wearOptions.map(function (w) {
              var isOn = w === wear;
              return (
                <TouchableOpacity
                  key={w}
                  style={[_s.chip, isOn && _s.chipOn]}
                  activeOpacity={0.7}
                  onPress={function () { setWear(w); }}
                >
                  <Text style={[_s.chipTxt, isOn && _s.chipTxtOn]}>{w}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[_s.submitBtn, (!name.trim() || !priceStr) && _s.submitDim]}
            activeOpacity={0.85}
            onPress={handlePublish}
          >
            <Text style={_s.submitTxt}>发布求购</Text>
          </TouchableOpacity>
        </View>

        {/* ── 我的求购 ── */}
        <SectionHeader title={'我的求购 (' + want.length + ')'} />

        <View style={_s.listInner}>
          {want.map(function (it) {
            return (
              <ProductCard
                key={it.id}
                name={it.name}
                price={it.price}
                wear={it.wear}
                stock={it.stock}
                horizontal
                actionLabel="撤销"
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
