/**
 * 生成AIステップアップガイド - UI/UX向上機能
 * @version 1.0.0
 * @description アニメーション、ローディング、モーダル、フォーム強化機能
 */

import { DOM, EventUtils, TimeUtils, A11yUtils } from './utils.js';

/**
 * ローディングマネージャー
 */
export class LoadingManager {
    constructor() {
        this.activeLoadings = new Map();
        this.globalLoadingCount = 0;
        this.loadingIndicators = new Map();
    }

    /**
     * ローディング開始
     */
    start(id, options = {}) {
        const config = {
            text: 'Loading...',
            type: 'spinner', // spinner, progress, dots
            backdrop: false,
            target: null,
            timeout: 30000,
            ...options
        };

        // 既存のローディングがある場合は更新
        if (this.activeLoadings.has(id)) {
            this.updateLoading(id, config);
            return;
        }

        this.activeLoadings.set(id, {
            ...config,
            startTime: Date.now(),
            element: this.createLoadingElement(config)
        });

        this.globalLoadingCount++;
        this.showLoading(id);

        // タイムアウト設定
        if (config.timeout > 0) {
            setTimeout(() => {
                if (this.activeLoadings.has(id)) {
                    this.finish(id);
                    console.warn(`ローディング "${id}" がタイムアウトしました`);
                }
            }, config.timeout);
        }

        this.updateGlobalState();
        return id;
    }

    /**
     * ローディング終了
     */
    finish(id) {
        const loading = this.activeLoadings.get(id);
        if (!loading) return false;

        this.hideLoading(id);
        this.activeLoadings.delete(id);
        this.globalLoadingCount = Math.max(0, this.globalLoadingCount - 1);

        this.updateGlobalState();
        return true;
    }

    /**
     * ローディング要素作成
     */
    createLoadingElement(config) {
        const container = DOM.create('div', {
            className: 'loading-container',
            'aria-live': 'polite',
            'aria-busy': 'true'
        });

        let content = '';
        switch (config.type) {
            case 'spinner':
                content = `
                    <div class="loading-spinner" aria-hidden="true"></div>
                    <div class="loading-text">${config.text}</div>
                `;
                break;
            case 'dots':
                content = `
                    <div class="loading-dots" aria-hidden="true">
                        <span></span><span></span><span></span>
                    </div>
                    <div class="loading-text">${config.text}</div>
                `;
                break;
            case 'progress':
                content = `
                    <div class="loading-progress" aria-hidden="true">
                        <div class="progress-bar" style="width: 0%"></div>
                    </div>
                    <div class="loading-text">${config.text}</div>
                `;
                break;
        }

        container.innerHTML = content;

        if (config.backdrop) {
            container.classList.add('has-backdrop');
        }

        return container;
    }

    /**
     * ローディング表示
     */
    showLoading(id) {
        const loading = this.activeLoadings.get(id);
        if (!loading) return;

        const target = loading.target 
            ? (typeof loading.target === 'string' ? DOM.$(loading.target) : loading.target)
            : document.body;

        target.appendChild(loading.element);
        
        // アニメーション開始
        requestAnimationFrame(() => {
            loading.element.classList.add('is-visible');
        });

        A11yUtils.announce(`ローディング開始: ${loading.text}`);
    }

    /**
     * ローディング非表示
     */
    hideLoading(id) {
        const loading = this.activeLoadings.get(id);
        if (!loading || !loading.element.parentNode) return;

        loading.element.classList.add('is-hiding');
        
        setTimeout(() => {
            if (loading.element.parentNode) {
                loading.element.parentNode.removeChild(loading.element);
            }
        }, 300);

        A11yUtils.announce('ローディング完了');
    }

    /**
     * ローディング更新
     */
    updateLoading(id, updates) {
        const loading = this.activeLoadings.get(id);
        if (!loading) return;

        if (updates.text) {
            const textElement = loading.element.querySelector('.loading-text');
            if (textElement) {
                textElement.textContent = updates.text;
            }
        }

        if (updates.progress !== undefined && loading.type === 'progress') {
            const progressBar = loading.element.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${Math.min(100, Math.max(0, updates.progress))}%`;
            }
        }

        Object.assign(loading, updates);
    }

    /**
     * グローバル状態更新
     */
    updateGlobalState() {
        document.body.classList.toggle('is-loading', this.globalLoadingCount > 0);
    }

    /**
     * 全ローディング終了
     */
    finishAll() {
        Array.from(this.activeLoadings.keys()).forEach(id => {
            this.finish(id);
        });
    }

    /**
     * ローディング状態確認
     */
    isLoading(id = null) {
        if (id) {
            return this.activeLoadings.has(id);
        }
        return this.globalLoadingCount > 0;
    }
}

/**
 * アニメーションマネージャー
 */
export class AnimationManager {
    constructor() {
        this.activeAnimations = new Map();
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // リデュースモーション設定の変更を監視
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;
        });
    }

    /**
     * フェードイン
     */
    fadeIn(element, options = {}) {
        if (this.prefersReducedMotion) {
            element.style.opacity = '1';
            return Promise.resolve();
        }

        const config = {
            duration: 300,
            easing: 'ease-out',
            delay: 0,
            ...options
        };

        return this.animate(element, [
            { opacity: 0 },
            { opacity: 1 }
        ], config);
    }

    /**
     * フェードアウト
     */
    fadeOut(element, options = {}) {
        if (this.prefersReducedMotion) {
            element.style.opacity = '0';
            return Promise.resolve();
        }

        const config = {
            duration: 300,
            easing: 'ease-in',
            delay: 0,
            ...options
        };

        return this.animate(element, [
            { opacity: 1 },
            { opacity: 0 }
        ], config);
    }

    /**
     * スライドイン
     */
    slideIn(element, direction = 'up', options = {}) {
        if (this.prefersReducedMotion) {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
            return Promise.resolve();
        }

        const transforms = {
            up: ['translateY(20px)', 'translateY(0)'],
            down: ['translateY(-20px)', 'translateY(0)'],
            left: ['translateX(20px)', 'translateX(0)'],
            right: ['translateX(-20px)', 'translateX(0)']
        };

        const config = {
            duration: 400,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            delay: 0,
            ...options
        };

        return this.animate(element, [
            { 
                transform: transforms[direction][0],
                opacity: 0
            },
            { 
                transform: transforms[direction][1],
                opacity: 1
            }
        ], config);
    }

    /**
     * スケールイン
     */
    scaleIn(element, options = {}) {
        if (this.prefersReducedMotion) {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
            return Promise.resolve();
        }

        const config = {
            duration: 300,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            delay: 0,
            ...options
        };

        return this.animate(element, [
            { 
                transform: 'scale(0.9)',
                opacity: 0
            },
            { 
                transform: 'scale(1)',
                opacity: 1
            }
        ], config);
    }

    /**
     * パルス
     */
    pulse(element, options = {}) {
        if (this.prefersReducedMotion) {
            return Promise.resolve();
        }

        const config = {
            duration: 600,
            iterations: 1,
            easing: 'ease-in-out',
            ...options
        };

        return this.animate(element, [
            { transform: 'scale(1)' },
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
        ], config);
    }

    /**
     * シェイク
     */
    shake(element, options = {}) {
        if (this.prefersReducedMotion) {
            return Promise.resolve();
        }

        const config = {
            duration: 500,
            iterations: 1,
            easing: 'ease-in-out',
            ...options
        };

        return this.animate(element, [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], config);
    }

    /**
     * 基本アニメーション実行
     */
    animate(element, keyframes, options) {
        if (!element || !element.animate) {
            return Promise.resolve();
        }

        const animationId = this.generateAnimationId();
        
        const animation = element.animate(keyframes, {
            duration: options.duration || 300,
            easing: options.easing || 'ease',
            delay: options.delay || 0,
            iterations: options.iterations || 1,
            fill: options.fill || 'forwards'
        });

        this.activeAnimations.set(animationId, animation);

        return new Promise((resolve) => {
            animation.addEventListener('finish', () => {
                this.activeAnimations.delete(animationId);
                resolve();
            });

            animation.addEventListener('cancel', () => {
                this.activeAnimations.delete(animationId);
                resolve();
            });
        });
    }

    /**
     * ステージングアニメーション
     */
    staggerAnimation(elements, animationFunc, options = {}) {
        const { delay = 100, direction = 'forward' } = options;
        const elementsArray = Array.from(elements);
        
        if (direction === 'reverse') {
            elementsArray.reverse();
        }

        const promises = elementsArray.map((element, index) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    animationFunc(element).then(resolve);
                }, index * delay);
            });
        });

        return Promise.all(promises);
    }

    /**
     * スクロールアニメーション
     */
    animateOnScroll(element, animationFunc, options = {}) {
        const { threshold = 0.1, once = true } = options;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animationFunc(entry.target);
                    
                    if (once) {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            threshold,
            rootMargin: '0px 0px -50px 0px'
        });

        observer.observe(element);
        return observer;
    }

    /**
     * アニメーションID生成
     */
    generateAnimationId() {
        return `animation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 全アニメーション停止
     */
    stopAllAnimations() {
        this.activeAnimations.forEach(animation => {
            animation.cancel();
        });
        this.activeAnimations.clear();
    }
}

/**
 * モーダルマネージャー
 */
export class ModalManager {
    constructor() {
        this.activeModals = new Map();
        this.modalStack = [];
        this.escapeHandler = this.handleEscape.bind(this);
        this.setupEventListeners();
    }

    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.escapeHandler);
        
        // モーダル外クリックでの閉じる処理
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                const modalId = e.target.dataset.modalId;
                if (modalId) {
                    this.close(modalId);
                }
            }
        });
    }

    /**
     * モーダル作成
     */
    create(id, options = {}) {
        const config = {
            title: '',
            content: '',
            size: 'medium', // small, medium, large, fullscreen
            closable: true,
            backdrop: true,
            keyboard: true,
            focus: true,
            animation: true,
            className: '',
            buttons: [],
            onOpen: null,
            onClose: null,
            ...options
        };

        const modalElement = this.createModalElement(id, config);
        this.activeModals.set(id, {
            element: modalElement,
            config,
            isOpen: false
        });

        document.body.appendChild(modalElement);
        return id;
    }

    /**
     * モーダル要素作成
     */
    createModalElement(id, config) {
        const modal = DOM.create('div', {
            className: `modal modal-${config.size} ${config.className}`,
            id: `modal-${id}`,
            'aria-hidden': 'true',
            'aria-labelledby': `modal-${id}-title`,
            'aria-describedby': `modal-${id}-content`,
            role: 'dialog',
            'aria-modal': 'true'
        });

        if (config.backdrop) {
            const backdrop = DOM.create('div', {
                className: 'modal-backdrop',
                'data-modal-id': id
            });
            modal.appendChild(backdrop);
        }

        const dialog = DOM.create('div', {
            className: 'modal-dialog'
        });

        const content = DOM.create('div', {
            className: 'modal-content'
        });

        // ヘッダー
        if (config.title || config.closable) {
            const header = DOM.create('div', {
                className: 'modal-header'
            });

            if (config.title) {
                const title = DOM.create('h3', {
                    className: 'modal-title',
                    id: `modal-${id}-title`
                }, config.title);
                header.appendChild(title);
            }

            if (config.closable) {
                const closeButton = DOM.create('button', {
                    type: 'button',
                    className: 'modal-close',
                    'aria-label': 'モーダルを閉じる'
                }, '×');
                
                closeButton.addEventListener('click', () => {
                    this.close(id);
                });
                
                header.appendChild(closeButton);
            }

            content.appendChild(header);
        }

        // ボディ
        const body = DOM.create('div', {
            className: 'modal-body',
            id: `modal-${id}-content`
        });

        if (typeof config.content === 'string') {
            body.innerHTML = config.content;
        } else if (config.content instanceof Element) {
            body.appendChild(config.content);
        }

        content.appendChild(body);

        // フッター（ボタン）
        if (config.buttons && config.buttons.length > 0) {
            const footer = DOM.create('div', {
                className: 'modal-footer'
            });

            config.buttons.forEach(buttonConfig => {
                const button = DOM.create('button', {
                    type: 'button',
                    className: `btn ${buttonConfig.className || 'btn-primary'}`
                }, buttonConfig.text);

                if (buttonConfig.action) {
                    button.addEventListener('click', (e) => {
                        buttonConfig.action(e, id);
                    });
                }

                footer.appendChild(button);
            });

            content.appendChild(footer);
        }

        dialog.appendChild(content);
        modal.appendChild(dialog);

        return modal;
    }

    /**
     * モーダル表示
     */
    open(id) {
        const modal = this.activeModals.get(id);
        if (!modal || modal.isOpen) return false;

        // フォーカス管理
        this.previousFocus = document.activeElement;

        // モーダルスタック管理
        this.modalStack.push(id);
        
        modal.isOpen = true;
        modal.element.setAttribute('aria-hidden', 'false');
        modal.element.classList.add('is-open');

        // アニメーション
        if (modal.config.animation) {
            const animationManager = new AnimationManager();
            animationManager.fadeIn(modal.element);
            animationManager.scaleIn(modal.element.querySelector('.modal-dialog'));
        }

        // フォーカス設定
        if (modal.config.focus) {
            setTimeout(() => {
                const firstFocusable = modal.element.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, 100);
        }

        // body スクロール無効化
        document.body.classList.add('modal-open');

        // コールバック実行
        if (modal.config.onOpen) {
            modal.config.onOpen(id);
        }

        A11yUtils.announce('モーダルが開きました');
        return true;
    }

    /**
     * モーダル非表示
     */
    close(id) {
        const modal = this.activeModals.get(id);
        if (!modal || !modal.isOpen) return false;

        modal.isOpen = false;
        modal.element.setAttribute('aria-hidden', 'true');
        modal.element.classList.remove('is-open');

        // モーダルスタックから削除
        const stackIndex = this.modalStack.indexOf(id);
        if (stackIndex > -1) {
            this.modalStack.splice(stackIndex, 1);
        }

        // 最後のモーダルの場合、body クラスを削除
        if (this.modalStack.length === 0) {
            document.body.classList.remove('modal-open');
        }

        // フォーカス復元
        if (this.previousFocus && this.modalStack.length === 0) {
            this.previousFocus.focus();
            this.previousFocus = null;
        }

        // アニメーション
        if (modal.config.animation) {
            const animationManager = new AnimationManager();
            animationManager.fadeOut(modal.element);
        }

        // コールバック実行
        if (modal.config.onClose) {
            modal.config.onClose(id);
        }

        A11yUtils.announce('モーダルが閉じられました');
        return true;
    }

    /**
     * モーダル削除
     */
    destroy(id) {
        const modal = this.activeModals.get(id);
        if (!modal) return false;

        if (modal.isOpen) {
            this.close(id);
        }

        if (modal.element.parentNode) {
            modal.element.parentNode.removeChild(modal.element);
        }

        this.activeModals.delete(id);
        return true;
    }

    /**
     * Escapeキーハンドラー
     */
    handleEscape(e) {
        if (e.key === 'Escape' && this.modalStack.length > 0) {
            const topModalId = this.modalStack[this.modalStack.length - 1];
            const modal = this.activeModals.get(topModalId);
            
            if (modal && modal.config.keyboard) {
                this.close(topModalId);
            }
        }
    }

    /**
     * アクティブモーダル確認
     */
    isOpen(id = null) {
        if (id) {
            const modal = this.activeModals.get(id);
            return modal ? modal.isOpen : false;
        }
        return this.modalStack.length > 0;
    }

    /**
     * 全モーダル閉じる
     */
    closeAll() {
        Array.from(this.modalStack).forEach(id => {
            this.close(id);
        });
    }
}

/**
 * トーストマネージャー
 */
export class ToastManager {
    constructor() {
        this.toasts = new Map();
        this.container = this.createContainer();
        this.maxToasts = 5;
    }

    /**
     * トーストコンテナ作成
     */
    createContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = DOM.create('div', {
                id: 'toast-container',
                className: 'toast-container',
                'aria-live': 'polite',
                'aria-atomic': 'false'
            });
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * トースト表示
     */
    show(message, options = {}) {
        const config = {
            type: 'info', // success, error, warning, info
            duration: 4000,
            closable: true,
            action: null,
            ...options
        };

        const id = this.generateToastId();
        const toastElement = this.createToastElement(id, message, config);

        this.toasts.set(id, {
            element: toastElement,
            config,
            timer: null
        });

        // 最大数チェック
        if (this.toasts.size > this.maxToasts) {
            const oldestId = Array.from(this.toasts.keys())[0];
            this.hide(oldestId);
        }

        this.container.appendChild(toastElement);

        // アニメーション
        requestAnimationFrame(() => {
            toastElement.classList.add('is-visible');
        });

        // 自動非表示タイマー
        if (config.duration > 0) {
            const timer = setTimeout(() => {
                this.hide(id);
            }, config.duration);

            this.toasts.get(id).timer = timer;
        }

        return id;
    }

    /**
     * トースト要素作成
     */
    createToastElement(id, message, config) {
        const toast = DOM.create('div', {
            className: `toast toast-${config.type}`,
            id: `toast-${id}`,
            role: 'alert'
        });

        const icon = this.getIcon(config.type);
        
        let content = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
        `;

        if (config.action) {
            content += `
                <button type="button" class="toast-action" aria-label="${config.action.label}">
                    ${config.action.text}
                </button>
            `;
        }

        if (config.closable) {
            content += `
                <button type="button" class="toast-close" aria-label="閉じる">×</button>
            `;
        }

        toast.innerHTML = content;

        // イベントリスナー
        if (config.action) {
            const actionButton = toast.querySelector('.toast-action');
            actionButton.addEventListener('click', (e) => {
                config.action.handler(e, id);
            });
        }

        if (config.closable) {
            const closeButton = toast.querySelector('.toast-close');
            closeButton.addEventListener('click', () => {
                this.hide(id);
            });
        }

        return toast;
    }

    /**
     * アイコン取得
     */
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * トースト非表示
     */
    hide(id) {
        const toast = this.toasts.get(id);
        if (!toast) return false;

        // タイマークリア
        if (toast.timer) {
            clearTimeout(toast.timer);
        }

        // アニメーション
        toast.element.classList.add('is-hiding');

        setTimeout(() => {
            if (toast.element.parentNode) {
                toast.element.parentNode.removeChild(toast.element);
            }
            this.toasts.delete(id);
        }, 300);

        return true;
    }

    /**
     * 便利メソッド
     */
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error', duration: 6000 });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    /**
     * トーストID生成
     */
    generateToastId() {
        return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 全トースト削除
     */
    clear() {
        Array.from(this.toasts.keys()).forEach(id => {
            this.hide(id);
        });
    }
}

/**
 * UI エンハンスメント統合クラス
 */
export class UIEnhancements {
    constructor() {
        this.loading = new LoadingManager();
        this.animation = new AnimationManager();
        this.modal = new ModalManager();
        this.toast = new ToastManager();

        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this.setupScrollAnimations();
        this.setupLazyLoading();
        this.setupSmoothScrolling();
        this.setupFormEnhancements();
    }

    /**
     * スクロールアニメーション設定
     */
    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        animatedElements.forEach(element => {
            const animationType = element.dataset.animate;
            const delay = parseInt(element.dataset.delay) || 0;
            
            this.animation.animateOnScroll(element, () => {
                setTimeout(() => {
                    switch (animationType) {
                        case 'fadeIn':
                            this.animation.fadeIn(element);
                            break;
                        case 'slideIn':
                            this.animation.slideIn(element, element.dataset.direction || 'up');
                            break;
                        case 'scaleIn':
                            this.animation.scaleIn(element);
                            break;
                    }
                }, delay);
            });
        });
    }

    /**
     * 遅延読み込み設定
     */
    setupLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * スムーススクロール設定
     */
    setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // フォーカス管理
                setTimeout(() => {
                    targetElement.focus();
                }, 500);
            }
        });
    }

    /**
     * フォーム機能強化
     */
    setupFormEnhancements() {
        // リアルタイム文字数カウント
        const textareas = document.querySelectorAll('textarea[data-max-length]');
        textareas.forEach(textarea => {
            const maxLength = parseInt(textarea.dataset.maxLength);
            const counter = this.createCharacterCounter(maxLength);
            
            textarea.parentNode.appendChild(counter);
            
            textarea.addEventListener('input', () => {
                this.updateCharacterCounter(textarea, counter, maxLength);
            });
        });

        // フォーム送信確認
        const forms = document.querySelectorAll('form[data-confirm]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const message = form.dataset.confirm || '送信してもよろしいですか？';
                if (!confirm(message)) {
                    e.preventDefault();
                }
            });
        });
    }

    /**
     * 文字数カウンター作成
     */
    createCharacterCounter(maxLength) {
        return DOM.create('div', {
            className: 'character-counter',
            'aria-live': 'polite'
        }, `0 / ${maxLength}`);
    }

    /**
     * 文字数カウンター更新
     */
    updateCharacterCounter(textarea, counter, maxLength) {
        const currentLength = textarea.value.length;
        const remaining = maxLength - currentLength;
        
        counter.textContent = `${currentLength} / ${maxLength}`;
        counter.classList.toggle('is-warning', remaining < 50);
        counter.classList.toggle('is-danger', remaining < 0);
    }

    /**
     * 便利メソッド：非同期処理のラッピング
     */
    async withLoading(asyncFunction, loadingOptions = {}) {
        const loadingId = this.loading.start('async-operation', loadingOptions);
        
        try {
            const result = await asyncFunction();
            return result;
        } catch (error) {
            this.toast.error('処理中にエラーが発生しました');
            throw error;
        } finally {
            this.loading.finish(loadingId);
        }
    }

    /**
     * 便利メソッド：成功通知
     */
    showSuccess(message, options = {}) {
        this.toast.success(message, options);
    }

    /**
     * 便利メソッド：エラー通知
     */
    showError(message, options = {}) {
        this.toast.error(message, options);
    }

    /**
     * 便利メソッド：確認モーダル
     */
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modalId = this.modal.create('confirm-modal', {
                title: options.title || '確認',
                content: message,
                size: 'small',
                buttons: [
                    {
                        text: 'キャンセル',
                        className: 'btn-outline',
                        action: () => {
                            this.modal.close(modalId);
                            resolve(false);
                        }
                    },
                    {
                        text: 'OK',
                        className: 'btn-primary',
                        action: () => {
                            this.modal.close(modalId);
                            resolve(true);
                        }
                    }
                ],
                onClose: () => resolve(false)
            });

            this.modal.open(modalId);
        });
    }
}

// グローバルインスタンス作成
export const ui = new UIEnhancements();

export {
    LoadingManager,
    AnimationManager,
    ModalManager,
    ToastManager,
    UIEnhancements as default
}; 