import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

var _c = { bg: '#0d0d1a', w: '#ffffff', g: '#8e8e9e' };

export default function SellScreen() {
  return React.createElement(View, { style: _s.root },
    React.createElement(Text, { style: _s.icon }, '💰'),
    React.createElement(Text, { style: _s.title }, '出售'),
    React.createElement(Text, { style: _s.sub }, '发布饰品出售信息'),
  );
}

var _s = StyleSheet.create({
  root: { flex: 1, backgroundColor: _c.bg, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: _c.w, marginBottom: 8 },
  sub: { fontSize: 14, color: _c.g },
});
