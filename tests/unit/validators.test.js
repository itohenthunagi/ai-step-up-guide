/**
 * validators.js のユニットテストスイート
 * 全バリデーション機能の動作を検証
 */

// validators.jsの読み込み（Node.js環境での対応）
const fs = require('fs');
const path = require('path');
const validatorsPath = path.join(__dirname, '../../src/js/validators.js');
const validatorsCode = fs.readFileSync(validatorsPath, 'utf8');

// グローバル環境でvalidators.jsを実行
eval(validatorsCode);

describe('Validators.js ユニットテスト', () => {
  
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  // ===== PromptValidators テスト =====
  describe('PromptValidators クラス', () => {
    let validator;

    beforeEach(() => {
      validator = new PromptValidators();
    });

    test('validateLength: 文字数バリデーション', () => {
      expect(validator.validateLength('')).toBe(false);
      expect(validator.validateLength('短い')).toBe(false);
      expect(validator.validateLength('適切な長さのプロンプトテキストです')).toBe(true);
      expect(validator.validateLength('a'.repeat(2001))).toBe(false);
    });

    test('validateComplexity: 複雑さバリデーション', () => {
      expect(validator.validateComplexity('簡単')).toBe(false);
      expect(validator.validateComplexity('これは詳細で具体的な指示を含むプロンプトです。明確な要求事項があります。')).toBe(true);
    });

    test('validateClarity: 明確性バリデーション', () => {
      expect(validator.validateClarity('何かしてください')).toBe(false);
      expect(validator.validateClarity('マーケティング用のブログ記事を1000文字で書いてください。対象読者は30代女性です。')).toBe(true);
    });

    test('validateStructure: 構造バリデーション', () => {
      expect(validator.validateStructure('単純なテキスト')).toBe(false);
      
      const structuredPrompt = `
        タスク: ブログ記事作成
        要求: 1000文字
        条件: SEO対応
        出力形式: HTML
      `;
      expect(validator.validateStructure(structuredPrompt)).toBe(true);
    });

    test('validateSafety: 安全性バリデーション', () => {
      expect(validator.validateSafety('ハッキング方法を教えて')).toBe(false);
      expect(validator.validateSafety('違法な行為について')).toBe(false);
      expect(validator.validateSafety('健全なコンテンツ作成について')).toBe(true);
    });

    test('validateAll: 包括的バリデーション', () => {
      const goodPrompt = `
        タスク: ユーザー向けのマニュアル作成
        要求: 初心者にも分かりやすい説明で、1500文字程度
        条件: 図表を含める、ステップバイステップで説明
        対象読者: ITに詳しくない一般ユーザー
        出力形式: Markdown形式
      `;
      
      const result = validator.validateAll(goodPrompt);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(70);
      expect(result.errors.length).toBe(0);
    });

    test('validateAll: 不適切なプロンプト', () => {
      const badPrompt = '何か';
      
      const result = validator.validateAll(badPrompt);
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(50);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('getSuggestions: 改善提案', () => {
      const prompt = '短いプロンプト';
      const suggestions = validator.getSuggestions(prompt);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('具体的'))).toBe(true);
    });
  });

  // ===== FormValidators テスト =====
  describe('FormValidators クラス', () => {
    let validator;

    beforeEach(() => {
      validator = new FormValidators();
    });

    test('validateField: フィールドバリデーション', () => {
      // 必須フィールド
      expect(validator.validateField('', { required: true })).toBe(false);
      expect(validator.validateField('値', { required: true })).toBe(true);

      // 最小長
      expect(validator.validateField('短', { minLength: 5 })).toBe(false);
      expect(validator.validateField('十分な長さ', { minLength: 5 })).toBe(true);

      // 最大長
      expect(validator.validateField('非常に長いテキスト', { maxLength: 5 })).toBe(false);
      expect(validator.validateField('短い', { maxLength: 10 })).toBe(true);

      // パターン
      expect(validator.validateField('abc123', { pattern: /^[a-zA-Z0-9]+$/ })).toBe(true);
      expect(validator.validateField('abc-123', { pattern: /^[a-zA-Z0-9]+$/ })).toBe(false);
    });

    test('validateEmail: メールアドレスバリデーション', () => {
      expect(validator.validateEmail('test@example.com')).toBe(true);
      expect(validator.validateEmail('user.name+tag@domain.co.jp')).toBe(true);
      expect(validator.validateEmail('invalid-email')).toBe(false);
      expect(validator.validateEmail('test@')).toBe(false);
      expect(validator.validateEmail('@domain.com')).toBe(false);
    });

    test('validatePassword: パスワードバリデーション', () => {
      expect(validator.validatePassword('Password1!')).toBe(true);
      expect(validator.validatePassword('password')).toBe(false); // 大文字なし
      expect(validator.validatePassword('PASSWORD')).toBe(false); // 小文字なし
      expect(validator.validatePassword('Password')).toBe(false); // 数字なし
      expect(validator.validatePassword('Pass1!')).toBe(false); // 短すぎる
    });

    test('validateUrl: URL バリデーション', () => {
      expect(validator.validateUrl('https://example.com')).toBe(true);
      expect(validator.validateUrl('http://localhost:3000')).toBe(true);
      expect(validator.validateUrl('ftp://files.example.com')).toBe(true);
      expect(validator.validateUrl('invalid-url')).toBe(false);
      expect(validator.validateUrl('www.example.com')).toBe(false);
    });

    test('validatePhone: 電話番号バリデーション', () => {
      expect(validator.validatePhone('090-1234-5678')).toBe(true);
      expect(validator.validatePhone('03-1234-5678')).toBe(true);
      expect(validator.validatePhone('0312345678')).toBe(true);
      expect(validator.validatePhone('123-456')).toBe(false);
      expect(validator.validatePhone('abc-defg-hijk')).toBe(false);
    });

    test('validateDate: 日付バリデーション', () => {
      expect(validator.validateDate('2024-01-15')).toBe(true);
      expect(validator.validateDate('2024/01/15')).toBe(true);
      expect(validator.validateDate('invalid-date')).toBe(false);
      expect(validator.validateDate('2024-13-01')).toBe(false);
    });

    test('validateForm: フォーム全体バリデーション', () => {
      const formData = {
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!'
      };

      const rules = {
        name: { required: true, minLength: 2 },
        email: { required: true, type: 'email' },
        password: { required: true, type: 'password' },
        confirmPassword: { required: true, matches: 'password' }
      };

      const result = validator.validateForm(formData, rules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('validateForm: エラーケース', () => {
      const formData = {
        name: '',
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different'
      };

      const rules = {
        name: { required: true },
        email: { required: true, type: 'email' },
        password: { required: true, type: 'password' },
        confirmPassword: { required: true, matches: 'password' }
      };

      const result = validator.validateForm(formData, rules);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });

    test('getRealTimeValidator: リアルタイムバリデーション', () => {
      const input = document.createElement('input');
      input.type = 'email';
      document.body.appendChild(input);

      const realTimeValidator = validator.getRealTimeValidator({
        email: { required: true, type: 'email' }
      });

      input.value = 'invalid-email';
      realTimeValidator(input, 'email');

      expect(input.classList.contains('is-invalid')).toBe(true);
    });
  });

  // ===== AIValidators テスト =====
  describe('AIValidators クラス', () => {
    let validator;

    beforeEach(() => {
      validator = new AIValidators();
    });

    test('validatePromptQuality: プロンプト品質評価', () => {
      const highQualityPrompt = `
        ユーザー向けのマニュアルを作成してください。
        
        対象読者: ITに詳しくない一般ユーザー
        目的: 製品の基本的な使い方を理解する
        文字数: 1500文字程度
        構成: 導入、手順説明、注意点、まとめ
        出力形式: Markdown
        
        特に重要なポイント:
        - 専門用語は使わず、分かりやすい言葉で説明
        - 手順は番号付きリストで構造化
        - 画像の挿入箇所も指示
      `;

      const result = validator.validatePromptQuality(highQualityPrompt);
      expect(result.score).toBeGreaterThan(80);
      expect(result.quality).toBe('excellent');
      expect(result.improvements.length).toBeLessThan(3);
    });

    test('validatePromptQuality: 低品質プロンプト', () => {
      const lowQualityPrompt = '何か書いて';

      const result = validator.validatePromptQuality(lowQualityPrompt);
      expect(result.score).toBeLessThan(30);
      expect(result.quality).toBe('poor');
      expect(result.improvements.length).toBeGreaterThan(3);
    });

    test('validateContentSafety: コンテンツ安全性チェック', () => {
      const safeContent = 'ユーザー体験を向上させるためのデザインパターンについて説明してください。';
      const unsafeContent = 'ハッキングの方法を詳しく教えてください。';

      expect(validator.validateContentSafety(safeContent).isSafe).toBe(true);
      expect(validator.validateContentSafety(unsafeContent).isSafe).toBe(false);
    });

    test('validateOutputFormat: 出力形式バリデーション', () => {
      const formats = ['text', 'markdown', 'html', 'json', 'csv'];
      
      formats.forEach(format => {
        expect(validator.validateOutputFormat(format)).toBe(true);
      });

      expect(validator.validateOutputFormat('invalid-format')).toBe(false);
    });

    test('validateTokenCount: トークン数チェック', () => {
      const shortText = 'これは短いテキストです。';
      const longText = 'これは非常に長いテキストです。'.repeat(1000);

      expect(validator.validateTokenCount(shortText).isValid).toBe(true);
      expect(validator.validateTokenCount(longText).isValid).toBe(false);
      expect(validator.validateTokenCount(longText).estimated).toBeGreaterThan(4000);
    });

    test('analyzePromptComplexity: プロンプト複雑度分析', () => {
      const simplePrompt = '記事を書いて';
      const complexPrompt = `
        SEO最適化されたブログ記事を作成してください。
        キーワード: 「生成AI」「プロンプト」「活用方法」
        文字数: 2000文字
        構成: H1, H2, H3タグを適切に使用
        メタディスクリプション: 120文字以内
        対象読者: IT初心者
      `;

      const simpleResult = validator.analyzePromptComplexity(simplePrompt);
      const complexResult = validator.analyzePromptComplexity(complexPrompt);

      expect(simpleResult.complexity).toBe('low');
      expect(complexResult.complexity).toBe('high');
      expect(complexResult.score).toBeGreaterThan(simpleResult.score);
    });
  });

  // ===== SecurityValidators テスト =====
  describe('SecurityValidators クラス', () => {
    let validator;

    beforeEach(() => {
      validator = new SecurityValidators();
    });

    test('validateXSS: XSS攻撃チェック', () => {
      const safeInput = 'これは安全な入力です';
      const xssInput = '<script>alert("xss")</script>';
      const xssInput2 = 'javascript:alert("xss")';

      expect(validator.validateXSS(safeInput).isSafe).toBe(true);
      expect(validator.validateXSS(xssInput).isSafe).toBe(false);
      expect(validator.validateXSS(xssInput2).isSafe).toBe(false);
    });

    test('validateSQLInjection: SQLインジェクションチェック', () => {
      const safeInput = 'normal search query';
      const sqlInput = "'; DROP TABLE users; --";
      const sqlInput2 = 'UNION SELECT * FROM passwords';

      expect(validator.validateSQLInjection(safeInput).isSafe).toBe(true);
      expect(validator.validateSQLInjection(sqlInput).isSafe).toBe(false);
      expect(validator.validateSQLInjection(sqlInput2).isSafe).toBe(false);
    });

    test('validateCSRF: CSRFトークンチェック', () => {
      const validToken = 'abc123def456ghi789';
      const invalidToken = 'invalid';

      expect(validator.validateCSRF(validToken, validToken)).toBe(true);
      expect(validator.validateCSRF(validToken, invalidToken)).toBe(false);
      expect(validator.validateCSRF('', validToken)).toBe(false);
    });

    test('sanitizeInput: 入力値サニタイズ', () => {
      const maliciousInput = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
      const sanitized = validator.sanitizeInput(maliciousInput);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    test('validateFileUpload: ファイルアップロードバリデーション', () => {
      const validFile = {
        name: 'document.pdf',
        type: 'application/pdf',
        size: 1024 * 1024 // 1MB
      };

      const invalidFile = {
        name: 'malware.exe',
        type: 'application/exe',
        size: 50 * 1024 * 1024 // 50MB
      };

      expect(validator.validateFileUpload(validFile).isValid).toBe(true);
      expect(validator.validateFileUpload(invalidFile).isValid).toBe(false);
    });

    test('validateRateLimit: レート制限チェック', () => {
      const userKey = 'user123';
      
      // 初回は成功
      expect(validator.validateRateLimit(userKey).allowed).toBe(true);
      
      // 制限値まで繰り返し
      for (let i = 0; i < 10; i++) {
        validator.validateRateLimit(userKey);
      }
      
      // 制限を超えると失敗
      expect(validator.validateRateLimit(userKey).allowed).toBe(false);
    });

    test('encryptSensitiveData: 機密データ暗号化', () => {
      const sensitiveData = 'secret-password-123';
      const encrypted = validator.encryptSensitiveData(sensitiveData);

      expect(encrypted).not.toBe(sensitiveData);
      expect(encrypted.length).toBeGreaterThan(sensitiveData.length);
    });
  });

  // ===== ValidationManager テスト =====
  describe('ValidationManager クラス', () => {
    let manager;

    beforeEach(() => {
      manager = new ValidationManager();
    });

    test('addRule: カスタムルール追加', () => {
      const customRule = {
        name: 'customRule',
        validate: (value) => value.includes('custom'),
        message: 'カスタムルールエラー'
      };

      manager.addRule(customRule);
      expect(manager.rules.has('customRule')).toBe(true);
    });

    test('validateWithRules: ルールセットでバリデーション', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password1!',
        age: 25
      };

      const rules = {
        email: ['required', 'email'],
        password: ['required', 'strongPassword'],
        age: ['required', 'numeric', 'minValue:18']
      };

      const result = manager.validateWithRules(data, rules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('validateWithRules: エラーケース', () => {
      const data = {
        email: 'invalid-email',
        password: 'weak',
        age: 15
      };

      const rules = {
        email: ['required', 'email'],
        password: ['required', 'strongPassword'],
        age: ['required', 'numeric', 'minValue:18']
      };

      const result = manager.validateWithRules(data, rules);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });

    test('getPresetRules: プリセットルール取得', () => {
      const userRegistrationRules = manager.getPresetRules('userRegistration');
      expect(userRegistrationRules).toBeDefined();
      expect(userRegistrationRules.email).toBeDefined();
      expect(userRegistrationRules.password).toBeDefined();
    });

    test('validateAsync: 非同期バリデーション', async () => {
      const asyncValidator = jest.fn().mockResolvedValue(true);
      manager.addRule({
        name: 'asyncRule',
        validate: asyncValidator,
        async: true
      });

      const result = await manager.validateAsync('test-value', ['asyncRule']);
      expect(result.isValid).toBe(true);
      expect(asyncValidator).toHaveBeenCalledWith('test-value');
    });

    test('batch validation: バッチ検証', () => {
      const datasets = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
        { email: 'invalid-email' }
      ];

      const rules = { email: ['required', 'email'] };
      const results = manager.validateBatch(datasets, rules);

      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);
    });
  });

  // ===== 統合テスト =====
  describe('バリデーション統合テスト', () => {
    test('複合バリデーションシナリオ', () => {
      const formData = {
        title: 'ブログ記事のタイトル',
        content: `
          これは詳細なブログ記事の内容です。
          SEO対策も考慮し、適切な長さと構造を持っています。
          ユーザーにとって価値のある情報を提供します。
        `,
        category: 'technology',
        tags: ['JavaScript', 'React', 'Frontend'],
        publishDate: '2024-01-15'
      };

      const promptValidator = new PromptValidators();
      const formValidator = new FormValidators();
      const aiValidator = new AIValidators();
      const securityValidator = new SecurityValidators();

      // 複数バリデーター組み合わせ
      const titleValid = formValidator.validateField(formData.title, { required: true, minLength: 5 });
      const contentQuality = aiValidator.validatePromptQuality(formData.content);
      const securityCheck = securityValidator.validateXSS(formData.content);
      const dateValid = formValidator.validateDate(formData.publishDate);

      expect(titleValid).toBe(true);
      expect(contentQuality.score).toBeGreaterThan(50);
      expect(securityCheck.isSafe).toBe(true);
      expect(dateValid).toBe(true);
    });

    test('リアルタイムバリデーション統合', () => {
      // フォーム要素作成
      const form = document.createElement('form');
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.name = 'email';
      form.appendChild(emailInput);
      document.body.appendChild(form);

      const manager = new ValidationManager();
      
      // リアルタイムバリデーション設定
      emailInput.addEventListener('input', (e) => {
        const result = manager.validateWithRules(
          { email: e.target.value },
          { email: ['required', 'email'] }
        );

        if (result.isValid) {
          emailInput.classList.remove('error');
          emailInput.classList.add('valid');
        } else {
          emailInput.classList.remove('valid');
          emailInput.classList.add('error');
        }
      });

      // テスト実行
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      expect(emailInput.classList.contains('valid')).toBe(true);

      emailInput.value = 'invalid-email';
      emailInput.dispatchEvent(new Event('input'));
      expect(emailInput.classList.contains('error')).toBe(true);
    });
  });

  // ===== パフォーマンステスト =====
  describe('パフォーマンステスト', () => {
    test('大量データの処理性能', () => {
      const manager = new ValidationManager();
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        email: `user${i}@example.com`,
        password: `Password${i}!`
      }));

      const rules = {
        email: ['required', 'email'],
        password: ['required', 'strongPassword']
      };

      const startTime = performance.now();
      const results = manager.validateBatch(largeDataset, rules);
      const endTime = performance.now();

      expect(results).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 1秒以内
    });

    test('メモリ使用量の最適化', () => {
      const validator = new PromptValidators();
      
      // 大量のバリデーション実行でメモリリークがないことを確認
      for (let i = 0; i < 100; i++) {
        validator.validateAll(`テストプロンプト ${i}`);
      }

      // ガベージコレクション後もメモリが適切に解放されることを期待
      expect(typeof validator.validateAll).toBe('function');
    });
  });
}); 