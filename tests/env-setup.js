/**
 * テスト用環境変数セットアップ
 * dotenvを使用してテスト用の環境変数を読み込む
 */

// dotenvを使用して環境変数を読み込み
try {
  require('dotenv').config({
    path: '.env'
  });
} catch (error) {
  // dotenvが見つからない場合はフォールバック
  console.warn('dotenv package not found, using fallback environment variables');
}

// テスト用のデフォルト環境変数を設定
const testEnvironmentDefaults = {
  NODE_ENV: 'test',
  SITE_URL: 'http://localhost:3000',
  SITE_TITLE: '生成AIステップアップガイド',
  SITE_DESCRIPTION: 'テスト用サイト説明',
  DEBUG_MODE: 'true',
  APP_VERSION: '1.0.0-test',
  
  // テスト用の設定
  LOG_LEVEL: 'error', // テスト中はエラーログのみ表示
  PERFORMANCE_MONITORING_ENABLED: 'false',
  ANALYTICS_ID: '', // テストでは解析を無効化
  
  // テスト用のパフォーマンス設定
  PERFORMANCE_BUDGET_FCP: '2000',
  PERFORMANCE_BUDGET_LCP: '3000',
  PERFORMANCE_BUDGET_CLS: '0.2'
};

// 環境変数が設定されていない場合はデフォルト値を使用
Object.entries(testEnvironmentDefaults).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

// テスト用の追加設定
process.env.NODE_ENV = 'test'; 