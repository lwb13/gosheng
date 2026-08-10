import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme, ColorScheme, F, W, S } from '../../theme';

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
    icon: { fontSize: 48, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: '700', color: C.white, marginBottom: 8 },
    sub: { fontSize: 14, color: C.gray },
  });
}

export default function WantBuyScreen() {
  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);

  return (
    <View style={_s.root}>
      <Text style={_s.icon}>🛒</Text>
      <Text style={_s.title}>求购</Text>
      <Text style={_s.sub}>发布求购需求</Text>
    </View>
  );
}
