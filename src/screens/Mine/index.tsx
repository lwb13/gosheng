/* ================================================================
 * 个人中心 — 用户信息 + 功能菜单 + 退出登录
 * 结构: 资产卡片 → 快捷操作 → 菜单分组 → 退出按钮
 * ================================================================ */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { C, F, W, R, S, PAGE_PAD, fmtPrice } from '../../theme';

/* ────────── 类型 ────────── */
interface MenuItemData {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}

interface MenuGroupData {
  title: string;
  items: MenuItemData[];
}

/* ────────── 静态菜单数据 ────────── */
var _menuGroups: MenuGroupData[] = [
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
      { id: 'steam', icon: '🎮', label: '绑定 Steam' },
      { id: 'security', icon: '🔐', label: '安全中心' },
      { id: 'language', icon: '🌐', label: '语言 / Language' },
      { id: 'about', icon: 'ℹ️', label: '关于 Go神' },
    ],
  },
];

/* ────────── 快捷操作 ────────── */
var _quickActions = [
  { id: 'qa1', icon: '💰', label: '充值' },
  { id: 'qa2', icon: '💳', label: '提现' },
  { id: 'qa3', icon: '🎫', label: '卡券' },
  { id: 'qa4', icon: '👥', label: '邀请' },
];

/* ================================================================
 * 子组件 — 菜单项
 * ================================================================ */
function MenuItem(props: MenuItemData) {
  var p = props;
  return (
    <TouchableOpacity style={_s.menuItem} activeOpacity={0.6}>
      <Text style={_s.menuIcon}>{p.icon}</Text>
      <Text style={_s.menuLabel}>{p.label}</Text>
      <View style={_s.menuRight}>
        {p.badge ? (
          <View style={_s.badge}>
            <Text style={_s.badgeTxt}>{p.badge}</Text>
          </View>
        ) : null}
        <Text style={_s.menuArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ================================================================
 * 主组件
 * ================================================================ */
export default function MineScreen() {
  return (
    <View style={_s.root}>
      <ScrollView
        style={_s.scroll}
        contentContainerStyle={_s.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* ──────── 顶部设置 ──────── */}
        <View style={_s.header}>
          <Text style={_s.headerTitle}>我的</Text>
          <TouchableOpacity style={_s.settingsBtn} activeOpacity={0.7}>
            <Text style={_s.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ──────── 用户资产卡片 ──────── */}
        <View style={_s.card}>
          {/* 头像 + 信息 */}
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

          {/* 分割线 */}
          <View style={_s.divider} />

          {/* 资产统计 */}
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

        {/* ──────── 快捷操作 ──────── */}
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

        {/* ──────── 菜单分组 ──────── */}
        {_menuGroups.map(function (group) {
          return (
            <View key={group.title} style={_s.menuGroup}>
              <Text style={_s.menuGroupTitle}>{group.title}</Text>
              <View style={_s.menuBox}>
                {group.items.map(function (item, idx) {
                  var isLast = idx === group.items.length - 1;
                  return (
                    <View key={item.id}>
                      <MenuItem {...item} />
                      {!isLast ? <View style={_s.menuDivider} /> : null}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* ──────── 退出登录 ──────── */}
        <TouchableOpacity style={_s.logoutBtn} activeOpacity={0.7}>
          <Text style={_s.logoutTxt}>退出登录</Text>
        </TouchableOpacity>

        {/* 底部安全区 */}
        <View style={_s.bottomSafe} />
      </ScrollView>
    </View>
  );
}

/* ────────── 样式 ────────── */
var _s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollInner: { paddingBottom: S.xxxl },

  /* -- 顶部 -- */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: S.sm,
    paddingBottom: S.lg,
  },
  headerTitle: {
    fontSize: F.xxxl,
    fontWeight: W.bold,
    color: C.white,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: R.full,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: F.xl,
  },

  /* -- 资产卡片 -- */
  card: {
    marginHorizontal: 16,
    padding: S.lg,
    borderRadius: R.xl,
    backgroundColor: C.card,
    marginBottom: S.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: S.md,
  },
  avatarWrap: {
    marginRight: S.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.accent,
  },
  avatarTxt: {
    fontSize: 30,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: F.xxl,
    fontWeight: W.bold,
    color: C.white,
    marginBottom: S.xs,
  },
  uid: {
    fontSize: F.sm,
    color: C.gray,
  },
  editBtn: {
    paddingHorizontal: S.md,
    paddingVertical: S.xs,
    borderRadius: R.sm,
    backgroundColor: C.border,
  },
  editTxt: {
    fontSize: F.sm,
    color: C.gray,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: S.lg,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: F.xxl,
    fontWeight: W.bold,
    color: C.gold,
    marginBottom: S.xs,
  },
  statLabel: {
    fontSize: F.sm,
    color: C.gray,
  },

  /* -- 快捷操作 -- */
  quickRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: S.xl,
    gap: S.sm,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: S.md,
    borderRadius: R.lg,
    backgroundColor: C.card,
  },
  quickIconBox: {
    width: 40,
    height: 40,
    borderRadius: R.full,
    backgroundColor: C.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: S.sm,
  },
  quickIcon: {
    fontSize: F.xxl,
  },
  quickLabel: {
    fontSize: F.sm,
    color: C.white,
  },

  /* -- 菜单组 -- */
  menuGroup: {
    marginBottom: S.xl,
  },
  menuGroupTitle: {
    fontSize: F.sm,
    fontWeight: W.semibold,
    color: C.gray2,
    paddingHorizontal: 16 + 4,
    marginBottom: S.sm,
    textTransform: 'uppercase',
  },
  menuBox: {
    marginHorizontal: 16,
    borderRadius: R.xl,
    backgroundColor: C.card,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: S.lg,
  },
  menuIcon: {
    fontSize: F.xl,
    marginRight: S.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: F.base,
    fontWeight: W.medium,
    color: C.white,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeTxt: {
    fontSize: F.xs,
    fontWeight: W.bold,
    color: C.white,
  },
  menuArrow: {
    fontSize: F.xxl,
    color: C.gray2,
    lineHeight: 20,
  },
  menuDivider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 52,
  },

  /* -- 退出登录 -- */
  logoutBtn: {
    marginHorizontal: 16,
    height: 48,
    borderRadius: R.xl,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: S.sm,
  },
  logoutTxt: {
    fontSize: F.base,
    fontWeight: W.semibold,
    color: C.danger,
  },

  /* -- 底部安全区 -- */
  bottomSafe: {
    height: S.xxxl,
  },
});
