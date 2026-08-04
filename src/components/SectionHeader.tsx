/* ================================================================
 * SectionHeader — 区块标题 + "查看全部" 链接
 * ================================================================ */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, F, W, S, PAGE_PAD } from '../theme';

export interface SectionHeaderProps {
  title: string;
  linkText?: string;
  onLinkPress?: () => void;
}

export default function SectionHeader(props: SectionHeaderProps) {
  var p = props;
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

var _s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: S.md,
  },
  title: {
    fontSize: F.xl,
    fontWeight: W.bold,
    color: C.white,
  },
  link: {
    fontSize: F.md,
    color: C.gray,
  },
});
