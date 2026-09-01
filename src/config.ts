/* ================================================================
 * 全局配置 — 后端地址 & Steam 回跳
 * ================================================================ */

/** 后端 API 根地址（不含末尾斜杠） */
export var API_BASE_URL = 'https://api.xn--go-i19e.top';

/** App deep link scheme（与 app.json 的 scheme 一致） */
export var STEAM_REDIRECT_SCHEME = 'goshen';

/** Steam 登录成功后的回跳地址 */
export var STEAM_REDIRECT_URI = STEAM_REDIRECT_SCHEME + '://steam/callback';
