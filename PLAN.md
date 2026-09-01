# Go神 — 未完成功能计划单

> 本文件是「交接文档」，交给下一个 AI / 开发者直接接手。
> 先读「已完成」了解现状，再按「未完成功能」逐项实现。

---

## 一、项目定位

「Go神」是一款 **CS2 饰品看盘工具**，面向散户玩家（不是商城下单，是分析工具）。

核心价值：帮助散户看清饰品市场里「大资金在买什么 / 什么在横盘要变盘 / 什么性价比最高 / 什么被低估」，从而做出买卖决策。

技术栈：
- **前端**：Expo SDK 54 + React Native 0.81 + TypeScript（Hermes 引擎）
- **后端**：Node.js 20 + Express，部署在香港腾讯云服务器（`43.129.238.111`，PM2 管理，进程名 `gosheng`）
- **构建**：EAS Build（`eas build --profile preview` 出 APK）

---

## 二、已完成（现状）

| 模块 | 状态 | 说明 |
|------|------|------|
| 首页 UI | ✅ | 分类 Tab / 搜索栏 / 2×2 功能入口 / 商品网格 |
| 真实饰品图片 | ✅ | `ProductCard` 支持 `imageUrl`，`Home` 从后端拉真实 Steam 数据 |
| 后端市场接口 | ✅ | `/api/market/items` 返回真实饰品（名称+图片+价格+在售量） |
| Steam OpenID 绑定 | ✅ | 后端 `passport-steam` + 前端 `SteamAuth`/`SteamContext` |
| 库存查询 | ✅ | `/api/user/steam/inventory`（需用户库存公开） |
| 登录/注册/忘记密码弹窗 | ✅ | `AuthModal.tsx` |
| 明暗主题切换 | ✅ | `src/theme` |
| 启动闪退修复 | ✅ | 移除 `app.json` 的 `jsEngine: "jsc"`（SDK54 已移除 JSC） |

### 目录结构

```
gosheng-master/
├── App.tsx                  # 入口
├── app.json                 # Expo 配置（scheme: goshen, package: com.inferno123.GameTrade）
├── eas.json                 # EAS 构建配置
├── src/
│   ├── config.ts            # API_BASE_URL = https://api.xn--go-i19e.top
│   ├── theme/               # 主题（明暗）
│   ├── components/          # ProductCard / SearchBar / SectionHeader / AuthModal ...
│   ├── screens/
│   │   ├── Home/            # 首页（已接真实数据）
│   │   ├── Mine/            # 我的（Steam绑定 + 登录弹窗）
│   │   └── SteamAuth/       # Steam 授权页
│   └── store/SteamContext.tsx  # Steam 用户状态
└── server/
    ├── src/index.js         # 后端全部路由
    ├── .env.example         # 环境变量模板（真实 .env 只在服务器上）
    └── deploy.sh            # 部署脚本
```

---

## 三、关键数据源（必须先读）

> ⚠️ **铁律**：所有对 steamcommunity.com 的请求，一律走后端（服务器在香港），**不能在前端直连**，因为 steamcommunity.com 被墙。Steam 图片 CDN 可国内直连。

| 数据 | 接口 | 备注 |
|------|------|------|
| 市场列表 | `https://steamcommunity.com/market/search/render/?appid=730&norender=1&count=N&start=0&sort_column=price&sort_dir=desc` | `sort_column=price` 才有真实皮肤，默认排序全是箱子 |
| 单件价格 | `https://steamcommunity.com/market/priceoverview/?appid=730&market_hash_name=XXX&currency=23` | `currency` 参数不可靠，永远返回 USD |
| 价格历史 | `https://steamcommunity.com/market/pricehistory/?appid=730&market_hash_name=XXX` | 返回每天均价，**横盘/变盘功能的核心数据** |
| 用户库存 | `https://steamcommunity.com/inventory/{steamid}/730/2?l=schinese&count=5000` | 需用户库存公开 |
| 用户信息 | `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=KEY&steamids=ID` | 走 Steam Web API Key |
| 图片 | `https://community.akamai.steamstatic.com/economy/image/{icon_url}` | 国内可直连，已验证 |

**已踩过的坑**：
- `currency` 参数在 search/render 上失效，价格永远是 USD（人民币要等悠悠有品，见下）。
- 分类过滤 `category_730_Type[]=tag_CSGO_Type_Knife` 可用，但 `tag_CSGO_Type_Weapon` 无效，不要用。
- market_hash_name 里带 `(` 和 `)`，构造 pricehistory URL 时记得 `encodeURIComponent`。

---

## 四、未完成功能（按优先级排序）

### 1. 性价比排名（价格 ÷ 数量）

**目标**：把「价格」和「在售数量」两个维度结合，算出哪个饰品「价低量大」，帮散户找到划算的入手点。

**思路**：
- 后端已有 `/api/market/items` 返回 `price`（USD）和 `stock`（在售量）。
- 定义性价比分 = `price / max(stock, 1)`，或 `stock / price`（越大越划算），列表按分数排序。
- 前端新增一个 Tab / 列表页展示排名，复用 `ProductCard`。

**数据**：现有接口已够，主要是后端加一个排序字段或新接口 `/api/market/rank`。

---

### 2. 横盘形态识别 + 变盘预警

**目标**：识别某饰品价格长期横盘（波动很小），当出现「放量 + 突破」时提醒用户「要变盘了」。**注意：判断的是价格形态（横盘/变盘），不是绝对价格高低。**

**思路**：
- 用 `pricehistory` 拉每日均价序列（比如近 90 天）。
- 计算横盘特征：标准差 / 均值 < 阈值（如波动率 < 5%），说明横盘。
- 变盘信号：某日成交量突增 + 价格突破横盘区间上下轨 → 推预警。
- 后端定时任务（PM2 cron 或 node-cron）扫描一批热门饰品，把命中的写进数据库/内存，前端轮询展示。

**数据**：`pricehistory`（价格）+ `priceoverview`（当日成交）。成交量字段 Steam 接口里较弱，需验证 `pricehistory` 是否返回 volume；没有的话用「在售量变化」近似。

---

### 3. 大资金仓库饰品出入分析（鲸鱼动向）

**目标**：追踪大额资金/大仓库账号的饰品进出，判断主力在买还是在卖。

**难点**：Steam 没有「资金流向」公开接口，需要自建方案，可选路径（按可行性排序）：

1. **市场挂单墙监控**：对高价值饰品（龙狙、咆哮、爪子刀等）定时抓 `priceoverview` + 挂单列表，当「大额挂单」出现/消失时记录，近似主力进出。
2. **公开大仓库存轮询**：维护一批已知大户/职业选手的 Steam64 ID，定时抓其 `inventory`，diff 出新增/移除的高价值饰品。
3. **第三方数据**：悠悠有品 / BUFF 有成交流水，但无公开 API，需抓包或官方合作。

**建议**：先做方案 1（数据可得、合规），方案 2 需要用户授权或公开库存，方案 3 最准但成本高。

---

### 4. 捡漏雷达（低估识别）

**目标**：找出「当前价明显低于近期均价」或「低磨损但价格没体现」的饰品，提示捡漏机会。

**思路**：
- 用 `pricehistory` 算近期均价，对比当前价，价差 > 阈值（如低于均值 10%）→ 命中。
- 磨损维度：market_hash_name 里带磨损（Factory New / Minimal Wear ...），结合价格看「低磨损价不高」的异常。

**数据**：`pricehistory` + `priceoverview`，可复用功能 2 的扫描任务。

---

### 5. 流动性评分

**目标**：给每个饰品一个「好不好卖」的分数，避免散户买到冷门货砸手里。

**思路**：
- 流动性 = f(在售量, 日成交笔数, 买卖价差)。在售量 `sell_listings` 已有；成交笔数用 `pricehistory` 的 volume（若有）；价差用 `priceoverview` 的 bid/ask。
- 输出 0-100 分，前端用标签（高/中/低流动性）展示。

**数据**：现有接口 + `priceoverview` 的 `lowest_price`/`median_price`。

---

### 6. 开箱 / 炼金期望值（EV 计算器）

**目标**：算开箱、汰换合同（Trade Up，即「炼金」）的期望收益，帮玩家理性判断值不值。

**思路**：
- 开箱 EV = Σ(各掉落概率 × 各掉落物品价格) − 箱子成本 − 钥匙成本。掉落概率从箱子内容物 + 官方掉率推算。
- 炼金 EV：10 个低品质皮肤合成 1 个高一级皮肤，期望 = 高一级皮肤均价 / 10 − 10 个素材成本。
- 前端做输入表单 + 结果展示；后端算价格。

**数据**：价格用 `priceoverview`；箱子掉落率需维护一个箱子→物品映射表（可从 Steam 箱子描述 / 第三方数据整理）。

---

### 7. 事件日历

**目标**：展示 CS2 饰品相关事件（新箱子上线、Major、大行动、炼金活动等），提醒用户提前布局。

**思路**：
- 纯前端日历 UI + 后端一个事件列表接口（可手动维护或从 Valve 公告 / 第三方抓取）。
- 事件来源：Valve 官方新闻、CS2 更新日志、社区公告。无稳定公开 API，建议先做「可编辑的事件数据表」+ 定时抓取 Valve 新闻页。

---

## 五、遗留问题（不阻塞，但要决策）

### A. 价格源：Steam 美元 vs 悠悠有品人民币

- 现状：后端返回 Steam **美元**价，前端 `ProductCard` 硬编码显示 `¥` 符号（**是错的，临时用**）。
- 用户已明确：**当前只需要 Steam 图片，不需要价格**（价格源暂缓）。
- 后续接人民币价的选项：
  1. **悠悠有品**：国内 CS2 平台，价格更贴近国内成交价，但**无公开 API**，需抓包/爬虫，有反爬风险。
  2. **BUFF**：有 App API 但需登录态，同样需逆向。
  3. **手动汇率换算**：Steam USD × 汇率 ≈ 人民币，最简单但偏差大（Steam 普遍偏贵）。
- **建议**：先用方案 3 兜底显示，等确定要接悠悠有品再单独做爬虫模块。

### B. Steam 授权浏览器被墙

- 现象：App 内授权绑定 Steam 时，浏览器打不开 steamcommunity.com（被墙）。
- 原因：游戏加速器（UU 等）只代理游戏进程，**不代理浏览器 / Chrome Custom Tab**。
- 现状：这个问题**还没解决**，属于产品上线前必须处理的硬伤。
- 可选方向（供决策）：
  1. App 内置 WebView 走**后端代理**加载 Steam 登录页（后端在香港中转，复杂且 Steam 有反代限制）。
  2. 提示用户开「全局代理」（VPN），体验差。
  3. 放弃 Steam 绑定，改用邮箱/手机登录（最简单，但少了 Steam 库存同步这个核心数据）。
- **建议**：优先评估方向 1 的可行性，不行就退到方向 3。

---

## 六、给下一个 AI 的落地建议

1. **后端优先**：新功能先把数据接口在后端做出来（`server/src/index.js` 加路由），前端再接。前端不要直接碰 steamcommunity.com。
2. **价格历史是核心**：功能 2、3、4、5 都依赖 `pricehistory`，先把「定时抓取 + 存库」的基建搭好（用 sqlite 或内存 map 都行，量不大）。
3. **复用 ProductCard**：所有列表类功能直接复用 `ProductCard`，别重写卡片。
4. **部署**：改完 `server/src/index.js` 后跑 `server/deploy.sh` 上传到服务器，`pm2 restart gosheng` 生效。
5. **环境变量**：真实 `.env`（STEAM_API_KEY、JWT_SECRET）只在服务器上，本地用 `.env.example` 复制成 `.env` 填空值即可。
