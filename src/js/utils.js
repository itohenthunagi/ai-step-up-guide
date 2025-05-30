/**
 * 生成AIステップアップガイド - ユーティリティ関数
 * @version 1.0.0
 * @description 汎用的なヘルパー関数集
 */

/**
 * DOM操作ユーティリティ
 */
export const DOM = {
    /**
     * 要素を取得（querySelector のラッパー）
     */
    $(selector, context = document) {
        return context.querySelector(selector);
    },

    /**
     * 複数要素を取得（querySelectorAll のラッパー）
     */
    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    /**
     * 要素作成
     */
    create(tagName, attributes = {}, textContent = '') {
        const element = document.createElement(tagName);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    },

    /**
     * 要素が表示されているかチェック
     */
    isVisible(element) {
        return element.offsetWidth > 0 && element.offsetHeight > 0;
    },

    /**
     * 要素がビューポート内にあるかチェック
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * スムーズスクロール
     */
    scrollTo(element, options = {}) {
        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };
        
        element.scrollIntoView({ ...defaultOptions, ...options });
    }
};

/**
 * 文字列操作ユーティリティ
 */
export const StringUtils = {
    /**
     * HTML エスケープ
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * テキストを省略表示
     */
    truncate(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    },

    /**
     * キャメルケースをケバブケースに変換
     */
    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    },

    /**
     * ケバブケースをキャメルケースに変換
     */
    kebabToCamel(str) {
        return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    },

    /**
     * 文字列をスラッグ化
     */
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};

/**
 * 配列操作ユーティリティ
 */
export const ArrayUtils = {
    /**
     * 配列をシャッフル
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * 配列をチャンク分割
     */
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },

    /**
     * 配列から重複を除去
     */
    unique(array, key = null) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        }
        return [...new Set(array)];
    },

    /**
     * 配列をグループ化
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = typeof key === 'function' ? key(item) : item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }
};

/**
 * オブジェクト操作ユーティリティ
 */
export const ObjectUtils = {
    /**
     * 深いクローン
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = this.deepClone(obj[key]);
        });
        return cloned;
    },

    /**
     * 深いマージ
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });
        
        return result;
    },

    /**
     * オブジェクトから指定キーのみ抽出
     */
    pick(obj, keys) {
        const result = {};
        keys.forEach(key => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    },

    /**
     * オブジェクトから指定キーを除外
     */
    omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    }
};

/**
 * イベント管理ユーティリティ
 */
export const EventUtils = {
    /**
     * イベントリスナーを安全に追加
     */
    on(element, eventType, handler, options = {}) {
        if (!element || !element.addEventListener) return null;
        
        element.addEventListener(eventType, handler, options);
        
        // 削除用の関数を返す
        return () => {
            element.removeEventListener(eventType, handler, options);
        };
    },

    /**
     * 一度だけ実行されるイベントリスナー
     */
    once(element, eventType, handler) {
        return this.on(element, eventType, handler, { once: true });
    },

    /**
     * カスタムイベント作成・送信
     */
    emit(element, eventType, detail = {}) {
        const event = new CustomEvent(eventType, { detail });
        element.dispatchEvent(event);
    },

    /**
     * イベントの伝播を停止
     */
    stop(event) {
        event.preventDefault();
        event.stopPropagation();
    }
};

/**
 * 時間・遅延ユーティリティ
 */
export const TimeUtils = {
    /**
     * 指定時間待機
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * デバウンス
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * スロットル
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 日付フォーマット
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }
};

/**
 * ローカルストレージユーティリティ
 */
export const StorageUtils = {
    /**
     * アイテムを保存
     */
    set(key, value, options = {}) {
        try {
            const item = {
                value,
                timestamp: Date.now(),
                ...options
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.warn('ローカルストレージ保存エラー:', error);
            return false;
        }
    },

    /**
     * アイテムを取得
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            
            const parsed = JSON.parse(item);
            
            // 有効期限チェック
            if (parsed.expiry && Date.now() > parsed.expiry) {
                this.remove(key);
                return defaultValue;
            }
            
            return parsed.value;
        } catch (error) {
            console.warn('ローカルストレージ取得エラー:', error);
            return defaultValue;
        }
    },

    /**
     * アイテムを削除
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('ローカルストレージ削除エラー:', error);
            return false;
        }
    },

    /**
     * 全て削除
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('ローカルストレージクリアエラー:', error);
            return false;
        }
    }
};

/**
 * アクセシビリティユーティリティ
 */
export const A11yUtils = {
    /**
     * ARIA属性を設定
     */
    setAria(element, attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
            element.setAttribute(ariaKey, value);
        });
    },

    /**
     * フォーカス可能な要素を取得
     */
    getFocusableElements(container = document) {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');
        
        return container.querySelectorAll(selector);
    },

    /**
     * スクリーンリーダーへのお知らせ
     */
    announce(message, priority = 'polite') {
        const announcer = document.getElementById('sr-announcer') || this.createAnnouncer();
        announcer.setAttribute('aria-live', priority);
        announcer.textContent = message;
        
        // メッセージをクリア
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    },

    /**
     * スクリーンリーダー用お知らせ要素を作成
     */
    createAnnouncer() {
        const announcer = DOM.create('div', {
            id: 'sr-announcer',
            className: 'sr-only',
            'aria-live': 'polite',
            'aria-atomic': 'true'
        });
        document.body.appendChild(announcer);
        return announcer;
    }
};

/**
 * パフォーマンス監視ユーティリティ
 */
export const PerformanceUtils = {
    /**
     * 関数の実行時間を測定
     */
    measure(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    },

    /**
     * 非同期関数の実行時間を測定
     */
    async measureAsync(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    },

    /**
     * 画像の遅延読み込み
     */
    lazyLoadImages(selector = 'img[data-src]') {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            
            DOM.$$(selector).forEach(img => observer.observe(img));
        }
    }
};

/**
 * バリデーションユーティリティ
 */
export const ValidationUtils = {
    /**
     * メールアドレス検証
     */
    isEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * URL検証
     */
    isUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * 空文字・空白文字チェック
     */
    isEmpty(value) {
        return !value || String(value).trim().length === 0;
    },

    /**
     * 数値範囲チェック
     */
    isInRange(value, min, max) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    /**
     * 文字数チェック
     */
    isLengthValid(text, min = 0, max = Infinity) {
        const length = String(text).length;
        return length >= min && length <= max;
    }
};

/**
 * 全ユーティリティのデフォルトエクスポート
 */
export default {
    DOM,
    StringUtils,
    ArrayUtils,
    ObjectUtils,
    EventUtils,
    TimeUtils,
    StorageUtils,
    A11yUtils,
    PerformanceUtils,
    ValidationUtils
}; 