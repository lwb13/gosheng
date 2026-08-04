/* ================================================================
 * AnimatedSplash — Go神 品牌闪屏动画
 *
 * 帧一: GO神 Logo + 滑动解锁 (~1800ms)
 *       → 背景底纹 → 标题光晕 → 装饰线 → 副标题 →
 *         滑块自动右滑 → "进入市场" 出现 → 停顿
 * 帧二: CS2 警匪对拼动画 (~1600ms)
 *
 * 帧一→帧二用 Animated.sequence 串联，帧二结束后调用 onFinish()
 * ================================================================ */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  Text,
  Easing,
} from 'react-native';
import {
  CT_BLUE,
  CT_HEAD,
  T_YELLOW,
  T_HEAD,
  GUNFIRE,
  BG_DARK,
  WHITE,
  SMOKE,
  ACCENT,
} from './designTokens';

/* ────────── 屏幕尺寸 ────────── */
var SW = Dimensions.get('window').width;
var SH = Dimensions.get('window').height;

/* ────────── 帧二 角色定位常量 ────────── */
var CT_TARGET_X = SW * 0.2;
var T_TARGET_X  = SW * 0.8 - 60;
var CHAR_W      = 60;
var CHAR_H      = 140;

/* ────────── 帧一 滑块尺寸 ────────── */
var TRACK_W      = SW * 0.68;
var TRACK_H      = 5;
var THUMB_SIZE   = 42;
var THUMB_TRAVEL = TRACK_W - THUMB_SIZE;

/* ────────── 帧二 火花固定位置 ────────── */
var SPARK_POSITIONS = [
  { top: SH * 0.32, left: SW * 0.35 },
  { top: SH * 0.28, left: SW * 0.45 },
  { top: SH * 0.36, left: SW * 0.50 },
  { top: SH * 0.26, left: SW * 0.55 },
  { top: SH * 0.34, left: SW * 0.60 },
  { top: SH * 0.30, left: SW * 0.65 },
];

/* ────────── 帧一 背景底纹文案 ────────── */
var WATERMARK_TEXTS = ['RIKE', 'SIVE', 'TRADE', 'CS:GO', 'SKIN'];

interface SplashProps { onFinish: () => void }

/* ================================================================
 * 主组件
 * ================================================================ */
export default function AnimatedSplash(props: SplashProps) {
  var onFinish        = props.onFinish;

  /* ──── 帧一动画值 ──── */
  var f1TitleO        = useRef(new Animated.Value(0)).current;   // 标题 opacity
  var f1TitleY        = useRef(new Animated.Value(8)).current;   // 标题微上移
  var f1LineW         = useRef(new Animated.Value(0)).current;   // 装饰线宽度
  var f1SubO          = useRef(new Animated.Value(0)).current;   // 副标题 opacity
  var f1ThumbX        = useRef(new Animated.Value(0)).current;   // 滑块 thumb translateX
  var f1EnterO        = useRef(new Animated.Value(0)).current;   // "进入市场" opacity
  var f1VersionO      = useRef(new Animated.Value(0)).current;   // 版本号 opacity
  var f1ContainerO    = useRef(new Animated.Value(1)).current;   // 帧一容器整体

  /* ──── 帧二控制 ──── */
  const [showFight, setShowFight] = useState(false);
  var fightOpacity    = useRef(new Animated.Value(1)).current;

  /* ──── 帧二 CT ──── */
  var ctX = useRef(new Animated.Value(-80)).current;
  var ctO = useRef(new Animated.Value(0)).current;

  /* ──── 帧二 T ──── */
  var tX = useRef(new Animated.Value(80)).current;
  var tO = useRef(new Animated.Value(0)).current;

  /* ──── 帧二 VS ──── */
  var vsO = useRef(new Animated.Value(0)).current;
  var vsS = useRef(new Animated.Value(0.5)).current;

  /* ──── 帧二 枪火 ──── */
  var gunO = useRef(new Animated.Value(0)).current;

  /* ──── 帧二 火花 ──── */
  var sparkO = useRef(new Animated.Value(0)).current;
  var sparkS = useRef(new Animated.Value(0)).current;

  /* ──── 帧二 烟雾 ──── */
  var smokeO = useRef(new Animated.Value(0)).current;
  var smokeS = useRef(new Animated.Value(0.8)).current;

  /* ──── 帧二 白色转场 ──── */
  var whiteO = useRef(new Animated.Value(0)).current;

  /* ================================================================
   * 帧一 动画编排
   * ================================================================ */
  useEffect(function () {
    /* 标题组：标题上浮 + 淡入 + 光晕 */
    var titleAnim = Animated.parallel([
      Animated.timing(f1TitleO, {
        toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
      Animated.timing(f1TitleY, {
        toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
    ]);

    /* 装饰线：宽度展开 */
    var lineAnim = Animated.timing(f1LineW, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    });

    /* 副标题：延迟后淡入 */
    var subAnim = Animated.timing(f1SubO, {
      toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true,
    });

    /* 标题+线+副标题 序列 */
    var titleGroup = Animated.sequence([
      Animated.parallel([titleAnim, lineAnim]),
      Animated.delay(80),
      subAnim,
      Animated.delay(150),
    ]);

    /* 滑块：从左滑到右 */
    var sliderAnim = Animated.timing(f1ThumbX, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    /* "进入市场" 文字在滑块动画尾部提前出现 */
    var enterAnim = Animated.timing(f1EnterO, {
      toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true,
    });

    /* 版本号延迟淡入 */
    var versionAnim = Animated.timing(f1VersionO, {
      toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
    });

    /* 组装帧一完整时间线 */
    var frame1 = Animated.sequence([
      /* ① 标题组出现 */
      titleGroup,
      /* ② 滑块自动滑动 + "进入市场"文字稍后出现 */
      Animated.parallel([
        sliderAnim,
        Animated.sequence([
          Animated.delay(300),
          enterAnim,
        ]),
      ]),
      /* ③ 版本号 */
      versionAnim,
      /* ④ 停留片刻 */
      Animated.delay(400),
    ]);

    frame1.start(function () {
      setShowFight(true);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================
   * 帧二 动画编排（showFight 变 true 时触发）
   * ================================================================ */
  useEffect(function () {
    if (!showFight) return;

    /* 阶段1: CT 左侧入场 (0-300ms) */
    var ctEnter = Animated.parallel([
      Animated.timing(ctX, { toValue: CT_TARGET_X, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(ctO, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]);

    /* 阶段2: T 右侧入场 (延迟200ms, 300ms) */
    var tEnter = Animated.parallel([
      Animated.timing(tX, { toValue: T_TARGET_X, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(tO, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]);

    var charactersEnter = Animated.parallel([
      ctEnter,
      Animated.sequence([Animated.delay(200), tEnter]),
    ]);

    /* 阶段3: 交火高潮 */
    var vsAnim = Animated.parallel([
      Animated.timing(vsO, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(vsS, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]);

    var gunFlash = Animated.sequence([
      Animated.timing(gunO, { toValue: 1, duration: 75, useNativeDriver: true }),
      Animated.timing(gunO, { toValue: 0, duration: 75, useNativeDriver: true }),
      Animated.timing(gunO, { toValue: 1, duration: 75, useNativeDriver: true }),
      Animated.timing(gunO, { toValue: 0, duration: 75, useNativeDriver: true }),
    ]);

    var sparkAnim = Animated.sequence([
      Animated.parallel([
        Animated.timing(sparkO, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(sparkS, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(sparkO, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);

    var smokeAnim = Animated.parallel([
      Animated.timing(smokeO, { toValue: 0.2, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(smokeS, { toValue: 1.2, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]);

    var fightClimax = Animated.parallel([
      vsAnim,
      Animated.sequence([Animated.delay(100), gunFlash]),
      sparkAnim,
      smokeAnim,
    ]);

    /* 阶段4: 闪光转场 */
    var whiteFlash = Animated.sequence([
      Animated.timing(whiteO, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(whiteO, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(fightOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
      Animated.timing(whiteO, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);

    Animated.sequence([
      charactersEnter,
      fightClimax,
      whiteFlash,
    ]).start(function () {
      onFinish();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFight]);

  /* ================================================================
   * 渲染
   * ================================================================ */

  /* ──── 帧一: GO神 欢迎页 ──── */
  var frame1View = (
    <Animated.View
      style={[_s.frame, { opacity: showFight ? 0 : f1ContainerO }]}
      key="frame1"
    >
      {/* ══ 底纹装饰文字 ══ */}
      {WATERMARK_TEXTS.map(function (word, i) {
        return (
          <Text
            key={'wm-' + i}
            style={[
              _s.watermark,
              {
                top: SH * (0.08 + i * 0.18),
                left: SW * ((i % 2 === 0) ? 0.05 : 0.55),
                fontSize: (i === 1 || i === 3) ? 38 : 28,
              },
            ]}
          >
            {word}
          </Text>
        );
      })}

      {/* ══ 主标题组（居中靠上） ══ */}
      <View style={_s.titleGroup}>
        {/* 主标题 GO神 — 暖橙黄+光晕 */}
        <Animated.View
          style={[
            _s.titleInner,
            {
              opacity: f1TitleO,
              transform: [{ translateY: f1TitleY }],
            },
          ]}
        >
          <Text style={_s.titleTxt}>GO神</Text>
        </Animated.View>

        {/* 装饰线 */}
        <Animated.View
          style={[
            _s.decoLine,
            {
              width: f1LineW.interpolate({
                inputRange: [0, 1],
                outputRange: [0, SW * 0.16],
              }),
            },
          ]}
        />

        {/* 副标题 */}
        <Animated.View style={{ opacity: f1SubO, marginTop: 10 }}>
          <Text style={_s.subTxt}>· 为热爱而生</Text>
        </Animated.View>
      </View>

      {/* ══ 中部偏下：滑动组件 ══ */}
      <View style={_s.sliderGroup}>
        {/* 滑轨 + 滑块 */}
        <View style={_s.trackWrap}>
          {/* 滑轨背景 */}
          <View style={_s.track} />
          {/* 滑块圆形按钮 — 从左侧滑动到右侧 */}
          <Animated.View
            style={[
              _s.thumb,
              {
                transform: [{
                  translateX: f1ThumbX.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, THUMB_TRAVEL],
                  }),
                }],
              },
            ]}
          >
            <Text style={_s.thumbCheck}>✓</Text>
          </Animated.View>
        </View>

        {/* 进入市场文字 — 滑块滑动时浮现 */}
        <Animated.View style={{ opacity: f1EnterO, marginTop: 14 }}>
          <Text style={_s.enterTxt}>进入市场 →</Text>
        </Animated.View>
      </View>

      {/* ══ 底部版本号 ══ */}
      <Animated.View style={[_s.versionWrap, { opacity: f1VersionO }]}>
        <Text style={_s.versionTxt}>v1.0.0</Text>
      </Animated.View>
    </Animated.View>
  );

  /* ──── 帧二: CS2 对拼 ──── */
  var fightView = !showFight ? null : (
    <Animated.View style={[_s.frame, { opacity: fightOpacity }]} key="frame2">

      {/* CT 角色 */}
      <Animated.View style={[_s.charContainer, { transform: [{ translateX: ctX }], opacity: ctO }]}>
        <View style={[_s.head, { backgroundColor: CT_HEAD }]} />
        <View style={[_s.body, { backgroundColor: CT_BLUE }]}>
          <View style={[_s.bodyLine, { marginTop: CHAR_H * 0.15 }]} />
          <View style={[_s.bodyLine, { marginTop: CHAR_H * 0.25 }]} />
        </View>
        <View style={[_s.weapon, _s.weaponRight, { backgroundColor: CT_HEAD }]} />
        <Animated.View style={[_s.gunFlash, _s.gunFlashRight, { opacity: gunO }]} />
        <Animated.View style={[_s.smoke, { opacity: Animated.multiply(smokeO, 0.5), transform: [{ scale: smokeS }] }]} />
      </Animated.View>

      {/* T 角色 */}
      <Animated.View style={[_s.charContainer, { transform: [{ translateX: tX }], opacity: tO }]}>
        <View style={[_s.head, { backgroundColor: T_HEAD }]} />
        <View style={[_s.body, { backgroundColor: T_YELLOW }]}>
          <View style={[_s.bodyLine, { marginTop: CHAR_H * 0.15 }]} />
          <View style={[_s.bodyLine, { marginTop: CHAR_H * 0.25 }]} />
        </View>
        <View style={[_s.weapon, _s.weaponLeft, { backgroundColor: T_HEAD }]} />
        <Animated.View style={[_s.gunFlash, _s.gunFlashLeft, { opacity: gunO }]} />
        <Animated.View style={[_s.smoke, { opacity: Animated.multiply(smokeO, 0.5), transform: [{ scale: smokeS }] }]} />
      </Animated.View>

      {/* VS 文字 */}
      <Animated.View style={[_s.vsWrap, { opacity: vsO, transform: [{ scale: vsS }] }]}>
        <Text style={_s.vsTxt}>VS</Text>
      </Animated.View>

      {/* 火花 */}
      <Animated.View style={[_s.sparkContainer, { opacity: sparkO, transform: [{ scale: sparkS }] }]} pointerEvents="none">
        {SPARK_POSITIONS.map(function (pos, idx) {
          return (
            <View
              key={'spark-' + idx}
              style={[_s.sparkDot, { top: pos.top - SH * 0.35, left: pos.left - SW * 0.5 }]}
            />
          );
        })}
      </Animated.View>

      {/* 白色转场层 */}
      <Animated.View style={[_s.whiteOverlay, { opacity: whiteO }]} pointerEvents="none" />
    </Animated.View>
  );

  return (
    <View style={_s.root}>
      {frame1View}
      {fightView}
    </View>
  );
}

/* ================================================================
 * 样式表
 * ================================================================ */
var _s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BG_DARK },
  frame: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },

  /* ──── 帧一 背景底纹 ──── */
  watermark: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.04)',
    fontWeight: '700',
    letterSpacing: 8,
    fontFamily: 'System',
  },

  /* ──── 帧一 标题组 ──── */
  titleGroup: {
    position: 'absolute',
    top: SH * 0.22,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  titleInner: {
    alignItems: 'center',
  },
  titleTxt: {
    fontSize: 48,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: 8,
    textShadowColor: 'rgba(255,107,0,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  decoLine: {
    height: 3,
    backgroundColor: ACCENT,
    borderRadius: 1.5,
    marginTop: 6,
  },
  subTxt: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 4,
  },

  /* ──── 帧一 滑动组件 ──── */
  sliderGroup: {
    position: 'absolute',
    top: SH * 0.52,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  trackWrap: {
    width: TRACK_W,
    height: Math.max(TRACK_H, THUMB_SIZE),
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: '#3A3A4A',
  },
  thumb: {
    position: 'absolute',
    top: (Math.max(TRACK_H, THUMB_SIZE) - THUMB_SIZE) / 2,
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  thumbCheck: {
    fontSize: 22,
    fontWeight: '700',
    color: WHITE,
  },

  enterTxt: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 2,
  },

  /* ──── 帧一 版本号 ──── */
  versionWrap: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionTxt: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
  },

  /* ──── 帧二 角色 ──── */
  charContainer: {
    position: 'absolute',
    top: SH * 0.5 - CHAR_H * 0.65,
    width: CHAR_W,
    alignItems: 'center',
  },
  head: {
    width: 28, height: 32,
    borderTopLeftRadius: 14, borderTopRightRadius: 14,
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    zIndex: 2,
  },
  body: {
    width: CHAR_W, height: CHAR_H,
    borderRadius: 8, marginTop: -4,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
  },
  bodyLine: {
    width: CHAR_W * 0.7, height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1, marginBottom: 8,
  },
  weapon: {
    position: 'absolute', top: 40, height: 8, width: 36, borderRadius: 3,
  },
  weaponRight: { right: -30, borderTopRightRadius: 1, borderBottomRightRadius: 1 },
  weaponLeft:  { left: -30,  borderTopLeftRadius: 1,  borderBottomLeftRadius: 1 },

  /* ──── 帧二 枪火 ──── */
  gunFlash: {
    position: 'absolute', top: 36,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: GUNFIRE,
  },
  gunFlashRight: { right: -52 },
  gunFlashLeft:  { left: -52 },

  /* ──── 帧二 烟雾 ──── */
  smoke: {
    position: 'absolute', bottom: -CHAR_H * 0.2,
    width: 80, height: 20, borderRadius: 10,
    backgroundColor: SMOKE,
  },

  /* ──── 帧二 VS ──── */
  vsWrap: {
    position: 'absolute', top: SH * 0.5 - 40, left: SW * 0.5 - 40,
    width: 80, height: 80,
    justifyContent: 'center', alignItems: 'center',
  },
  vsTxt: { fontSize: 48, fontWeight: '800', color: WHITE, opacity: 0.7, letterSpacing: 2 },

  /* ──── 帧二 火花 ──── */
  sparkContainer: {
    position: 'absolute', top: SH * 0.35, left: SW * 0.5,
    width: 0, height: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  sparkDot: {
    position: 'absolute',
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: GUNFIRE,
  },

  /* ──── 帧二 白色转场 ──── */
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: WHITE,
  },
});
