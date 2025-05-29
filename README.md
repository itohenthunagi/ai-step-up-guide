# 生成AIステップアップガイド

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build Status](https://img.shields.io/badge/build-passing-success)
![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)

## 📋 プロジェクト概要

生成AIの基本的な使い方をユーザーが理解し、日常生活や業務において抵抗なく活用できるようになることを目的とした学習サイトです。

### ✨ 特徴
- **親しみやすいデザイン**: オレンジ基調の温かみのあるUI
- **段階的学習**: 基礎から実践まで体系的にスキルアップ
- **テスト駆動開発**: 品質と保守性を重視した開発プロセス
- **アクセシビリティ対応**: WCAG 2.1 AA準拠
- **レスポンシブデザイン**: 全デバイス対応

### 🎯 ターゲットユーザー
- ITリテラシーが普通以上の方
- AIリテラシーは高くなく、生成AIに心理的抵抗がある方
- 生成AIの具体的活用方法を学びたい方

---

## 🚀 クイックスタート

### 前提条件
- Node.js 16.0.0以上
- npm 8.0.0以上
- Git
- 推奨エディタ: Cursor/VSCode

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/itohenthunagi/seifu.git
cd seifu

# 依存関係をインストール
npm install

# 環境変数を設定
cp env.development .env

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

---

## 🏗️ プロジェクト構造

```
project-root/
├── src/                          # ソースファイル
│   ├── css/                      # スタイルシート
│   ├── js/                       # JavaScript
│   ├── templates/                # HTMLテンプレート
│   └── pages/                    # 各ページHTML
├── tests/                        # テストファイル
│   ├── unit/                     # 単体テスト
│   ├── integration/              # 結合テスト
│   └── e2e/                      # E2Eテスト
├── assets/                       # 静的アセット
├── docs/                         # 設計・仕様書
├── config/                       # 設定ファイル
└── scripts/                      # ビルド・ユーティリティスクリプト
```

---

## 🧪 テスト駆動開発（TDD）

このプロジェクトは **Red → Green → Refactor** サイクルを厳守したテスト駆動開発で進めています。

### テスト実行コマンド

```bash
# 全テスト実行
npm test

# 単体テスト
npm run test:unit

# 結合テスト  
npm run test:integration

# E2Eテスト
npm run test:e2e

# テストカバレッジ確認
npm run test:coverage

# テスト監視モード（開発時）
npm run test:watch
```

### テスト作成ルール

1. **機能実装前にテストを書く**
2. **テストは失敗すること（Red）を確認**
3. **最小限のコードで成功（Green）させる**
4. **コードを整理・最適化（Refactor）する**

### テストカバレッジ目標
- **JavaScript関数**: 90%以上
- **重要ユーザーフロー**: 100%
- **Cross-browser**: 4ブラウザ対応

---

## 🔍 コード品質管理

### Linting・フォーマット

```bash
# 全ファイルのLint実行
npm run lint

# JavaScript Lint
npm run lint:js

# CSS Lint
npm run lint:css

# HTML検証
npm run lint:html

# Lint問題を自動修正
npm run lint:fix

# コードフォーマット実行
npm run format
```

### バリデーション

```bash
# HTML/CSS バリデーション
npm run validate

# アクセシビリティチェック
npm run accessibility

# パフォーマンス測定
npm run performance

# 総合監査
npm run audit
```

---

## 📈 品質指標・目標

### パフォーマンス目標
- ✅ **Lighthouse Performance**: 90点以上
- ✅ **First Contentful Paint**: 1.5秒以下
- ✅ **Total Blocking Time**: 200ms以下

### アクセシビリティ目標
- ✅ **Lighthouse Accessibility**: 95点以上
- ✅ **WCAG 2.1 AA準拠**: 100%
- ✅ **キーボードナビゲーション**: 完全対応

### SEO目標
- ✅ **Lighthouse SEO**: 95点以上
- ✅ **Core Web Vitals**: 全項目Good
- ✅ **構造化データ**: 実装済み

---

## 🔧 開発コマンド

### 開発サーバー

```bash
# 開発サーバー起動
npm run dev

# ファイル監視付きサーバー
npm run serve

# テスト監視付きサーバー
npm run watch
```

### ビルド

```bash
# 本番用ビルド
npm run build

# CSS最適化ビルド
npm run build:css

# JavaScript最適化ビルド
npm run build:js

# HTML最適化ビルド
npm run build:html
```

### 環境管理

```bash
# プロジェクト初期セットアップ
npm run setup

# ディレクトリ構造作成
npm run create:directories

# 環境変数コピー
npm run copy:env

# クリーンアップ
npm run clean
```

---

## 📝 開発フローガイド

### Phase 0: 環境・基盤整備 🏗️
**現在のフェーズ** - 詳細は `docs/todo-phase0-environment.md` を参照

- [x] 環境変数設定
- [x] ファイル構造設計  
- [ ] テストフレームワーク設定
- [ ] Linting・フォーマット設定

### Phase 1: デザインシステム・CSS基盤 🎨
- [ ] CSS設計システム
- [ ] カラーシステム・タイポグラフィ
- [ ] コンポーネント設計
- [ ] レスポンシブシステム

### Phase 2: ページ構造・HTML基盤 📄
- [ ] HTMLテンプレート作成
- [ ] メタタグ・SEO設定
- [ ] アクセシビリティ基盤

### Phase 3: ページ実装 🏠
- [ ] ホームページ（index.html）
- [ ] 生成AIの基礎理解ページ
- [ ] 解像度向上ページ
- [ ] プロンプトエンジニアリングページ
- [ ] プロンプト作成ページ

### Phase 4: JavaScript・インタラクティブ機能 ⚡
- [ ] JavaScript基盤
- [ ] プロンプト生成機能
- [ ] UI/UX向上機能

### Phase 5: テスト・品質保証 🔍
- [ ] 自動テスト実装
- [ ] ブラウザテスト
- [ ] パフォーマンス最適化
- [ ] セキュリティ・アクセシビリティ

---

## 🔐 環境変数設定

### 必須設定項目

```bash
# 基本設定
NODE_ENV=development
SITE_URL=http://localhost:3000
SITE_TITLE=生成AIステップアップガイド
DEBUG_MODE=true

# 本番環境では以下も設定
ANALYTICS_ID=G-XXXXXXXXXX
PRODUCTION_DOMAIN=https://your-domain.com
```

詳細は `env.sample` ファイルを参照してください。

---

## 🤝 コントリビューション

### 開発ルール

1. **Issue作成**: 新機能・バグ修正前にIssueを作成
2. **ブランチ戦略**: feature/bugfix ブランチから main へPR
3. **コミットメッセージ**: Conventional Commits 形式
4. **コードレビュー**: 最低1名のレビュー必須
5. **テスト**: 全テスト通過必須

### Pull Request 流れ

```bash
# feature ブランチ作成
git checkout -b feature/new-feature

# 開発実行（TDD）
npm run test:watch  # テスト監視

# コミット前チェック
npm run precommit

# コミット
git commit -m "feat: 新機能の追加"

# PR作成
git push origin feature/new-feature
```

---

## 📊 プロジェクト進捗

| Phase | 進捗 | 期限 | ステータス |
|-------|------|------|------------|
| Phase 0 | 25% | 2時間 | 🟡 進行中 |
| Phase 1 | 0% | 4時間 | ⏳ 待機中 |
| Phase 2 | 0% | 3時間 | ⏳ 待機中 |
| Phase 3 | 0% | 6時間 | ⏳ 待機中 |
| Phase 4 | 0% | 4時間 | ⏳ 待機中 |
| Phase 5 | 0% | 3時間 | ⏳ 待機中 |

**見積もり総時間**: 22時間

---

## 🔗 関連リンク

- [基本仕様書](basic_design.md)
- [Phase 0 詳細TODO](docs/todo-phase0-environment.md)
- [環境変数テンプレート](env.sample)
- [プロジェクト管理](TODO.md)

---

## 📞 サポート

質問・問題・提案がある場合は、以下の方法でお知らせください：

- **Issue**: GitHub Issues で報告
- **ディスカッション**: GitHub Discussions で議論
- **メール**: project@example.com

---

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。

---

**天才心配性エンジニアからのメッセージ** 💡:

このプロジェクトは品質とメンテナンス性を最重視しています。テスト駆動開発により、安全で確実な機能追加・修正が可能です。不明点があれば遠慮なくお声かけください。一緒に素晴らしいプロダクトを作りましょう！ 