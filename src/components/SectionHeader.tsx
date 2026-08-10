/* ================================================================
 * SectionHeader — 区块标题 + "查看全部" 链接 (双主题)
 * ================================================================ */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme, ColorScheme, F, W, S } from '../theme';

export interface SectionHeaderProps {
  title: string;
  linkText?: string;
  onLinkPress?: () => void;
}

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, marginBottom: S.md,
    },
    title: { fontSize: F.xl, fontWeight: W.bold, color: C.white },
    link: { fontSize: F.md, color: C.gray },
  });
}

export default function SectionHeader(props: SectionHeaderProps) {
  var p = props;
  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);

  return (
    <View style={_s.wrap}>
      <Text style={_s.title}>{p.title}</Text>
      {p.linkText ? (
        <TouchableOpacity activeOpacity={0.6} onPress={p.onLinkPress}>
          <Text style={_s.link}>{p.linkText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
