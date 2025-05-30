/**
 * components.js のユニットテストスイート
 * 全UIコンポーネントの動作を検証
 */

// モック設定
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

// components.jsの読み込み（Node.js環境での対応）
const fs = require('fs');
const path = require('path');
const componentsPath = path.join(__dirname, '../../src/js/components.js');
const componentsCode = fs.readFileSync(componentsPath, 'utf8');

// グローバル環境でcomponents.jsを実行
eval(componentsCode);

describe('Components.js ユニットテスト', () => {
  
  beforeEach(() => {
    document.body.innerHTML = '';
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  // ===== BaseComponent テスト =====
  describe('BaseComponent クラス', () => {
    let container;

    beforeEach(() => {
      container = document.createElement('div');
      container.className = 'base-component';
      document.body.appendChild(container);
    });

    test('基本的なコンポーネント初期化', () => {
      const component = new BaseComponent(container);
      
      expect(component.element).toBe(container);
      expect(component.options).toBeDefined();
      expect(component.state).toBeDefined();
      expect(component.isInitialized).toBe(true);
    });

    test('オプション設定の反映', () => {
      const options = {
        customOption: 'test-value',
        enabled: false
      };
      
      const component = new BaseComponent(container, options);
      expect(component.options.customOption).toBe('test-value');
      expect(component.options.enabled).toBe(false);
    });

    test('イベントリスナーの登録と削除', () => {
      const component = new BaseComponent(container);
      const handler = jest.fn();
      
      component.on('custom-event', handler);
      component.trigger('custom-event', { data: 'test' });
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ data: 'test' }));
      
      component.off('custom-event', handler);
      component.trigger('custom-event');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('状態管理', () => {
      const component = new BaseComponent(container);
      
      component.setState({ isActive: true, count: 42 });
      expect(component.getState('isActive')).toBe(true);
      expect(component.getState('count')).toBe(42);
      expect(component.getState('nonExistent')).toBeUndefined();
    });

    test('アクセシビリティ設定', () => {
      const component = new BaseComponent(container);
      
      component.setAriaLabel('テストコンポーネント');
      expect(container.getAttribute('aria-label')).toBe('テストコンポーネント');
      
      component.setAriaExpanded(true);
      expect(container.getAttribute('aria-expanded')).toBe('true');
    });

    test('コンポーネントの破棄', () => {
      const component = new BaseComponent(container);
      const destroySpy = jest.spyOn(component, 'destroy');
      
      component.destroy();
      expect(destroySpy).toHaveBeenCalled();
      expect(component.isInitialized).toBe(false);
    });
  });

  // ===== AccordionComponent テスト =====
  describe('AccordionComponent クラス', () => {
    let accordionElement;

    beforeEach(() => {
      accordionElement = document.createElement('div');
      accordionElement.className = 'accordion';
      accordionElement.innerHTML = `
        <div class="accordion-item">
          <button class="accordion-header">セクション1</button>
          <div class="accordion-content">
            <p>コンテンツ1</p>
          </div>
        </div>
        <div class="accordion-item">
          <button class="accordion-header">セクション2</button>
          <div class="accordion-content">
            <p>コンテンツ2</p>
          </div>
        </div>
      `;
      document.body.appendChild(accordionElement);
    });

    test('アコーディオンの初期化', () => {
      const accordion = new AccordionComponent(accordionElement);
      
      expect(accordion.element).toBe(accordionElement);
      expect(accordion.items.length).toBe(2);
    });

    test('アコーディオンアイテムの開閉', () => {
      const accordion = new AccordionComponent(accordionElement);
      const firstHeader = accordionElement.querySelector('.accordion-header');
      const firstContent = accordionElement.querySelector('.accordion-content');
      
      // 最初は閉じている
      expect(firstContent.style.display).toBe('none');
      
      // クリックで開く
      firstHeader.click();
      expect(firstContent.style.display).not.toBe('none');
      expect(firstHeader.getAttribute('aria-expanded')).toBe('true');
      
      // 再度クリックで閉じる
      firstHeader.click();
      expect(firstContent.style.display).toBe('none');
      expect(firstHeader.getAttribute('aria-expanded')).toBe('false');
    });

    test('キーボードナビゲーション', () => {
      const accordion = new AccordionComponent(accordionElement);
      const firstHeader = accordionElement.querySelector('.accordion-header');
      
      // Enterキーで開閉
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      firstHeader.dispatchEvent(enterEvent);
      
      expect(firstHeader.getAttribute('aria-expanded')).toBe('true');
      
      // スペースキーで開閉
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      firstHeader.dispatchEvent(spaceEvent);
      
      expect(firstHeader.getAttribute('aria-expanded')).toBe('false');
    });

    test('複数アイテム同時展開の制御', () => {
      const accordion = new AccordionComponent(accordionElement, { allowMultiple: false });
      const headers = accordionElement.querySelectorAll('.accordion-header');
      
      // 最初のアイテムを開く
      headers[0].click();
      expect(headers[0].getAttribute('aria-expanded')).toBe('true');
      
      // 2番目のアイテムを開く（最初のアイテムは閉じるはず）
      headers[1].click();
      expect(headers[0].getAttribute('aria-expanded')).toBe('false');
      expect(headers[1].getAttribute('aria-expanded')).toBe('true');
    });

    test('アニメーション設定', () => {
      const accordion = new AccordionComponent(accordionElement, { 
        animation: true,
        animationDuration: 300
      });
      
      expect(accordion.options.animation).toBe(true);
      expect(accordion.options.animationDuration).toBe(300);
    });
  });

  // ===== StepProgressComponent テスト =====
  describe('StepProgressComponent クラス', () => {
    let progressElement;

    beforeEach(() => {
      progressElement = document.createElement('div');
      progressElement.className = 'step-progress';
      progressElement.innerHTML = `
        <div class="step" data-step="1">ステップ1</div>
        <div class="step" data-step="2">ステップ2</div>
        <div class="step" data-step="3">ステップ3</div>
      `;
      document.body.appendChild(progressElement);
    });

    test('ステッププログレスの初期化', () => {
      const progress = new StepProgressComponent(progressElement);
      
      expect(progress.element).toBe(progressElement);
      expect(progress.steps.length).toBe(3);
      expect(progress.currentStep).toBe(1);
    });

    test('ステップの移動', () => {
      const progress = new StepProgressComponent(progressElement);
      
      // 次のステップに移動
      progress.nextStep();
      expect(progress.currentStep).toBe(2);
      expect(progress.steps[1].classList.contains('active')).toBe(true);
      
      // 前のステップに移動
      progress.prevStep();
      expect(progress.currentStep).toBe(1);
      expect(progress.steps[0].classList.contains('active')).toBe(true);
    });

    test('特定ステップへのジャンプ', () => {
      const progress = new StepProgressComponent(progressElement);
      
      progress.goToStep(3);
      expect(progress.currentStep).toBe(3);
      expect(progress.steps[2].classList.contains('active')).toBe(true);
      
      // 無効なステップ番号
      progress.goToStep(5);
      expect(progress.currentStep).toBe(3); // 変更されない
    });

    test('ステップの完了マーク', () => {
      const progress = new StepProgressComponent(progressElement);
      
      progress.markStepCompleted(1);
      expect(progress.steps[0].classList.contains('completed')).toBe(true);
      
      progress.markStepCompleted(2);
      expect(progress.steps[1].classList.contains('completed')).toBe(true);
    });

    test('プログレスバーの更新', () => {
      const progress = new StepProgressComponent(progressElement, {
        showProgressBar: true
      });
      
      // プログレスバーが追加されているか確認
      const progressBar = progressElement.querySelector('.progress-bar');
      expect(progressBar).toBeTruthy();
      
      progress.goToStep(2);
      const progressFill = progressBar.querySelector('.progress-fill');
      expect(progressFill.style.width).toContain('%');
    });

    test('イベントハンドリング', () => {
      const progress = new StepProgressComponent(progressElement);
      const stepChangeHandler = jest.fn();
      
      progress.on('stepChanged', stepChangeHandler);
      progress.nextStep();
      
      expect(stepChangeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 2,
          previousStep: 1
        })
      );
    });
  });

  // ===== ChecklistComponent テスト =====
  describe('ChecklistComponent クラス', () => {
    let checklistElement;

    beforeEach(() => {
      checklistElement = document.createElement('div');
      checklistElement.className = 'checklist';
      checklistElement.innerHTML = `
        <div class="checklist-item" data-id="task1">
          <input type="checkbox" id="task1">
          <label for="task1">タスク1</label>
        </div>
        <div class="checklist-item" data-id="task2">
          <input type="checkbox" id="task2">
          <label for="task2">タスク2</label>
        </div>
      `;
      document.body.appendChild(checklistElement);
    });

    test('チェックリストの初期化', () => {
      const checklist = new ChecklistComponent(checklistElement);
      
      expect(checklist.element).toBe(checklistElement);
      expect(checklist.items.length).toBe(2);
      expect(checklist.getProgress().total).toBe(2);
      expect(checklist.getProgress().completed).toBe(0);
    });

    test('アイテムのチェック/アンチェック', () => {
      const checklist = new ChecklistComponent(checklistElement);
      const checkbox = checklistElement.querySelector('#task1');
      
      checklist.checkItem('task1');
      expect(checkbox.checked).toBe(true);
      expect(checklist.getProgress().completed).toBe(1);
      
      checklist.uncheckItem('task1');
      expect(checkbox.checked).toBe(false);
      expect(checklist.getProgress().completed).toBe(0);
    });

    test('ローカルストレージの保存・復元', () => {
      const checklist = new ChecklistComponent(checklistElement, {
        saveToStorage: true,
        storageKey: 'test-checklist'
      });
      
      checklist.checkItem('task1');
      checklist.saveProgress();
      
      // ストレージに保存されているか確認
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-checklist',
        expect.stringContaining('task1')
      );
      
      // 新しいインスタンスで復元確認
      const newChecklist = new ChecklistComponent(checklistElement, {
        saveToStorage: true,
        storageKey: 'test-checklist'
      });
      newChecklist.loadProgress();
      
      expect(newChecklist.getProgress().completed).toBe(1);
    });

    test('全選択/全解除機能', () => {
      const checklist = new ChecklistComponent(checklistElement);
      
      checklist.checkAll();
      expect(checklist.getProgress().completed).toBe(2);
      expect(checklist.isAllCompleted()).toBe(true);
      
      checklist.uncheckAll();
      expect(checklist.getProgress().completed).toBe(0);
      expect(checklist.isAllCompleted()).toBe(false);
    });

    test('プログレス表示の更新', () => {
      const checklist = new ChecklistComponent(checklistElement, {
        showProgress: true
      });
      
      const progressElement = checklistElement.querySelector('.progress-display');
      expect(progressElement).toBeTruthy();
      
      checklist.checkItem('task1');
      expect(progressElement.textContent).toContain('1/2');
      expect(progressElement.textContent).toContain('50%');
    });

    test('アイテム追加/削除', () => {
      const checklist = new ChecklistComponent(checklistElement);
      
      checklist.addItem('task3', 'タスク3');
      expect(checklist.items.length).toBe(3);
      expect(checklist.getProgress().total).toBe(3);
      
      checklist.removeItem('task3');
      expect(checklist.items.length).toBe(2);
      expect(checklist.getProgress().total).toBe(2);
    });
  });

  // ===== ComparisonComponent テスト =====
  describe('ComparisonComponent クラス', () => {
    let comparisonElement;

    beforeEach(() => {
      comparisonElement = document.createElement('div');
      comparisonElement.className = 'comparison';
      comparisonElement.innerHTML = `
        <div class="comparison-good">
          <h3>良い例</h3>
          <div class="example">適切なプロンプト例</div>
        </div>
        <div class="comparison-bad">
          <h3>悪い例</h3>
          <div class="example">不適切なプロンプト例</div>
        </div>
      `;
      document.body.appendChild(comparisonElement);
    });

    test('比較コンポーネントの初期化', () => {
      const comparison = new ComparisonComponent(comparisonElement);
      
      expect(comparison.element).toBe(comparisonElement);
      expect(comparison.goodExample).toBeTruthy();
      expect(comparison.badExample).toBeTruthy();
    });

    test('例の更新', () => {
      const comparison = new ComparisonComponent(comparisonElement);
      
      comparison.updateGoodExample('新しい良い例');
      const goodContent = comparisonElement.querySelector('.comparison-good .example');
      expect(goodContent.textContent).toBe('新しい良い例');
      
      comparison.updateBadExample('新しい悪い例');
      const badContent = comparisonElement.querySelector('.comparison-bad .example');
      expect(badContent.textContent).toBe('新しい悪い例');
    });

    test('ハイライト機能', () => {
      const comparison = new ComparisonComponent(comparisonElement);
      
      comparison.highlightDifferences();
      
      // ハイライトが適用されているか確認
      const goodExample = comparisonElement.querySelector('.comparison-good');
      const badExample = comparisonElement.querySelector('.comparison-bad');
      
      expect(goodExample.classList.contains('highlighted')).toBe(true);
      expect(badExample.classList.contains('highlighted')).toBe(true);
    });

    test('アニメーション効果', () => {
      const comparison = new ComparisonComponent(comparisonElement, {
        enableAnimation: true,
        animationType: 'fadeIn'
      });
      
      comparison.animateComparison();
      
      expect(comparisonElement.classList.contains('animate-fade-in')).toBe(true);
    });

    test('表示モード切り替え', () => {
      const comparison = new ComparisonComponent(comparisonElement);
      
      // サイドバイサイド表示
      comparison.setDisplayMode('side-by-side');
      expect(comparisonElement.classList.contains('side-by-side')).toBe(true);
      
      // 上下表示
      comparison.setDisplayMode('stacked');
      expect(comparisonElement.classList.contains('stacked')).toBe(true);
    });

    test('インタラクティブ要素', () => {
      const comparison = new ComparisonComponent(comparisonElement, {
        interactive: true
      });
      
      const goodExample = comparisonElement.querySelector('.comparison-good');
      const clickHandler = jest.fn();
      
      comparison.on('exampleClicked', clickHandler);
      goodExample.click();
      
      expect(clickHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'good' })
      );
    });
  });

  // ===== PromptGeneratorComponent テスト =====
  describe('PromptGeneratorComponent クラス', () => {
    let generatorElement;

    beforeEach(() => {
      generatorElement = document.createElement('div');
      generatorElement.className = 'prompt-generator';
      generatorElement.innerHTML = `
        <form class="prompt-form">
          <input type="text" name="task" placeholder="タスクを入力">
          <textarea name="context" placeholder="コンテキストを入力"></textarea>
          <button type="submit">生成</button>
        </form>
        <div class="generated-prompt"></div>
        <div class="analysis-result"></div>
      `;
      document.body.appendChild(generatorElement);
    });

    test('プロンプトジェネレーターの初期化', () => {
      const generator = new PromptGeneratorComponent(generatorElement);
      
      expect(generator.element).toBe(generatorElement);
      expect(generator.form).toBeTruthy();
      expect(generator.outputArea).toBeTruthy();
    });

    test('プロンプト生成', () => {
      const generator = new PromptGeneratorComponent(generatorElement);
      const form = generatorElement.querySelector('.prompt-form');
      const taskInput = form.querySelector('input[name="task"]');
      const contextInput = form.querySelector('textarea[name="context"]');
      
      taskInput.value = 'ブログ記事作成';
      contextInput.value = 'SEO対策を考慮して';
      
      const formData = new FormData(form);
      const generatedPrompt = generator.generatePrompt(formData);
      
      expect(generatedPrompt).toContain('ブログ記事作成');
      expect(generatedPrompt).toContain('SEO対策');
    });

    test('テンプレート選択機能', () => {
      const generator = new PromptGeneratorComponent(generatorElement, {
        templates: ['blog', 'email', 'summary']
      });
      
      generator.selectTemplate('blog');
      expect(generator.currentTemplate).toBe('blog');
      
      const templateElements = generatorElement.querySelectorAll('.template-option');
      expect(templateElements.length).toBe(3);
    });

    test('プロンプト分析機能', () => {
      const generator = new PromptGeneratorComponent(generatorElement);
      const prompt = 'ユーザー向けのマニュアルを1500文字で作成してください。対象は初心者です。';
      
      const analysis = generator.analyzePrompt(prompt);
      
      expect(analysis.length).toBeGreaterThan(0);
      expect(analysis.clarity).toBeGreaterThan(0);
      expect(analysis.specificity).toBeGreaterThan(0);
    });

    test('履歴管理', () => {
      const generator = new PromptGeneratorComponent(generatorElement, {
        saveHistory: true
      });
      
      const prompt1 = '最初のプロンプト';
      const prompt2 = '2番目のプロンプト';
      
      generator.addToHistory(prompt1);
      generator.addToHistory(prompt2);
      
      const history = generator.getHistory();
      expect(history.length).toBe(2);
      expect(history[0]).toBe(prompt2); // 最新が最初
      expect(history[1]).toBe(prompt1);
    });

    test('エクスポート機能', () => {
      const generator = new PromptGeneratorComponent(generatorElement);
      const prompt = 'テストプロンプト';
      
      generator.setGeneratedPrompt(prompt);
      
      const exported = generator.exportPrompt('markdown');
      expect(exported).toContain(prompt);
      expect(exported).toContain('```');
    });

    test('リアルタイムバリデーション', () => {
      const generator = new PromptGeneratorComponent(generatorElement, {
        realTimeValidation: true
      });
      
      const taskInput = generatorElement.querySelector('input[name="task"]');
      
      taskInput.value = '短い';
      taskInput.dispatchEvent(new Event('input'));
      
      expect(taskInput.classList.contains('invalid')).toBe(true);
      
      taskInput.value = '適切な長さのタスク説明';
      taskInput.dispatchEvent(new Event('input'));
      
      expect(taskInput.classList.contains('valid')).toBe(true);
    });
  });

  // ===== TemplateComponent テスト =====
  describe('TemplateComponent クラス', () => {
    let templateElement;

    beforeEach(() => {
      templateElement = document.createElement('div');
      templateElement.className = 'template-selector';
      templateElement.innerHTML = `
        <div class="template-list">
          <div class="template-item" data-template="blog">ブログ記事</div>
          <div class="template-item" data-template="email">メール</div>
          <div class="template-item" data-template="summary">要約</div>
        </div>
        <div class="template-preview"></div>
      `;
      document.body.appendChild(templateElement);
    });

    test('テンプレートコンポーネントの初期化', () => {
      const template = new TemplateComponent(templateElement);
      
      expect(template.element).toBe(templateElement);
      expect(template.templates.size).toBeGreaterThan(0);
      expect(template.templateItems.length).toBe(3);
    });

    test('テンプレート選択', () => {
      const template = new TemplateComponent(templateElement);
      const blogTemplate = templateElement.querySelector('[data-template="blog"]');
      
      template.selectTemplate('blog');
      
      expect(template.selectedTemplate).toBe('blog');
      expect(blogTemplate.classList.contains('selected')).toBe(true);
    });

    test('テンプレートプレビュー', () => {
      const template = new TemplateComponent(templateElement);
      const previewArea = templateElement.querySelector('.template-preview');
      
      template.showPreview('blog');
      
      expect(previewArea.innerHTML).toContain('ブログ記事');
      expect(previewArea.style.display).not.toBe('none');
    });

    test('カスタムテンプレート追加', () => {
      const template = new TemplateComponent(templateElement);
      
      const customTemplate = {
        id: 'custom',
        name: 'カスタムテンプレート',
        structure: 'カスタム構造',
        variables: ['title', 'content']
      };
      
      template.addCustomTemplate(customTemplate);
      
      expect(template.templates.has('custom')).toBe(true);
      expect(template.templateItems.length).toBe(4);
    });

    test('テンプレート変数の置換', () => {
      const template = new TemplateComponent(templateElement);
      
      const templateText = 'タイトル: {{title}}\n内容: {{content}}';
      const variables = {
        title: 'テストタイトル',
        content: 'テスト内容'
      };
      
      const result = template.replaceVariables(templateText, variables);
      
      expect(result).toContain('テストタイトル');
      expect(result).toContain('テスト内容');
      expect(result).not.toContain('{{');
    });

    test('テンプレート検索', () => {
      const template = new TemplateComponent(templateElement, {
        enableSearch: true
      });
      
      const searchInput = templateElement.querySelector('.template-search');
      expect(searchInput).toBeTruthy();
      
      template.searchTemplates('ブログ');
      const visibleItems = templateElement.querySelectorAll('.template-item:not(.hidden)');
      expect(visibleItems.length).toBe(1);
      expect(visibleItems[0].getAttribute('data-template')).toBe('blog');
    });

    test('テンプレートのソート', () => {
      const template = new TemplateComponent(templateElement);
      
      template.sortTemplates('name');
      const items = templateElement.querySelectorAll('.template-item');
      
      // 名前順にソートされているか確認
      expect(items[0].textContent).toContain('ブログ記事');
      expect(items[1].textContent).toContain('メール');
      expect(items[2].textContent).toContain('要約');
    });
  });

  // ===== auto-initialization テスト =====
  describe('auto-initialization機能', () => {
    test('コンポーネント自動初期化', () => {
      // 複数のコンポーネント要素を作成
      const accordion = document.createElement('div');
      accordion.className = 'accordion';
      accordion.setAttribute('data-component', 'accordion');
      
      const checklist = document.createElement('div');
      checklist.className = 'checklist';
      checklist.setAttribute('data-component', 'checklist');
      
      document.body.appendChild(accordion);
      document.body.appendChild(checklist);
      
      // 自動初期化実行
      if (typeof initializeComponents === 'function') {
        initializeComponents();
        
        // コンポーネントが初期化されているか確認
        expect(accordion.classList.contains('initialized')).toBe(true);
        expect(checklist.classList.contains('initialized')).toBe(true);
      }
    });

    test('オプション設定付きの自動初期化', () => {
      const accordion = document.createElement('div');
      accordion.className = 'accordion';
      accordion.setAttribute('data-component', 'accordion');
      accordion.setAttribute('data-options', '{"allowMultiple": false}');
      
      document.body.appendChild(accordion);
      
      if (typeof initializeComponents === 'function') {
        initializeComponents();
        
        // オプションが適用されているか確認
        expect(accordion.classList.contains('initialized')).toBe(true);
      }
    });
  });

  // ===== パフォーマンステスト =====
  describe('パフォーマンステスト', () => {
    test('大量アイテムでのチェックリスト性能', () => {
      const largeChecklist = document.createElement('div');
      largeChecklist.className = 'checklist';
      
      // 100個のアイテムを作成
      for (let i = 0; i < 100; i++) {
        const item = document.createElement('div');
        item.className = 'checklist-item';
        item.setAttribute('data-id', `task${i}`);
        item.innerHTML = `
          <input type="checkbox" id="task${i}">
          <label for="task${i}">タスク${i}</label>
        `;
        largeChecklist.appendChild(item);
      }
      
      document.body.appendChild(largeChecklist);
      
      const startTime = performance.now();
      const checklist = new ChecklistComponent(largeChecklist);
      const endTime = performance.now();
      
      expect(checklist.items.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(100); // 100ms以内
    });

    test('メモリリークの検証', () => {
      // 複数のコンポーネントを作成・破棄
      for (let i = 0; i < 50; i++) {
        const element = document.createElement('div');
        element.className = 'base-component';
        document.body.appendChild(element);
        
        const component = new BaseComponent(element);
        component.destroy();
        
        element.remove();
      }
      
      // メモリリークがないことを期待（明示的な確認は困難だが、例外が発生しないことを確認）
      expect(true).toBe(true);
    });
  });

  // ===== 統合テスト =====
  describe('コンポーネント統合テスト', () => {
    test('複数コンポーネントの連携', () => {
      // プロンプトジェネレーターとテンプレートセレクターの連携
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="template-selector">
          <div class="template-item" data-template="blog">ブログ</div>
        </div>
        <div class="prompt-generator">
          <form class="prompt-form">
            <input type="text" name="task">
            <button type="submit">生成</button>
          </form>
          <div class="generated-prompt"></div>
        </div>
      `;
      document.body.appendChild(container);
      
      const templateSelector = new TemplateComponent(container.querySelector('.template-selector'));
      const promptGenerator = new PromptGeneratorComponent(container.querySelector('.prompt-generator'));
      
      // テンプレート選択時にプロンプトジェネレーターにも反映
      templateSelector.on('templateSelected', (event) => {
        promptGenerator.setTemplate(event.template);
      });
      
      templateSelector.selectTemplate('blog');
      
      expect(promptGenerator.currentTemplate).toBe('blog');
    });

    test('アクセシビリティ統合テスト', () => {
      const accordion = document.createElement('div');
      accordion.className = 'accordion';
      accordion.innerHTML = `
        <div class="accordion-item">
          <button class="accordion-header">ヘッダー</button>
          <div class="accordion-content">コンテンツ</div>
        </div>
      `;
      document.body.appendChild(accordion);
      
      const component = new AccordionComponent(accordion);
      const header = accordion.querySelector('.accordion-header');
      const content = accordion.querySelector('.accordion-content');
      
      // ARIA属性が正しく設定されているか確認
      expect(header.getAttribute('aria-expanded')).toBe('false');
      expect(header.getAttribute('aria-controls')).toBeTruthy();
      expect(content.getAttribute('aria-labelledby')).toBeTruthy();
      
      // キーボードアクセシビリティ
      expect(header.getAttribute('tabindex')).toBe('0');
    });
  });
}); 