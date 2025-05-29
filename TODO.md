# 生成AIステップアップガイド - 開発TODO（テスト駆動開発版）

## 📋 プロジェクト概要
- **プロジェクト名**: 生成AIステップアップガイド
- **目的**: 生成AIの基本的な使い方をユーザーが理解し、日常生活や業務において抵抗なく活用できるようになること
- **ターゲット**: ITリテラシーが普通以上だが、AIリテラシーは低く心理的抵抗がある方
- **技術スタック**: HTML5, CSS3, JavaScript (最小限), テスト駆動開発
- **品質方針**: アクセシビリティ・レスポンシブ・メンテナンス性重視

## 🎯 開発フェーズ（TDD準拠）

### Phase 0: 🏗️ 環境・基盤整備（Priority: 🔴 High）
**期限**: 完了まで 2時間以内
**テスト方針**: 環境整合性・設定値検証

#### 0.1 プロジェクト環境設定
- [ ] **Environment Variables Setup**
  - [ ] `.env` ファイル作成（開発用設定）
  - [ ] `.env.sample` ファイル作成（テンプレート）
  - [ ] 環境変数バリデーション機能実装
  - [ ] **Test**: 環境変数読み込み・バリデーションテスト

#### 0.2 ファイル構造設計
- [ ] **Directory Structure**
  - [ ] `src/` ディレクトリ作成（ソースファイル管理）
  - [ ] `tests/` ディレクトリ作成（テストファイル管理）
  - [ ] `docs/` ディレクトリ作成（仕様書・設計書）
  - [ ] `assets/` ディレクトリ作成（画像・アイコン）
  - [ ] **Test**: ディレクトリ構造整合性チェック

#### 0.3 開発ツール・テスト環境
- [ ] **Testing Framework**
  - [ ] Jest or Mocha設定（JavaScriptテスト用）
  - [ ] HTML/CSS バリデーション設定
  - [ ] アクセシビリティテストツール設定（Pa11y等）
  - [ ] **Test**: テストフレームワーク動作確認

#### 0.4 Linting・フォーマット設定
- [ ] **Code Quality**
  - [ ] ESLint設定ファイル作成
  - [ ] Prettier設定ファイル作成
  - [ ] Stylelint設定ファイル作成（CSS品質管理）
  - [ ] **Test**: Lint・フォーマットルール動作確認

---

### Phase 1: 🎨 デザインシステム・CSS基盤（Priority: 🔴 High）
**期限**: Phase 0完了後 4時間以内
**テスト方針**: デザイン一貫性・レスポンシブ・アクセシビリティ検証

#### 1.1 CSS設計システム
- [ ] **CSS Architecture**
  - [ ] `src/css/variables.css` - CSS変数定義
  - [ ] `src/css/reset.css` - リセットCSS
  - [ ] `src/css/base.css` - 基本スタイル
  - [ ] `src/css/components.css` - コンポーネントスタイル
  - [ ] `src/css/layout.css` - レイアウトスタイル
  - [ ] `src/css/utilities.css` - ユーティリティクラス
  - [ ] **Test**: CSS読み込み順序・依存関係テスト

#### 1.2 カラーシステム・タイポグラフィ
- [ ] **Color & Typography**
  - [ ] オレンジ基調カラーパレット定義
  - [ ] アクセシビリティ準拠コントラスト比確認
  - [ ] 游ゴシック・Noto Sans JPフォント設定
  - [ ] 文字サイズ・行間システム設定
  - [ ] **Test**: カラーコントラスト比検証（WCAG AA準拠）
  - [ ] **Test**: フォント読み込み・フォールバック検証

#### 1.3 コンポーネント設計
- [ ] **UI Components**
  - [ ] ボタンコンポーネント（5種類：Primary, Secondary, Success, Warning, Danger）
  - [ ] カードコンポーネント（コンテンツ表示用）
  - [ ] ナビゲーションコンポーネント
  - [ ] フォームコンポーネント（入力フィールド・セレクトボックス）
  - [ ] アコーディオンコンポーネント
  - [ ] **Test**: 各コンポーネント単体表示テスト
  - [ ] **Test**: コンポーネント組み合わせテスト

#### 1.4 レスポンシブシステム
- [ ] **Responsive Design**
  - [ ] ブレークポイント定義（5段階：XS, SM, MD, LG, XL）
  - [ ] Grid システム実装
  - [ ] **Test**: 各ブレークポイント表示確認
  - [ ] **Test**: レスポンシブ画像・テキスト確認

---

### Phase 2: 📄 ページ構造・HTML基盤（Priority: 🔴 High）
**期限**: Phase 1完了後 3時間以内
**テスト方針**: セマンティック・SEO・アクセシビリティ検証

#### 2.1 HTML テンプレート作成
- [ ] **HTML Templates**
  - [ ] `src/templates/base.html` - 基本テンプレート
  - [ ] `src/templates/header.html` - ヘッダーコンポーネント
  - [ ] `src/templates/footer.html` - フッターコンポーネント
  - [ ] `src/templates/navigation.html` - ナビゲーション
  - [ ] **Test**: HTML5バリデーション確認
  - [ ] **Test**: セマンティックHTML構造検証

#### 2.2 メタタグ・SEO設定
- [ ] **SEO Foundation**
  - [ ] 基本メタタグテンプレート
  - [ ] OGPタグテンプレート（Facebook・Twitter対応）
  - [ ] JSON-LD構造化データ
  - [ ] **Test**: メタタグ動的生成確認
  - [ ] **Test**: SEOツールでの構造確認

#### 2.3 アクセシビリティ基盤
- [ ] **Accessibility**
  - [ ] ARIA属性適切な実装
  - [ ] alt属性システマティック管理
  - [ ] キーボードナビゲーション対応
  - [ ] スクリーンリーダー対応確認
  - [ ] **Test**: アクセシビリティ自動テスト（Pa11y）
  - [ ] **Test**: キーボードナビゲーションテスト

---

### Phase 3: 🏠 ページ実装（Priority: 🟡 Medium）
**期限**: Phase 2完了後 6時間以内
**テスト方針**: ページ機能・ナビゲーション・コンテンツ表示検証

#### 3.1 ホームページ（index.html）
- [ ] **Home Page**
  - [ ] ファーストビュー実装
  - [ ] サービス紹介セクション
  - [ ] 各ページへの導線（カード形式）
  - [ ] CTA（Call To Action）ボタン
  - [ ] **Test**: ページ読み込み速度測定
  - [ ] **Test**: 導線クリック動作確認
  - [ ] **Test**: レスポンシブ表示確認

#### 3.2 生成AIの基礎理解ページ（ai-basics.html）
- [ ] **AI Basics Page**
  - [ ] Q&A形式コンテンツ実装
  - [ ] アコーディオンUI実装
  - [ ] 図解・アイコン配置
  - [ ] 関連ページへのナビゲーション
  - [ ] **Test**: アコーディオン開閉動作
  - [ ] **Test**: コンテンツ読み込み確認
  - [ ] **Test**: 内部リンク動作確認

#### 3.3 解像度向上ページ（improve-resolution.html）
- [ ] **Improve Resolution Page**
  - [ ] ステップ形式コンテンツ実装
  - [ ] 成功・失敗事例表示
  - [ ] プログレスインジケーター
  - [ ] **Test**: ステップナビゲーション動作
  - [ ] **Test**: 事例表示確認

#### 3.4 プロンプトエンジニアリングページ（prompt-engineering.html）
- [ ] **Prompt Engineering Page**
  - [ ] 良い例・悪い例対比表示
  - [ ] チェックリスト機能実装
  - [ ] テンプレート表示機能
  - [ ] **Test**: 対比表示切り替え動作
  - [ ] **Test**: チェックリスト保存・復元

#### 3.5 プロンプト作成ページ（prompt-creator.html）
- [ ] **Prompt Creator Page**
  - [ ] 静的テンプレート集表示
  - [ ] サンプル表示機能（JavaScript必要）
  - [ ] フォーム要素配置
  - [ ] **Test**: フォーム入力・バリデーション
  - [ ] **Test**: テンプレート表示機能

---

### Phase 4: ⚡ JavaScript・インタラクティブ機能（Priority: 🟡 Medium）
**期限**: Phase 3完了後 4時間以内
**テスト方針**: 機能動作・エラーハンドリング・パフォーマンス検証

#### 4.1 JavaScript基盤
- [ ] **JavaScript Foundation**
  - [ ] `src/js/app.js` - メインアプリケーション
  - [ ] `src/js/utils.js` - ユーティリティ関数
  - [ ] `src/js/validators.js` - バリデーション関数
  - [ ] `src/js/components.js` - コンポーネント制御
  - [ ] **Test**: JavaScript モジュール読み込み確認
  - [ ] **Test**: 各関数単体テスト

#### 4.2 プロンプト生成機能
- [ ] **Prompt Generation**
  - [ ] 目的別プロンプトテンプレート機能
  - [ ] 動的プロンプト生成ロジック
  - [ ] プロンプト改善提案機能
  - [ ] **Test**: プロンプト生成ロジックテスト
  - [ ] **Test**: エラーハンドリング確認

#### 4.3 UI/UX向上機能
- [ ] **UI Enhancement**
  - [ ] スムーズスクロール実装
  - [ ] ローディングアニメーション
  - [ ] フォームバリデーション強化
  - [ ] **Test**: アニメーション パフォーマンステスト
  - [ ] **Test**: ユーザビリティテスト

---

### Phase 5: 🔍 テスト・品質保証（Priority: 🟢 Low）
**期限**: Phase 4完了後 3時間以内
**テスト方針**: 総合テスト・パフォーマンス・セキュリティ検証

#### 5.1 自動テスト実装
- [ ] **Automated Testing**
  - [ ] Unit Test（JavaScript関数）
  - [ ] Integration Test（ページ間ナビゲーション）
  - [ ] End-to-End Test（ユーザーシナリオ）
  - [ ] **Test**: テストカバレッジ 80%以上達成

#### 5.2 ブラウザテスト
- [ ] **Cross-browser Testing**
  - [ ] Chrome最新版テスト
  - [ ] Firefox最新版テスト
  - [ ] Safari最新版テスト
  - [ ] Edge最新版テスト
  - [ ] **Test**: 各ブラウザ機能差分確認

#### 5.3 パフォーマンス最適化
- [ ] **Performance**
  - [ ] ページ読み込み速度測定・最適化
  - [ ] 画像最適化・圧縮
  - [ ] CSS・JavaScript最適化
  - [ ] **Test**: Lighthouse スコア90点以上達成

#### 5.4 セキュリティ・アクセシビリティ
- [ ] **Security & Accessibility**
  - [ ] セキュリティヘッダー設定確認
  - [ ] XSS・CSRF対策確認
  - [ ] WCAG 2.1 AA準拠確認
  - [ ] **Test**: セキュリティスキャン実行
  - [ ] **Test**: アクセシビリティスコア95点以上

---

## 📁 ファイル構造（メンテナンス重視）

```
project-root/
├── .env                          # 開発環境変数（Git除外）
├── .env.sample                   # 環境変数テンプレート
├── .gitignore                    # Git除外設定
├── package.json                  # 依存関係管理
├── README.md                     # プロジェクト説明
├── TODO.md                       # 本ファイル
├── basic_design.md               # 基本仕様書
│
├── src/                          # ソースファイル
│   ├── css/                      # スタイルシート
│   │   ├── variables.css         # CSS変数
│   │   ├── reset.css             # リセットCSS
│   │   ├── base.css              # 基本スタイル
│   │   ├── components.css        # コンポーネント
│   │   ├── layout.css            # レイアウト
│   │   └── utilities.css         # ユーティリティ
│   │
│   ├── js/                       # JavaScript
│   │   ├── app.js                # メインアプリ
│   │   ├── utils.js              # ユーティリティ
│   │   ├── validators.js         # バリデーション
│   │   └── components.js         # コンポーネント制御
│   │
│   ├── templates/                # HTMLテンプレート
│   │   ├── base.html             # 基本テンプレート
│   │   ├── header.html           # ヘッダー
│   │   ├── footer.html           # フッター
│   │   └── navigation.html       # ナビゲーション
│   │
│   └── pages/                    # 各ページHTML
│       ├── index.html            # ホーム
│       ├── ai-basics.html        # AI基礎理解
│       ├── improve-resolution.html # 解像度向上
│       ├── prompt-engineering.html # プロンプトエンジニアリング
│       └── prompt-creator.html   # プロンプト作成
│
├── assets/                       # 静的アセット
│   ├── images/                   # 画像ファイル
│   ├── icons/                    # アイコンファイル
│   └── fonts/                    # フォントファイル
│
├── tests/                        # テストファイル
│   ├── unit/                     # 単体テスト
│   ├── integration/              # 結合テスト
│   └── e2e/                      # E2Eテスト
│
├── docs/                         # 設計・仕様書
│   ├── design-system.md          # デザインシステム
│   ├── api-documentation.md      # API仕様書
│   └── deployment-guide.md       # デプロイガイド
│
└── config/                       # 設定ファイル
    ├── eslint.config.js          # ESLint設定
    ├── prettier.config.js        # Prettier設定
    └── stylelint.config.js       # Stylelint設定
```

## 🔧 環境変数設計

### 開発・本番共通
- `NODE_ENV` - 実行環境（development/production）
- `SITE_URL` - サイトURL
- `SITE_TITLE` - サイトタイトル
- `ANALYTICS_ID` - Google Analytics ID
- `DEBUG_MODE` - デバッグモード（true/false）

### 将来拡張用
- `FIREBASE_API_KEY` - Firebase設定
- `FIREBASE_PROJECT_ID` - Firebase プロジェクトID
- `API_ENDPOINT` - 外部API エンドポイント
- `CDN_URL` - CDN URL

## 📊 品質指標・達成目標

### パフォーマンス目標
- [ ] Lighthouse Performance: 90点以上
- [ ] First Contentful Paint: 1.5秒以下
- [ ] Total Blocking Time: 200ms以下

### アクセシビリティ目標
- [ ] Lighthouse Accessibility: 95点以上
- [ ] WCAG 2.1 AA準拠: 100%
- [ ] キーボードナビゲーション: 完全対応

### SEO目標
- [ ] Lighthouse SEO: 95点以上
- [ ] Core Web Vitals: 全項目Good
- [ ] 構造化データ: 実装済み

### テストカバレッジ目標
- [ ] JavaScript関数: 90%以上
- [ ] 重要ユーザーフロー: 100%
- [ ] Cross-browser: 4ブラウザ対応

## 🚀 デプロイ・リリース戦略

### デプロイ準備チェックリスト
- [ ] 全自動テスト実行・パス確認
- [ ] 本番環境変数設定確認
- [ ] SEOメタタグ設定確認
- [ ] パフォーマンス計測・基準クリア
- [ ] アクセシビリティ最終チェック
- [ ] セキュリティチェック完了

### リリース後監視項目
- [ ] ページ読み込み速度監視
- [ ] エラー発生率監視
- [ ] ユーザビリティ feedback収集
- [ ] SEO順位確認

---

## ⏰ 作業時間見積もり

| Phase | 見積もり時間 | 担当範囲 |
|-------|-------------|----------|
| Phase 0 | 2時間 | 環境・基盤整備 |
| Phase 1 | 4時間 | CSS・デザインシステム |
| Phase 2 | 3時間 | HTML・ページ構造 |
| Phase 3 | 6時間 | ページ実装 |
| Phase 4 | 4時間 | JavaScript機能 |
| Phase 5 | 3時間 | テスト・品質保証 |
| **合計** | **22時間** | **フルスタック開発** |

---

## 📝 作業ログ・進捗追跡

### 日次チェックポイント
- [ ] 前日の進捗確認・課題整理
- [ ] 当日の作業範囲決定
- [ ] 自動テスト実行・結果確認
- [ ] 品質指標確認（Lighthouse等）
- [ ] Git コミット・プッシュ実行

### 週次レビューポイント
- [ ] Phase単位での成果物レビュー
- [ ] テストカバレッジ確認
- [ ] コードレビュー実施
- [ ] ドキュメント更新

**天才心配性エンジニアからの重要メモ**: 
テスト駆動開発では「Red → Green → Refactor」サイクルを厳守し、
各機能実装前に必ずテストケースを先に書くことを徹底してください。
ファイル分離により、変更影響範囲を最小化し、メンテナンス性を最大化します。
