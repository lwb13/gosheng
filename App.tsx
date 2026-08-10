/* ================================================================
 * Go神 CS饰品商城 — 唯一入口 App.tsx
 * 兼容旧版 Hermes：零 ES 私有字段，零不可转译语法
 * ================================================================ */

import 'react-native-gesture-handler';

import { enableScreens } from 'react-native-screens';
enableScreens(true);

import React, { useMemo, useState } from 'react';
import { Text } from 'react-native';
import { registerRootComponent } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen      from './src/screens/Home';
import InventoryScreen from './src/screens/Inventory';
import SellScreen      from './src/screens/Sell';
import WantBuyScreen   from './src/screens/WantBuy';
import MineScreen      from './src/screens/Mine';
import AnimatedSplash  from './src/splash/AnimatedSplash';
import { ThemeProvider, useAppTheme } from './src/theme';
import { SteamProvider } from './src/store/SteamContext';

/* ────────── 类型 ────────── */
type TabParamList = {
  Home:      undefined;
  Inventory: undefined;
  Sell:      undefined;
  WantBuy:   undefined;
  Mine:      undefined;
};

var Tab = createBottomTabNavigator<TabParamList>();

var _tabCfg: Record<keyof TabParamList, { label: string; icon: string }> = {
  Home:      { label: 'Go神', icon: '🏠' },
  Inventory: { label: '库存', icon: '🎒' },
  Sell:      { label: '出售', icon: '💰' },
  WantBuy:   { label: '求购', icon: '🛒' },
  Mine:      { label: '我的', icon: '👤' },
};

/* ────────── App 内容 (必须在 ThemeProvider 内部使用 hook) ────────── */
function AppContent() {
  var _sd           = useState(false);
  var splashDone    = _sd[0];
  var setSplashDone = _sd[1];

  var { C } = useAppTheme();

  var screenOpts = useMemo(function () {
    return function (props: { route: { name: string } }) {
      var name = props.route.name as keyof TabParamList;
      var cfg  = _tabCfg[name] || _tabCfg.Home;

      return {
        headerShown: false,
        tabBarIcon: function (p: { focused: boolean }) {
          return (
            <Text style={{ fontSize: p.focused ? 22 : 20, opacity: p.focused ? 1 : 0.5 }}>
              {cfg.icon}
            </Text>
          );
        },
        tabBarLabel:            cfg.label,
        tabBarActiveTintColor:   C.accent,
        tabBarInactiveTintColor: C.gray2,
        tabBarStyle: {
          backgroundColor: C.bgSecondary,
          borderTopColor:   C.border,
          borderTopWidth:    1,
          height:            56,
          paddingBottom:     6,
          paddingTop:        4,
        },
        tabBarLabelStyle: {
          fontSize:   11,
          fontWeight: '600' as const,
        },
      };
    };
  }, [C]);

  if (!splashDone) {
    return <AnimatedSplash onFinish={function () { setSplashDone(true); }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={screenOpts}>
          <Tab.Screen name="Home"      component={HomeScreen} />
          <Tab.Screen name="Inventory" component={InventoryScreen} />
          <Tab.Screen name="Sell"      component={SellScreen} />
          <Tab.Screen name="WantBuy"   component={WantBuyScreen} />
          <Tab.Screen name="Mine"      component={MineScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

/* ────────── App 根组件 ────────── */
export default function App() {
  return (
    <ThemeProvider>
      <SteamProvider>
        <AppContent />
      </SteamProvider>
    </ThemeProvider>
  );
}

registerRootComponent(App);
