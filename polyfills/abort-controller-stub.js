// React Native 0.81 已内置 AbortController/AbortSignal，此桩模块替代 abort-controller 避免 Event 原型冲突
const AC = globalThis.AbortController;
const AS = globalThis.AbortSignal;

class AbortControllerStub {
  constructor() {
    if (AC) return new AC();
    this.signal = new AbortSignalStub();
  }
  abort() {
    if (AC) return;
    this.signal._aborted = true;
    this.signal.onabort?.();
  }
}

class AbortSignalStub {
  constructor() {
    if (AS) return new AS();
    this._aborted = false;
    this.onabort = null;
  }
  get aborted() { return this._aborted; }
}

module.exports = {
  AbortController: AC || AbortControllerStub,
  AbortSignal: AS || AbortSignalStub,
};
