/**
 * Jest テストフレームワーク設定
 * 生成AIステップアップガイド
 */

module.exports = {
  // テスト環境
  testEnvironment: 'jsdom',

  // ルートディレクトリ
  rootDir: '..',

  // テストファイルのパターン
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // カバレッジ対象ファイル
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!src/js/**/*.test.js',
    '!src/js/**/*.spec.js',
    '!src/js/**/index.js'
  ],

  // カバレッジ出力設定
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ],

  // カバレッジ閾値（品質保証）
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // 重要なファイルは高い閾値を設定
    'src/js/utils/env-validator.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // セットアップファイル
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],

  // モジュール解決
  moduleDirectories: [
    'node_modules',
    'src'
  ],

  // モジュールパス設定
  modulePaths: [
    '<rootDir>/src'
  ],

  // ファイル変換設定
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // テスト実行時の詳細設定
  verbose: true,
  
  // テストタイムアウト
  testTimeout: 10000,

  // 並列実行設定
  maxWorkers: '50%',

  // キャッシュ設定
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // 除外するファイル・ディレクトリ
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],

  // 監視除外
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],

  // レポーター設定
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports',
        filename: 'jest-report.html',
        expand: true
      }
    ]
  ],

  // グローバル変数設定
  globals: {
    'process.env': {
      NODE_ENV: 'test'
    }
  },

  // 環境変数ファイル読み込み
  setupFiles: [
    '<rootDir>/tests/env-setup.js'
  ]
}; 