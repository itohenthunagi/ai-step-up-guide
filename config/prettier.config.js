/**
 * Prettier設定ファイル
 * コードフォーマッター設定
 */

module.exports = {
  // 基本設定
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  
  // インデント設定
  tabWidth: 2,
  useTabs: false,
  
  // 行の長さ
  printWidth: 80,
  
  // 括弧設定
  bracketSpacing: true,
  bracketSameLine: false,
  
  // アロー関数の括弧
  arrowParens: 'avoid',
  
  // 改行設定
  endOfLine: 'lf',
  
  // 埋め込み言語の設定
  embeddedLanguageFormatting: 'auto',
  
  // HTML設定
  htmlWhitespaceSensitivity: 'css',
  
  // ファイル別設定
  overrides: [
    // JSON ファイル
    {
      files: '*.json',
      options: {
        tabWidth: 2,
        parser: 'json'
      }
    },
    
    // CSS ファイル
    {
      files: ['*.css', '*.scss'],
      options: {
        tabWidth: 2,
        singleQuote: false,
        parser: 'css'
      }
    },
    
    // HTML ファイル
    {
      files: '*.html',
      options: {
        tabWidth: 2,
        parser: 'html',
        htmlWhitespaceSensitivity: 'ignore'
      }
    },
    
    // Markdown ファイル
    {
      files: '*.md',
      options: {
        tabWidth: 2,
        printWidth: 100,
        parser: 'markdown',
        proseWrap: 'always'
      }
    },
    
    // YAML ファイル
    {
      files: ['*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
        singleQuote: false,
        parser: 'yaml'
      }
    }
  ]
}; 