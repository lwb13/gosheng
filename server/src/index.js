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
    var data = await fetchSteamJson(url);
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

/* 性价比排名（价低量大：score = 在售量 / 价格，越大越划算） */
app.get('/api/market/rank', async function (req, res) {
  try {
    var count = Math.min(parseInt(req.query.count) || 30, 100);
    // 价格升序拉取低价饰品，才能命中「价低量大」的标的
    var url = 'https://steamcommunity.com/market/search/render/' +
      '?appid=730&norender=1&count=' + count + '&start=0&sort_column=price&sort_dir=asc';
    var data = await fetchSteamJson(url);
    var results = data.results || [];

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
        var price = r.sell_price ? r.sell_price / 100 : 0;
        var stock = r.sell_listings || 0;
        var score = price > 0 ? stock / price : 0;
        return {
          name: r.hash_name,
          imageUrl: icon ? 'https://community.akamai.steamstatic.com/economy/image/' + icon : '',
          price: price,
          stock: stock,
          score: Math.round(score * 100) / 100,
        };
      })
      .sort(function (a, b) { return b.score - a.score; });

    res.json({ total: items.length, items: items });
  } catch (e) {
    res.status(500).json({ error: '查询性价比排名失败：' + e.message });
  }
});

/* ================================================================
 * 分析模块 — 双速采集
 *   快采集（~90 秒）：实时价 priceoverview + 挂单墙 itemordershistogram
 *   慢采集（6 小时） ：价格历史 pricehistory → 横盘/捡漏/流动性
 * ================================================================ */

/* 内存缓存 */
var analysisCache = { updatedAt: 0, items: {} };  // name -> 分析结果（实时价/挂单墙/慢指标）
var watchlist = [];                                 // [{ name, imageUrl, price, stock }]
var orderSnapshots = {};                            // name -> 上次挂单墙摘要（用于 diff）
var isFastScanning = false;
var isSlowScanning = false;

/* 排除非饰品类型 */
var EXCLUDE_TYPES = ['Sticker', 'Graffiti', 'Patch', 'Capsule', 'Music Kit', 'Pin', 'Pass', 'Container', 'Charm'];

function isSkinName(name) {
  if (!name || name.indexOf('|') === -1) return false;
  for (var i = 0; i < EXCLUDE_TYPES.length; i++) {
    if (name.indexOf(EXCLUDE_TYPES[i]) !== -1) return false;
  }
  return true;
}

function priceFromCents(sellPrice) {
  return sellPrice ? sellPrice / 100 : 0;
}

function imageUrlOf(icon) {
  return icon ? 'https://community.akamai.steamstatic.com/economy/image/' + icon : '';
}

/* ────────── 限速 fetch 助手（全局冷却 + 429 指数退避） ────────── */
var _lastFetch = 0;
var _minInterval = 800; // 每次请求间隔（毫秒）

async function fetchSteam(url, opts) {
  opts = opts || {};
  var wait = _lastFetch + _minInterval - Date.now();
  if (wait > 0) await new Promise(function (r) { setTimeout(r, wait); });

  var headers = { 'User-Agent': 'GoShen/1.0' };
  if (opts.referer) headers['Referer'] = opts.referer;

  var attempt = 0;
  while (true) {
    _lastFetch = Date.now();
    var resp = await fetch(url, { headers: headers });
    if (resp.status === 429 || resp.status === 503) {
      attempt += 1;
      if (attempt > 4) throw new Error('Steam 限流：HTTP ' + resp.status);
      var backoff = Math.min(1000 * Math.pow(2, attempt), 30000);
      console.warn('Steam 限流，' + (backoff / 1000) + 's 后重试');
      await new Promise(function (r) { setTimeout(r, backoff); });
      continue;
    }
    if (resp.status !== 200) throw new Error('Steam 请求失败：HTTP ' + resp.status);
    return resp;
  }
}

async function fetchSteamJson(url, opts) {
  var resp = await fetchSteam(url, opts);
  return await resp.json();
}

/* 从 listings 页抓 item_nameid（挂单墙接口需要，稳定可缓存） */
var _nameIdCache = {};
async function getNameId(hashName) {
  if (_nameIdCache[hashName]) return _nameIdCache[hashName];
  var url = 'https://steamcommunity.com/market/listings/730/' + encodeURIComponent(hashName);
  var resp = await fetchSteam(url, { referer: 'https://steamcommunity.com/market/' });
  var html = await resp.text();
  var m = html.match(/Market_LoadOrderSpread\(\s*(\d+)\s*\)/);
  if (!m) return null;
  _nameIdCache[hashName] = parseInt(m[1], 10);
  return _nameIdCache[hashName];
}

/* 刷新 watchlist：从市场列表按价格降序取高价值饰品 */
async function refreshWatchlist() {
  var url = 'https://steamcommunity.com/market/search/render/' +
    '?appid=730&norender=1&count=30&start=0&sort_column=price&sort_dir=desc';
  var data = await fetchSteamJson(url);
  var results = (data && data.results) || [];
  var list = [];
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var name = r.hash_name || '';
    if (!isSkinName(name)) continue;
    var icon = (r.asset_description && r.asset_description.icon_url) || '';
    list.push({
      name: name,
      imageUrl: imageUrlOf(icon),
      price: priceFromCents(r.sell_price),
      stock: r.sell_listings || 0,
    });
  }
  if (list.length) watchlist = list;
  return watchlist;
}

/* 拉取单个饰品的价格历史（每天均价 + 当日成交量） */
async function fetchPriceHistory(name) {
  var url = 'https://steamcommunity.com/market/pricehistory/?appid=730&market_hash_name=' +
    encodeURIComponent(name);
  return await fetchSteamJson(url);
}

/* 计算横盘/变盘特征（近 30 天） */
function computeMetrics(prices) {
  // prices: [[dateStr, price, volumeStr], ...]
  if (!prices || prices.length < 10) return null;

  var recent = prices.slice(-30);
  var n = recent.length;

  var sum = 0;
  for (var i = 0; i < n; i++) sum += Number(recent[i][1]);
  var mean = sum / n;

  var sq = 0;
  for (var j = 0; j < n; j++) {
    var d = Number(recent[j][1]) - mean;
    sq += d * d;
  }
  var std = Math.sqrt(sq / n);

  var volatilityPct = mean > 0 ? (std / mean) * 100 : 0;

  var lastPrice = Number(prices[prices.length - 1][1]);
  var upper = mean + 2 * std;
  var lower = mean - 2 * std;

  var volSum = 0;
  for (var k = 0; k < n; k++) volSum += Number(recent[k][2]) || 0;
  var avgVol = volSum / n;
  var recentVol = Number(prices[prices.length - 1][2]) || 0;

  var signal = null;
  if (volatilityPct < 5) {
    if (lastPrice > upper && recentVol > avgVol * 1.5) signal = '突破上轨';
    else if (lastPrice < lower && recentVol > avgVol * 1.5) signal = '跌破下轨';
    else signal = '横盘中';
  }

  return {
    days: n,
    mean: mean,
    volatilityPct: Math.round(volatilityPct * 10) / 10,
    lastPrice: lastPrice,
    avgVol: avgVol,
    signal: signal,
  };
}

/* 流动性评分 0-100（在售量 + 日均成交量） */
function liquidityScore(stock, avgVol) {
  var volumeScore = Math.min(avgVol / 100, 1);
  var stockScore = Math.min(stock / 500, 1);
  var score = Math.round(50 * volumeScore + 50 * stockScore);
  var level = score >= 70 ? '高' : (score >= 40 ? '中' : '低');
  return { score: score, level: level };
}

/* 低估比例（当前价相对近期均价的折扣，正值 = 低于均价） */
function undervaluePct(currentPrice, avgPrice) {
  if (!avgPrice || avgPrice <= 0) return 0;
  return ((avgPrice - currentPrice) / avgPrice) * 100;
}

/* ────────── 慢采集：价格历史 → 横盘/捡漏/流动性（每 6 小时） ────────── */
async function runSlowScan() {
  if (isSlowScanning) return;
  isSlowScanning = true;
  try {
    var list = await refreshWatchlist();
    var next = {};

    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var rec = {
        name: it.name,
        imageUrl: it.imageUrl,
        price: it.price,
        stock: it.stock,
      };

      try {
        var ph = await fetchPriceHistory(it.name);
        var m = computeMetrics((ph && ph.prices) || []);
        if (m) {
          rec.days = m.days;
          rec.volatilityPct = m.volatilityPct;
          rec.signal = m.signal;
          rec.avgPrice = Math.round(m.mean * 100) / 100;
          rec.avgVol = Math.round(m.avgVol * 10) / 10;
          var liq = liquidityScore(it.stock, m.avgVol);
          rec.liquidity = liq.score;
          rec.liquidityLevel = liq.level;
          rec.discountPct = Math.round(undervaluePct(it.price, m.mean) * 10) / 10;
        }
      } catch (err) {
        /* 单个饰品抓取失败不影响整体 */
      }

      next[it.name] = rec;
    }

    analysisCache.items = next;
    analysisCache.updatedAt = Date.now();
    console.log('slow scan done: ' + Object.keys(next).length + ' items');
  } catch (err) {
    console.error('slow scan failed: ' + err.message);
  } finally {
    isSlowScanning = false;
  }
}

/* ────────── 快采集：实时价 + 挂单墙（每 ~90 秒） ────────── */
async function fetchPriceOverview(name) {
  var url = 'https://steamcommunity.com/market/priceoverview/?appid=730&market_hash_name=' +
    encodeURIComponent(name) + '&currency=1';
  return await fetchSteamJson(url);
}

async function fetchOrderBook(name) {
  var nameid = await getNameId(name);
  if (!nameid) return null;
  var url = 'https://steamcommunity.com/market/itemordershistogram?country=US&language=english&currency=1&item_nameid=' +
    nameid + '&two_factor=0';
  return await fetchSteamJson(url, {
    referer: 'https://steamcommunity.com/market/listings/730/' + encodeURIComponent(name),
  });
}

/* 挂单墙摘要：总量 + 单档最大量 */
function orderBookSummary(ob) {
  var sell = ob.sell_order_graph || [];
  var buy = ob.buy_order_graph || [];
  var totalSell = 0, maxSell = 0;
  for (var i = 0; i < sell.length; i++) {
    var q = Number(sell[i][1]) || 0;
    totalSell += q;
    if (q > maxSell) maxSell = q;
  }
  var totalBuy = 0, maxBuy = 0;
  for (var j = 0; j < buy.length; j++) {
    var q2 = Number(buy[j][1]) || 0;
    totalBuy += q2;
    if (q2 > maxBuy) maxBuy = q2;
  }
  return { totalSell: totalSell, maxSell: maxSell, totalBuy: totalBuy, maxBuy: maxBuy };
}

async function runFastScan() {
  if (isFastScanning) return;
  isFastScanning = true;
  try {
    var list = watchlist.length ? watchlist : await refreshWatchlist();
    var hot = list.slice(0, 12); // 只对最贵的 12 个监控挂单墙（最易出现大资金）

    // 1) 实时价 + 24h 成交量（全 watchlist）
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      try {
        var ov = await fetchPriceOverview(it.name);
        if (ov && ov.success !== false) {
          var rec = analysisCache.items[it.name] || { name: it.name, imageUrl: it.imageUrl, stock: it.stock };
          rec.price = it.price;
          rec.volume24h = Number(ov.volume) || 0;
          rec.lowestPrice = ov.lowest_price || '';
          rec.medianPrice = ov.median_price || '';
          analysisCache.items[it.name] = rec;
        }
      } catch (err) { /* 忽略单个失败 */ }
    }

    // 2) 挂单墙 diff（仅 hot）
    for (var h = 0; h < hot.length; h++) {
      var hotName = hot[h].name;
      try {
        var ob = await fetchOrderBook(hotName);
        if (!ob) continue;
        var sum = orderBookSummary(ob);
        var prev = orderSnapshots[hotName];
        var whale = null;
        if (sum.maxSell >= 10) whale = '大额卖墙';
        else if (sum.maxBuy >= 10) whale = '大额买墙';
        else if (prev) {
          if (sum.maxSell > prev.maxSell * 1.5 && sum.maxSell >= 5) whale = '卖墙增厚';
          else if (sum.maxBuy > prev.maxBuy * 1.5 && sum.maxBuy >= 5) whale = '买墙增厚';
        }
        orderSnapshots[hotName] = Object.assign({ ts: Date.now() }, sum);

        var rec2 = analysisCache.items[hotName] || { name: hotName, imageUrl: hot[h].imageUrl, stock: hot[h].stock };
        rec2.whaleSignal = whale;
        rec2.maxSell = sum.maxSell;
        rec2.maxBuy = sum.maxBuy;
        rec2.totalSell = sum.totalSell;
        rec2.totalBuy = sum.totalBuy;
        analysisCache.items[hotName] = rec2;
      } catch (err) { /* 忽略单个失败 */ }
    }

    analysisCache.updatedAt = Date.now();
    console.log('fast scan done: ' + list.length + ' items');
  } catch (err) {
    console.error('fast scan failed: ' + err.message);
  } finally {
    isFastScanning = false;
  }
}

/* 单个饰品价格历史（按需代理，功能 2/4/5 的核心数据） */
app.get('/api/market/pricehistory', async function (req, res) {
  var name = req.query.name || '';
  if (!name) return res.status(400).json({ error: '缺少 name 参数' });
  try {
    var url = 'https://steamcommunity.com/market/pricehistory/?appid=730&market_hash_name=' +
      encodeURIComponent(name);
    var data = await fetchSteamJson(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: '查询价格历史失败：' + e.message });
  }
});

/* 横盘形态 + 变盘预警（变盘信号优先） */
app.get('/api/analysis/sideways', function (req, res) {
  var arr = Object.keys(analysisCache.items).map(function (k) { return analysisCache.items[k]; })
    .filter(function (it) { return it.signal; })
    .sort(function (a, b) {
      var ra = a.signal === '横盘中' ? 2 : 1;
      var rb = b.signal === '横盘中' ? 2 : 1;
      if (ra !== rb) return ra - rb;
      return a.volatilityPct - b.volatilityPct;
    });
  res.json({ updatedAt: analysisCache.updatedAt, total: arr.length, items: arr });
});

/* 捡漏雷达（低估识别） */
app.get('/api/analysis/undervalue', function (req, res) {
  var threshold = parseFloat(req.query.threshold) || 10;
  var arr = Object.keys(analysisCache.items).map(function (k) { return analysisCache.items[k]; })
    .filter(function (it) { return it.discountPct != null && it.discountPct >= threshold; })
    .sort(function (a, b) { return b.discountPct - a.discountPct; });
  res.json({ updatedAt: analysisCache.updatedAt, total: arr.length, items: arr });
});

/* 流动性评分（0-100，越高越好卖） */
app.get('/api/analysis/liquidity', function (req, res) {
  var arr = Object.keys(analysisCache.items).map(function (k) { return analysisCache.items[k]; })
    .filter(function (it) { return it.liquidity != null; })
    .sort(function (a, b) { return b.liquidity - a.liquidity; });
  res.json({ updatedAt: analysisCache.updatedAt, total: arr.length, items: arr });
});

/* 鲸鱼动向（有大额挂单墙的饰品优先） */
app.get('/api/analysis/whales', function (req, res) {
  var rankMap = { '大额卖墙': 1, '大额买墙': 1, '卖墙增厚': 2, '买墙增厚': 2 };
  var arr = Object.keys(analysisCache.items).map(function (k) { return analysisCache.items[k]; })
    .filter(function (it) { return it.whaleSignal; })
    .sort(function (a, b) {
      return (rankMap[a.whaleSignal] || 3) - (rankMap[b.whaleSignal] || 3);
    });
  res.json({ updatedAt: analysisCache.updatedAt, total: arr.length, items: arr });
});

/* 启动双速采集：慢采集立即跑一次 + 每 6 小时；快采集每 90 秒 */
runSlowScan();
setInterval(runSlowScan, 6 * 60 * 60 * 1000);
setInterval(runFastScan, 90 * 1000);

/* 启动 */
app.listen(PORT, function () {
  console.log('GoShen server running at ' + BASE_URL);
  console.log('Health: ' + BASE_URL + '/api/health');
});
