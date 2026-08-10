/* ================================================================
 * SteamContext — Steam 账号绑定状态管理
 * 绑定成功后存储 Steam 用户信息，全局共享
 * ================================================================ */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

/* ────────── 类型 ────────── */
export interface SteamUser {
  steamId: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  /** 模拟的库存数量 */
  inventoryCount: number;
}

export interface SteamContextValue {
  user: SteamUser | null;
  isBound: boolean;
  bindAccount: (user: SteamUser) => void;
  unbindAccount: () => void;
}

/* ────────── Context ────────── */
var SteamContext = createContext<SteamContextValue>({
  user: null,
  isBound: false,
  bindAccount: function () {},
  unbindAccount: function () {},
});

/* ────────── Provider ────────── */
export function SteamProvider(props: { children: React.ReactNode }) {
  var _sd = useState<SteamUser | null>(null);
  var user = _sd[0];
  var setUser = _sd[1];

  var bindAccount = useCallback(function (u: SteamUser) {
    setUser(u);
  }, []);

  var unbindAccount = useCallback(function () {
    setUser(null);
  }, []);

  var value = useMemo<SteamContextValue>(function () {
    return {
      user: user,
      isBound: user !== null,
      bindAccount: bindAccount,
      unbindAccount: unbindAccount,
    };
  }, [user, bindAccount, unbindAccount]);

  return React.createElement(SteamContext.Provider, { value: value }, props.children);
}

/* ────────── Hook ────────── */
export function useSteam(): SteamContextValue {
  return useContext(SteamContext);
}
