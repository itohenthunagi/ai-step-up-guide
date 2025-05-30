/**
 * 生成AIステップアップガイド - メインアプリケーション
 * @version 1.0.0
 * @description 全ページ共通の初期化とページ固有機能の制御
 */

// アプリケーション全体の設定
const APP_CONFIG = {
    name: '生成AIステップアップガイド',
    version: '1.0.0',
    debug: false,
    animation: {
        duration: 300,
        easing: 'ease-in-out'
    },
    accessibility: {
        respectsReducedMotion: true
    }
};

/**
 * メインアプリケーションクラス
 */
class AIGuideApp {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.isLoaded = false;
        this.components = new Map();
        
        // 初期化
        this.init();
    }

    /**
     * アプリケーション初期化
     */
    async init() {
        try {
            console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} 初期化開始`);

            // 基本機能の初期化
            this.initializeBasicFeatures();
            
            // ページ固有機能の初期化
            await this.initializePageFeatures();
            
            // アクセシビリティ機能の初期化
            this.initializeAccessibility();
            
            // 初期化完了
            this.isLoaded = true;
            this.dispatchEvent('app:ready');
            
            console.log('アプリケーション初期化完了');
        } catch (error) {
            console.error('アプリケーション初期化エラー:', error);
        }
    }

    /**
     * 現在のページを検出
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        const pageMap = {
            'index.html': 'home',
            'ai-basics.html': 'ai-basics',
            'improve-resolution.html': 'improve-resolution',
            'prompt-engineering.html': 'prompt-engineering',
            'prompt-creator.html': 'prompt-creator'
        };
        
        return pageMap[filename] || 'unknown';
    }

    /**
     * 基本機能の初期化（全ページ共通）
     */
    initializeBasicFeatures() {
        // スムーズスクロール
        this.initSmoothScroll();
        
        // ローディング状態管理
        this.initLoadingStates();
        
        // 外部リンクの処理
        this.initExternalLinks();
        
        // フォーカス管理
        this.initFocusManagement();
    }

    /**
     * ページ固有機能の初期化
     */
    async initializePageFeatures() {
        switch (this.currentPage) {
            case 'home':
                await this.initHomePage();
                break;
            case 'ai-basics':
                await this.initAIBasicsPage();
                break;
            case 'improve-resolution':
                await this.initImproveResolutionPage();
                break;
            case 'prompt-engineering':
                await this.initPromptEngineeringPage();
                break;
            case 'prompt-creator':
                await this.initPromptCreatorPage();
                break;
            default:
                console.warn('未知のページ:', this.currentPage);
        }
    }

    /**
     * ホームページ機能初期化
     */
    async initHomePage() {
        // ファーストビューアニメーション
        this.initHeroAnimation();
        
        // カード要素のホバー効果
        this.initCardHoverEffects();
    }

    /**
     * AI基礎理解ページ機能初期化
     */
    async initAIBasicsPage() {
        const { AccordionComponent } = await import('./components.js');
        
        // アコーディオン機能
        const accordions = document.querySelectorAll('.accordion');
        accordions.forEach(accordion => {
            const component = new AccordionComponent(accordion);
            this.components.set(accordion, component);
        });
    }

    /**
     * 解像度向上ページ機能初期化
     */
    async initImproveResolutionPage() {
        const { StepProgressComponent } = await import('./components.js');
        
        // ステップ進行インジケーター
        const stepProgress = document.querySelector('.step-progress');
        if (stepProgress) {
            const component = new StepProgressComponent(stepProgress);
            this.components.set(stepProgress, component);
        }
    }

    /**
     * プロンプトエンジニアリングページ機能初期化
     */
    async initPromptEngineeringPage() {
        const { ChecklistComponent, ComparisonComponent } = await import('./components.js');
        
        // チェックリスト機能
        const checklists = document.querySelectorAll('.checklist');
        checklists.forEach(checklist => {
            const component = new ChecklistComponent(checklist);
            this.components.set(checklist, component);
        });

        // 良い例・悪い例の比較表示
        const comparisons = document.querySelectorAll('.comparison-container');
        comparisons.forEach(comparison => {
            const component = new ComparisonComponent(comparison);
            this.components.set(comparison, component);
        });
    }

    /**
     * プロンプト作成ページ機能初期化
     */
    async initPromptCreatorPage() {
        const { PromptGeneratorComponent, TemplateComponent } = await import('./components.js');
        
        // プロンプト生成機能
        const promptGenerator = document.querySelector('.prompt-generator');
        if (promptGenerator) {
            const component = new PromptGeneratorComponent(promptGenerator);
            this.components.set(promptGenerator, component);
        }

        // テンプレート選択機能
        const templateSelector = document.querySelector('.template-selector');
        if (templateSelector) {
            const component = new TemplateComponent(templateSelector);
            this.components.set(templateSelector, component);
        }
    }

    /**
     * スムーズスクロール機能
     */
    initSmoothScroll() {
        // アンカーリンクのスムーズスクロール
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // フォーカス移動（アクセシビリティ対応）
                setTimeout(() => {
                    targetElement.focus();
                }, APP_CONFIG.animation.duration);
            }
        });
    }

    /**
     * ローディング状態管理
     */
    initLoadingStates() {
        // ページロード完了時の処理
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.hideLoadingIndicator();
            });
        } else {
            this.hideLoadingIndicator();
        }
    }

    /**
     * ローディングインジケーターを非表示
     */
    hideLoadingIndicator() {
        const loadingElement = document.querySelector('.loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // メインコンテンツを表示
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.opacity = '1';
        }
    }

    /**
     * 外部リンクの処理
     */
    initExternalLinks() {
        const externalLinks = document.querySelectorAll('a[href^="http"]');
        externalLinks.forEach(link => {
            if (!link.hostname || link.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                
                // 視覚的インジケーター追加
                if (!link.querySelector('.external-icon')) {
                    link.insertAdjacentHTML('beforeend', ' <span class="external-icon" aria-label="外部リンク">🔗</span>');
                }
            }
        });
    }

    /**
     * フォーカス管理
     */
    initFocusManagement() {
        // スキップリンクの処理
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.focus();
                    targetElement.scrollIntoView();
                }
            });
        });
    }

    /**
     * ヒーローセクションアニメーション
     */
    initHeroAnimation() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;
        
        // リデュースモーション設定確認
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        // フェードインアニメーション
        const heroElements = heroSection.querySelectorAll('h1, .hero-description, .cta-button');
        heroElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = `opacity ${APP_CONFIG.animation.duration}ms ${APP_CONFIG.animation.easing}, transform ${APP_CONFIG.animation.duration}ms ${APP_CONFIG.animation.easing}`;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * カードホバー効果
     */
    initCardHoverEffects() {
        const cards = document.querySelectorAll('.card, .service-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    card.style.transform = 'translateY(-4px)';
                    card.style.transition = `transform ${APP_CONFIG.animation.duration}ms ${APP_CONFIG.animation.easing}`;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    /**
     * アクセシビリティ機能の初期化
     */
    initializeAccessibility() {
        // キーボードナビゲーション強化
        this.initKeyboardNavigation();
        
        // ARIA属性の動的更新
        this.initAriaUpdates();
        
        // フォーカストラップ
        this.initFocusTrap();
    }

    /**
     * キーボードナビゲーション
     */
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escキーでモーダルを閉じる
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.is-open');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    /**
     * ARIA属性の動的更新
     */
    initAriaUpdates() {
        // 展開/折りたたみ要素のARIA属性更新
        const toggleButtons = document.querySelectorAll('[aria-expanded]');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !isExpanded);
            });
        });
    }

    /**
     * フォーカストラップ
     */
    initFocusTrap() {
        // モーダル要素内でのフォーカストラップ
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal.is-open');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    /**
     * フォーカストラップ実行
     */
    trapFocus(event, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }

    /**
     * カスタムイベント送信
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: { ...detail, app: this }
        });
        document.dispatchEvent(event);
    }

    /**
     * コンポーネントの取得
     */
    getComponent(element) {
        return this.components.get(element);
    }

    /**
     * アプリケーションの破棄
     */
    destroy() {
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        this.components.clear();
    }
}

// アプリケーション初期化
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new AIGuideApp();
    });
} else {
    app = new AIGuideApp();
}

// グローバルに公開（デバッグ用）
window.AIGuideApp = app;

export { AIGuideApp, APP_CONFIG }; 