/**
 * アプリケーション統合テスト
 * 複数JSファイル間の連携動作を検証
 */

// 統合テスト用モック設定
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Performance API モック
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn()
  }
});

// ResizeObserver モック
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 各JSファイルの読み込み
const fs = require('fs');
const path = require('path');

const loadJSFile = (filename) => {
  const filePath = path.join(__dirname, '../../src/js', filename);
  return fs.readFileSync(filePath, 'utf8');
};

// 依存関係順序でファイルを読み込み
const utilsCode = loadJSFile('utils.js');
const validatorsCode = loadJSFile('validators.js');
const componentsCode = loadJSFile('components.js');
const promptEngineCode = loadJSFile('prompt-engine.js');
const uiEnhancementsCode = loadJSFile('ui-enhancements.js');
const appCode = loadJSFile('app.js');

// グローバル環境で実行
eval(utilsCode);
eval(validatorsCode);
eval(componentsCode);
eval(promptEngineCode);
eval(uiEnhancementsCode);
eval(appCode);

describe('アプリケーション統合テスト', () => {
  
  beforeEach(() => {
    document.body.innerHTML = '';
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  // ===== アプリケーション初期化統合テスト =====
  describe('アプリケーション初期化', () => {
    test('AIGuideApp完全初期化', () => {
      // 基本的なHTML構造を作成
      document.body.innerHTML = `
        <div id="ai-guide-app">
          <nav class="main-nav">
            <a href="/basics">AI基礎</a>
            <a href="/prompts">プロンプト</a>
          </nav>
          <main class="main-content">
            <div class="accordion" data-component="accordion">
              <div class="accordion-item">
                <button class="accordion-header">セクション1</button>
                <div class="accordion-content">内容1</div>
              </div>
            </div>
            <div class="checklist" data-component="checklist">
              <div class="checklist-item" data-id="task1">
                <input type="checkbox" id="task1">
                <label for="task1">タスク1</label>
              </div>
            </div>
          </main>
        </div>
      `;

      // アプリケーションインスタンス作成
      const app = new AIGuideApp();
      
      expect(app).toBeDefined();
      expect(app.isInitialized).toBe(true);
      expect(app.components).toBeDefined();
      expect(app.validators).toBeDefined();
      expect(app.promptEngine).toBeDefined();
    });

    test('ページ検出機能', () => {
      // URL変更をシミュレート
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/basics',
          search: '',
          hash: ''
        },
        writable: true
      });

      const app = new AIGuideApp();
      const currentPage = app.detectCurrentPage();
      
      expect(currentPage).toBe('basics');
    });

    test('コンポーネント自動検出・初期化', () => {
      document.body.innerHTML = `
        <div class="accordion" data-component="accordion"></div>
        <div class="checklist" data-component="checklist"></div>
        <div class="prompt-generator" data-component="promptGenerator"></div>
      `;

      const app = new AIGuideApp();
      
      // 各コンポーネントが初期化されているか確認
      const accordion = document.querySelector('.accordion');
      const checklist = document.querySelector('.checklist');
      const promptGenerator = document.querySelector('.prompt-generator');
      
      expect(accordion.classList.contains('initialized')).toBe(true);
      expect(checklist.classList.contains('initialized')).toBe(true);
      expect(promptGenerator.classList.contains('initialized')).toBe(true);
    });
  });

  // ===== プロンプトエンジン統合テスト =====
  describe('プロンプトエンジン統合', () => {
    test('プロンプト生成→バリデーション→分析の流れ', () => {
      const promptEngine = new PromptEngine();
      const validators = new PromptValidators();
      
      // テンプレートからプロンプト生成
      const formData = {
        target: 'ブログ記事',
        audience: '初心者',
        length: '1500文字',
        tone: 'わかりやすく'
      };
      
      const generatedPrompt = promptEngine.generateFromTemplate('blog', formData);
      expect(generatedPrompt).toBeDefined();
      expect(generatedPrompt.length).toBeGreaterThan(50);
      
      // 生成されたプロンプトのバリデーション
      const validationResult = validators.validateAll(generatedPrompt);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.score).toBeGreaterThan(70);
      
      // プロンプト最適化
      const optimizedPrompt = promptEngine.optimizePrompt(generatedPrompt);
      expect(optimizedPrompt.optimized).toBeDefined();
      expect(optimizedPrompt.improvements.length).toBeGreaterThanOrEqual(0);
    });

    test('プロンプト履歴管理', () => {
      const promptEngine = new PromptEngine();
      
      const prompt1 = 'テストプロンプト1';
      const prompt2 = 'テストプロンプト2';
      
      promptEngine.addToHistory(prompt1);
      promptEngine.addToHistory(prompt2);
      
      const history = promptEngine.getHistory();
      expect(history.length).toBe(2);
      expect(history[0].prompt).toBe(prompt2); // 最新が最初
      
      // ローカルストレージに保存されているか確認
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('テンプレート管理機能', () => {
      const templateManager = new PromptTemplateManager();
      
      // デフォルトテンプレートの確認
      const blogTemplate = templateManager.getTemplate('blog');
      expect(blogTemplate).toBeDefined();
      expect(blogTemplate.structure).toBeDefined();
      
      // カスタムテンプレート追加
      const customTemplate = {
        id: 'custom-test',
        name: 'テスト用テンプレート',
        structure: 'カスタム構造: {{task}}',
        variables: ['task'],
        category: 'test'
      };
      
      templateManager.addTemplate(customTemplate);
      const retrievedTemplate = templateManager.getTemplate('custom-test');
      expect(retrievedTemplate).toEqual(customTemplate);
    });
  });

  // ===== UIコンポーネント統合テスト =====
  describe('UIコンポーネント統合', () => {
    test('アコーディオン + チェックリスト連携', () => {
      document.body.innerHTML = `
        <div class="learning-module">
          <div class="accordion" data-component="accordion">
            <div class="accordion-item">
              <button class="accordion-header">学習ステップ1</button>
              <div class="accordion-content">
                <div class="checklist" data-component="checklist">
                  <div class="checklist-item" data-id="step1-task1">
                    <input type="checkbox" id="step1-task1">
                    <label for="step1-task1">基本概念の理解</label>
                  </div>
                  <div class="checklist-item" data-id="step1-task2">
                    <input type="checkbox" id="step1-task2">
                    <label for="step1-task2">実践問題</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const accordion = new AccordionComponent(document.querySelector('.accordion'));
      const checklist = new ChecklistComponent(document.querySelector('.checklist'));
      
      // アコーディオンを開く
      const header = document.querySelector('.accordion-header');
      header.click();
      
      expect(header.getAttribute('aria-expanded')).toBe('true');
      
      // チェックリストのタスクを完了
      checklist.checkItem('step1-task1');
      checklist.checkItem('step1-task2');
      
      expect(checklist.isAllCompleted()).toBe(true);
      expect(checklist.getProgress().percentage).toBe(100);
    });

    test('プロンプトジェネレーター + バリデーション統合', () => {
      document.body.innerHTML = `
        <div class="prompt-workshop">
          <div class="template-selector" data-component="template">
            <div class="template-item" data-template="blog">ブログ記事</div>
            <div class="template-item" data-template="email">メール</div>
          </div>
          <div class="prompt-generator" data-component="promptGenerator">
            <form class="prompt-form">
              <input type="text" name="task" placeholder="タスク">
              <input type="text" name="audience" placeholder="対象読者">
              <button type="submit">生成</button>
            </form>
            <div class="generated-prompt"></div>
            <div class="validation-result"></div>
          </div>
        </div>
      `;

      const templateSelector = new TemplateComponent(document.querySelector('.template-selector'));
      const promptGenerator = new PromptGeneratorComponent(document.querySelector('.prompt-generator'));
      const validators = new PromptValidators();
      
      // テンプレート選択
      templateSelector.selectTemplate('blog');
      expect(templateSelector.selectedTemplate).toBe('blog');
      
      // フォーム入力
      const taskInput = document.querySelector('input[name="task"]');
      const audienceInput = document.querySelector('input[name="audience"]');
      
      taskInput.value = 'SEO対策記事作成';
      audienceInput.value = '初心者ブロガー';
      
      // プロンプト生成
      const form = document.querySelector('.prompt-form');
      const formData = new FormData(form);
      const generatedPrompt = promptGenerator.generatePrompt(formData);
      
      expect(generatedPrompt).toContain('SEO対策記事作成');
      expect(generatedPrompt).toContain('初心者ブロガー');
      
      // リアルタイムバリデーション
      const validationResult = validators.validateAll(generatedPrompt);
      expect(validationResult.score).toBeGreaterThan(50);
    });

    test('ステッププログレス + 学習進捗管理', () => {
      document.body.innerHTML = `
        <div class="learning-progress">
          <div class="step-progress" data-component="stepProgress">
            <div class="step" data-step="1">基礎学習</div>
            <div class="step" data-step="2">実践練習</div>
            <div class="step" data-step="3">応用問題</div>
          </div>
          <div class="content-sections">
            <div class="section" data-step="1">
              <div class="checklist" data-component="checklist">
                <div class="checklist-item" data-id="basic1">
                  <input type="checkbox" id="basic1">
                  <label for="basic1">AI基礎理解</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const stepProgress = new StepProgressComponent(document.querySelector('.step-progress'));
      const checklist = new ChecklistComponent(document.querySelector('.checklist'));
      
      // 学習進捗の連携
      checklist.on('itemChecked', () => {
        if (checklist.isAllCompleted()) {
          stepProgress.markStepCompleted(stepProgress.currentStep);
          stepProgress.nextStep();
        }
      });
      
      // タスク完了
      checklist.checkItem('basic1');
      
      expect(stepProgress.steps[0].classList.contains('completed')).toBe(true);
      expect(stepProgress.currentStep).toBe(2);
    });
  });

  // ===== バリデーション統合テスト =====
  describe('バリデーション統合', () => {
    test('フォームバリデーション + セキュリティチェック', () => {
      document.body.innerHTML = `
        <form class="user-input-form">
          <input type="email" name="email" value="test@example.com">
          <textarea name="content">ユーザーからの安全な入力内容</textarea>
          <button type="submit">送信</button>
        </form>
      `;

      const formValidator = new FormValidators();
      const securityValidator = new SecurityValidators();
      
      const form = document.querySelector('.user-input-form');
      const formData = new FormData(form);
      
      // フォームバリデーション
      const emailValid = formValidator.validateEmail(formData.get('email'));
      expect(emailValid).toBe(true);
      
      // セキュリティバリデーション
      const xssCheck = securityValidator.validateXSS(formData.get('content'));
      expect(xssCheck.isSafe).toBe(true);
      
      // 統合バリデーション結果
      const isSecureAndValid = emailValid && xssCheck.isSafe;
      expect(isSecureAndValid).toBe(true);
    });

    test('プロンプトバリデーション + AI品質チェック', () => {
      const promptValidator = new PromptValidators();
      const aiValidator = new AIValidators();
      
      const testPrompt = `
        SEO最適化されたブログ記事を作成してください。
        
        対象読者: マーケティング初心者
        文字数: 2000文字
        キーワード: "デジタルマーケティング"
        構成: 導入→本文→まとめ
        出力形式: HTML
      `;
      
      // 基本バリデーション
      const basicValidation = promptValidator.validateAll(testPrompt);
      expect(basicValidation.isValid).toBe(true);
      
      // AI品質評価
      const qualityAssessment = aiValidator.validatePromptQuality(testPrompt);
      expect(qualityAssessment.score).toBeGreaterThan(80);
      expect(qualityAssessment.quality).toBe('excellent');
      
      // 安全性チェック
      const safetyCheck = aiValidator.validateContentSafety(testPrompt);
      expect(safetyCheck.isSafe).toBe(true);
    });

    test('リアルタイムバリデーション統合', () => {
      document.body.innerHTML = `
        <div class="realtime-validation-form">
          <input type="text" id="username" data-validate="required,minLength:3">
          <input type="email" id="email" data-validate="required,email">
          <textarea id="prompt" data-validate="promptQuality"></textarea>
          <div class="validation-messages"></div>
        </div>
      `;

      const validationManager = new ValidationManager();
      const formValidator = new FormValidators();
      const promptValidator = new PromptValidators();
      
      // リアルタイムバリデーションのセットアップ
      const usernameInput = document.getElementById('username');
      const emailInput = document.getElementById('email');
      const promptInput = document.getElementById('prompt');
      
      usernameInput.addEventListener('input', (e) => {
        const isValid = formValidator.validateField(e.target.value, {
          required: true,
          minLength: 3
        });
        
        e.target.classList.toggle('valid', isValid);
        e.target.classList.toggle('invalid', !isValid);
      });
      
      // テスト実行
      usernameInput.value = 'user123';
      usernameInput.dispatchEvent(new Event('input'));
      expect(usernameInput.classList.contains('valid')).toBe(true);
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      expect(emailInput.classList.contains('valid')).toBe(true);
    });
  });

  // ===== UI拡張機能統合テスト =====
  describe('UI拡張機能統合', () => {
    test('ローディング + アニメーション + モーダル統合', () => {
      const loadingManager = new LoadingManager();
      const animationManager = new AnimationManager();
      const modalManager = new ModalManager();
      
      document.body.innerHTML = `
        <div id="test-element">テスト要素</div>
        <div id="modal-content">モーダル内容</div>
      `;

      const testElement = document.getElementById('test-element');
      
      // ローディング表示
      loadingManager.show(testElement, 'spinner');
      expect(testElement.querySelector('.loading-spinner')).toBeTruthy();
      
      // アニメーション付きでローディング非表示
      loadingManager.hide(testElement);
      animationManager.fadeIn(testElement);
      
      expect(testElement.classList.contains('animate-fade-in')).toBe(true);
      
      // モーダル表示
      const modalContent = document.getElementById('modal-content');
      modalManager.show(modalContent, {
        title: 'テストモーダル',
        closeButton: true
      });
      
      const modal = document.querySelector('.modal-overlay');
      expect(modal).toBeTruthy();
      expect(modal.style.display).not.toBe('none');
    });

    test('トースト通知 + バリデーションエラー統合', () => {
      const toastManager = new ToastManager();
      const formValidator = new FormValidators();
      
      document.body.innerHTML = `
        <form id="test-form">
          <input type="email" id="email" required>
          <button type="submit">送信</button>
        </form>
      `;

      const form = document.getElementById('test-form');
      const emailInput = document.getElementById('email');
      
      // 無効なメールアドレス入力
      emailInput.value = 'invalid-email';
      
      // フォーム送信イベント
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isValid = formValidator.validateEmail(emailInput.value);
        
        if (!isValid) {
          toastManager.show('メールアドレスの形式が正しくありません', 'error');
        } else {
          toastManager.show('送信しました', 'success');
        }
      });
      
      // 送信ボタンクリック
      form.dispatchEvent(new Event('submit'));
      
      // エラートーストが表示されているか確認
      const errorToast = document.querySelector('.toast.error');
      expect(errorToast).toBeTruthy();
      expect(errorToast.textContent).toContain('メールアドレスの形式が正しくありません');
    });

    test('スクロールアニメーション + 遅延読み込み統合', () => {
      const uiEnhancements = new UIEnhancements();
      
      document.body.innerHTML = `
        <div style="height: 2000px;">
          <div class="animate-on-scroll" data-animation="fadeInUp" style="margin-top: 1000px;">
            アニメーション要素
          </div>
          <img class="lazy-load" data-src="image.jpg" alt="遅延読み込み画像">
        </div>
      `;

      uiEnhancements.init();
      
      // スクロールアニメーションの設定確認
      const animateElement = document.querySelector('.animate-on-scroll');
      expect(animateElement.getAttribute('data-animation')).toBe('fadeInUp');
      
      // 遅延読み込み画像の設定確認
      const lazyImage = document.querySelector('.lazy-load');
      expect(lazyImage.getAttribute('data-src')).toBe('image.jpg');
    });
  });

  // ===== パフォーマンス統合テスト =====
  describe('パフォーマンス統合', () => {
    test('大量データ処理性能', () => {
      const promptEngine = new PromptEngine();
      const validators = new PromptValidators();
      
      // 100個のプロンプトを一括処理
      const prompts = Array.from({ length: 100 }, (_, i) => 
        `テストプロンプト${i}: 詳細な説明を含む適切な長さのテキスト内容`
      );
      
      const startTime = performance.now();
      
      const results = prompts.map(prompt => {
        const validation = validators.validateAll(prompt);
        const analysis = promptEngine.analyzePrompt(prompt);
        return { validation, analysis };
      });
      
      const endTime = performance.now();
      
      expect(results.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(2000); // 2秒以内
      
      // 結果の品質確認
      const validResults = results.filter(r => r.validation.isValid);
      expect(validResults.length).toBeGreaterThan(90); // 90%以上が有効
    });

    test('メモリ使用量最適化', () => {
      // 大量のコンポーネント作成・破棄でメモリリークチェック
      const components = [];
      
      for (let i = 0; i < 50; i++) {
        const element = document.createElement('div');
        element.className = 'test-component';
        document.body.appendChild(element);
        
        const component = new BaseComponent(element);
        components.push(component);
      }
      
      // 全コンポーネント破棄
      components.forEach(component => {
        component.destroy();
        component.element.remove();
      });
      
      // メモリリークがないことを期待
      expect(components.every(c => !c.isInitialized)).toBe(true);
    });

    test('非同期処理の統合', async () => {
      const validationManager = new ValidationManager();
      
      // 非同期バリデーション関数を追加
      validationManager.addRule({
        name: 'asyncEmailCheck',
        validate: async (email) => {
          // 疑似的な非同期処理
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(email.includes('@'));
            }, 100);
          });
        },
        async: true
      });
      
      const result = await validationManager.validateAsync('test@example.com', ['asyncEmailCheck']);
      expect(result.isValid).toBe(true);
    });
  });

  // ===== エラーハンドリング統合テスト =====
  describe('エラーハンドリング統合', () => {
    test('グローバルエラーハンドリング', () => {
      const app = new AIGuideApp();
      const errorHandler = jest.fn();
      
      // グローバルエラーハンドラー設定
      app.setErrorHandler(errorHandler);
      
      // 意図的にエラーを発生
      try {
        throw new Error('テストエラー');
      } catch (error) {
        app.handleError(error);
      }
      
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    test('ネットワークエラー対応', () => {
      // fetch APIのモック
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      const promptEngine = new PromptEngine();
      
      return promptEngine.fetchExternalTemplate('test-template')
        .catch(error => {
          expect(error.message).toBe('Network error');
          return { error: 'ネットワークエラーが発生しました' };
        })
        .then(result => {
          expect(result.error).toBeDefined();
        });
    });

    test('バリデーションエラーの統合処理', () => {
      const formValidator = new FormValidators();
      const toastManager = new ToastManager();
      
      document.body.innerHTML = `
        <form class="validation-form">
          <input type="email" name="email" value="invalid-email">
          <input type="password" name="password" value="weak">
          <button type="submit">送信</button>
        </form>
      `;

      const form = document.querySelector('.validation-form');
      const formData = new FormData(form);
      
      const emailResult = formValidator.validateEmail(formData.get('email'));
      const passwordResult = formValidator.validatePassword(formData.get('password'));
      
      const errors = [];
      if (!emailResult) errors.push('メールアドレスが無効です');
      if (!passwordResult) errors.push('パスワードが弱すぎます');
      
      // エラー表示
      errors.forEach(error => {
        toastManager.show(error, 'error');
      });
      
      const errorToasts = document.querySelectorAll('.toast.error');
      expect(errorToasts.length).toBe(2);
    });
  });

  // ===== アクセシビリティ統合テスト =====
  describe('アクセシビリティ統合', () => {
    test('キーボードナビゲーション統合', () => {
      document.body.innerHTML = `
        <div class="accessible-app">
          <div class="accordion" data-component="accordion">
            <div class="accordion-item">
              <button class="accordion-header">セクション1</button>
              <div class="accordion-content">
                <div class="checklist" data-component="checklist">
                  <div class="checklist-item" data-id="task1">
                    <input type="checkbox" id="task1">
                    <label for="task1">タスク1</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const accordion = new AccordionComponent(document.querySelector('.accordion'));
      const checklist = new ChecklistComponent(document.querySelector('.checklist'));
      
      const header = document.querySelector('.accordion-header');
      const checkbox = document.querySelector('#task1');
      
      // Tab順序の確認
      expect(header.getAttribute('tabindex')).toBe('0');
      expect(checkbox.getAttribute('tabindex')).toBeDefined();
      
      // キーボード操作
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      header.dispatchEvent(enterEvent);
      
      expect(header.getAttribute('aria-expanded')).toBe('true');
    });

    test('スクリーンリーダー対応統合', () => {
      document.body.innerHTML = `
        <div class="sr-test">
          <div class="step-progress" data-component="stepProgress">
            <div class="step" data-step="1">ステップ1</div>
            <div class="step" data-step="2">ステップ2</div>
          </div>
        </div>
      `;

      const stepProgress = new StepProgressComponent(document.querySelector('.step-progress'));
      
      // ARIA属性の確認
      const steps = document.querySelectorAll('.step');
      steps.forEach((step, index) => {
        expect(step.getAttribute('role')).toBe('tab');
        expect(step.getAttribute('aria-selected')).toBeDefined();
      });
      
      // ライブリージョンでの通知
      stepProgress.nextStep();
      
      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement).toBeTruthy();
    });

    test('カラーコントラスト・フォーカス統合', () => {
      document.body.innerHTML = `
        <div class="focus-test">
          <button class="primary-button">プライマリボタン</button>
          <button class="secondary-button">セカンダリボタン</button>
        </div>
      `;

      const buttons = document.querySelectorAll('button');
      
      buttons.forEach(button => {
        // フォーカス時のアウトライン確認
        button.focus();
        const focusOutline = getComputedStyle(button).outline;
        expect(focusOutline).toBeDefined();
        
        // フォーカス可能要素であることを確認
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });
}); 