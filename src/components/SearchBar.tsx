/* ================================================================
 * SearchBar — 通用搜索栏
 * ================================================================ */

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { C, F, R, S } from '../theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar(props: SearchBarProps) {
  var p = props;
  return (
    <View style={_s.wrap}>
      <Text style={_s.icon}>🔍</Text>
      <TextInput
        style={_s.input}
        placeholder={p.placeholder || '搜索 CS:GO 饰品...'}
        placeholderTextColor={C.gray2}
        value={p.value}
        onChangeText={p.onChangeText}
        returnKeyType="search"
      />
    </View>
  );
}

var _s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: S.lg,
    marginBottom: S.md,
    paddingHorizontal: S.md,
    height: 40,
    borderRadius: R.lg,
    backgroundColor: C.input,
  },
  icon: {
    fontSize: F.base,
    marginRight: S.sm,
  },
  input: {
    flex: 1,
    fontSize: F.base,
    color: C.white,
    padding: 0,
  },
});
