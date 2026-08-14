/* ================================================================
 * AuthModal — 登录/注册/忘记密码 弹窗
 *
 * 黑灰极简现代风，同一弹窗内三视图切换，透明度淡入过渡
 * 结构清晰：常量 → 类型 → 校验逻辑 → 输入组件 → 主组件
 * ================================================================ */

import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

/* ================================================================
 * 色彩常量（规范色值）
 * ================================================================ */
var AUTH = {
  pageBg:       '#191A1F',  // 全局页面背景
  cardBg:       '#24252B',  // 弹窗卡片背景
  inputBg:      '#2E3038',  // 输入框背景
  primary:      '#2978e0',  // 主按钮蓝色
  primaryDim:   '#1f5db0',  // 主按钮按下
  white:        '#FFFFFF',  // 主文字
  secondary:    '#B0B2BD',  // 辅助文字
  placeholder:  '#767884',  // 占位文字
  error:        '#f26b6b',  // 错误提示
  focusBorder:  'rgba(41,120,224,0.6)', // 聚焦描边
  maxCardW:     420,        // 卡片最大宽度
} as const;

/* ================================================================
 * 类型定义
 * ================================================================ */
type ViewMode = 'login' | 'register' | 'forgot';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

/* 各视图错误信息结构 */
interface LoginErrors   { account?: string; password?: string; }
interface RegisterErrors { account?: string; password?: string; confirm?: string; }
interface ForgotErrors  { account?: string; code?: string; password?: string; confirm?: string; }

/* ================================================================
 * 校验逻辑（纯函数，与视图渲染分离）
 * ================================================================ */
function validateLogin(account: string, password: string): LoginErrors {
  var err: LoginErrors = {};
  if (!account.trim()) err.account = '请输入账号';
  if (!password) err.password = '请输入密码';
  return err;
}

function validateRegister(account: string, password: string, confirm: string): RegisterErrors {
  var err: RegisterErrors = {};
  if (!account.trim()) err.account = '请输入账号';
  if (!password) err.password = '请设置密码';
  else if (password.length < 6) err.password = '密码至少 6 位';
  if (!confirm) err.confirm = '请确认密码';
  else if (confirm !== password) err.confirm = '两次密码不一致';
  return err;
}

function validateForgot(account: string, code: string, password: string, confirm: string): ForgotErrors {
  var err: ForgotErrors = {};
  if (!account.trim()) err.account = '请输入绑定账号';
  if (!code.trim()) err.code = '请输入验证码';
  if (!password) err.password = '请输入新密码';
  else if (password.length < 6) err.password = '密码至少 6 位';
  if (!confirm) err.confirm = '请确认新密码';
  else if (confirm !== password) err.confirm = '两次密码不一致';
  return err;
}

/* ================================================================
 * 输入框组件（可复用，含密码眼睛切换与聚焦描边）
 * ================================================================ */
interface FormFieldProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  withEye?: boolean;               // 是否带密码可见性切换
  keyboardType?: 'default' | 'email-address';
  returnKeyType?: 'next' | 'done' | 'go';
  onSubmitEditing?: () => void;
}

function FormField(props: FormFieldProps) {
  var p = props;
  var [focused, setFocused] = useState(false);
  var [hidden, setHidden] = useState(true);  // 密码默认隐藏

  var borderColor = p.error
    ? AUTH.error
    : focused
      ? AUTH.focusBorder
      : 'transparent';

  return (
    <View style={_s.fieldWrap}>
      <View style={[_s.inputRow, { borderColor: borderColor }]}>
        <TextInput
          style={_s.input}
          value={p.value}
          onChangeText={p.onChangeText}
          placeholder={p.placeholder}
          placeholderTextColor={AUTH.placeholder}
          secureTextEntry={p.withEye ? hidden : p.secureTextEntry}
          keyboardType={p.keyboardType || 'default'}
          returnKeyType={p.returnKeyType || 'next'}
          onSubmitEditing={p.onSubmitEditing}
          onFocus={function () { setFocused(true); }}
          onBlur={function () { setFocused(false); }}
          autoCapitalize="none"
        />
        {/* 密码眼睛切换 */}
        {p.withEye ? (
          <TouchableOpacity
            style={_s.eyeBtn}
            activeOpacity={0.6}
            onPress={function () { setHidden(!hidden); }}
          >
            <Text style={[_s.eyeIcon, { opacity: hidden ? 0.4 : 1 }]}>👁</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {/* 错误提示 */}
      {p.error ? <Text style={_s.errTxt}>{p.error}</Text> : null}
    </View>
  );
}

/* ================================================================
 * 文字链接（悬浮提亮）
 * ================================================================ */
function LinkText(props: { text: string; onPress: () => void; bold?: boolean }) {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={props.onPress}>
      <Text style={[_s.linkTxt, props.bold ? _s.linkTxtBold : null]}>{props.text}</Text>
    </TouchableOpacity>
  );
}

/* ================================================================
 * 主组件
 * ================================================================ */
export default function AuthModal(props: AuthModalProps) {
  var onClose = props.onClose;

  /* ──── 视图切换状态 ──── */
  var [view, setView] = useState<ViewMode>('login');

  /* ──── 登录表单 ──── */
  var [loginAccount,  setLoginAccount]  = useState('');
  var [loginPassword, setLoginPassword] = useState('');
  var [loginErr,      setLoginErr]      = useState<LoginErrors>({});

  /* ──── 注册表单 ──── */
  var [regAccount,  setRegAccount]  = useState('');
  var [regPassword, setRegPassword] = useState('');
  var [regConfirm,  setRegConfirm]  = useState('');
  var [regErr,      setRegErr]      = useState<RegisterErrors>({});

  /* ──── 忘记密码表单 ──── */
  var [forgotAccount,  setForgotAccount]  = useState('');
  var [forgotCode,     setForgotCode]     = useState('');
  var [forgotPassword, setForgotPassword] = useState('');
  var [forgotConfirm,  setForgotConfirm]  = useState('');
  var [forgotErr,      setForgotErr]      = useState<ForgotErrors>({});

  /* ──── 淡入过渡动画 ──── */
  var fadeAnim = useRef(new Animated.Value(1)).current;

  /* 切换视图 + 淡入 */
  function switchView(mode: ViewMode) {
    setView(mode);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true,
    }).start();
  }

  /* ──── 提交处理 ──── */
  function handleLogin() {
    var err = validateLogin(loginAccount, loginPassword);
    setLoginErr(err);
    if (Object.keys(err).length === 0) onClose(); // 校验通过，模拟登录成功关闭
  }

  function handleRegister() {
    var err = validateRegister(regAccount, regPassword, regConfirm);
    setRegErr(err);
    if (Object.keys(err).length === 0) onClose();
  }

  function handleForgot() {
    var err = validateForgot(forgotAccount, forgotCode, forgotPassword, forgotConfirm);
    setForgotErr(err);
    if (Object.keys(err).length === 0) {
      switchView('login'); // 重置成功返回登录
    }
  }

  /* ================================================================
   * 渲染
   * ================================================================ */
  return (
    <Modal visible={props.visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={_s.page}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[_s.card, { opacity: fadeAnim }]}>
          {view === 'login' ? (
            /* ──────────── 登录视图 ──────────── */
            <View>
              <Text style={_s.title}>登录</Text>
              <Text style={_s.subtitle}>登录以使用软件全部功能</Text>

              <FormField
                value={loginAccount}
                onChangeText={function (t) { setLoginAccount(t); setLoginErr({}); }}
                placeholder="账号/邮箱"
                error={loginErr.account}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={function () { /* 跳转到密码框由聚焦控制 */ }}
              />
              <FormField
                value={loginPassword}
                onChangeText={function (t) { setLoginPassword(t); setLoginErr({}); }}
                placeholder="密码"
                error={loginErr.password}
                withEye
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                style={_s.primaryBtn}
                activeOpacity={0.85}
                onPress={handleLogin}
              >
                <Text style={_s.primaryBtnTxt}>登录</Text>
              </TouchableOpacity>

              <View style={_s.linkRow}>
                <LinkText text="忘记密码？" onPress={function () { switchView('forgot'); }} />
                <LinkText text="没有账号？去注册" bold onPress={function () { switchView('register'); }} />
              </View>
            </View>
          ) : view === 'register' ? (
            /* ──────────── 注册视图 ──────────── */
            <View>
              <Text style={_s.title}>创建账号</Text>

              <FormField
                value={regAccount}
                onChangeText={function (t) { setRegAccount(t); setRegErr({}); }}
                placeholder="账号"
                error={regErr.account}
                keyboardType="email-address"
                returnKeyType="next"
              />
              <FormField
                value={regPassword}
                onChangeText={function (t) { setRegPassword(t); setRegErr({}); }}
                placeholder="设置密码"
                error={regErr.password}
                withEye
                returnKeyType="next"
              />
              <FormField
                value={regConfirm}
                onChangeText={function (t) { setRegConfirm(t); setRegErr({}); }}
                placeholder="确认密码"
                error={regErr.confirm}
                withEye
                returnKeyType="go"
                onSubmitEditing={handleRegister}
              />

              <TouchableOpacity
                style={_s.primaryBtn}
                activeOpacity={0.85}
                onPress={handleRegister}
              >
                <Text style={_s.primaryBtnTxt}>注册</Text>
              </TouchableOpacity>

              <View style={_s.linkRowCenter}>
                <LinkText text="已有账号？返回登录" onPress={function () { switchView('login'); }} />
              </View>
            </View>
          ) : (
            /* ──────────── 忘记密码视图 ──────────── */
            <View>
              <Text style={_s.title}>重置密码</Text>

              <FormField
                value={forgotAccount}
                onChangeText={function (t) { setForgotAccount(t); setForgotErr({}); }}
                placeholder="绑定账号"
                error={forgotErr.account}
                keyboardType="email-address"
                returnKeyType="next"
              />
              <FormField
                value={forgotCode}
                onChangeText={function (t) { setForgotCode(t); setForgotErr({}); }}
                placeholder="验证码"
                error={forgotErr.code}
                returnKeyType="next"
              />
              <FormField
                value={forgotPassword}
                onChangeText={function (t) { setForgotPassword(t); setForgotErr({}); }}
                placeholder="新密码"
                error={forgotErr.password}
                withEye
                returnKeyType="next"
              />
              <FormField
                value={forgotConfirm}
                onChangeText={function (t) { setForgotConfirm(t); setForgotErr({}); }}
                placeholder="确认新密码"
                error={forgotErr.confirm}
                withEye
                returnKeyType="go"
                onSubmitEditing={handleForgot}
              />

              <TouchableOpacity
                style={_s.primaryBtn}
                activeOpacity={0.85}
                onPress={handleForgot}
              >
                <Text style={_s.primaryBtnTxt}>确认重置</Text>
              </TouchableOpacity>

              <View style={_s.linkRowCenter}>
                <LinkText text="返回登录" onPress={function () { switchView('login'); }} />
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ================================================================
 * 样式表
 * ================================================================ */
var _s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: AUTH.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: AUTH.maxCardW,
    backgroundColor: AUTH.cardBg,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  /* ── 标题 ── */
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AUTH.white,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: AUTH.secondary,
    marginBottom: 28,
  },

  /* ── 输入框 ── */
  fieldWrap: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AUTH.inputBg,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: AUTH.white,
    padding: 0,
  },
  eyeBtn: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 16,
  },
  errTxt: {
    fontSize: 12,
    color: AUTH.error,
    marginTop: 6,
    marginLeft: 4,
  },

  /* ── 主按钮 ── */
  primaryBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: AUTH.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  primaryBtnTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: AUTH.white,
  },

  /* ── 文字链接 ── */
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkTxt: {
    fontSize: 13,
    color: AUTH.secondary,
  },
  linkTxtBold: {
    color: AUTH.primary,
    fontWeight: '600',
  },
});
