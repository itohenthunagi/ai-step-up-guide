/**
 * Jest テストセットアップファイル
 * 全テスト実行前に実行される初期化処理
 */

// グローバルなテスト設定
global.console = {
  ...console,
  // テスト中の不要なログを抑制
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// DOM関連のモック
global.window = {
  ...global.window,
  location: {
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  }
};

// fetch APIのモック
global.fetch = jest.fn();

// localStorage のモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// sessionStorage のモック
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// カスタムマッチャーの追加
expect.extend({
  toBeValidURL(received) {
    try {
      new URL(received);
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true
      };
    } catch (error) {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false
      };
    }
  },

  toBeValidEnvironmentVariable(received, options = {}) {
    const { type = 'string', required = false } = options;
    
    if (required && (received === undefined || received === '')) {
      return {
        message: () => `expected ${received} to be set (required environment variable)`,
        pass: false
      };
    }

    if (received === undefined || received === '') {
      return {
        message: () => `environment variable is not set but not required`,
        pass: true
      };
    }

    // 型チェック
    switch (type) {
      case 'boolean':
        const isValidBoolean = ['true', 'false'].includes(received.toLowerCase());
        return {
          message: () => `expected ${received} to be a valid boolean ('true' or 'false')`,
          pass: isValidBoolean
        };
      
      case 'number':
        const isValidNumber = !isNaN(Number(received));
        return {
          message: () => `expected ${received} to be a valid number`,
          pass: isValidNumber
        };
      
      case 'url':
        try {
          new URL(received);
          return {
            message: () => `expected ${received} not to be a valid URL`,
            pass: true
          };
        } catch (error) {
          return {
            message: () => `expected ${received} to be a valid URL`,
            pass: false
          };
        }
      
      case 'string':
      default:
        return {
          message: () => `environment variable is valid`,
          pass: true
        };
    }
  }
});

// テスト終了後のクリーンアップ
afterEach(() => {
  // モックをクリア
  jest.clearAllMocks();
  
  // localStorage/sessionStorage をクリア
  localStorageMock.clear();
  sessionStorageMock.clear();
}); 