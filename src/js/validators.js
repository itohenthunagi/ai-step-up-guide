/**
 * 生成AIステップアップガイド - バリデーション関数
 * @version 1.0.0
 * @description フォーム・データ検証用バリデーター集
 */

import { ValidationUtils } from './utils.js';

/**
 * プロンプト関連バリデーター
 */
export const PromptValidators = {
    /**
     * プロンプトテキストの妥当性をチェック
     */
    validatePromptText(prompt) {
        const errors = [];
        
        // 必須チェック
        if (ValidationUtils.isEmpty(prompt)) {
            errors.push('プロンプトを入力してください');
            return { isValid: false, errors };
        }
        
        // 最小文字数チェック
        if (!ValidationUtils.isLengthValid(prompt, 10)) {
            errors.push('プロンプトは10文字以上で入力してください');
        }
        
        // 最大文字数チェック
        if (!ValidationUtils.isLengthValid(prompt, 0, 5000)) {
            errors.push('プロンプトは5000文字以下で入力してください');
        }
        
        // 特殊文字チェック（潜在的に問題のある文字）
        const dangerousChars = /<script|javascript:|on\w+=/i;
        if (dangerousChars.test(prompt)) {
            errors.push('不正な文字列が含まれています');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            characterCount: prompt.length,
            wordCount: prompt.split(/\s+/).filter(word => word.length > 0).length
        };
    },

    /**
     * プロンプトの目的設定をチェック
     */
    validatePromptPurpose(purpose) {
        const validPurposes = [
            'text-generation',
            'image-generation', 
            'code-generation',
            'data-analysis',
            'creative-writing',
            'educational',
            'business',
            'other'
        ];
        
        if (!purpose || !validPurposes.includes(purpose)) {
            return {
                isValid: false,
                errors: ['有効な目的を選択してください']
            };
        }
        
        return { isValid: true, errors: [] };
    },

    /**
     * プロンプトの複雑度をチェック
     */
    validatePromptComplexity(prompt) {
        const analysis = {
            hasContext: /context|背景|状況/.test(prompt),
            hasInstructions: /please|してください|実行|generate/.test(prompt),
            hasExamples: /example|例|サンプル|like/.test(prompt),
            hasConstraints: /must|必須|条件|制約|limit/.test(prompt),
            hasFormat: /format|形式|style|スタイル/.test(prompt),
            sentenceCount: prompt.split(/[.!?。！？]/).filter(s => s.trim().length > 0).length
        };
        
        const complexityScore = Object.values(analysis).filter(Boolean).length - 1; // sentenceCountを除外
        
        let level;
        let suggestions = [];
        
        if (complexityScore <= 1) {
            level = 'basic';
            suggestions.push('より具体的な指示を追加してみましょう');
            suggestions.push('例や背景情報を含めると効果的です');
        } else if (complexityScore <= 3) {
            level = 'intermediate';
            suggestions.push('出力形式を指定するとより良い結果が得られます');
        } else {
            level = 'advanced';
            suggestions.push('適切な複雑さのプロンプトです');
        }
        
        return {
            analysis,
            complexityScore,
            level,
            suggestions
        };
    }
};

/**
 * フォーム関連バリデーター
 */
export const FormValidators = {
    /**
     * フォーム全体のバリデーション
     */
    validateForm(formData, rules) {
        const errors = {};
        let isValid = true;
        
        Object.entries(rules).forEach(([fieldName, fieldRules]) => {
            const value = formData[fieldName];
            const fieldErrors = this.validateField(value, fieldRules);
            
            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
                isValid = false;
            }
        });
        
        return { isValid, errors };
    },

    /**
     * 個別フィールドのバリデーション
     */
    validateField(value, rules) {
        const errors = [];
        
        // 必須チェック
        if (rules.required && ValidationUtils.isEmpty(value)) {
            errors.push(rules.requiredMessage || 'この項目は必須です');
            return errors; // 必須エラーがある場合は他のチェックをスキップ
        }
        
        // 空値の場合は以降のチェックをスキップ
        if (ValidationUtils.isEmpty(value)) {
            return errors;
        }
        
        // 型チェック
        if (rules.type) {
            switch (rules.type) {
                case 'email':
                    if (!ValidationUtils.isEmail(value)) {
                        errors.push('有効なメールアドレスを入力してください');
                    }
                    break;
                case 'url':
                    if (!ValidationUtils.isUrl(value)) {
                        errors.push('有効なURLを入力してください');
                    }
                    break;
                case 'number':
                    if (isNaN(Number(value))) {
                        errors.push('数値を入力してください');
                    }
                    break;
            }
        }
        
        // 長さチェック
        if (rules.minLength && !ValidationUtils.isLengthValid(value, rules.minLength)) {
            errors.push(`${rules.minLength}文字以上で入力してください`);
        }
        
        if (rules.maxLength && !ValidationUtils.isLengthValid(value, 0, rules.maxLength)) {
            errors.push(`${rules.maxLength}文字以下で入力してください`);
        }
        
        // 数値範囲チェック
        if (rules.min !== undefined || rules.max !== undefined) {
            const num = Number(value);
            if (!isNaN(num)) {
                if (rules.min !== undefined && num < rules.min) {
                    errors.push(`${rules.min}以上の値を入力してください`);
                }
                if (rules.max !== undefined && num > rules.max) {
                    errors.push(`${rules.max}以下の値を入力してください`);
                }
            }
        }
        
        // パターンマッチング
        if (rules.pattern) {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(value)) {
                errors.push(rules.patternMessage || '入力形式が正しくありません');
            }
        }
        
        // カスタムバリデーター
        if (rules.custom && typeof rules.custom === 'function') {
            const customResult = rules.custom(value);
            if (customResult !== true) {
                errors.push(customResult || 'カスタムバリデーションエラー');
            }
        }
        
        return errors;
    },

    /**
     * リアルタイムバリデーション
     */
    setupRealTimeValidation(formElement, rules) {
        const fields = formElement.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            const fieldName = field.name;
            const fieldRules = rules[fieldName];
            
            if (!fieldRules) return;
            
            // イベントリスナー設定
            const events = fieldRules.validateOn || ['blur'];
            
            events.forEach(eventType => {
                field.addEventListener(eventType, () => {
                    this.validateSingleField(field, fieldRules);
                });
            });
        });
    },

    /**
     * 単一フィールドのリアルタイムバリデーション
     */
    validateSingleField(fieldElement, rules) {
        const value = fieldElement.value;
        const errors = this.validateField(value, rules);
        
        // エラー表示の更新
        this.updateFieldErrorDisplay(fieldElement, errors);
        
        return errors.length === 0;
    },

    /**
     * フィールドエラー表示の更新
     */
    updateFieldErrorDisplay(fieldElement, errors) {
        const fieldContainer = fieldElement.closest('.form-field') || fieldElement.parentElement;
        const existingError = fieldContainer.querySelector('.field-error');
        
        // 既存のエラー表示を削除
        if (existingError) {
            existingError.remove();
        }
        
        // エラーがある場合は新しいエラー表示を追加
        if (errors.length > 0) {
            fieldElement.classList.add('is-invalid');
            fieldElement.setAttribute('aria-invalid', 'true');
            
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            errorElement.innerHTML = errors.map(error => 
                `<p class="error-message">${error}</p>`
            ).join('');
            
            fieldContainer.appendChild(errorElement);
            
            // ARIA属性でエラーメッセージを関連付け
            const errorId = `error-${fieldElement.name || fieldElement.id}`;
            errorElement.id = errorId;
            fieldElement.setAttribute('aria-describedby', errorId);
        } else {
            fieldElement.classList.remove('is-invalid');
            fieldElement.removeAttribute('aria-invalid');
            fieldElement.removeAttribute('aria-describedby');
        }
    }
};

/**
 * AI専用バリデーター
 */
export const AIValidators = {
    /**
     * AI生成コンテンツの品質チェック
     */
    validateAIContent(content, criteria = {}) {
        const analysis = {
            length: content.length,
            readability: this.calculateReadability(content),
            coherence: this.checkCoherence(content),
            relevance: this.checkRelevance(content, criteria.keywords || []),
            safety: this.checkSafety(content)
        };
        
        const scores = {
            overall: 0,
            length: this.scoreLengthAppropriate(analysis.length, criteria.targetLength),
            readability: analysis.readability,
            coherence: analysis.coherence,
            relevance: analysis.relevance,
            safety: analysis.safety
        };
        
        scores.overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
        
        return {
            isValid: scores.overall >= (criteria.threshold || 0.7),
            analysis,
            scores,
            suggestions: this.generateContentSuggestions(scores, criteria)
        };
    },

    /**
     * 可読性スコア計算（簡易版）
     */
    calculateReadability(text) {
        const sentences = text.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const avgWordsPerSentence = words.length / sentences.length;
        
        // 日本語の場合の調整
        const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
        
        if (isJapanese) {
            // 日本語の場合は文字数ベース
            const avgCharsPerSentence = text.length / sentences.length;
            return Math.max(0, Math.min(1, 1 - (avgCharsPerSentence - 20) / 80));
        } else {
            // 英語の場合は単語数ベース
            return Math.max(0, Math.min(1, 1 - (avgWordsPerSentence - 15) / 30));
        }
    },

    /**
     * 一貫性チェック
     */
    checkCoherence(text) {
        const sentences = text.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
        
        // 接続詞や論理的な構造の確認
        const connectives = /therefore|however|furthermore|また|しかし|そのため|一方/.test(text);
        const repetition = this.checkRepetition(sentences);
        
        let score = 0.5; // ベーススコア
        if (connectives) score += 0.3;
        if (repetition < 0.3) score += 0.2; // 適度な繰り返し
        
        return Math.min(1, score);
    },

    /**
     * 関連性チェック
     */
    checkRelevance(text, keywords) {
        if (keywords.length === 0) return 0.8; // キーワードがない場合はデフォルト
        
        const lowerText = text.toLowerCase();
        const matchedKeywords = keywords.filter(keyword => 
            lowerText.includes(keyword.toLowerCase())
        );
        
        return matchedKeywords.length / keywords.length;
    },

    /**
     * 安全性チェック
     */
    checkSafety(text) {
        const unsafePatterns = [
            /個人情報|電話番号|住所|クレジットカード/,
            /暴力|攻撃|危険|違法/,
            /差別|偏見|ヘイト/
        ];
        
        const hasUnsafeContent = unsafePatterns.some(pattern => pattern.test(text));
        return hasUnsafeContent ? 0 : 1;
    },

    /**
     * 繰り返しチェック
     */
    checkRepetition(sentences) {
        const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
        return 1 - (uniqueSentences.size / sentences.length);
    },

    /**
     * 長さ適切性スコア
     */
    scoreLengthAppropriate(actualLength, targetLength) {
        if (!targetLength) return 0.8; // 目標がない場合はデフォルト
        
        const ratio = actualLength / targetLength;
        if (ratio >= 0.8 && ratio <= 1.2) return 1;
        if (ratio >= 0.6 && ratio <= 1.5) return 0.7;
        if (ratio >= 0.4 && ratio <= 2.0) return 0.5;
        return 0.2;
    },

    /**
     * コンテンツ改善提案生成
     */
    generateContentSuggestions(scores, criteria) {
        const suggestions = [];
        
        if (scores.readability < 0.6) {
            suggestions.push('文章をより短く、簡潔にすることで読みやすさが向上します');
        }
        
        if (scores.coherence < 0.6) {
            suggestions.push('接続詞を使って文章の流れを改善しましょう');
        }
        
        if (scores.relevance < 0.6) {
            suggestions.push('指定されたキーワードをより多く含めてください');
        }
        
        if (scores.length < 0.6) {
            suggestions.push('適切な長さに調整してください');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('コンテンツの品質は良好です');
        }
        
        return suggestions;
    }
};

/**
 * セキュリティバリデーター
 */
export const SecurityValidators = {
    /**
     * XSS攻撃の可能性をチェック
     */
    checkXSS(input) {
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe[^>]*>/gi,
            /<object[^>]*>/gi,
            /<embed[^>]*>/gi
        ];
        
        return !xssPatterns.some(pattern => pattern.test(input));
    },

    /**
     * SQLインジェクションの可能性をチェック
     */
    checkSQLInjection(input) {
        const sqlPatterns = [
            /('|(\\x27)|(\\x2D\\x2D)|(%27)|(%2D%2D))/i,
            /((\%3D)|(=))[^\n]*((\%27)|(\\x27)|(\')|(\\x2D\\x2D)|(\-\-))/i,
            /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
            /((\%27)|(\'))union/i
        ];
        
        return !sqlPatterns.some(pattern => pattern.test(input));
    },

    /**
     * 入力値の総合セキュリティチェック
     */
    validateInputSecurity(input) {
        const checks = {
            xss: this.checkXSS(input),
            sql: this.checkSQLInjection(input),
            length: input.length <= 10000, // 異常に長い入力を防ぐ
            encoding: this.checkEncoding(input)
        };
        
        const isSecure = Object.values(checks).every(check => check);
        const threats = Object.entries(checks)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        return {
            isSecure,
            threats,
            checks
        };
    },

    /**
     * 文字エンコーディングチェック
     */
    checkEncoding(input) {
        // 不正なエンコーディングパターンをチェック
        const invalidPatterns = [
            /%[^0-9A-Fa-f]/,
            /%[0-9A-Fa-f][^0-9A-Fa-f]/
        ];
        
        return !invalidPatterns.some(pattern => pattern.test(input));
    }
};

/**
 * バリデーションルールのプリセット
 */
export const ValidationPresets = {
    promptForm: {
        prompt: {
            required: true,
            minLength: 10,
            maxLength: 5000,
            validateOn: ['blur', 'input'],
            custom: (value) => {
                const security = SecurityValidators.validateInputSecurity(value);
                return security.isSecure || 'セキュリティ上の問題が検出されました';
            }
        },
        purpose: {
            required: true,
            type: 'select'
        },
        complexity: {
            required: false,
            type: 'select'
        }
    },

    contactForm: {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50
        },
        email: {
            required: true,
            type: 'email'
        },
        message: {
            required: true,
            minLength: 10,
            maxLength: 1000
        }
    },

    settingsForm: {
        theme: {
            required: true,
            pattern: '^(light|dark|auto)$'
        },
        language: {
            required: true,
            pattern: '^(ja|en)$'
        },
        notifications: {
            type: 'boolean'
        }
    }
};

/**
 * 汎用バリデーションマネージャー
 */
export class ValidationManager {
    constructor(formElement, rules = {}) {
        this.form = formElement;
        this.rules = rules;
        this.errors = {};
        this.isValid = true;
        
        this.init();
    }

    init() {
        if (this.form) {
            FormValidators.setupRealTimeValidation(this.form, this.rules);
        }
    }

    validate() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        const result = FormValidators.validateForm(data, this.rules);
        this.errors = result.errors;
        this.isValid = result.isValid;
        
        // エラー表示の更新
        this.updateErrorDisplay();
        
        return result;
    }

    updateErrorDisplay() {
        // 全エラー表示をクリア
        this.form.querySelectorAll('.field-error').forEach(error => error.remove());
        
        // 新しいエラー表示
        Object.entries(this.errors).forEach(([fieldName, fieldErrors]) => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                FormValidators.updateFieldErrorDisplay(field, fieldErrors);
            }
        });
    }

    getErrors() {
        return this.errors;
    }

    isFormValid() {
        return this.isValid;
    }
}

export { FormValidators as default, PromptValidators, AIValidators, SecurityValidators }; 