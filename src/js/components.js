/**
 * 生成AIステップアップガイド - UIコンポーネント
 * @version 1.0.0
 * @description ページ内のインタラクティブコンポーネント集
 */

import { DOM, EventUtils, TimeUtils, A11yUtils, StorageUtils } from './utils.js';
import { PromptValidators, ValidationManager } from './validators.js';

/**
 * ベースコンポーネントクラス
 */
export class BaseComponent {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { ...this.defaultOptions, ...options };
        this.isInitialized = false;
        this.eventListeners = [];
        
        this.init();
    }

    get defaultOptions() {
        return {
            debug: false,
            autoInit: true
        };
    }

    init() {
        if (this.isInitialized) return;
        
        this.validateElement();
        this.setupEventListeners();
        this.render();
        
        this.isInitialized = true;
        this.emit('component:initialized');
    }

    validateElement() {
        if (!this.element || !this.element.nodeType) {
            throw new Error('有効なDOM要素が必要です');
        }
    }

    setupEventListeners() {
        // サブクラスでオーバーライド
    }

    render() {
        // サブクラスでオーバーライド
    }

    on(eventType, handler) {
        const removeListener = EventUtils.on(this.element, eventType, handler);
        this.eventListeners.push(removeListener);
        return removeListener;
    }

    emit(eventType, detail = {}) {
        EventUtils.emit(this.element, eventType, { ...detail, component: this });
    }

    destroy() {
        this.eventListeners.forEach(remove => remove());
        this.eventListeners = [];
        this.isInitialized = false;
    }
}

/**
 * アコーディオンコンポーネント
 */
export class AccordionComponent extends BaseComponent {
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            allowMultiple: false,
            animationDuration: 300,
            closeOthers: true
        };
    }

    setupEventListeners() {
        const triggers = this.element.querySelectorAll('.accordion-trigger');
        
        triggers.forEach(trigger => {
            this.on('click', (e) => {
                if (e.target === trigger || trigger.contains(e.target)) {
                    e.preventDefault();
                    this.toggle(trigger);
                }
            });

            // キーボードサポート
            this.on('keydown', (e) => {
                if (e.target === trigger && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    this.toggle(trigger);
                }
            });
        });
    }

    toggle(trigger) {
        const panel = this.getPanel(trigger);
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            this.close(trigger);
        } else {
            if (this.options.closeOthers) {
                this.closeAll();
            }
            this.open(trigger);
        }
    }

    open(trigger) {
        const panel = this.getPanel(trigger);
        
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.height = panel.scrollHeight + 'px';
        panel.classList.add('is-expanded');
        
        // アニメーション完了後の処理
        setTimeout(() => {
            panel.style.height = 'auto';
        }, this.options.animationDuration);

        this.emit('accordion:opened', { trigger, panel });
        A11yUtils.announce('セクションが展開されました');
    }

    close(trigger) {
        const panel = this.getPanel(trigger);
        
        panel.style.height = panel.scrollHeight + 'px';
        
        // 強制的にリフローを発生させる
        panel.offsetHeight;
        
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.height = '0';
        panel.classList.remove('is-expanded');

        this.emit('accordion:closed', { trigger, panel });
    }

    closeAll() {
        const triggers = this.element.querySelectorAll('.accordion-trigger');
        triggers.forEach(trigger => {
            if (trigger.getAttribute('aria-expanded') === 'true') {
                this.close(trigger);
            }
        });
    }

    getPanel(trigger) {
        const panelId = trigger.getAttribute('aria-controls');
        return document.getElementById(panelId);
    }
}

/**
 * ステップ進行コンポーネント
 */
export class StepProgressComponent extends BaseComponent {
    constructor(element, options = {}) {
        super(element, options);
        this.currentStep = 1;
        this.totalSteps = this.element.querySelectorAll('.step').length;
    }

    get defaultOptions() {
        return {
            ...super.defaultOptions,
            autoProgress: false,
            saveProgress: true,
            storageKey: 'step-progress'
        };
    }

    setupEventListeners() {
        // ステップナビゲーションボタン
        this.on('click', (e) => {
            const nextBtn = e.target.closest('.step-next');
            const prevBtn = e.target.closest('.step-prev');
            const stepBtn = e.target.closest('[data-step]');

            if (nextBtn) {
                e.preventDefault();
                this.nextStep();
            } else if (prevBtn) {
                e.preventDefault();
                this.prevStep();
            } else if (stepBtn) {
                e.preventDefault();
                const stepNumber = parseInt(stepBtn.dataset.step);
                this.goToStep(stepNumber);
            }
        });
    }

    render() {
        this.loadProgress();
        this.updateDisplay();
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateDisplay();
            this.saveProgress();
            this.emit('step:changed', { step: this.currentStep, direction: 'next' });
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateDisplay();
            this.saveProgress();
            this.emit('step:changed', { step: this.currentStep, direction: 'prev' });
        }
    }

    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
            const previousStep = this.currentStep;
            this.currentStep = stepNumber;
            this.updateDisplay();
            this.saveProgress();
            this.emit('step:changed', { 
                step: this.currentStep, 
                previousStep,
                direction: stepNumber > previousStep ? 'next' : 'prev'
            });
        }
    }

    updateDisplay() {
        const steps = this.element.querySelectorAll('.step');
        const indicators = this.element.querySelectorAll('.step-indicator');
        
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === this.currentStep;
            const isCompleted = stepNumber < this.currentStep;
            
            step.classList.toggle('is-active', isActive);
            step.classList.toggle('is-completed', isCompleted);
            step.setAttribute('aria-current', isActive ? 'step' : 'false');
        });

        indicators.forEach((indicator, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === this.currentStep;
            const isCompleted = stepNumber < this.currentStep;
            
            indicator.classList.toggle('is-active', isActive);
            indicator.classList.toggle('is-completed', isCompleted);
        });

        // プログレスバー更新
        const progressBar = this.element.querySelector('.progress-bar');
        if (progressBar) {
            const progress = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', this.currentStep);
            progressBar.setAttribute('aria-valuemax', this.totalSteps);
        }

        // ナビゲーションボタンの状態更新
        this.updateNavigationButtons();

        A11yUtils.announce(`ステップ ${this.currentStep} / ${this.totalSteps}`);
    }

    updateNavigationButtons() {
        const prevBtn = this.element.querySelector('.step-prev');
        const nextBtn = this.element.querySelector('.step-next');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentStep === this.totalSteps;
        }
    }

    saveProgress() {
        if (this.options.saveProgress) {
            StorageUtils.set(this.options.storageKey, this.currentStep);
        }
    }

    loadProgress() {
        if (this.options.saveProgress) {
            const savedStep = StorageUtils.get(this.options.storageKey, 1);
            this.currentStep = Math.min(Math.max(savedStep, 1), this.totalSteps);
        }
    }

    reset() {
        this.currentStep = 1;
        this.updateDisplay();
        this.saveProgress();
        this.emit('step:reset');
    }
}

/**
 * チェックリストコンポーネント
 */
export class ChecklistComponent extends BaseComponent {
    constructor(element, options = {}) {
        super(element, options);
        this.items = [];
        this.completedCount = 0;
    }

    get defaultOptions() {
        return {
            ...super.defaultOptions,
            saveState: true,
            storageKey: 'checklist-state',
            showProgress: true
        };
    }

    setupEventListeners() {
        this.on('change', (e) => {
            const checkbox = e.target.closest('input[type="checkbox"]');
            if (checkbox) {
                this.handleItemChange(checkbox);
            }
        });

        // キーボードサポート
        this.on('keydown', (e) => {
            const item = e.target.closest('.checklist-item');
            if (item && e.key === ' ') {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    e.preventDefault();
                    checkbox.click();
                }
            }
        });
    }

    render() {
        this.initializeItems();
        this.loadState();
        this.updateProgress();
    }

    initializeItems() {
        const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
        this.items = Array.from(checkboxes).map(checkbox => ({
            id: checkbox.id || `item-${Math.random().toString(36).substr(2, 9)}`,
            element: checkbox,
            completed: checkbox.checked
        }));
    }

    handleItemChange(checkbox) {
        const item = this.items.find(item => item.element === checkbox);
        if (item) {
            item.completed = checkbox.checked;
            
            // 視覚的フィードバック
            const listItem = checkbox.closest('.checklist-item');
            listItem.classList.toggle('is-completed', checkbox.checked);
            
            this.updateProgress();
            this.saveState();
            
            this.emit('checklist:itemChanged', { item, completed: checkbox.checked });
            
            if (checkbox.checked) {
                A11yUtils.announce('項目が完了しました');
            } else {
                A11yUtils.announce('項目のチェックが外されました');
            }
        }
    }

    updateProgress() {
        this.completedCount = this.items.filter(item => item.completed).length;
        const totalCount = this.items.length;
        const progressPercentage = totalCount > 0 ? (this.completedCount / totalCount) * 100 : 0;

        if (this.options.showProgress) {
            const progressElement = this.element.querySelector('.checklist-progress');
            if (progressElement) {
                progressElement.textContent = `${this.completedCount} / ${totalCount} 完了`;
            }

            const progressBar = this.element.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progressPercentage}%`;
                progressBar.setAttribute('aria-valuenow', this.completedCount);
                progressBar.setAttribute('aria-valuemax', totalCount);
            }
        }

        // 全完了時のイベント
        if (this.completedCount === this.items.length && this.items.length > 0) {
            this.emit('checklist:allCompleted');
            A11yUtils.announce('すべての項目が完了しました！');
        }
    }

    saveState() {
        if (this.options.saveState) {
            const state = this.items.map(item => ({
                id: item.id,
                completed: item.completed
            }));
            StorageUtils.set(this.options.storageKey, state);
        }
    }

    loadState() {
        if (this.options.saveState) {
            const savedState = StorageUtils.get(this.options.storageKey, []);
            
            savedState.forEach(savedItem => {
                const item = this.items.find(item => item.id === savedItem.id);
                if (item) {
                    item.completed = savedItem.completed;
                    item.element.checked = savedItem.completed;
                    
                    const listItem = item.element.closest('.checklist-item');
                    listItem.classList.toggle('is-completed', savedItem.completed);
                }
            });
        }
    }

    reset() {
        this.items.forEach(item => {
            item.completed = false;
            item.element.checked = false;
            
            const listItem = item.element.closest('.checklist-item');
            listItem.classList.remove('is-completed');
        });
        
        this.updateProgress();
        this.saveState();
        this.emit('checklist:reset');
    }

    getProgress() {
        return {
            completed: this.completedCount,
            total: this.items.length,
            percentage: this.items.length > 0 ? (this.completedCount / this.items.length) * 100 : 0
        };
    }
}

/**
 * 比較表示コンポーネント（良い例・悪い例）
 */
export class ComparisonComponent extends BaseComponent {
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            defaultView: 'both', // 'good', 'bad', 'both'
            animateTransition: true
        };
    }

    setupEventListeners() {
        this.on('click', (e) => {
            const viewBtn = e.target.closest('[data-view]');
            if (viewBtn) {
                e.preventDefault();
                const view = viewBtn.dataset.view;
                this.setView(view);
            }
        });
    }

    render() {
        this.setView(this.options.defaultView);
    }

    setView(view) {
        const goodExamples = this.element.querySelectorAll('.good-example');
        const badExamples = this.element.querySelectorAll('.bad-example');
        const buttons = this.element.querySelectorAll('[data-view]');

        // ボタンの状態更新
        buttons.forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.view === view);
        });

        // 表示の切り替え
        switch (view) {
            case 'good':
                this.showElements(goodExamples);
                this.hideElements(badExamples);
                break;
            case 'bad':
                this.showElements(badExamples);
                this.hideElements(goodExamples);
                break;
            case 'both':
            default:
                this.showElements(goodExamples);
                this.showElements(badExamples);
                break;
        }

        this.emit('comparison:viewChanged', { view });
    }

    showElements(elements) {
        elements.forEach(element => {
            element.style.display = '';
            element.setAttribute('aria-hidden', 'false');
        });
    }

    hideElements(elements) {
        elements.forEach(element => {
            element.style.display = 'none';
            element.setAttribute('aria-hidden', 'true');
        });
    }
}

/**
 * プロンプト生成コンポーネント
 */
export class PromptGeneratorComponent extends BaseComponent {
    constructor(element, options = {}) {
        super(element, options);
        this.validator = null;
        this.generatedPrompt = '';
    }

    get defaultOptions() {
        return {
            ...super.defaultOptions,
            autoValidate: true,
            saveHistory: true,
            maxHistory: 10
        };
    }

    setupEventListeners() {
        const form = this.element.querySelector('.prompt-form');
        if (form) {
            this.validator = new ValidationManager(form, {
                prompt: {
                    required: true,
                    minLength: 10,
                    maxLength: 5000,
                    validateOn: ['blur']
                },
                purpose: {
                    required: true
                }
            });

            this.on('submit', (e) => {
                if (e.target === form) {
                    e.preventDefault();
                    this.generatePrompt();
                }
            });

            // リアルタイム分析
            const promptInput = form.querySelector('[name="prompt"]');
            if (promptInput) {
                const debouncedAnalyze = TimeUtils.debounce(() => {
                    this.analyzePrompt();
                }, 500);

                promptInput.addEventListener('input', debouncedAnalyze);
            }
        }

        // テンプレート選択
        this.on('click', (e) => {
            const templateBtn = e.target.closest('.template-button');
            if (templateBtn) {
                e.preventDefault();
                this.applyTemplate(templateBtn.dataset.template);
            }
        });
    }

    generatePrompt() {
        if (!this.validator.validate().isValid) {
            A11yUtils.announce('入力内容にエラーがあります');
            return;
        }

        const formData = new FormData(this.element.querySelector('.prompt-form'));
        const data = Object.fromEntries(formData.entries());

        // プロンプト生成ロジック
        this.generatedPrompt = this.buildPrompt(data);

        // 結果表示
        this.displayResult(this.generatedPrompt);

        // 履歴保存
        if (this.options.saveHistory) {
            this.saveToHistory(data, this.generatedPrompt);
        }

        this.emit('prompt:generated', { 
            input: data, 
            output: this.generatedPrompt 
        });

        A11yUtils.announce('プロンプトが生成されました');
    }

    buildPrompt(data) {
        const { prompt, purpose, context, format } = data;
        let result = prompt;

        // 目的に応じた接頭辞
        const purposePrefixes = {
            'text-generation': 'テキストを生成してください：',
            'image-generation': '以下の説明に基づいて画像を生成してください：',
            'code-generation': 'コードを生成してください：',
            'data-analysis': 'データを分析してください：',
            'creative-writing': '創作文章を書いてください：',
            'educational': '教育的な内容を作成してください：',
            'business': 'ビジネス向けの文章を作成してください：'
        };

        if (purposePrefixes[purpose]) {
            result = purposePrefixes[purpose] + '\n\n' + result;
        }

        // コンテキスト追加
        if (context && context.trim()) {
            result = `背景情報：${context}\n\n${result}`;
        }

        // フォーマット指定
        if (format && format !== 'none') {
            const formatInstructions = {
                'markdown': '\n\n出力形式：Markdown形式で出力してください。',
                'bullet-points': '\n\n出力形式：箇条書き形式で出力してください。',
                'numbered-list': '\n\n出力形式：番号付きリスト形式で出力してください。',
                'paragraph': '\n\n出力形式：段落形式で出力してください。'
            };

            if (formatInstructions[format]) {
                result += formatInstructions[format];
            }
        }

        return result;
    }

    analyzePrompt() {
        const promptInput = this.element.querySelector('[name="prompt"]');
        if (!promptInput || !promptInput.value.trim()) return;

        const analysis = PromptValidators.validatePromptComplexity(promptInput.value);
        this.displayAnalysis(analysis);
    }

    displayAnalysis(analysis) {
        const analysisContainer = this.element.querySelector('.prompt-analysis');
        if (!analysisContainer) return;

        const { level, suggestions, complexityScore, analysis: details } = analysis;

        analysisContainer.innerHTML = `
            <div class="analysis-summary">
                <h4>プロンプト分析</h4>
                <div class="complexity-level level-${level}">
                    複雑度: ${this.getLevelText(level)} (${complexityScore}/5)
                </div>
            </div>
            <div class="analysis-details">
                <h5>構成要素</h5>
                <ul class="analysis-checklist">
                    <li class="${details.hasContext ? 'checked' : ''}">背景・文脈情報</li>
                    <li class="${details.hasInstructions ? 'checked' : ''}">具体的な指示</li>
                    <li class="${details.hasExamples ? 'checked' : ''}">例・サンプル</li>
                    <li class="${details.hasConstraints ? 'checked' : ''}">制約・条件</li>
                    <li class="${details.hasFormat ? 'checked' : ''}">出力形式指定</li>
                </ul>
            </div>
            <div class="suggestions">
                <h5>改善提案</h5>
                <ul>
                    ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    getLevelText(level) {
        const levels = {
            'basic': '基本',
            'intermediate': '中級',
            'advanced': '上級'
        };
        return levels[level] || level;
    }

    displayResult(prompt) {
        const resultContainer = this.element.querySelector('.prompt-result');
        if (!resultContainer) return;

        resultContainer.innerHTML = `
            <div class="result-header">
                <h4>生成されたプロンプト</h4>
                <button type="button" class="btn btn-outline copy-button" data-copy-target="generated-prompt">
                    コピー
                </button>
            </div>
            <div class="result-content">
                <textarea id="generated-prompt" readonly>${prompt}</textarea>
            </div>
            <div class="result-stats">
                文字数: ${prompt.length}文字
            </div>
        `;

        // コピーボタンの機能
        const copyButton = resultContainer.querySelector('.copy-button');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                this.copyToClipboard(prompt);
            });
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            A11yUtils.announce('クリップボードにコピーしました');
        } catch (error) {
            console.warn('クリップボードコピーに失敗:', error);
            // フォールバック
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            A11yUtils.announce('クリップボードにコピーしました');
        } catch (error) {
            A11yUtils.announce('コピーに失敗しました');
        }
        
        document.body.removeChild(textarea);
    }

    applyTemplate(templateName) {
        const templates = {
            'blog-writing': {
                prompt: 'SEO対策を考慮したブログ記事を書いてください。タイトル、見出し、本文を含めて、読者にとって価値のある内容にしてください。',
                purpose: 'creative-writing',
                format: 'markdown'
            },
            'code-review': {
                prompt: '以下のコードをレビューし、改善点や潜在的な問題を指摘してください。パフォーマンス、セキュリティ、可読性の観点から評価してください。',
                purpose: 'code-generation',
                format: 'bullet-points'
            },
            'email-draft': {
                prompt: 'ビジネスメールの下書きを作成してください。丁寧で簡潔、かつ要点が明確に伝わる文章にしてください。',
                purpose: 'business',
                format: 'paragraph'
            }
        };

        const template = templates[templateName];
        if (template) {
            const form = this.element.querySelector('.prompt-form');
            Object.entries(template).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                }
            });

            A11yUtils.announce(`テンプレート「${templateName}」を適用しました`);
        }
    }

    saveToHistory(input, output) {
        const history = StorageUtils.get('prompt-history', []);
        
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            input,
            output,
            characterCount: output.length
        };

        history.unshift(entry);
        
        // 履歴の上限チェック
        if (history.length > this.options.maxHistory) {
            history.splice(this.options.maxHistory);
        }

        StorageUtils.set('prompt-history', history);
    }

    getHistory() {
        return StorageUtils.get('prompt-history', []);
    }
}

/**
 * テンプレートセレクターコンポーネント
 */
export class TemplateComponent extends BaseComponent {
    constructor(element, options = {}) {
        super(element, options);
        this.selectedTemplate = null;
        this.templates = [];
    }

    get defaultOptions() {
        return {
            ...super.defaultOptions,
            categories: ['all', 'business', 'creative', 'technical', 'educational'],
            defaultCategory: 'all'
        };
    }

    setupEventListeners() {
        // カテゴリフィルター
        this.on('click', (e) => {
            const categoryBtn = e.target.closest('.category-filter');
            const templateCard = e.target.closest('.template-card');

            if (categoryBtn) {
                e.preventDefault();
                this.filterByCategory(categoryBtn.dataset.category);
            } else if (templateCard) {
                e.preventDefault();
                this.selectTemplate(templateCard.dataset.templateId);
            }
        });

        // 検索機能
        const searchInput = this.element.querySelector('.template-search');
        if (searchInput) {
            const debouncedSearch = TimeUtils.debounce((query) => {
                this.searchTemplates(query);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    render() {
        this.loadTemplates();
        this.renderTemplates();
    }

    loadTemplates() {
        // テンプレートデータ（実際の実装では外部ファイルやAPIから取得）
        this.templates = [
            {
                id: 'blog-seo',
                title: 'SEOブログ記事',
                description: 'SEO対策を考慮したブログ記事のプロンプトテンプレート',
                category: 'business',
                tags: ['SEO', 'ブログ', 'マーケティング'],
                content: 'SEO対策を考慮したブログ記事を書いてください...',
                usage: 150
            },
            {
                id: 'creative-story',
                title: '創作小説',
                description: '魅力的な創作小説のプロンプトテンプレート',
                category: 'creative',
                tags: ['小説', '創作', 'ストーリー'],
                content: '魅力的な短編小説を書いてください...',
                usage: 89
            },
            {
                id: 'code-documentation',
                title: 'コードドキュメント',
                description: 'プログラムコードのドキュメント作成用テンプレート',
                category: 'technical',
                tags: ['プログラミング', 'ドキュメント', 'API'],
                content: '以下のコードの詳細なドキュメントを作成してください...',
                usage: 203
            },
            {
                id: 'lesson-plan',
                title: '授業計画',
                description: '教育用の授業計画作成テンプレート',
                category: 'educational',
                tags: ['教育', '授業', '学習'],
                content: '効果的な授業計画を作成してください...',
                usage: 67
            }
        ];
    }

    renderTemplates(filteredTemplates = this.templates) {
        const container = this.element.querySelector('.templates-grid');
        if (!container) return;

        container.innerHTML = filteredTemplates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                    <h4 class="template-title">${template.title}</h4>
                    <span class="template-category">${template.category}</span>
                </div>
                <div class="template-description">
                    ${template.description}
                </div>
                <div class="template-tags">
                    ${template.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="template-footer">
                    <span class="usage-count">${template.usage}回使用</span>
                    <button type="button" class="btn btn-primary btn-sm">使用する</button>
                </div>
            </div>
        `).join('');
    }

    filterByCategory(category) {
        const buttons = this.element.querySelectorAll('.category-filter');
        buttons.forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.category === category);
        });

        const filtered = category === 'all' 
            ? this.templates 
            : this.templates.filter(template => template.category === category);

        this.renderTemplates(filtered);
        this.emit('template:filtered', { category, count: filtered.length });
    }

    searchTemplates(query) {
        if (!query.trim()) {
            this.renderTemplates();
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = this.templates.filter(template => 
            template.title.toLowerCase().includes(lowerQuery) ||
            template.description.toLowerCase().includes(lowerQuery) ||
            template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );

        this.renderTemplates(filtered);
        this.emit('template:searched', { query, count: filtered.length });
    }

    selectTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            this.selectedTemplate = template;
            this.emit('template:selected', { template });
            A11yUtils.announce(`テンプレート「${template.title}」が選択されました`);
        }
    }

    getSelectedTemplate() {
        return this.selectedTemplate;
    }
}

// コンポーネントの自動初期化関数
export function initializeComponents(container = document) {
    const components = new Map();

    // アコーディオン
    container.querySelectorAll('.accordion').forEach(element => {
        components.set(element, new AccordionComponent(element));
    });

    // ステップ進行
    container.querySelectorAll('.step-progress').forEach(element => {
        components.set(element, new StepProgressComponent(element));
    });

    // チェックリスト
    container.querySelectorAll('.checklist').forEach(element => {
        components.set(element, new ChecklistComponent(element));
    });

    // 比較表示
    container.querySelectorAll('.comparison-container').forEach(element => {
        components.set(element, new ComparisonComponent(element));
    });

    // プロンプト生成
    container.querySelectorAll('.prompt-generator').forEach(element => {
        components.set(element, new PromptGeneratorComponent(element));
    });

    // テンプレートセレクター
    container.querySelectorAll('.template-selector').forEach(element => {
        components.set(element, new TemplateComponent(element));
    });

    return components;
}

export {
    BaseComponent as default,
    AccordionComponent,
    StepProgressComponent,
    ChecklistComponent,
    ComparisonComponent,
    PromptGeneratorComponent,
    TemplateComponent
}; 