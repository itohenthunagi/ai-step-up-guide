/**
 * ESLint設定ファイル
 * JavaScript コード品質・スタイルガイド
 */

module.exports = {
  // 実行環境
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },

  // 継承する設定
  extends: [
    'eslint:recommended',
    'prettier' // Prettierとの競合を避ける
  ],

  // パーサー設定
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },

  // プラグイン
  plugins: [
    'jsx-a11y'
  ],

  // カスタムルール
  rules: {
    // 基本的なエラー・品質ルール
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',

    // セミコロン・クォート
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],

    // インデント・スペース
    'indent': ['error', 2, { SwitchCase: 1 }],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',

    // 関数・オブジェクト
    'func-style': ['error', 'function', { allowArrowFunctions: true }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],

    // 制御文
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    'keyword-spacing': 'error',
    'space-before-blocks': 'error',

    // 等価比較
    'eqeqeq': ['error', 'always'],
    'no-implicit-coercion': 'error',

    // セキュリティ関連
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // アクセシビリティ（jsx-a11yプラグイン）
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/iframe-has-title': 'error',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/mouse-events-have-key-events': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/tabindex-no-positive': 'warn'
  },

  // ファイル別設定
  overrides: [
    // テストファイル用設定
    {
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off' // テストファイルではconsole.logを許可
      }
    },
    
    // 設定ファイル用
    {
      files: ['config/**/*.js', '*.config.js'],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off'
      }
    },

    // スクリプトファイル用
    {
      files: ['scripts/**/*.js'],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off'
      }
    }
  ],

  // グローバル変数
  globals: {
    // ブラウザ環境での追加グローバル変数
    'ga': 'readonly', // Google Analytics
    'gtag': 'readonly' // Google Tag Manager
  },

  // 除外パターン
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js'
  ]
}; 