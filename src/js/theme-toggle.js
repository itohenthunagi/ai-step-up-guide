/**
 * 🌙 Theme Toggle - ダークモード切り替え機能
 * 生成AIステップアップガイド
 * 
 * 機能:
 * - ライト/ダークモード切り替え
 * - ユーザー設定の記憶（localStorage）
 * - システム設定の自動検出
 * - アニメーション効果
 */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'ai-guide-theme';
    this.themes = {
      LIGHT: 'light',
      DARK: 'dark',
      AUTO: 'auto'
    };
    
    this.init();
  }

  /**
   * 初期化処理
   */
  init() {
    this.bindEvents();
    this.loadSavedTheme();
    this.updateThemeToggleButton();
  }

  /**
   * イベントリスナーを設定
   */
  bindEvents() {
    // テーマ切り替えボタンのクリックイベント
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // システムテーマ変更の監視
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (this.getCurrentTheme() === this.themes.AUTO) {
          this.applySystemTheme();
        }
      });
    }

    // キーボードショートカット（Ctrl+Shift+T）
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  /**
   * 保存されたテーマ設定を読み込み
   */
  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      if (savedTheme && Object.values(this.themes).includes(savedTheme)) {
        this.applyTheme(savedTheme);
      } else {
        // 初回訪問時はシステム設定に従う
        this.applySystemTheme();
      }
    } catch (error) {
      console.warn('Theme loading failed:', error);
      this.applySystemTheme();
    }
  }

  /**
   * システムの設定に従ってテーマを適用
   */
  applySystemTheme() {
    const prefersDark = window.matchMedia && 
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? this.themes.DARK : this.themes.LIGHT;
    this.applyTheme(systemTheme);
  }

  /**
   * テーマを切り替え
   */
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    let nextTheme;

    // ライト → ダーク → システム自動 → ライト のサイクル
    switch (currentTheme) {
      case this.themes.LIGHT:
        nextTheme = this.themes.DARK;
        break;
      case this.themes.DARK:
        nextTheme = this.themes.LIGHT;
        break;
      default:
        nextTheme = this.themes.LIGHT;
        break;
    }

    this.applyTheme(nextTheme);
    this.saveTheme(nextTheme);
    this.showThemeChangeNotification(nextTheme);
  }

  /**
   * テーマを適用
   * @param {string} theme - 適用するテーマ
   */
  applyTheme(theme) {
    const htmlElement = document.documentElement;
    
    // 既存のテーマクラスを削除
    Object.values(this.themes).forEach(t => {
      htmlElement.classList.remove(`theme-${t}`);
    });

    // data-theme属性でテーマを設定
    if (theme === this.themes.AUTO) {
      htmlElement.removeAttribute('data-theme');
      this.applySystemTheme();
    } else {
      htmlElement.setAttribute('data-theme', theme);
    }

    // テーマ変更のアニメーション効果
    this.addThemeTransition();
    
    // ボタンの状態を更新
    this.updateThemeToggleButton();
  }

  /**
   * テーマ変更のアニメーション効果を追加
   */
  addThemeTransition() {
    const body = document.body;
    body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // 一定時間後にtransitionを削除（パフォーマンス最適化）
    setTimeout(() => {
      body.style.transition = '';
    }, 300);
  }

  /**
   * 現在のテーマを取得
   * @returns {string} 現在のテーマ
   */
  getCurrentTheme() {
    const htmlElement = document.documentElement;
    const dataTheme = htmlElement.getAttribute('data-theme');
    
    if (dataTheme && Object.values(this.themes).includes(dataTheme)) {
      return dataTheme;
    }
    
    return this.themes.AUTO;
  }

  /**
   * テーマ設定を保存
   * @param {string} theme - 保存するテーマ
   */
  saveTheme(theme) {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Theme saving failed:', error);
    }
  }

  /**
   * テーマ切り替えボタンの状態を更新
   */
  updateThemeToggleButton() {
    const button = document.getElementById('theme-toggle');
    if (!button) return;

    const currentTheme = this.getCurrentTheme();
    
    // ボタンのaria-labelを更新
    let label = '';
    let title = '';
    
    switch (currentTheme) {
      case this.themes.LIGHT:
        label = 'ダークモードに切り替え';
        title = 'ダークモードに切り替え';
        break;
      case this.themes.DARK:
        label = 'ライトモードに切り替え';
        title = 'ライトモードに切り替え';
        break;
      default:
        label = 'テーマを切り替え';
        title = 'ライト/ダークモード切り替え';
        break;
    }
    
    button.setAttribute('aria-label', label);
    button.setAttribute('title', title);
    
    // ボタンのアニメーション効果
    this.animateThemeButton(button);
  }

  /**
   * テーマ切り替えボタンのアニメーション
   * @param {HTMLElement} button - ボタン要素
   */
  animateThemeButton(button) {
    button.style.transform = 'scale(0.9) rotate(180deg)';
    
    setTimeout(() => {
      button.style.transform = '';
    }, 200);
  }

  /**
   * テーマ変更通知を表示
   * @param {string} theme - 変更後のテーマ
   */
  showThemeChangeNotification(theme) {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.theme-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // 通知要素を作成
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    
    const themeNames = {
      [this.themes.LIGHT]: 'ライトモード',
      [this.themes.DARK]: 'ダークモード',
      [this.themes.AUTO]: '自動モード'
    };
    
    const icon = theme === this.themes.DARK ? '🌙' : '☀️';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icon}</span>
        <span class="notification-text">${themeNames[theme]}に切り替えました</span>
      </div>
    `;

    // 通知スタイルを適用
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'var(--glass-bg-primary)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-4) var(--space-6)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 'var(--z-toast)',
      transition: 'all 0.3s ease',
      transform: 'translateX(100%)',
      opacity: '0'
    });

    document.body.appendChild(notification);

    // アニメーション開始
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });

    // 3秒後に自動削除
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  /**
   * テーマ情報を取得（デバッグ用）
   * @returns {Object} テーマ情報
   */
  getThemeInfo() {
    return {
      current: this.getCurrentTheme(),
      saved: localStorage.getItem(this.STORAGE_KEY),
      systemPrefersDark: window.matchMedia && 
                        window.matchMedia('(prefers-color-scheme: dark)').matches,
      available: Object.values(this.themes)
    };
  }
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  // テーママネージャーを初期化
  const themeManager = new ThemeManager();
  
  // グローバルに公開（デバッグ用）
  window.themeManager = themeManager;
  
  console.log('🌙 Theme Manager initialized:', themeManager.getThemeInfo());
});

// CSS通知スタイルをhead要素に追加
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .theme-notification .notification-content {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--color-text-primary);
    font-weight: 500;
    font-size: var(--font-size-sm);
  }
  
  .theme-notification .notification-icon {
    font-size: var(--font-size-lg);
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
  
  .theme-notification .notification-text {
    white-space: nowrap;
  }
`;

document.head.appendChild(notificationStyles); 