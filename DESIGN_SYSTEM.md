# 🎮 Go神 — CS:GO饰品商城 UI设计系统

> **基于现有代码提炼 + 扩展，与 [App.tsx](App.tsx) / [src/screens/Home/](src/screens/Home/index.tsx) 色板完全对齐**

---

## 一、产品定位 & 设计哲学

| 维度 | 描述 |
|------|------|
| **产品名称** | Go神 — CS:GO 饰品交易平台 |
| **定位** | 面向硬核FPS玩家的游戏饰品C2C商城 |
| **设计风格** | 暗黑电竞风 × 赛博橙金 — 夜晚竞技场感 |
| **情感关键词** | 硬核、热血、信任、稀有度 |
| **用户群体** | 18-30岁男性CS:GO玩家，熟悉Steam市场 |
| **核心差异** | 以"磨损"为核心筛选维度，价格金色高亮即视觉锚点 |

---

## 二、主色调 · Color Palette

### 2.1 色板总览

```
┌──────────────────────────────────────────────────────────────┐
│  TOKEN            HEX        RGB           HSB         用途  │
├──────────────────────────────────────────────────────────────┤
│  bg-primary       #0D0D1A    13  13  26    240° 50% 10%   主背景 │
│  bg-secondary     #12122A    18  18  42    240° 57% 16%   次背景/导航栏 │
│  bg-card          #181830    24  24  48    240° 50% 19%   卡片背景 │
│  bg-card-alt      #1E1E3A    30  30  58    240° 48% 23%   图片占位/高亮卡 │
│  bg-input         #1A1A32    26  26  50    240° 48% 20%   输入框 │
│  bg-overlay       rgba(0,0,0,0.6)              -          蒙层 │
├──────────────────────────────────────────────────────────────┤
│  accent-primary   #FF6B00    255 107  0     25° 100% 100%  主强调色/激活态 │
│  accent-gold      #F0C060    240 192  96    40°  60%  94%  价格/金币 │
│  accent-success   #4CAF50    76  175  80    122° 57%  69%  崭新出厂 │
│  accent-warning   #FFC107    255 193  7     45°  97% 100%  久经沙场 │
│  accent-danger    #F44336    244 67   54     4°  78%  96%  战痕累累/错误 │
│  accent-info      #2196F3    33  150 243    207° 86%  95%  信息提示 │
├──────────────────────────────────────────────────────────────┤
│  text-primary     #FFFFFF    255 255 255    -          主文字 │
│  text-secondary   #8E8E9E    142 142 142    -          辅助文字 │
│  text-tertiary    #5A5A72    90  90  114    240° 21% 45%   弱文字/占位 │
│  text-price       #F0C060    =accent-gold   -          价格专用 │
│  text-on-accent   #FFFFFF    =white         -          强调色上文字 │
├──────────────────────────────────────────────────────────────┤
│  border-default   #252540    37  37  64     240° 42% 25%   默认边框 │
│  border-light     #1E1E3A    30  30  58     240° 48% 23%   浅边框/分割 │
│  border-active    #FF6B00    =accent-primary -          激活边框 │
├──────────────────────────────────────────────────────────────┤
│  磨损-崭新出厂     #4CAF50    =accent-success -          稀有标识 │
│  磨损-略有磨损     #8BC34A    139 195 74    88°  62%  76%  稀有标识 │
│  磨损-久经沙场     #FFC107    =accent-warning -          稀有标识 │
│  磨损-破损不堪     #FF9800    255 152 0     36° 100% 100%  稀有标识 │
│  磨损-战痕累累     #F44336    =accent-danger -          稀有标识 │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 语义色使用规则

| 语义 | 色值 | 使用场景 |
|------|------|---------|
| 背景底 | `#0D0D1A` | 所有页面根背景 |
| 导航栏 | `#12122A` | 底部TabBar背景 |
| 卡片 | `#181830` | 商品卡片/列表项/信息面板 |
| CTA按钮 | `#FF6B00` | 购买/出售/确认等主操作 |
| 价格 | `#F0C060` | 所有价格数字，金色即价格 |
| 磨损标签 | 见磨损色阶 | 商品状态标签背景色 |
| 禁用态 | `#5A5A72` 30% | 不可用按钮/选项 |

---

## 三、辅色 · Accent & Semantic

```
  强调色体系（橙色为主，色阶扩展）

  accent-50   #FFF3E6    ← 浅橙背景（优惠券/活动标签底）
  accent-100  #FFD4B3    ← 浅橙高亮
  accent-300  #FF994D    ← 中等强调（hover态）
  accent-500  #FF6B00    ← **主强调色 PRIMARY**
  accent-700  #CC5500    ← 深橙（按下态/渐变终点）
  accent-900  #993F00    ← 最深（暗色模式渐变起点）
```

---

## 四、字体规范 · Typography

### 4.1 字体族

| 平台 | 字体 | 用途 |
|------|------|------|
| iOS/Android | 系统默认 (San Francisco / Roboto) | 正文 |
| 数字/价格 | System monospace number | 价格展示（等宽数字对齐） |

### 4.2 字号阶梯 (Type Scale)

```
TOKEN           REM      PX      用途
────────────────────────────────────────────
text-2xs        0.625rem  10px   磨损标签、库存数
text-xs         0.75rem   12px   辅助信息、卡片副标题
text-sm         0.8125rem 13px   标签文字、链接
text-base       0.875rem  14px   正文、按钮、输入框
text-md         0.9375rem 15px   入口标签、列表标题
text-lg         1.0625rem 17px   区块标题
text-xl         1.25rem   20px   页面标题(Tab未选中)
text-2xl        1.375rem  22px   页面大标题(Tab选中)
text-3xl        1.5rem    24px   首页大数字/金额
text-4xl        2rem      32px   图标/占位图
```

### 4.3 字重

```
TOKEN           VALUE     使用场景
────────────────────────────────────
font-light      300       极少使用
font-regular    400       正文、输入框
font-medium     500       卡片名称、列表标题
font-semibold   600       标签激活态、按钮
font-bold       700       价格、区块标题、大标题
font-extrabold  800       首页Hero数字
```

### 4.4 行高

```
TOKEN           MULTIPLIER   PX(14px基准)
────────────────────────────────────────
leading-tight   1.2          16.8px   (标题)
leading-normal  1.4          19.6px   (正文)
leading-relaxed 1.6          22.4px   (长文本/说明)
```

---

## 五、圆角 · Border Radius

```
TOKEN           PX      用途
────────────────────────────────────────
radius-xs       3px     磨损标签、小徽章
radius-sm       6px     小按钮、标签内部
radius-md       8px     商品卡片
radius-lg       10px    搜索框、入口卡片、列表项
radius-xl       12px    大卡片、弹窗
radius-2xl      16px    底部弹窗面板
radius-full     9999px  胶囊标签、Tab切换、头像
```

---

## 六、间距 · Spacing System

基于 4px 基准网格：

```
TOKEN           PX      4px单位     用途
───────────────────────────────────────────
space-0         0       0           无边距
space-0.5       2       0.5         图标微调
space-1         4       1           紧凑间距
space-1.5       6       1.5         TabBar底部内边距
space-2         8       2           卡片内边距、元素间隙
space-2.5       10      2.5         快捷入口间距
space-3         12      3           搜索框水平内边距、区块间距
space-4         16      4           页面水平边距、卡片间距
space-5         20      5           大区块间距
space-6         24      6           页面底部留白
space-8         32      8           页面顶部留白
space-10        40      10          Hero区间距
space-12        48      12          超大间距
```

---

## 七、阴影 · Elevation

```
TOKEN               VALUE                         用途
─────────────────────────────────────────────────────────
shadow-card         0px 2px 8px rgba(0,0,0,0.4)   商品卡片
shadow-button       0px 4px 12px rgba(255,107,0,0.3) CTA按钮发光
shadow-modal        0px 8px 32px rgba(0,0,0,0.6)   弹窗/底部面板
shadow-tabbar       0px -2px 8px rgba(0,0,0,0.3)   导航栏顶部阴影
```

---

## 八、动效 · Motion

| 场景 | 时长 | 缓动 |
|------|------|------|
| Tab切换 | 150ms | ease-out |
| 卡片点击 | 100ms | ease-in-out (scale 0.97) |
| 页面转场 | 250ms | ease-in-out |
| 列表滚动 | 原生惯性 | - |
| 价格刷新 | 300ms | ease-out (opacity交叉淡入) |

---

## 九、页面设计 — 首页 (HomeScreen)

### 9.1 信息架构

```
┌─────────────────────────────────┐
│  STATUS BAR (时间/电量)          │
├─────────────────────────────────┤
│  [买饰品] [租饰品] [免费租] [好物竞拍]  ← Tab切换胶囊
├─────────────────────────────────┤
│  🔍 搜索 CS:GO 饰品...           ← 搜索栏 (40px高, radius-lg)
├─────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐     │
│  │  🔪      │ │  🧤      │     ← 快捷入口 2x2网格
│  │ 匕首市场  │ │ 手套市场  │     │   每格: (屏宽-32-10)/2 × 72px
│  └──────────┘ └──────────┘     │   icon 44×44 radius-xl
│  ┌──────────┐ ┌──────────┐     │
│  │  🏆      │ │  🔴      │     │
│  │ 科隆Major│ │ 红皮专区  │     │
│  └──────────┘ └──────────┘     │
├─────────────────────────────────┤
│  最新上架              查看全部 >│  ← 区块标题
├─────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 🖼️  │ │ 🖼️  │ │ 🖼️  │   │  ← 商品网格 3列
│  │崭新出厂│ │略有磨损│ │久经沙场│   │   卡片宽: (屏宽-32-8×2)/3
│  │AWP龙王│ │AK火蛇 │ │M4咆哮 │   │   图片区 aspectRatio:1
│  │¥1280 │ │¥3560 │ │¥8999 │   │   磨损标签+库存数同一行
│  └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ ...  │ │ ...  │ │ ...  │   │
│  └──────┘ └──────┘ └──────┘   │
│         ... 无限滚动 ...        │
├─────────────────────────────────┤
│  🏠 🎒 💰 🛒 👤  ← TabBar 56px  │
│ Go神 库存 出售 求购 我的        │
└─────────────────────────────────┘
```

### 9.2 组件树

```
HomeScreen
├── TabsBar                        ← 水平滚动胶囊标签
│   └── TabItem × 4               ← [买饰品|租饰品|免费租|好物竞拍]
├── SearchBar                      ← TextInput + 搜索icon
├── ScrollView
│   ├── QuickEntryGrid             ← 2×2 快捷入口
│   │   └── QuickEntryCard × 4    ← icon(44×44) + label
│   ├── SectionHeader              ← "最新上架" + "查看全部>"
│   └── ProductGrid                ← 3列网格
│       └── ProductCard × N        ← 图片+磨损+名称+价格
│           ├── ProductImage       ← 占位图 1:1
│           ├── WearTag            ← 磨损标签(彩色背景)
│           ├── StockBadge         ← "在售 N"
│           ├── ProductName        ← 1行截断
│           └── ProductPrice       ← ¥金色数字
└── BottomTabBar (App.tsx 全局)
```

### 9.3 组件规格

| 组件 | 高度 | 宽度 | 间距 | 关键样式 |
|------|------|------|------|---------|
| TabsBar | 自动(py:6) | 全屏-32 | gap:10 | radius-full, bg:#252540 |
| TabItem(激活) | py:6, px:14 | 自适应 | - | bg:#FF6B00, color:#FFF |
| SearchBar | 40px | 全屏-32 | mb:12 | radius:10px, bg:#1A1A32 |
| QuickEntryCard | 72px | (屏宽-42)/2 | gap:10 | radius:10px, bg:#181830 |
| EntryIconBox | 44×44 | - | mr:12 | radius:12px, bg:#1E1E3A |
| ProductCard | 自适应 | (屏宽-48)/3 | gap:8 | radius:8px, bg:#181830 |
| ProductImage | aspectRatio:1 | 100% | - | bg:#1E1E3A |
| WearTag | py:2, px:5 | 自适应 | - | radius:3px, 10px字号 |
| Price | - | - | - | 14px #F0C060 bold |

---

## 十、页面设计 — 列表页 (InventoryScreen / 库存)

### 10.1 信息架构

```
┌─────────────────────────────────┐
│  库存                   🔍 🔔  │  ← 顶部导航
├─────────────────────────────────┤
│  [全部] [崭新出厂] [略有磨损] ... │  ← 磨损筛选横滚
├─────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │ 🖼️  AWP | 龙王           │  │
│  │     崭新出厂  在售 ¥1280  │  │  ← 列表卡片 (横向布局)
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ 🖼️  AK-47 | 火蛇          │  │
│  │     略有磨损  在售 ¥3560  │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ 🖼️  M4A4 | 咆哮           │  │
│  │     久经沙场  在售 ¥8999  │  │
│  └──────────────────────────┘  │
│         ... 列表无限滚动 ...    │
├─────────────────────────────────┤
│  🏠 🎒 💰 🛒 👤  ← TabBar     │
└─────────────────────────────────┘
```

### 10.2 组件树

```
InventoryScreen
├── HeaderNav                     ← 标题"库存" + 右侧搜索/筛选icon
├── FilterTabs                    ← 水平滚动磨损筛选(与首页Tab同款组件)
│   └── FilterChip × 6           ← [全部|崭新出厂|...|战痕累累]
├── FlatList                      ← 高性能列表
│   └── InventoryCard × N         ← 横向布局卡片
│       ├── Thumbnail             ← 80×80 饰品缩略图
│       ├── InfoColumn            ← 右侧信息区
│       │   ├── ItemName          ← 名称 (text-md, medium)
│       │   ├── MetaRow           ← 磨损标签 + 状态
│       │   └── PriceRow          ← 价格 (金色)
│       └── ActionButton          ← "出售"/"下架" 快捷操作
└── BottomTabBar
```

### 10.3 列表卡片规格

| 属性 | 值 |
|------|-----|
| 卡片高度 | 96px |
| 缩略图 | 80×80, radius-md(8px) |
| 内边距 | padding:8px (卡片), padding:12px (信息区) |
| 卡片间距 | gap:8px |
| 背景 | #181830 |
| 分割线 | 无需分割线，卡片自带间隔 |

---

## 十一、页面设计 — 个人中心 (MineScreen / 我的)

### 11.1 信息架构

```
┌─────────────────────────────────┐
│  我的                     ⚙️    │  ← 设置齿轮
├─────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │  👤头像  用户名           │  │  ← 用户信息卡
│  │          UID: 730xxxx    │  │     bg:#181830 radius-xl
│  │  ──────────────────────  │  │
│  │  💰 余额       ¥ 12,580  │  │
│  │  📦 在售         3件     │  │
│  │  🛒 求购         1件     │  │
│  └──────────────────────────┘  │
├─────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │ 📋 我的订单           >  │  │  ← 功能菜单
│  │ 💬 消息中心       3 🔴  >  │  │     列表项 48px高
│  │ ❤️ 我的收藏           >  │  │     分割线 0.5px #252540
│  │ 🏷️ 优惠券             >  │  │
│  │ 📊 交易记录           >  │  │
│  └──────────────────────────┘  │
├─────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │ 🎮 绑定Steam          >  │  │
│  │ 🔐 安全中心           >  │  │
│  │ 🌐 语言 / Language   >  │  │
│  │ ℹ️ 关于 Go神 v1.0.0  >  │  │
│  └──────────────────────────┘  │
├─────────────────────────────────┤
│         [ 退出登录 ]           │  ← 红色文字按钮
├─────────────────────────────────┤
│  🏠 🎒 💰 🛒 👤  ← TabBar     │
└─────────────────────────────────┘
```

### 11.2 组件树

```
MineScreen
├── ScrollView
│   ├── UserCard                   ← 用户信息卡片
│   │   ├── Avatar                 ← 60×60 radius-full
│   │   ├── Username               ← 18px #FFF bold
│   │   ├── UID                    ← 12px #8E8E9E
│   │   └── StatsRow               ← 余额/在售/求购 3列
│   │       └── StatItem × 3       ← label + value
│   ├── MenuGroup "交易管理"        ← 分组标题 12px #5A5A72
│   │   └── MenuItem × 5           ← icon + label + 右箭头
│   │       └── Badge (可选)        ← 红点/数字角标
│   ├── MenuGroup "设置"
│   │   └── MenuItem × 4
│   └── LogoutButton               ← 居中红色文字 14px
└── BottomTabBar
```

### 11.3 组件规格

| 组件 | 高度 | 关键样式 |
|------|------|---------|
| UserCard | 自适应(p:16) | radius:12px, bg:#181830 |
| Avatar | 60×60 | radius:full, border 2px #FF6B00 |
| StatItem | 自适应 | 等宽分布, 数字18px #F0C060 |
| MenuGroup标题 | 32px | 12px #5A5A72, pl:20, pt:20 |
| MenuItem | 48px | 16px水平内边距, 分割线0.5px #252540 |
| MenuItem icon | 20×20 | mr:12 |
| LogoutButton | 44px | 14px #F44336, 居中 |
| 角标Badge | 16×16 | radius:full, #F44336, 11px #FFF |

---

## 十二、Figma 导入参数清单

### 12.1 颜色 (Color Styles)

```
Figma Color Style Name          HEX          Opacity
─────────────────────────────────────────────────────
Go/Bg/Primary                   #0D0D1A      100%
Go/Bg/Secondary                 #12122A      100%
Go/Bg/Card                      #181830      100%
Go/Bg/CardAlt                   #1E1E3A      100%
Go/Bg/Input                     #1A1A32      100%
Go/Bg/Overlay                   #000000      60%
Go/Accent/Primary               #FF6B00      100%
Go/Accent/Gold                  #F0C060      100%
Go/Accent/Success               #4CAF50      100%
Go/Accent/Warning               #FFC107      100%
Go/Accent/Danger                #F44336      100%
Go/Accent/Info                  #2196F3      100%
Go/Text/Primary                 #FFFFFF      100%
Go/Text/Secondary               #8E8E9E      100%
Go/Text/Tertiary                #5A5A72      100%
Go/Text/Price                   #F0C060      100%
Go/Text/OnAccent                #FFFFFF      100%
Go/Border/Default               #252540      100%
Go/Border/Light                 #1E1E3A      100%
Go/Border/Active                #FF6B00      100%
Go/Wear/FactoryNew              #4CAF50      100%
Go/Wear/MinimalWear             #8BC34A      100%
Go/Wear/FieldTested             #FFC107      100%
Go/Wear/WellWorn                #FF9800      100%
Go/Wear/BattleScarred           #F44336      100%
```

### 12.2 字号 (Text Styles)

```
Figma Text Style Name           Family         Size    Weight  LineH  Letter
──────────────────────────────────────────────────────────────────────────────
Go/H1/Title                     System         22px    Bold     1.2    0%
Go/H2/Section                   System         17px    Bold     1.2    0%
Go/H3/CardTitle                 System         15px    Semibold 1.2    0%
Go/Body/Large                   System         16px    Regular  1.4    0%
Go/Body/Default                 System         14px    Regular  1.4    0%
Go/Body/Small                   System         13px    Regular  1.4    0%
Go/Caption/Default              System         12px    Medium   1.3    0%
Go/Caption/Small                System         10px    Semibold 1.2    0%
Go/Price/Large                  System         18px    Bold     1.2    0%
Go/Price/Default                System         14px    Bold     1.2    0%
Go/Price/Small                  System         12px    Bold     1.2    0%
Go/Button/Primary               System         14px    Semibold 1.2    0%
Go/Button/Small                 System         12px    Semibold 1.2    0%
Go/Label/Tab                    System         13px    Semibold 1.2    0%
Go/Label/Tag                    System         10px    Semibold 1.2    0%
```

### 12.3 间距/圆角/组件尺寸 (Effect & Layout)

```
Figma Token Name                Value
─────────────────────────────────────────
Go/Radius/XS                    3px
Go/Radius/SM                    6px
Go/Radius/MD                    8px
Go/Radius/LG                    10px
Go/Radius/XL                    12px
Go/Radius/2XL                   16px
Go/Radius/Full                  9999px
Go/Spacing/1                    4px
Go/Spacing/2                    8px
Go/Spacing/3                    12px
Go/Spacing/4                    16px
Go/Spacing/5                    20px
Go/Spacing/6                    24px
Go/Spacing/8                    32px
Go/Spacing/10                   40px
Go/Shadow/Card                  0-2-8  rgba(0,0,0,0.4)
Go/Shadow/Button                0-4-12 rgba(255,107,0,0.3)
Go/Shadow/Modal                 0-8-32 rgba(0,0,0,0.6)
Go/Shadow/TabBar                0(-2)-8 rgba(0,0,0,0.3)
Go/Component/TabBar/Height      56px
Go/Component/SearchBar/Height   40px
Go/Component/MenuItem/Height    48px
Go/Component/Avatar/Size        60px
Go/Component/Thumbnail/Size     80px
Go/Component/EntryCard/Height   72px
Go/Screen/HorizontalPadding     16px
```

### 12.4 布局断点

```
Figma Frame Name                Width     说明
─────────────────────────────────────────────────
Go/Frame/iPhoneSE               375×812   小屏基准(现有代码基准)
Go/Frame/iPhone14               390×844   主流屏幕
Go/Frame/iPhone14ProMax         430×932   大屏适配
```

---

## 十三、与现有代码对照速查

| 代码变量 | 设计Token | 用途 |
|----------|-----------|------|
| `_C.bg = '#0d0d1a'` | `Go/Bg/Primary` | 页面根背景 |
| `_C.card = '#181830'` | `Go/Bg/Card` | 卡片容器 |
| `_C.cardImg = '#1e1e3a'` | `Go/Bg/CardAlt` | 图片占位 |
| `_C.accent = '#ff6b00'` | `Go/Accent/Primary` | CTA/激活态 |
| `_C.gold = '#f0c060'` | `Go/Accent/Gold` | 价格文字 |
| `_C.gray = '#8e8e9e'` | `Go/Text/Secondary` | 辅助文字 |
| `_C.gray2 = '#5a5a72'` | `Go/Text/Tertiary` | 弱文字 |
| `_C.border = '#252540'` | `Go/Border/Default` | 边框/分割 |
| `_C.input = '#1a1a32'` | `Go/Bg/Input` | 输入框背景 |
| `_barStyle.backgroundColor` | `Go/Bg/Secondary` | TabBar背景 |
| `_barStyle.borderTopColor` | `Go/Border/Light` | TabBar顶部分割 |
| `_wearColor` map | `Go/Wear/*` | 磨损标签5色 |
| `_cardW` = `(sw - 32 - 8*2) / 3` | 3列网格 | `Go/Layout/Grid/3Col` |
| `_entryW` = `(sw - 32 - 10) / 2` | 2列网格 | `Go/Layout/Grid/2Col` |

---

## 十四、Figma 快速设置步骤

1. 创建新文件 → 设置页面尺寸 375×812
2. **Color Styles**: 按 §12.1 表格在右侧 Local Styles 逐个创建
3. **Text Styles**: 按 §12.2 表格创建，注意选系统默认字体
4. **Effects**: 新建4个 Drop Shadow effect styles
5. **Auto Layout**: 建议开启，卡片/列表项全部使用 Auto Layout
6. **命名规范**: 统一 `Go/类别/Token` 格式，方便导出
