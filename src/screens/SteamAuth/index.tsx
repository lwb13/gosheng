/* ================================================================
 * SteamAuth — Steam 账号绑定页 (Modal)
 *
 * 流程: 输入 Steam ID → 模拟验证 → 成功回调
 * 真实场景会通过 Steam OpenID 跳转 WebView 完成授权
 * ================================================================ */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {
  useAppTheme, ColorScheme,
  F, W, R, S,
} from '../../theme';
import { SteamUser } from '../../store/SteamContext';

/* ────────── 模拟 Steam 用户数据 ────────── */
var _demoUsers: Record<string, SteamUser> = {
  '76561198000000001': {
    steamId: '76561198000000001',
    personaname: 'CS2_Player_CN',
    avatarfull: '',
    profileurl: 'https://steamcommunity.com/id/cs2player',
    inventoryCount: 234,
  },
  'steam_test': {
    steamId: '76561198000000002',
    personaname: 'Go神_测试账号',
    avatarfull: '',
    profileurl: 'https://steamcommunity.com/id/goshentest',
    inventoryCount: 56,
  },
};

/* ────────── 样式工厂 ────────── */
function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: '88%',
      maxWidth: 380,
      backgroundColor: C.card,
      borderRadius: R.xxl,
      padding: S.xxl,
      alignItems: 'center',
    },
    closeBtn: {
      position: 'absolute',
      top: S.md,
      right: S.md,
      width: 32,
      height: 32,
      borderRadius: R.full,
      backgroundColor: C.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeTxt: {
      fontSize: F.xl,
      color: C.gray,
      lineHeight: 18,
    },
    steamLogo: {
      width: 64,
      height: 64,
      borderRadius: R.full,
      backgroundColor: C.cardAlt,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: S.lg,
    },
    steamLogoIcon: { fontSize: 36 },
    title: {
      fontSize: F.xxl,
      fontWeight: W.bold,
      color: C.white,
      marginBottom: S.xs,
    },
    subtitle: {
      fontSize: F.sm,
      color: C.gray,
      marginBottom: S.xxl,
      textAlign: 'center',
      lineHeight: 20,
    },

    /* 输入区 */
    inputWrap: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      borderRadius: R.lg,
      backgroundColor: C.input,
      paddingHorizontal: S.lg,
      marginBottom: S.md,
    },
    inputPrefix: {
      fontSize: F.base,
      color: C.gray2,
      marginRight: S.sm,
    },
    input: {
      flex: 1,
      fontSize: F.base,
      color: C.white,
      padding: 0,
    },

    /* 按钮 */
    bindBtn: {
      width: '100%',
      height: 48,
      borderRadius: R.lg,
      backgroundColor: '#1A73E8',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: S.md,
    },
    bindBtnDisabled: { opacity: 0.5 },
    bindBtnTxt: {
      fontSize: F.lg,
      fontWeight: W.bold,
      color: '#FFFFFF',
    },
    skipBtn: {
      paddingVertical: S.sm,
      paddingHorizontal: S.lg,
    },
    skipTxt: {
      fontSize: F.sm,
      color: C.gray,
    },

    /* demo hint */
    hintBox: {
      width: '100%',
      padding: S.md,
      borderRadius: R.md,
      backgroundColor: C.cardAlt,
      marginBottom: S.md,
    },
    hintTitle: {
      fontSize: F.xs,
      fontWeight: W.semibold,
      color: C.gray,
      marginBottom: S.xs,
    },
    hintCode: {
      fontSize: F.sm,
      color: C.gold,
      fontFamily: 'monospace',
      lineHeight: 20,
    },

    /* 加载态 */
    loadingWrap: {
      alignItems: 'center',
      paddingVertical: S.xxl,
    },
    loadingTxt: {
      fontSize: F.base,
      color: C.gray,
      marginTop: S.md,
    },
  });
}

/* ================================================================
 * Props
 * ================================================================ */
export interface SteamAuthProps {
  visible: boolean;
  onClose: () => void;
  onBindSuccess: (user: SteamUser) => void;
}

/* ────────── 审批步骤 ────────── */
type Step = 'input' | 'loading' | 'error';

/* ================================================================
 * 组件
 * ================================================================ */
export default function SteamAuth(props: SteamAuthProps) {
  var p = props;
  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);

  var _s1 = useState('');
  var steamId = _s1[0];
  var setSteamId = _s1[1];

  var _s2 = useState<Step>('input');
  var step = _s2[0];
  var setStep = _s2[1];

  var _s3 = useState('');
  var errorMsg = _s3[0];
  var setErrorMsg = _s3[1];

  /* ── 处理绑定 ── */
  function handleBind() {
    var trimmed = steamId.trim();
    if (!trimmed) {
      setErrorMsg('请输入 Steam ID');
      return;
    }

    setStep('loading');
    setErrorMsg('');

    /* 模拟网络请求延迟 */
    setTimeout(function () {
      var found = _demoUsers[trimmed];
      if (found) {
        p.onBindSuccess(found);
        p.onClose();
        /* 重置状态 */
        setSteamId('');
        setStep('input');
      } else if (trimmed === 'steam_test') {
        p.onBindSuccess(_demoUsers['steam_test']);
        p.onClose();
        setSteamId('');
        setStep('input');
      } else {
        /* 任意输入都绑定成功 (演示用) */
        var newUser: SteamUser = {
          steamId: trimmed,
          personaname: 'Steam_' + trimmed.slice(0, 6),
          avatarfull: '',
          profileurl: 'https://steamcommunity.com/id/' + trimmed,
          inventoryCount: Math.floor(Math.random() * 200) + 20,
        };
        p.onBindSuccess(newUser);
        p.onClose();
        setSteamId('');
        setStep('input');
      }
    }, 1500);
  }

  /* ── 关闭 ── */
  function handleClose() {
    setSteamId('');
    setStep('input');
    setErrorMsg('');
    p.onClose();
  }

  return (
    <Modal
      visible={p.visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={_s.overlay}>
        <View style={_s.card}>
          {/* 关闭按钮 */}
          <TouchableOpacity style={_s.closeBtn} onPress={handleClose} activeOpacity={0.7}>
            <Text style={_s.closeTxt}>✕</Text>
          </TouchableOpacity>

          {/* Steam Logo */}
          <View style={_s.steamLogo}>
            <Text style={_s.steamLogoIcon}>🎮</Text>
          </View>

          <Text style={_s.title}>绑定 Steam 账号</Text>
          <Text style={_s.subtitle}>
            绑定后可同步 Steam 库存，\n进行饰品交易与报价
          </Text>

          {step === 'loading' ? (
            /* ── 加载态 ── */
            <View style={_s.loadingWrap}>
              <ActivityIndicator size="large" color="#1A73E8" />
              <Text style={_s.loadingTxt}>正在验证 Steam 账号...</Text>
            </View>
          ) : (
            /* ── 输入态 ── */
            <>
              {/* Demo 提示 */}
              <View style={_s.hintBox}>
                <Text style={_s.hintTitle}>演示账号：</Text>
                <Text style={_s.hintCode}>steam_test</Text>
              </View>

              {/* Steam ID 输入 */}
              <View style={_s.inputWrap}>
                <Text style={_s.inputPrefix}>ID:</Text>
                <TextInput
                  style={_s.input}
                  placeholder="输入 Steam ID 或 Steam 64位ID"
                  placeholderTextColor={C.gray2}
                  value={steamId}
                  onChangeText={setSteamId}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleBind}
                />
              </View>

              {/* 错误提示 */}
              {errorMsg ? (
                <Text style={{ fontSize: F.xs, color: C.danger, marginBottom: S.sm, alignSelf: 'flex-start', paddingLeft: S.xs }}>
                  {errorMsg}
                </Text>
              ) : null}

              {/* 绑定按钮 */}
              <TouchableOpacity
                style={[_s.bindBtn, !steamId.trim() && _s.bindBtnDisabled]}
                onPress={handleBind}
                activeOpacity={0.8}
                disabled={!steamId.trim()}
              >
                <Text style={_s.bindBtnTxt}>授权并登录</Text>
              </TouchableOpacity>

              {/* 跳过 */}
              <TouchableOpacity style={_s.skipBtn} onPress={handleClose} activeOpacity={0.6}>
                <Text style={_s.skipTxt}>暂不绑定</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
