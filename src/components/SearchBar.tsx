/* ================================================================
 * SearchBar — 通用搜索栏 (双主题)
 * ================================================================ */

import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useAppTheme, ColorScheme, F, R, S } from '../theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row', alignItems: 'center',
      marginHorizontal: S.lg, marginBottom: S.md,
      paddingHorizontal: S.md, height: 40,
      borderRadius: R.lg, backgroundColor: C.input,
    },
    icon: { fontSize: F.base, marginRight: S.sm },
    input: { flex: 1, fontSize: F.base, color: C.white, padding: 0 },
  });
}

export default function SearchBar(props: SearchBarProps) {
  var p = props;
  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);

  return (
    <View style={_s.wrap}>
      <Text style={_s.icon}>🔍</Text>
      <TextInput
        style={_s.input}
        placeholder={p.placeholder || '搜索饰品'}
        placeholderTextColor={C.gray2}
        value={p.value}
        onChangeText={p.onChangeText}
        returnKeyType="search"
      />
    </View>
  );
}
