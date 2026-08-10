/* ================================================================
 * 个人中心 — 用户信息 + Steam绑定 + 功能菜单 + 主题切换
 * ================================================================ */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  useAppTheme, ColorScheme,
  F, W, R, S, fmtPrice,
} from '../../theme';
import { useSteam, SteamUser } from '../../store/SteamContext';
import SteamAuth from '../SteamAuth';

/* ────────── 类型 ────────── */
interface MenuItemData { id: string; icon: string; label: string; badge?: number; onPress?: () => void; }
interface MenuGroupData { title: string; items: MenuItemData[]; }

/* ================================================================
 * 子组件 — 菜单项
 * ================================================================ */
function MenuItem(props: MenuItemData & { borderColor: string; textColor: string; gray2: string }) {
  var p = props;
  return (
    <TouchableOpacity style={_mn.menuItem} activeOpacity={0.6} onPress={p.onPress}>
      <Text style={_mn.menuIcon}>{p.icon}</Text>
      <Text style={[_mn.menuLabel, { color: p.textColor }]}>{p.label}</Text>
      <View style={_mn.menuRight}>
        {p.badge ? (
          <View style={_mn.badge}>
            <Text style={_mn.badgeTxt}>{p.badge}</Text>
          </View>
        ) : null}
        <Text style={[_mn.menuArrow, { color: p.gray2 }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

var _mn = StyleSheet.create({
  menuItem: { flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 16 },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#F44336', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeTxt: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  menuArrow: { fontSize: 20, lineHeight: 20 },
});

/* ================================================================
 * 样式工厂
 * ================================================================ */
function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    scrollInner: { paddingBottom: S.xxxl },

    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingTop: S.sm, paddingBottom: S.lg,
    },
    headerTitle: { fontSize: F.xxxl, fontWeight: W.bold, color: C.white },
    settingsBtn: {
      width: 36, height: 36, borderRadius: R.full,
      backgroundColor: C.card, justifyContent: 'center', alignItems: 'center',
    },
    settingsIcon: { fontSize: F.xl },

    /* Steam 绑定卡片 (已绑定状态) */
    steamCard: {
      marginHorizontal: 16, marginBottom: S.lg,
      padding: S.lg, borderRadius: R.xl,
      backgroundColor: '#1A1E3A',
      borderWidth: 1, borderColor: '#2A5AB8',
    },
    steamCardTop: {
      flexDirection: 'row', alignItems: 'center', marginBottom: S.md,
    },
    steamAvatar: {
      width: 48, height: 48, borderRadius: R.full,
      backgroundColor: '#1A3A6E', justifyContent: 'center', alignItems: 'center',
      marginRight: S.md,
    },
    steamAvatarTxt: { fontSize: 24 },
    steamInfo: { flex: 1 },
    steamName: { fontSize: F.lg, fontWeight: W.bold, color: '#FFFFFF', marginBottom: 2 },
    steamIdTxt: { fontSize: F.xs, color: '#8EAFE8' },
    steamStatus: {
      paddingHorizontal: S.sm, paddingVertical: 2,
      borderRadius: R.xs, backgroundColor: '#1A4A1A',
      alignSelf: 'flex-start', marginTop: S.xs,
    },
    steamStatusTxt: { fontSize: F.xs, color: '#6BCB6B', fontWeight: W.semibold },
    steamCardBottom: {
      flexDirection: 'row', gap: S.sm,
      paddingTop: S.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    },
    steamStat: { flex: 1, alignItems: 'center' },
    steamStatVal: { fontSize: F.xl, fontWeight: W.bold, color: C.gold, marginBottom: 2 },
    steamStatLabel: { fontSize: F.xs, color: C.gray },
    steamUnbind: {
      paddingVertical: S.xs, paddingHorizontal: S.md,
      borderRadius: R.sm, backgroundColor: 'rgba(255,255,255,0.08)',
    },
    steamUnbindTxt: { fontSize: F.xs, color: C.gray },

    /* 资产卡片 */
    card: {
      marginHorizontal: 16, padding: S.lg,
      borderRadius: R.xl, backgroundColor: C.card, marginBottom: S.lg,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: S.md },
    avatarWrap: { marginRight: S.md },
    avatar: {
      width: 60, height: 60, borderRadius: 30,
      backgroundColor: C.cardAlt, justifyContent: 'center', alignItems: 'center',
      borderWidth: 2, borderColor: C.accent,
    },
    avatarTxt: { fontSize: 30 },
    userInfo: { flex: 1 },
    username: { fontSize: F.xxl, fontWeight: W.bold, color: C.white, marginBottom: S.xs },
    uid: { fontSize: F.sm, color: C.gray },
    editBtn: {
      paddingHorizontal: S.md, paddingVertical: S.xs,
      borderRadius: R.sm, backgroundColor: C.border,
    },
    editTxt: { fontSize: F.sm, color: C.gray },
    divider: { height: 1, backgroundColor: C.border, marginBottom: S.lg },
    statsRow: { flexDirection: 'row' },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: F.xxl, fontWeight: W.bold, color: C.gold, marginBottom: S.xs },
    statLabel: { fontSize: F.sm, color: C.gray },

    /* 快捷操作 */
    quickRow: {
      flexDirection: 'row', marginHorizontal: 16, marginBottom: S.xl, gap: S.sm,
    },
    quickItem: {
      flex: 1, alignItems: 'center', paddingVertical: S.md,
      borderRadius: R.lg, backgroundColor: C.card,
    },
    quickIconBox: {
      width: 40, height: 40, borderRadius: R.full,
      backgroundColor: C.cardAlt, justifyContent: 'center', alignItems: 'center',
      marginBottom: S.sm,
    },
    quickIcon: { fontSize: F.xxl },
    quickLabel: { fontSize: F.sm, color: C.white },

    /* 主题切换 */
    themeRow: {
      flexDirection: 'row', alignItems: 'center',
      marginHorizontal: 16, marginBottom: S.xl,
      paddingHorizontal: S.lg, height: 52,
      borderRadius: R.xl, backgroundColor: C.card,
    },
    themeIcon: { fontSize: F.xl, marginRight: S.md },
    themeLabel: { flex: 1, fontSize: F.base, fontWeight: W.medium, color: C.white },
    themeHint: { fontSize: F.xs, color: C.gray, marginRight: S.sm },

    /* 菜单组 */
    menuGroup: { marginBottom: S.xl },
    menuGroupTitle: {
      fontSize: F.sm, fontWeight: W.semibold, color: C.gray2,
      paddingHorizontal: 20, marginBottom: S.sm, textTransform: 'uppercase',
    },
    menuBox: {
      marginHorizontal: 16, borderRadius: R.xl,
      backgroundColor: C.card, overflow: 'hidden',
    },
    menuDivider: { height: 1, backgroundColor: C.border, marginLeft: 52 },

    /* 退出 */
    logoutBtn: {
      marginHorizontal: 16, height: 48, borderRadius: R.xl,
      backgroundColor: C.card, justifyContent: 'center', alignItems: 'center',
      marginTop: S.sm,
    },
    logoutTxt: { fontSize: F.base, fontWeight: W.semibold, color: C.danger },
    bottomSafe: { height: S.xxxl },
  });
}

/* ================================================================
 * 快捷操作
 * ================================================================ */
var _quickActions = [
  { id: 'qa1', icon: '💰', label: '充值' },
  { id: 'qa2', icon: '💳', label: '提现' },
  { id: 'qa3', icon: '🎫', label: '卡券' },
  { id: 'qa4', icon: '👥', label: '邀请' },
];

/* ================================================================
 * 主组件
 * ================================================================ */
export default function MineScreen() {
  var { C, isDark, toggleTheme } = useAppTheme();
  var { user, isBound, bindAccount, unbindAccount } = useSteam();
  var _s = useMemo(function () { return createStyles(C); }, [C]);

  var _s1 = useState(false);
  var showSteamAuth = _s1[0];
  var setShowSteamAuth = _s1[1];

  /* ── 绑定成功回调 ── */
  var handleBindSuccess = useCallback(function (u: SteamUser) {
    bindAccount(u);
  }, [bindAccount]);

  /* ── 解绑确认 ── */
  var handleUnbind = useCallback(function () {
    Alert.alert(
      '解除 Steam 绑定',
      '解绑后将无法同步库存与发起交易，确定继续？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定解绑', style: 'destructive', onPress: function () { unbindAccount(); } },
      ],
    );
  }, [unbindAccount]);

  /* ── 菜单数据 (含回调) ── */
  var menuGroups = useMemo(function () {
    return [
      {
        title: '交易管理',
        items: [
          { id: 'orders', icon: '📋', label: '我的订单' },
          { id: 'messages', icon: '💬', label: '消息中心', badge: 3 },
          { id: 'favs', icon: '❤️', label: '我的收藏' },
          { id: 'coupons', icon: '🏷️', label: '优惠券' },
          { id: 'history', icon: '📊', label: '交易记录' },
        ],
      },
      {
        title: '设置',
        items: [
          {
            id: 'steam', icon: '🎮',
            label: isBound ? 'Steam 账号 (' + (user?.personaname || '') + ')' : '绑定 Steam',
            onPress: isBound ? undefined : function () { setShowSteamAuth(true); },
          },
          { id: 'security', icon: '🔐', label: '安全中心' },
          { id: 'language', icon: '🌐', label: '语言 / Language' },
          { id: 'about', icon: 'ℹ️', label: '关于 Go神' },
        ],
      },
    ];
  }, [isBound, user]);

  return (
    <View style={_s.root}>
      <ScrollView
        style={_s.scroll}
        contentContainerStyle={_s.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 顶部 ── */}
        <View style={_s.header}>
          <Text style={_s.headerTitle}>我的</Text>
          <TouchableOpacity style={_s.settingsBtn} activeOpacity={0.7}>
            <Text style={_s.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Steam 绑定卡片 ── */}
        {isBound && user ? (
          <View style={_s.steamCard}>
            <View style={_s.steamCardTop}>
              <View style={_s.steamAvatar}>
                <Text style={_s.steamAvatarTxt}>🎮</Text>
              </View>
              <View style={_s.steamInfo}>
                <Text style={_s.steamName}>{user.personaname}</Text>
                <Text style={_s.steamIdTxt}>Steam ID: {user.steamId}</Text>
                <View style={_s.steamStatus}>
                  <Text style={_s.steamStatusTxt}>✓ 已绑定</Text>
                </View>
              </View>
              <TouchableOpacity style={_s.steamUnbind} onPress={handleUnbind} activeOpacity={0.7}>
                <Text style={_s.steamUnbindTxt}>解绑</Text>
              </TouchableOpacity>
            </View>
            <View style={_s.steamCardBottom}>
              <View style={_s.steamStat}>
                <Text style={_s.steamStatVal}>{user.inventoryCount}</Text>
                <Text style={_s.steamStatLabel}>库存饰品</Text>
              </View>
              <View style={_s.steamStat}>
                <Text style={_s.steamStatVal}>¥ {fmtPrice(user.inventoryCount * 350)}</Text>
                <Text style={_s.steamStatLabel}>估值</Text>
              </View>
              <View style={_s.steamStat}>
                <Text style={_s.steamStatVal}>3</Text>
                <Text style={_s.steamStatLabel}>报价中</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── 资产卡片 ── */}
        <View style={_s.card}>
          <View style={_s.cardTop}>
            <View style={_s.avatarWrap}>
              <View style={_s.avatar}>
                <Text style={_s.avatarTxt}>👤</Text>
              </View>
            </View>
            <View style={_s.userInfo}>
              <Text style={_s.username}>玩家_Go神001</Text>
              <Text style={_s.uid}>UID: 73000001</Text>
            </View>
            <TouchableOpacity style={_s.editBtn} activeOpacity={0.7}>
              <Text style={_s.editTxt}>编辑资料</Text>
            </TouchableOpacity>
          </View>
          <View style={_s.divider} />
          <View style={_s.statsRow}>
            <View style={_s.statItem}>
              <Text style={_s.statValue}>¥ {fmtPrice(12580.00)}</Text>
              <Text style={_s.statLabel}>余额</Text>
            </View>
            <View style={_s.statItem}>
              <Text style={_s.statValue}>3</Text>
              <Text style={_s.statLabel}>在售</Text>
            </View>
            <View style={_s.statItem}>
              <Text style={_s.statValue}>1</Text>
              <Text style={_s.statLabel}>求购</Text>
            </View>
          </View>
        </View>

        {/* ── 快捷操作 ── */}
        <View style={_s.quickRow}>
          {_quickActions.map(function (qa) {
            return (
              <TouchableOpacity key={qa.id} style={_s.quickItem} activeOpacity={0.7}>
                <View style={_s.quickIconBox}>
                  <Text style={_s.quickIcon}>{qa.icon}</Text>
                </View>
                <Text style={_s.quickLabel}>{qa.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 主题切换 ── */}
        <View style={_s.themeRow}>
          <Text style={_s.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
          <Text style={_s.themeLabel}>{isDark ? '暗黑模式' : '白天模式'}</Text>
          <Text style={_s.themeHint}>{isDark ? '关' : '开'}</Text>
          <Switch
            value={!isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: C.accent, true: C.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* ── 菜单分组 ── */}
        {menuGroups.map(function (group) {
          return (
            <View key={group.title} style={_s.menuGroup}>
              <Text style={_s.menuGroupTitle}>{group.title}</Text>
              <View style={_s.menuBox}>
                {group.items.map(function (item, idx) {
                  var isLast = idx === group.items.length - 1;
                  return (
                    <View key={item.id}>
                      <MenuItem
                        {...item}
                        borderColor={C.border}
                        textColor={C.white}
                        gray2={C.gray2}
                      />
                      {!isLast ? <View style={_s.menuDivider} /> : null}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* ── 退出登录 ── */}
        <TouchableOpacity style={_s.logoutBtn} activeOpacity={0.7}>
          <Text style={_s.logoutTxt}>退出登录</Text>
        </TouchableOpacity>

        <View style={_s.bottomSafe} />
      </ScrollView>

      {/* ── Steam 授权弹窗 ── */}
      <SteamAuth
        visible={showSteamAuth}
        onClose={function () { setShowSteamAuth(false); }}
        onBindSuccess={handleBindSuccess}
      />
    </View>
  );
}
