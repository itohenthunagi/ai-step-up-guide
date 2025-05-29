/**
 * 環境変数バリデーション機能のテスト
 * テスト駆動開発 - Red → Green → Refactor
 */

// テスト対象の環境変数バリデーター（まだ存在しない - Red段階）
const { validateEnvironmentVariables, validateVariable } = require('../../src/js/utils/env-validator');

describe('環境変数バリデーション機能', () => {
  // テスト前の準備
  beforeEach(() => {
    // 元の環境変数を保存
    this.originalEnv = { ...process.env };
  });

  // テスト後のクリーンアップ
  afterEach(() => {
    // 環境変数を元に戻す
    process.env = this.originalEnv;
  });

  describe('validateVariable', () => {
    test('必須環境変数が設定されている場合、true を返す', () => {
      process.env.TEST_VAR = 'test-value';
      
      const result = validateVariable('TEST_VAR', { required: true });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('必須環境変数が設定されていない場合、false を返す', () => {
      delete process.env.TEST_VAR;
      
      const result = validateVariable('TEST_VAR', { required: true });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TEST_VAR is required but not set');
    });

    test('URL形式の環境変数が正しい場合、true を返す', () => {
      process.env.TEST_URL = 'http://localhost:3000';
      
      const result = validateVariable('TEST_URL', { type: 'url' });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('URL形式の環境変数が不正な場合、false を返す', () => {
      process.env.TEST_URL = 'invalid-url';
      
      const result = validateVariable('TEST_URL', { type: 'url' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TEST_URL is not a valid URL');
    });

    test('Boolean形式の環境変数が正しい場合、true を返す', () => {
      process.env.TEST_BOOL = 'true';
      
      const result = validateVariable('TEST_BOOL', { type: 'boolean' });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('Boolean形式の環境変数が不正な場合、false を返す', () => {
      process.env.TEST_BOOL = 'maybe';
      
      const result = validateVariable('TEST_BOOL', { type: 'boolean' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TEST_BOOL is not a valid boolean');
    });

    test('数値形式の環境変数が正しい場合、true を返す', () => {
      process.env.TEST_NUMBER = '3000';
      
      const result = validateVariable('TEST_NUMBER', { type: 'number' });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('数値形式の環境変数が不正な場合、false を返す', () => {
      process.env.TEST_NUMBER = 'not-a-number';
      
      const result = validateVariable('TEST_NUMBER', { type: 'number' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TEST_NUMBER is not a valid number');
    });

    test('デフォルト値が設定されている場合、未設定でも有効とする', () => {
      delete process.env.TEST_VAR;
      
      const result = validateVariable('TEST_VAR', { 
        required: false, 
        defaultValue: 'default-value' 
      });
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('default-value');
    });
  });

  describe('validateEnvironmentVariables', () => {
    test('すべての環境変数が正しく設定されている場合、true を返す', () => {
      process.env.NODE_ENV = 'development';
      process.env.SITE_URL = 'http://localhost:3000';
      process.env.DEBUG_MODE = 'true';
      
      const config = {
        NODE_ENV: { required: true, type: 'string' },
        SITE_URL: { required: true, type: 'url' },
        DEBUG_MODE: { required: true, type: 'boolean' }
      };
      
      const result = validateEnvironmentVariables(config);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('必須環境変数が不足している場合、false を返す', () => {
      delete process.env.NODE_ENV;
      process.env.SITE_URL = 'http://localhost:3000';
      
      const config = {
        NODE_ENV: { required: true, type: 'string' },
        SITE_URL: { required: true, type: 'url' }
      };
      
      const result = validateEnvironmentVariables(config);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('NODE_ENV is required but not set');
    });

    test('複数の環境変数で問題がある場合、すべてのエラーを返す', () => {
      delete process.env.NODE_ENV;
      process.env.SITE_URL = 'invalid-url';
      process.env.DEBUG_MODE = 'maybe';
      
      const config = {
        NODE_ENV: { required: true, type: 'string' },
        SITE_URL: { required: true, type: 'url' },
        DEBUG_MODE: { required: true, type: 'boolean' }
      };
      
      const result = validateEnvironmentVariables(config);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('NODE_ENV is required but not set');
      expect(result.errors).toContain('SITE_URL is not a valid URL');
      expect(result.errors).toContain('DEBUG_MODE is not a valid boolean');
    });

    test('オプション環境変数は未設定でも問題なし', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.ANALYTICS_ID;
      
      const config = {
        NODE_ENV: { required: true, type: 'string' },
        ANALYTICS_ID: { required: false, type: 'string' }
      };
      
      const result = validateEnvironmentVariables(config);
      
      expect(result.isValid).toBe(true);
    });
  });
});

/**
 * プロジェクト固有の環境変数設定テスト
 */
describe('プロジェクト環境変数設定', () => {
  test('開発環境の必須変数が正しく設定されているかテスト', () => {
    // 開発環境の必須変数を設定
    process.env.NODE_ENV = 'development';
    process.env.SITE_URL = 'http://localhost:3000';
    process.env.SITE_TITLE = '生成AIステップアップガイド';
    process.env.DEBUG_MODE = 'true';
    process.env.APP_VERSION = '1.0.0';

    const developmentConfig = {
      NODE_ENV: { required: true, type: 'string' },
      SITE_URL: { required: true, type: 'url' },
      SITE_TITLE: { required: true, type: 'string' },
      DEBUG_MODE: { required: true, type: 'boolean' },
      APP_VERSION: { required: true, type: 'string' }
    };

    const result = validateEnvironmentVariables(developmentConfig);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('本番環境の設定バリデーション', () => {
    // 本番環境の設定
    process.env.NODE_ENV = 'production';
    process.env.SITE_URL = 'https://ai-guide.example.com';
    process.env.DEBUG_MODE = 'false';
    process.env.ANALYTICS_ID = 'G-XXXXXXXXXX';
    process.env.FORCE_HTTPS = 'true';

    const productionConfig = {
      NODE_ENV: { required: true, type: 'string' },
      SITE_URL: { required: true, type: 'url' },
      DEBUG_MODE: { required: true, type: 'boolean' },
      ANALYTICS_ID: { required: true, type: 'string' },
      FORCE_HTTPS: { required: true, type: 'boolean' }
    };

    const result = validateEnvironmentVariables(productionConfig);
    
    expect(result.isValid).toBe(true);
  });
}); 