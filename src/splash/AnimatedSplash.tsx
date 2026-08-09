/* ================================================================
 * AnimatedSplash — Go神 品牌闪屏动画
 *
 * 帧一: GO神 Logo + 手动滑动解锁
 * 帧二: 图片动态化 — 淡入缩放 → 白色转场
 * ================================================================ */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  Text,
  Image,
  Easing,
  PanResponder,
} from 'react-native';
import {
  BG_DARK,
  WHITE,
  ACCENT,
} from './designTokens';

/* ────────── 屏幕尺寸 ────────── */
var SW = Dimensions.get('window').width;
var SH = Dimensions.get('window').height;

/* ────────── 帧一 滑块尺寸 ────────── */
var TRACK_W      = SW * 0.68;
var TRACK_H      = 5;
var THUMB_SIZE   = 42;
var THUMB_TRAVEL = TRACK_W - THUMB_SIZE;

/* ────────── 帧一 背景底纹文案 ────────── */
var WATERMARK_TEXTS = ['RIKE', 'SIVE', 'TRADE', 'CS:GO', 'SKIN'];

interface SplashProps { onFinish: () => void }

export default function AnimatedSplash(props: SplashProps) {
  var onFinish = props.onFinish;

  /* ──── 帧一动画值 ──── */
  var f1TitleO     = useRef(new Animated.Value(0)).current;
  var f1TitleY     = useRef(new Animated.Value(8)).current;
  var f1LineW      = useRef(new Animated.Value(0)).current;
  var f1SubO       = useRef(new Animated.Value(0)).current;
  var f1EnterO     = useRef(new Animated.Value(0)).current;
  var f1VersionO   = useRef(new Animated.Value(0)).current;
  var f1ContainerO = useRef(new Animated.Value(1)).current;

  /* ──── 帧一 手动滑块 ──── */
  var thumbPos    = useRef(new Animated.Value(0)).current;
  var trackFill   = useRef(new Animated.Value(0)).current;
  var thumbScale  = useRef(new Animated.Value(1)).current;
  var hintOpacity = useRef(new Animated.Value(1)).current;
  var isUnlocked  = useRef(false);

  /* ──── 帧二控制 ──── */
  const [showFight, setShowFight] = useState(false);
  var fightOpacity = useRef(new Animated.Value(1)).current;

  /* ──── 帧二 图片动画 ──── */
  var imgOpacity = useRef(new Animated.Value(0)).current;
  var imgScale   = useRef(new Animated.Value(1.08)).current;

  /* ──── 帧二 白色转场 ──── */
  var whiteO = useRef(new Animated.Value(0)).current;

  /* ================================================================
   * 帧一 手动滑块 — PanResponder
   * ================================================================ */
  var panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: function () { return !isUnlocked.current; },
    onMoveShouldSetPanResponder: function () { return !isUnlocked.current; },

    onPanResponderGrant: function () {
      Animated.spring(thumbScale, { toValue: 1.2, friction: 6, useNativeDriver: true }).start();
      Animated.timing(hintOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    },

    onPanResponderMove: function (_, gs) {
      var clamped = Math.max(0, Math.min(gs.dx, THUMB_TRAVEL));
      thumbPos.setValue(clamped);
      trackFill.setValue(clamped / THUMB_TRAVEL);
    },

    onPanResponderRelease: function (_, gs) {
      Animated.spring(thumbScale, { toValue: 1, friction: 6, useNativeDriver: true }).start();

      if (gs.dx > THUMB_TRAVEL * 0.78) {
        isUnlocked.current = true;
        Animated.parallel([
          Animated.timing(thumbPos,  { toValue: THUMB_TRAVEL, duration: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(trackFill, { toValue: 1, duration: 150, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        ]).start(function () {
          Animated.timing(f1EnterO, {
            toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }).start(function () {
            Animated.timing(f1VersionO, {
              toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true,
            }).start(function () {
              setTimeout(function () { setShowFight(true); }, 500);
            });
          });
        });
      } else {
        Animated.parallel([
          Animated.spring(thumbPos,  { toValue: 0, friction: 5, useNativeDriver: true }),
          Animated.timing(trackFill, { toValue: 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: false }),
          Animated.timing(hintOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      }
    },
  })).current;

  /* ================================================================
   * 帧一 自动动画: 标题 + 线 + 副标题
   * ================================================================ */
  useEffect(function () {
    var titleAnim = Animated.parallel([
      Animated.timing(f1TitleO, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(f1TitleY, { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]);
    var lineAnim = Animated.timing(f1LineW, { toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: false });
    var subAnim = Animated.timing(f1SubO, { toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true });
    Animated.sequence([
      Animated.parallel([titleAnim, lineAnim]),
      Animated.delay(80),
      subAnim,
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================
   * 帧二 动画编排 — 图片淡入缩放 + 白色转场
   * ================================================================ */
  useEffect(function () {
    if (!showFight) return;

    Animated.sequence([
      /* ① 图片淡入 + 微缩放 (1.08x → 1.0x) */
      Animated.parallel([
        Animated.timing(imgOpacity, {
          toValue: 1, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(imgScale, {
          toValue: 1, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true,
        }),
      ]),
      /* ② 停留 */
      Animated.delay(600),
      /* ③ 白色转场 */
      Animated.sequence([
        Animated.timing(whiteO, { toValue: 0.75, duration: 200, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(whiteO, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(fightOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
        Animated.timing(whiteO, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(function () {
      onFinish();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFight]);

  /* ================================================================
   * 渲染
   * ================================================================ */

  var frame1View = (
    <Animated.View style={[_s.frame, { opacity: showFight ? 0 : f1ContainerO }]} key="frame1">
      {WATERMARK_TEXTS.map(function (word, i) {
        return (
          <Text key={'wm-' + i} style={[_s.watermark, {
            top: SH * (0.08 + i * 0.18),
            left: SW * ((i % 2 === 0) ? 0.05 : 0.55),
            fontSize: (i === 1 || i === 3) ? 38 : 28,
          }]}>{word}</Text>
        );
      })}
      <View style={_s.titleGroup}>
        <Animated.View style={[_s.titleInner, { opacity: f1TitleO, transform: [{ translateY: f1TitleY }] }]}>
          <Text style={_s.titleTxt}>GO神</Text>
        </Animated.View>
        <Animated.View style={[_s.decoLine, {
          width: f1LineW.interpolate({ inputRange: [0, 1], outputRange: [0, SW * 0.16] }),
        }]} />
        <Animated.View style={{ opacity: f1SubO, marginTop: 10 }}>
          <Text style={_s.subTxt}>· 为热爱而生</Text>
        </Animated.View>
      </View>
      <View style={_s.sliderGroup}>
        <View style={_s.trackWrap}>
          <View style={_s.track} />
          <Animated.View style={[_s.trackFill, {
            width: trackFill.interpolate({ inputRange: [0, 1], outputRange: [0, TRACK_W] }),
          }]} />
          <Animated.View
            {...panResponder.panHandlers}
            style={[_s.thumb, { transform: [{ translateX: thumbPos }, { scale: thumbScale }] }]}
          >
            <Text style={_s.thumbArrow}>→</Text>
          </Animated.View>
        </View>
        <Animated.View style={{ opacity: hintOpacity, marginTop: 12 }}>
          <Text style={_s.hintTxt}>← 滑动解锁</Text>
        </Animated.View>
        <Animated.View style={{ opacity: f1EnterO, marginTop: 14 }}>
          <Text style={_s.enterTxt}>进入市场 →</Text>
        </Animated.View>
      </View>
      <Animated.View style={[_s.versionWrap, { opacity: f1VersionO }]}>
        <Text style={_s.versionTxt}>v1.0.0</Text>
      </Animated.View>
    </Animated.View>
  );

  var fightView = !showFight ? null : (
    <Animated.View style={[_s.frame, { opacity: fightOpacity }]} key="frame2">
      <Animated.Image
        source={require('../../assets/fight-scene.png')}
        style={[_s.fightImage, { opacity: imgOpacity, transform: [{ scale: imgScale }] }]}
        resizeMode="cover"
      />
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

var _s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BG_DARK },
  frame: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },

  /* ──── 帧一 ──── */
  watermark: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.04)',
    fontWeight: '700',
    letterSpacing: 8,
    fontFamily: 'System',
  },
  titleGroup: {
    position: 'absolute',
    top: SH * 0.22,
    left: 0, right: 0,
    alignItems: 'center',
  },
  titleInner: { alignItems: 'center' },
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
  sliderGroup: {
    position: 'absolute',
    top: SH * 0.52,
    left: 0, right: 0,
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
    position: 'absolute',
    top: (Math.max(TRACK_H, THUMB_SIZE) - TRACK_H) / 2,
    left: 0,
  },
  trackFill: {
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: ACCENT,
    position: 'absolute',
    top: (Math.max(TRACK_H, THUMB_SIZE) - TRACK_H) / 2,
    left: 0,
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
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 2,
  },
  thumbArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  hintTxt: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2,
  },
  enterTxt: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 2,
  },
  versionWrap: {
    position: 'absolute',
    bottom: 40,
    left: 0, right: 0,
    alignItems: 'center',
  },
  versionTxt: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
  },

  /* ──── 帧二 ──── */
  fightImage: {
    ...StyleSheet.absoluteFillObject,
    width: SW,
    height: SH,
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: WHITE,
  },
});
