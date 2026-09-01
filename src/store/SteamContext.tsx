/* ================================================================
 * SteamContext — Steam 账号绑定状态管理
 * 真实绑定：登录后存储 Steam 用户信息 + JWT token，全局共享
 * ================================================================ */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

/* ────────── 类型 ────────── */
export interface SteamUser {
  steamId: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  /** 库存数量（可选，绑定后查库存接口填充） */
  inventoryCount?: number;
}

export interface SteamContextValue {
  user: SteamUser | null;
  /** 后端签发的 JWT，用于调 profile / inventory 接口 */
  token: string | null;
  isBound: boolean;
  bindAccount: (user: SteamUser, token: string) => void;
  unbindAccount: () => void;
}

/* ────────── Context ────────── */
var SteamContext = createContext<SteamContextValue>({
  user: null,
  token: null,
  isBound: false,
  bindAccount: function () {},
  unbindAccount: function () {},
});

/* ────────── Provider ────────── */
export function SteamProvider(props: { children: React.ReactNode }) {
  var _user = useState<SteamUser | null>(null);
  var user = _user[0];
  var setUser = _user[1];

  var _token = useState<string | null>(null);
  var token = _token[0];
  var setToken = _token[1];

  var bindAccount = useCallback(function (u: SteamUser, t: string) {
    setUser(u);
    setToken(t);
  }, []);

  var unbindAccount = useCallback(function () {
    setUser(null);
    setToken(null);
  }, []);

  var value = useMemo<SteamContextValue>(function () {
    return {
      user: user,
      token: token,
      isBound: user !== null,
      bindAccount: bindAccount,
      unbindAccount: unbindAccount,
    };
  }, [user, token, bindAccount, unbindAccount]);

  return React.createElement(SteamContext.Provider, { value: value }, props.children);
}

/* ────────── Hook ────────── */
export function useSteam(): SteamContextValue {
  return useContext(SteamContext);
}
