/* ================================================================
 * SteamAuth — Steam 账号绑定页 (Modal)
 *
 * 真实流程：点「授权并登录」→ 打开浏览器跳转 Steam 官方登录
 * → 登录成功后 Steam 回调后端 → 后端签发 token 跳回 App
 * → App 拿 token 调 profile 接口换取用户信息
 * ================================================================ */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import {
  useAppTheme, ColorScheme,
  F, W, R, S,
} from '../../theme';
import { SteamUser } from '../../store/SteamContext';
import { API_BASE_URL, STEAM_REDIRECT_URI } from '../../config';

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

    /* 错误提示 */
    errorTxt: {
      fontSize: F.xs,
      color: C.danger,
      marginBottom: S.sm,
      textAlign: 'center',
    },

    /* 加载态 */
    loadingWrap: {
      alignItems: 'center',
      paddingVertical: S.lg,
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
  onBindSuccess: (user: SteamUser, token: string) => void;
}

/* ================================================================
 * 工具 — 从回调 URL 提取 token
 * ================================================================ */
function extractToken(url: string): string {
  var match = url.match(/[?&]token=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/* ================================================================
 * 组件
 * ================================================================ */
export default function SteamAuth(props: SteamAuthProps) {
  var p = props;
  var { C } = useAppTheme();
  var _s = useMemo(function () { return createStyles(C); }, [C]);

  var _s1 = useState(false);
  var loading = _s1[0];
  var setLoading = _s1[1];

  var _s2 = useState('');
  var errorMsg = _s2[0];
  var setErrorMsg = _s2[1];

  /* ── 真实 Steam 登录 ── */
  var handleBind = useCallback(async function () {
    setLoading(true);
    setErrorMsg('');

    try {
      // 打开浏览器，跳转 Steam 官方登录页
      var result = await WebBrowser.openAuthSessionAsync(
        API_BASE_URL + '/api/auth/steam',
        STEAM_REDIRECT_URI,
      );

      if (result.type !== 'success') {
        // 用户取消或关闭了浏览器
        setLoading(false);
        return;
      }

      // 从回跳地址解析 token
      var token = extractToken(result.url);
      if (!token) {
        setErrorMsg('登录失败：未获取到授权凭证');
        setLoading(false);
        return;
      }

      // 用 token 换用户信息
      var resp = await axios.get(API_BASE_URL + '/api/user/steam/profile', {
        headers: { Authorization: 'Bearer ' + token },
        timeout: 15000,
      });

      var data = resp.data;
      var user: SteamUser = {
        steamId: data.steamId,
        personaname: data.personaname,
        avatarfull: data.avatarfull || '',
        profileurl: data.profileurl || '',
        inventoryCount: 0, // 库存数可后续单独拉取
      };

      p.onBindSuccess(user, token);
      p.onClose();
      setLoading(false);
    } catch (e) {
      setErrorMsg('登录失败，请重试');
      setLoading(false);
    }
  }, [p]);

  /* ── 关闭 ── */
  function handleClose() {
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
            跳转到 Steam 官方页面登录，{'\n'}授权后同步你的库存与交易数据
          </Text>

          {loading ? (
            /* ── 加载态 ── */
            <View style={_s.loadingWrap}>
              <ActivityIndicator size="large" color="#1A73E8" />
              <Text style={_s.loadingTxt}>正在验证 Steam 账号...</Text>
            </View>
          ) : (
            <>
              {errorMsg ? <Text style={_s.errorTxt}>{errorMsg}</Text> : null}

              {/* 授权并登录按钮 */}
              <TouchableOpacity
                style={_s.bindBtn}
                onPress={handleBind}
                activeOpacity={0.8}
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
