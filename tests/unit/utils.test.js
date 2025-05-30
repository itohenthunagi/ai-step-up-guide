/**
 * utils.js のユニットテストスイート
 * すべてのユーティリティ関数の動作を検証
 */

// モック設定
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// DOM環境のセットアップ
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn()
  }
});

// utils.jsの読み込み（Node.js環境での対応）
const fs = require('fs');
const path = require('path');
const utilsPath = path.join(__dirname, '../../src/js/utils.js');
const utilsCode = fs.readFileSync(utilsPath, 'utf8');

// グローバル環境でutils.jsを実行
eval(utilsCode);

describe('Utils.js ユニットテスト', () => {
  
  beforeEach(() => {
    document.body.innerHTML = '';
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  // ===== DOM操作ユーティリティ =====
  describe('DOM操作ユーティリティ', () => {
    test('createElement: 基本的な要素作成', () => {
      const element = Utils.createElement('div', { 
        class: 'test-class', 
        id: 'test-id',
        'data-test': 'value'
      });
      
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('test-class');
      expect(element.id).toBe('test-id');
      expect(element.getAttribute('data-test')).toBe('value');
    });

    test('createElement: 子要素の追加', () => {
      const parent = Utils.createElement('div');
      const child = Utils.createElement('span', {}, 'テキスト');
      parent.appendChild(child);
      
      expect(parent.children.length).toBe(1);
      expect(parent.querySelector('span').textContent).toBe('テキスト');
    });

    test('$(selector): 要素選択', () => {
      document.body.innerHTML = '<div id="test">テスト</div>';
      const element = Utils.$('#test');
      expect(element.id).toBe('test');
      expect(element.textContent).toBe('テスト');
    });

    test('$$(selector): 複数要素選択', () => {
      document.body.innerHTML = `
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
      `;
      const elements = Utils.$$('.item');
      expect(elements.length).toBe(3);
      expect(elements[1].textContent).toBe('2');
    });

    test('hide/show: 要素の表示/非表示', () => {
      const element = Utils.createElement('div');
      document.body.appendChild(element);
      
      Utils.hide(element);
      expect(element.style.display).toBe('none');
      
      Utils.show(element);
      expect(element.style.display).toBe('');
    });

    test('addClass/removeClass: クラス操作', () => {
      const element = Utils.createElement('div');
      
      Utils.addClass(element, 'test-class');
      expect(element.classList.contains('test-class')).toBe(true);
      
      Utils.removeClass(element, 'test-class');
      expect(element.classList.contains('test-class')).toBe(false);
    });

    test('hasClass: クラス存在確認', () => {
      const element = Utils.createElement('div', { class: 'existing-class' });
      
      expect(Utils.hasClass(element, 'existing-class')).toBe(true);
      expect(Utils.hasClass(element, 'non-existing')).toBe(false);
    });

    test('toggleClass: クラストグル', () => {
      const element = Utils.createElement('div');
      
      Utils.toggleClass(element, 'toggle-class');
      expect(element.classList.contains('toggle-class')).toBe(true);
      
      Utils.toggleClass(element, 'toggle-class');
      expect(element.classList.contains('toggle-class')).toBe(false);
    });
  });

  // ===== 文字列操作ユーティリティ =====
  describe('文字列操作ユーティリティ', () => {
    test('capitalizeFirst: 最初の文字を大文字に', () => {
      expect(Utils.capitalizeFirst('hello')).toBe('Hello');
      expect(Utils.capitalizeFirst('WORLD')).toBe('WORLD');
      expect(Utils.capitalizeFirst('')).toBe('');
    });

    test('truncate: 文字列の切り詰め', () => {
      const longText = 'これは長いテキストです。';
      expect(Utils.truncate(longText, 10)).toBe('これは長いテキス...');
      expect(Utils.truncate('短い', 10)).toBe('短い');
    });

    test('slugify: URL用スラッグ生成', () => {
      expect(Utils.slugify('Hello World!')).toBe('hello-world');
      expect(Utils.slugify('こんにちは 世界')).toBe('こんにちは-世界');
    });

    test('stripTags: HTMLタグ除去', () => {
      expect(Utils.stripTags('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
      expect(Utils.stripTags('Plain text')).toBe('Plain text');
    });

    test('escapeHtml: HTMLエスケープ', () => {
      expect(Utils.escapeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    test('unescapeHtml: HTMLアンエスケープ', () => {
      expect(Utils.unescapeHtml('&lt;div&gt;Hello&lt;/div&gt;'))
        .toBe('<div>Hello</div>');
    });
  });

  // ===== 配列操作ユーティリティ =====
  describe('配列操作ユーティリティ', () => {
    test('unique: 重複要素除去', () => {
      expect(Utils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(Utils.unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    test('shuffle: 配列のシャッフル', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = Utils.shuffle([...original]);
      
      expect(shuffled.length).toBe(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    test('chunk: 配列の分割', () => {
      expect(Utils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(Utils.chunk(['a', 'b', 'c'], 2)).toEqual([['a', 'b'], ['c']]);
    });

    test('flatten: 配列の平坦化', () => {
      expect(Utils.flatten([1, [2, 3], [4, [5, 6]]])).toEqual([1, 2, 3, 4, 5, 6]);
      expect(Utils.flatten(['a', ['b', 'c']])).toEqual(['a', 'b', 'c']);
    });
  });

  // ===== オブジェクト操作ユーティリティ =====
  describe('オブジェクト操作ユーティリティ', () => {
    test('deepClone: ディープクローン', () => {
      const original = { a: 1, b: { c: 2, d: [3, 4] } };
      const cloned = Utils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    test('mergeDeep: 深いマージ', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const merged = Utils.mergeDeep(obj1, obj2);
      
      expect(merged).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    test('getNestedValue: ネストした値の取得', () => {
      const obj = { a: { b: { c: 'value' } } };
      
      expect(Utils.getNestedValue(obj, 'a.b.c')).toBe('value');
      expect(Utils.getNestedValue(obj, 'a.b.x', 'default')).toBe('default');
    });

    test('isEmpty: 空チェック', () => {
      expect(Utils.isEmpty({})).toBe(true);
      expect(Utils.isEmpty([])).toBe(true);
      expect(Utils.isEmpty('')).toBe(true);
      expect(Utils.isEmpty(null)).toBe(true);
      expect(Utils.isEmpty(undefined)).toBe(true);
      expect(Utils.isEmpty({ a: 1 })).toBe(false);
      expect(Utils.isEmpty([1])).toBe(false);
      expect(Utils.isEmpty('text')).toBe(false);
    });
  });

  // ===== イベント管理ユーティリティ =====
  describe('イベント管理ユーティリティ', () => {
    test('on/off: イベントリスナー管理', () => {
      const element = Utils.createElement('button');
      const handler = jest.fn();
      
      Utils.on(element, 'click', handler);
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
      
      Utils.off(element, 'click', handler);
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('once: 一回だけのイベントリスナー', () => {
      const element = Utils.createElement('button');
      const handler = jest.fn();
      
      Utils.once(element, 'click', handler);
      element.click();
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('delegate: イベント委譲', () => {
      const container = Utils.createElement('div');
      const button = Utils.createElement('button', { class: 'target' });
      container.appendChild(button);
      document.body.appendChild(container);
      
      const handler = jest.fn();
      Utils.delegate(container, '.target', 'click', handler);
      
      button.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // ===== デバウンス・スロットルユーティリティ =====
  describe('デバウンス・スロットルユーティリティ', () => {
    jest.useFakeTimers();

    test('debounce: デバウンス処理', () => {
      const func = jest.fn();
      const debouncedFunc = Utils.debounce(func, 100);
      
      debouncedFunc();
      debouncedFunc();
      debouncedFunc();
      
      expect(func).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });

    test('throttle: スロットル処理', () => {
      const func = jest.fn();
      const throttledFunc = Utils.throttle(func, 100);
      
      throttledFunc();
      throttledFunc();
      throttledFunc();
      
      expect(func).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  // ===== ローカルストレージユーティリティ =====
  describe('ローカルストレージユーティリティ', () => {
    test('setStorage/getStorage: 基本的な保存・取得', () => {
      Utils.setStorage('test-key', 'test-value');
      expect(Utils.getStorage('test-key')).toBe('test-value');
    });

    test('setStorage/getStorage: オブジェクトの保存・取得', () => {
      const testObj = { name: 'テスト', value: 123 };
      Utils.setStorage('test-obj', testObj);
      expect(Utils.getStorage('test-obj')).toEqual(testObj);
    });

    test('removeStorage: ストレージから削除', () => {
      Utils.setStorage('temp-key', 'temp-value');
      Utils.removeStorage('temp-key');
      expect(Utils.getStorage('temp-key')).toBeNull();
    });

    test('clearStorage: ストレージ全体をクリア', () => {
      Utils.setStorage('key1', 'value1');
      Utils.setStorage('key2', 'value2');
      Utils.clearStorage();
      expect(Utils.getStorage('key1')).toBeNull();
      expect(Utils.getStorage('key2')).toBeNull();
    });
  });

  // ===== アクセシビリティユーティリティ =====
  describe('アクセシビリティユーティリティ', () => {
    test('setAriaLabel: ARIA ラベル設定', () => {
      const element = Utils.createElement('button');
      Utils.setAriaLabel(element, 'テストボタン');
      expect(element.getAttribute('aria-label')).toBe('テストボタン');
    });

    test('setAriaLive: ARIA ライブリージョン設定', () => {
      const element = Utils.createElement('div');
      Utils.setAriaLive(element, 'polite');
      expect(element.getAttribute('aria-live')).toBe('polite');
    });

    test('announceToScreenReader: スクリーンリーダー通知', () => {
      Utils.announceToScreenReader('重要なお知らせ');
      const announcer = document.querySelector('[aria-live="assertive"]');
      expect(announcer).toBeTruthy();
      expect(announcer.textContent).toBe('重要なお知らせ');
    });

    test('trapFocus: フォーカストラップ', () => {
      const container = Utils.createElement('div');
      const button1 = Utils.createElement('button');
      const button2 = Utils.createElement('button');
      container.appendChild(button1);
      container.appendChild(button2);
      document.body.appendChild(container);
      
      const releaseTrap = Utils.trapFocus(container);
      expect(typeof releaseTrap).toBe('function');
      
      releaseTrap(); // クリーンアップ
    });
  });

  // ===== パフォーマンスユーティリティ =====
  describe('パフォーマンスユーティリティ', () => {
    test('performanceMark/performanceMeasure: パフォーマンス計測', () => {
      Utils.performanceMark('test-start');
      Utils.performanceMark('test-end');
      const duration = Utils.performanceMeasure('test-duration', 'test-start', 'test-end');
      
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    test('raf: requestAnimationFrame のポリフィル', () => {
      const callback = jest.fn();
      const id = Utils.raf(callback);
      
      expect(typeof id).toBe('number');
      expect(callback).toHaveBeenCalled();
    });

    test('caf: cancelAnimationFrame のポリフィル', () => {
      const callback = jest.fn();
      const id = Utils.raf(callback);
      Utils.caf(id);
      
      // キャンセル後はコールバックが呼ばれない
      expect(typeof id).toBe('number');
    });
  });

  // ===== バリデーションユーティリティ =====
  describe('バリデーションユーティリティ', () => {
    test('isEmail: メールアドレス検証', () => {
      expect(Utils.isEmail('test@example.com')).toBe(true);
      expect(Utils.isEmail('invalid-email')).toBe(false);
      expect(Utils.isEmail('test@')).toBe(false);
    });

    test('isUrl: URL検証', () => {
      expect(Utils.isUrl('https://example.com')).toBe(true);
      expect(Utils.isUrl('http://localhost:3000')).toBe(true);
      expect(Utils.isUrl('invalid-url')).toBe(false);
    });

    test('isNumeric: 数値検証', () => {
      expect(Utils.isNumeric('123')).toBe(true);
      expect(Utils.isNumeric('123.45')).toBe(true);
      expect(Utils.isNumeric('abc')).toBe(false);
    });

    test('isAlphanumeric: 英数字検証', () => {
      expect(Utils.isAlphanumeric('abc123')).toBe(true);
      expect(Utils.isAlphanumeric('ABC123')).toBe(true);
      expect(Utils.isAlphanumeric('abc-123')).toBe(false);
    });

    test('sanitizeInput: 入力値のサニタイズ', () => {
      expect(Utils.sanitizeInput('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(Utils.sanitizeInput('Normal text')).toBe('Normal text');
    });
  });

  // ===== エラーハンドリング =====
  describe('エラーハンドリング', () => {
    test('存在しない要素に対する操作', () => {
      expect(() => Utils.hide(null)).not.toThrow();
      expect(() => Utils.addClass(null, 'test')).not.toThrow();
    });

    test('不正なパラメータに対する処理', () => {
      expect(Utils.truncate(null, 10)).toBe('');
      expect(Utils.unique(null)).toEqual([]);
      expect(Utils.deepClone(null)).toBeNull();
    });
  });
});

// テストヘルパー関数
function createMockElement(tag = 'div', attributes = {}) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

// カスタムマッチャー
expect.extend({
  toBeVisible(received) {
    const pass = received && received.style.display !== 'none';
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}be visible`,
      pass
    };
  },
  
  toHaveAriaLabel(received, expected) {
    const actual = received?.getAttribute('aria-label');
    const pass = actual === expected;
    return {
      message: () => `expected element to have aria-label "${expected}", received "${actual}"`,
      pass
    };
  }
}); 