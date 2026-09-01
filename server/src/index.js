/* ================================================================
 * Go神 CS饰品商城 — Steam 绑定后端
 *
 * 功能：
 *   1. Steam OpenID 登录（passport-steam）
 *   2. 登录成功后签发 JWT，重定向回 App（deep link）
 *   3. 用 JWT 换取 Steam 用户信息（头像/昵称）
 *   4. 查询 CS2 库存（appid=730）
 *
 * 部署要求：Node.js 18+，公网 HTTPS 域名（Steam 回调必需）
 * ================================================================ */

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

/* ────────── 配置 ────────── */
const PORT = process.env.PORT || 3000;
const STEAM_API_KEY = process.env.STEAM_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const APP_SCHEME = process.env.APP_SCHEME || 'goshen';
const CS2_APPID = 730; // CS2 在 Steam 里的 appid

/* ────────── 中间件 ────────── */
app.use(cors());
app.use(express.json());

/* passport-steam 依赖 session 保存 OpenID 往返状态 */
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60 * 1000 }, // 10 分钟
}));

app.use(passport.initialize());
app.use(passport.session());

/* ────────── Steam 登录策略 ────────── */
passport.use(new SteamStrategy({
  returnURL: BASE_URL + '/api/auth/steam/return',
  realm: BASE_URL + '/',
  apiKey: STEAM_API_KEY,
}, function (identifier, profile, done) {
  // identifier: https://steamcommunity.com/openid/id/7656119...
  // profile.id:  Steam64 ID（字符串）
  return done(null, profile);
}));

passport.serializeUser(function (user, done) { done(null, user); });
passport.deserializeUser(function (obj, done) { done(null, obj); });

/* ────────── JWT 工具 ────────── */
function signToken(profile) {
  var avatar = (profile.photos && profile.photos[0] && profile.photos[0].value) || '';
  return jwt.sign({
    steamid: profile.id,
    personaname: profile.displayName || '',
    avatar: avatar,
  }, JWT_SECRET, { expiresIn: '30d' });
}

/* 校验 JWT，通过后挂到 req.user */
function requireAuth(req, res, next) {
  var header = req.headers.authorization || '';
  var token = header.replace(/^Bearer\s+/i, '') || req.query.token || '';
  if (!token) {
    return res.status(401).json({ error: '缺少 token' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'token 无效或已过期' });
  }
}

/* ================================================================
 * 路由
 * ================================================================ */

/* 健康检查 */
app.get('/api/health', function (req, res) {
  res.json({ ok: true, time: new Date().toISOString() });
});

/* 跳转 Steam 登录页 */
app.get('/api/auth/steam', passport.authenticate('steam'));

/* Steam 登录回调 */
app.get('/api/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/api/auth/steam/failed' }),
  function (req, res) {
    var token = signToken(req.user);
    // 重定向回 App（deep link），App 拿到 token 后调 profile 接口
    res.redirect(APP_SCHEME + '://steam/callback?token=' + token);
  }
);

/* 登录失败 */
app.get('/api/auth/steam/failed', function (req, res) {
  res.status(401).send('<h1>Steam 登录失败</h1><p>请返回 App 重试</p>');
});

/* 获取当前绑定用户信息（Steam 官方接口，返回最新头像/昵称） */
app.get('/api/user/steam/profile', requireAuth, async function (req, res) {
  var steamid = req.user.steamid;
  try {
    var url = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/' +
      '?key=' + STEAM_API_KEY + '&steamids=' + steamid;
    var resp = await fetch(url);
    var data = await resp.json();
    var players = (data.response && data.response.players) || [];

    if (!players.length) {
      return res.status(404).json({ error: '未找到该 Steam 用户' });
    }

    var p = players[0];
    res.json({
      steamId: p.steamid,
      personaname: p.personaname,
      avatarfull: p.avatarfull,
      profileurl: p.profileurl,
    });
  } catch (e) {
    res.status(500).json({ error: '查询 Steam 用户失败：' + e.message });
  }
});

/* 查询 CS2 库存（需用户库存公开） */
app.get('/api/user/steam/inventory', requireAuth, async function (req, res) {
  var steamid = req.user.steamid;
  try {
    var url = 'https://steamcommunity.com/inventory/' + steamid + '/' + CS2_APPID +
      '/2?l=schinese&count=5000';
    var resp = await fetch(url, { headers: { 'User-Agent': 'GoShen/1.0' } });
    if (resp.status !== 200) {
      return res.status(resp.status).json({ error: '库存不可见，请在 Steam 隐私设置里公开库存' });
    }
    var data = await resp.json();

    var assets = data.assets || [];
    var descs = data.descriptions || [];
    // 建立 classid+instanceid -> description 的索引
    var descMap = {};
    descs.forEach(function (d) {
      descMap[d.classid + '_' + d.instanceid] = d;
    });

    // 只取可交易/可出售的 CS2 饰品
    var items = [];
    assets.forEach(function (a) {
      var key = a.classid + '_' + a.instanceid;
      var d = descMap[key];
      if (!d) return;
      // 过滤掉胶囊、钥匙等非饰品（可选，这里保留全部）
      items.push({
        assetid: a.assetid,
        classid: a.classid,
        instanceid: a.instanceid,
        name: d.market_hash_name || '',
        iconUrl: d.icon_url
          ? 'https://community.akamai.steamstatic.com/economy/image/' + d.icon_url
          : '',
        tradable: d.tradable ? 1 : 0,
        marketable: d.marketable ? 1 : 0,
        type: d.type || '',
        rarity: d.tags ? (d.tags.find(function (t) { return t.category === 'Rarity'; }) || {}).localized_tag_name || '' : '',
      });
    });

    res.json({ total: items.length, items: items });
  } catch (e) {
    res.status(500).json({ error: '查询库存失败：' + e.message });
  }
});

/* 市场饰品列表（真实 Steam 数据：名称 + 图片 + 价格 + 在售量） */
app.get('/api/market/items', async function (req, res) {
  try {
    var count = Math.min(parseInt(req.query.count) || 20, 100);
    var url = 'https://steamcommunity.com/market/search/render/' +
      '?appid=730&norender=1&count=' + count + '&start=0&sort_column=price&sort_dir=desc';
    var resp = await fetch(url, { headers: { 'User-Agent': 'GoShen/1.0' } });
    var data = await resp.json();
    var results = data.results || [];

    // 排除非饰品类型（箱子/胶囊/印花/涂鸦等）
    var EXCLUDE = ['Sticker', 'Graffiti', 'Patch', 'Capsule', 'Music Kit', 'Pin', 'Pass', 'Container', 'Charm'];
    var items = results
      .filter(function (r) {
        var n = r.hash_name || '';
        if (!n || n.indexOf('|') === -1) return false;
        for (var i = 0; i < EXCLUDE.length; i++) {
          if (n.indexOf(EXCLUDE[i]) !== -1) return false;
        }
        return true;
      })
      .map(function (r) {
        var icon = (r.asset_description && r.asset_description.icon_url) || '';
        return {
          name: r.hash_name,
          imageUrl: icon
            ? 'https://community.akamai.steamstatic.com/economy/image/' + icon
            : '',
          price: r.sell_price ? r.sell_price / 100 : 0, // Steam 美元价，后续换悠悠有品人民币
          stock: r.sell_listings || 0,
        };
      });

    res.json({ total: items.length, items: items });
  } catch (e) {
    res.status(500).json({ error: '查询市场失败：' + e.message });
  }
});

/* 启动 */
app.listen(PORT, function () {
  console.log('GoShen server running at ' + BASE_URL);
  console.log('Health: ' + BASE_URL + '/api/health');
});
