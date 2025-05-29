/**
 * Stylelint設定ファイル
 * CSS品質・スタイルガイド管理
 */

module.exports = {
  // 継承する設定
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier'
  ],

  // プラグイン
  plugins: [
    'stylelint-order'
  ],

  // ルール設定
  rules: {
    // 基本的なCSS品質ルール
    'color-no-invalid-hex': true,
    'font-family-no-duplicate-names': true,
    'function-calc-no-unspaced-operator': true,
    'property-no-unknown': true,
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'unit-no-unknown': true,

    // 色関連
    'color-named': 'never',
    'color-no-hex': null, // Hexカラーは許可
    'color-function-notation': 'modern',

    // フォント
    'font-family-name-quotes': 'always-where-recommended',
    'font-weight-notation': 'numeric',

    // セレクタ
    'selector-class-pattern': '^[a-z][a-zA-Z0-9-]*$',
    'selector-id-pattern': '^[a-z][a-zA-Z0-9-]*$',
    'selector-max-id': 1,
    'selector-max-universal': 1,
    'selector-no-qualifying-type': [true, {
      ignore: ['attribute', 'class']
    }],

    // 宣言
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'declaration-no-important': true,

    // 値
    'number-max-precision': 3,
    'shorthand-property-no-redundant-values': true,
    'value-no-vendor-prefix': true,

    // プロパティ順序（論理的順序で整理）
    'order/properties-order': [
      // レイアウト・ポジション
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      
      // 表示・フロー
      'display',
      'flex',
      'flex-direction',
      'flex-wrap',
      'flex-basis',
      'flex-grow',
      'flex-shrink',
      'align-items',
      'align-self',
      'justify-content',
      'order',
      'float',
      'clear',
      'visibility',
      'opacity',
      'overflow',
      'overflow-x',
      'overflow-y',
      'clip',
      
      // ボックスモデル
      'box-sizing',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'border',
      'border-width',
      'border-style',
      'border-color',
      'border-radius',
      
      // 背景・表示
      'background',
      'background-color',
      'background-image',
      'background-repeat',
      'background-position',
      'background-size',
      
      // テキスト・フォント
      'color',
      'font',
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'line-height',
      'text-align',
      'text-decoration',
      'text-transform',
      'text-indent',
      'text-shadow',
      'letter-spacing',
      'word-spacing',
      'white-space',
      
      // その他
      'cursor',
      'transition',
      'transform',
      'animation'
    ],

    // メディアクエリ
    'media-query-list-comma-newline-after': 'always-multi-line',
    'media-query-list-comma-space-after': 'always-single-line',

    // コメント
    'comment-no-empty': true,

    // 命名規則
    'custom-property-pattern': '^[a-z][a-zA-Z0-9-]*$',
    'keyframes-name-pattern': '^[a-z][a-zA-Z0-9-]*$',

    // ベンダープレフィックス（Autoprefixerを使用するため制限）
    'property-no-vendor-prefix': [true, {
      ignoreProperties: ['appearance']
    }],
    'at-rule-no-vendor-prefix': true,

    // パフォーマンス関連
    'no-duplicate-selectors': true,
    'selector-max-compound-selectors': 4,
    'selector-max-specificity': '0,4,0',

    // アクセシビリティ
    'a11y/media-prefers-reduced-motion': true,
    'a11y/no-outline-none': true,
    'a11y/selector-pseudo-class-focus': true
  },

  // ファイル別設定
  overrides: [
    // CSS変数ファイル
    {
      files: ['**/variables.css', '**/vars.css'],
      rules: {
        'custom-property-pattern': '^[a-z][a-zA-Z0-9-]*$',
        'declaration-no-important': null // CSS変数では!importantを許可
      }
    },
    
    // リセットCSS
    {
      files: ['**/reset.css', '**/normalize.css'],
      rules: {
        'selector-max-universal': null, // リセットCSSでは*セレクタを許可
        'selector-max-type': null,
        'property-no-vendor-prefix': null
      }
    },

    // ユーティリティCSS
    {
      files: ['**/utilities.css', '**/helpers.css'],
      rules: {
        'declaration-no-important': null, // ユーティリティでは!importantを許可
        'selector-class-pattern': '^[a-z][a-zA-Z0-9-]*$|^u-[a-z][a-zA-Z0-9-]*$' // u-プレフィックスを許可
      }
    }
  ],

  // 除外パターン
  ignoreFiles: [
    'node_modules/**/*',
    'dist/**/*',
    'build/**/*',
    '**/*.min.css'
  ]
}; 