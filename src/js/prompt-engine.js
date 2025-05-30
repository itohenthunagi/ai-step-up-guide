/**
 * 生成AIステップアップガイド - プロンプト生成エンジン
 * @version 1.0.0
 * @description 高度なプロンプト生成・最適化エンジン
 */

import { StringUtils, ObjectUtils, StorageUtils } from './utils.js';
import { PromptValidators, AIValidators } from './validators.js';

/**
 * プロンプトテンプレートマネージャー
 */
export class PromptTemplateManager {
    constructor() {
        this.templates = new Map();
        this.categories = new Set();
        this.loadDefaultTemplates();
    }

    /**
     * デフォルトテンプレートの読み込み
     */
    loadDefaultTemplates() {
        const defaultTemplates = [
            {
                id: 'blog-article',
                title: 'ブログ記事作成',
                category: 'content-creation',
                description: 'SEO対策を考慮したブログ記事の作成',
                variables: ['topic', 'target_audience', 'tone', 'length'],
                template: `{topic}について、{target_audience}向けの{tone}なブログ記事を{length}文字程度で書いてください。

以下の要素を含めてください：
- キャッチーなタイトル
- 読者の問題や悩みを明確にする導入部
- 具体的な解決策やノウハウ
- 実例やデータの引用
- 行動を促すまとめ

SEO対策として適切な見出し構造（H2、H3）を使用し、読者にとって価値のある内容を心がけてください。`,
                parameters: {
                    topic: { type: 'text', label: 'トピック', required: true },
                    target_audience: { type: 'select', label: 'ターゲット層', options: ['初心者', '中級者', '上級者', '専門家'], required: true },
                    tone: { type: 'select', label: '文体', options: ['親しみやすい', '専門的', 'カジュアル', 'フォーマル'], required: true },
                    length: { type: 'number', label: '文字数', min: 500, max: 5000, default: 1500 }
                },
                tags: ['ブログ', 'SEO', 'コンテンツマーケティング'],
                usage_count: 0,
                rating: 0,
                created_at: new Date().toISOString()
            },
            {
                id: 'code-documentation',
                title: 'コードドキュメント生成',
                category: 'development',
                description: 'プログラムコードの詳細ドキュメント作成',
                variables: ['code_snippet', 'language', 'audience_level'],
                template: `以下の{language}コードについて、{audience_level}向けの詳細なドキュメントを作成してください：

\`\`\`{language}
{code_snippet}
\`\`\`

以下の内容を含めてください：
- 関数/クラスの概要と目的
- パラメータの詳細説明（型、役割、制約）
- 戻り値の説明
- 使用例
- エラーハンドリング
- パフォーマンスに関する注意点
- 関連する他の関数やクラスとの関係

技術的に正確で、実装者が理解しやすい説明を心がけてください。`,
                parameters: {
                    code_snippet: { type: 'textarea', label: 'コード', required: true },
                    language: { type: 'select', label: 'プログラミング言語', options: ['JavaScript', 'Python', 'Java', 'C#', 'PHP', 'Go', 'Rust'], required: true },
                    audience_level: { type: 'select', label: '対象者レベル', options: ['初心者', '中級者', '上級者'], required: true }
                },
                tags: ['プログラミング', 'ドキュメント', 'API'],
                usage_count: 0,
                rating: 0,
                created_at: new Date().toISOString()
            },
            {
                id: 'image-generation',
                title: '画像生成プロンプト',
                category: 'creative',
                description: 'AI画像生成ツール用の詳細プロンプト',
                variables: ['subject', 'style', 'mood', 'composition', 'quality_tags'],
                template: `{subject}の{style}スタイルの画像を生成してください。

【被写体・シーン】
{subject}

【スタイル・技法】
{style}

【雰囲気・ムード】
{mood}

【構図・配置】
{composition}

【品質・技術的指定】
{quality_tags}

【追加指示】
- 高解像度（4K以上）
- プロフェッショナルなライティング
- 細部まで精密に描写
- 色彩豊かで鮮明な表現`,
                parameters: {
                    subject: { type: 'text', label: '被写体・シーン', required: true },
                    style: { type: 'select', label: 'アートスタイル', options: ['写真調', 'イラスト調', '油絵風', '水彩画風', 'アニメ調', 'リアリスティック', '抽象的'], required: true },
                    mood: { type: 'text', label: '雰囲気・ムード', placeholder: '例：幻想的な、ダークな、明るい' },
                    composition: { type: 'text', label: '構図', placeholder: '例：中央配置、三分割法、クローズアップ' },
                    quality_tags: { type: 'text', label: '品質タグ', placeholder: '例：ultra detailed, masterpiece, best quality' }
                },
                tags: ['画像生成', 'AI Art', 'クリエイティブ'],
                usage_count: 0,
                rating: 0,
                created_at: new Date().toISOString()
            },
            {
                id: 'data-analysis',
                title: 'データ分析レポート',
                category: 'business',
                description: 'データ分析結果の包括的レポート作成',
                variables: ['data_type', 'analysis_goal', 'time_period', 'key_metrics'],
                template: `{data_type}データの{time_period}における分析レポートを作成してください。

【分析目的】
{analysis_goal}

【重要指標】
{key_metrics}

【レポート構成】
1. エグゼクティブサマリー
2. データ概要と収集方法
3. 主要な発見事項
4. トレンド分析
5. 異常値や注意点
6. ビジネスへの影響と示唆
7. 推奨アクション
8. 次回分析に向けた改善点

【出力要件】
- 数値データは具体的に表記
- グラフや表の提案も含める
- ビジネス判断に活用できる実用的な内容
- 非専門家にも理解しやすい説明`,
                parameters: {
                    data_type: { type: 'select', label: 'データ種別', options: ['Webアクセス', '売上', 'ユーザー行動', 'マーケティング', 'アンケート', 'その他'], required: true },
                    analysis_goal: { type: 'text', label: '分析目的', required: true },
                    time_period: { type: 'text', label: '分析期間', placeholder: '例：2024年1月〜3月' },
                    key_metrics: { type: 'textarea', label: '重要指標', placeholder: '例：PV数、CVR、売上高、ユーザー数' }
                },
                tags: ['データ分析', 'ビジネス', 'レポート'],
                usage_count: 0,
                rating: 0,
                created_at: new Date().toISOString()
            }
        ];

        defaultTemplates.forEach(template => {
            this.addTemplate(template);
        });
    }

    /**
     * テンプレートを追加
     */
    addTemplate(template) {
        this.templates.set(template.id, template);
        this.categories.add(template.category);
        return template.id;
    }

    /**
     * テンプレートを取得
     */
    getTemplate(id) {
        return this.templates.get(id);
    }

    /**
     * テンプレート一覧を取得
     */
    getTemplates(filters = {}) {
        let templates = Array.from(this.templates.values());

        // カテゴリフィルター
        if (filters.category && filters.category !== 'all') {
            templates = templates.filter(t => t.category === filters.category);
        }

        // 検索フィルター
        if (filters.search) {
            const query = filters.search.toLowerCase();
            templates = templates.filter(t => 
                t.title.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query) ||
                t.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // ソート
        if (filters.sort) {
            switch (filters.sort) {
                case 'usage':
                    templates.sort((a, b) => b.usage_count - a.usage_count);
                    break;
                case 'rating':
                    templates.sort((a, b) => b.rating - a.rating);
                    break;
                case 'created':
                    templates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case 'alphabetical':
                    templates.sort((a, b) => a.title.localeCompare(b.title));
                    break;
            }
        }

        return templates;
    }

    /**
     * カテゴリ一覧を取得
     */
    getCategories() {
        return Array.from(this.categories);
    }

    /**
     * テンプレートからプロンプトを生成
     */
    generatePrompt(templateId, variables) {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`テンプレート "${templateId}" が見つかりません`);
        }

        let prompt = template.template;

        // 変数の置換
        template.variables.forEach(varName => {
            const value = variables[varName] || '';
            const placeholder = new RegExp(`\\{${varName}\\}`, 'g');
            prompt = prompt.replace(placeholder, value);
        });

        // 使用回数を増やす
        template.usage_count++;

        return {
            prompt,
            template: template,
            metadata: {
                generated_at: new Date().toISOString(),
                template_id: templateId,
                variables_used: variables
            }
        };
    }

    /**
     * テンプレートの評価
     */
    rateTemplate(templateId, rating) {
        const template = this.getTemplate(templateId);
        if (template && rating >= 1 && rating <= 5) {
            // 簡易的な平均評価計算
            template.rating = ((template.rating * (template.usage_count - 1)) + rating) / template.usage_count;
            return true;
        }
        return false;
    }
}

/**
 * プロンプト最適化エンジン
 */
export class PromptOptimizer {
    constructor() {
        this.optimizationRules = this.loadOptimizationRules();
    }

    /**
     * 最適化ルールの読み込み
     */
    loadOptimizationRules() {
        return {
            clarity: {
                name: '明確性の向上',
                rules: [
                    {
                        pattern: /(?:してください|作成してください|生成してください)$/,
                        suggestion: '具体的な出力形式や要件を追加することを推奨します'
                    },
                    {
                        pattern: /^(.{1,50})$/,
                        suggestion: 'より詳細な説明や文脈情報を追加することで、より良い結果が得られます'
                    }
                ]
            },
            structure: {
                name: '構造化の改善',
                rules: [
                    {
                        pattern: /^(?!.*(?:以下|下記|次の)).*$/,
                        suggestion: '構造化された指示（「以下の要素を含めてください」など）を追加することを推奨します'
                    }
                ]
            },
            specificity: {
                name: '具体性の向上',
                rules: [
                    {
                        pattern: /(?:良い|悪い|適切な|効果的な)(?!\s*(?:例|サンプル|内容))/g,
                        suggestion: '「良い」「悪い」などの抽象的な表現をより具体的な基準に置き換えることを推奨します'
                    }
                ]
            },
            context: {
                name: 'コンテキストの追加',
                rules: [
                    {
                        pattern: /^(?!.*(?:背景|目的|対象|ターゲット)).*$/,
                        suggestion: '背景情報や目的、対象者を明確にすることで品質が向上します'
                    }
                ]
            }
        };
    }

    /**
     * プロンプトを最適化
     */
    optimize(prompt, options = {}) {
        const analysis = this.analyzePrompt(prompt);
        const suggestions = this.generateSuggestions(analysis);
        const optimizedPrompt = this.applyOptimizations(prompt, suggestions, options);

        return {
            original: prompt,
            optimized: optimizedPrompt,
            analysis,
            suggestions,
            improvements: this.calculateImprovements(analysis)
        };
    }

    /**
     * プロンプトを分析
     */
    analyzePrompt(prompt) {
        const analysis = {
            length: prompt.length,
            sentences: prompt.split(/[.!?。！？]/).filter(s => s.trim().length > 0).length,
            words: prompt.split(/\s+/).filter(w => w.length > 0).length,
            structure: this.analyzeStructure(prompt),
            clarity: this.analyzeClarity(prompt),
            specificity: this.analyzeSpecificity(prompt),
            context: this.analyzeContext(prompt)
        };

        analysis.complexity = this.calculateComplexity(analysis);
        return analysis;
    }

    /**
     * 構造を分析
     */
    analyzeStructure(prompt) {
        return {
            hasNumberedList: /^\d+\.\s/.test(prompt) || /\n\d+\.\s/.test(prompt),
            hasBulletPoints: /^[-*•]\s/.test(prompt) || /\n[-*•]\s/.test(prompt),
            hasHeaders: /^#+\s/.test(prompt) || /\n#+\s/.test(prompt),
            hasInstructions: /(?:以下|下記|次の).*(?:してください|含めてください)/.test(prompt),
            hasExamples: /(?:例|サンプル|Example)/.test(prompt)
        };
    }

    /**
     * 明確性を分析
     */
    analyzeClarity(prompt) {
        return {
            hasSpecificInstructions: /(?:具体的|詳細|明確)/.test(prompt),
            hasOutputFormat: /(?:形式|フォーマット|構成)/.test(prompt),
            hasConstraints: /(?:条件|制約|要件|必須)/.test(prompt),
            avgSentenceLength: this.calculateAverageSentenceLength(prompt)
        };
    }

    /**
     * 具体性を分析
     */
    analyzeSpecificity(prompt) {
        const abstractWords = ['良い', '悪い', '適切', '効果的', '重要', '必要'];
        const abstractCount = abstractWords.reduce((count, word) => {
            return count + (prompt.match(new RegExp(word, 'g')) || []).length;
        }, 0);

        return {
            abstractWordCount: abstractCount,
            hasQuantifiers: /(?:\d+|数字|具体的な数値)/.test(prompt),
            hasExamples: /(?:例えば|たとえば|例:|具体例)/.test(prompt),
            specificity_score: Math.max(0, 1 - (abstractCount / (prompt.length / 100)))
        };
    }

    /**
     * コンテキストを分析
     */
    analyzeContext(prompt) {
        return {
            hasBackground: /(?:背景|前提|状況|文脈)/.test(prompt),
            hasPurpose: /(?:目的|目標|狙い)/.test(prompt),
            hasAudience: /(?:対象|ターゲット|読者|ユーザー)/.test(prompt),
            hasDomain: /(?:分野|領域|業界|専門)/.test(prompt)
        };
    }

    /**
     * 複雑度を計算
     */
    calculateComplexity(analysis) {
        const structureScore = Object.values(analysis.structure).filter(Boolean).length / 5;
        const clarityScore = Object.values(analysis.clarity).filter(v => typeof v === 'boolean' && v).length / 3;
        const contextScore = Object.values(analysis.context).filter(Boolean).length / 4;
        
        return (structureScore + clarityScore + contextScore) / 3;
    }

    /**
     * 平均文章長を計算
     */
    calculateAverageSentenceLength(prompt) {
        const sentences = prompt.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
        if (sentences.length === 0) return 0;
        
        const totalLength = sentences.reduce((sum, sentence) => sum + sentence.trim().length, 0);
        return totalLength / sentences.length;
    }

    /**
     * 改善提案を生成
     */
    generateSuggestions(analysis) {
        const suggestions = [];

        // 長さに関する提案
        if (analysis.length < 50) {
            suggestions.push({
                type: 'length',
                priority: 'high',
                message: 'プロンプトが短すぎます。より詳細な説明を追加してください。',
                example: '背景情報、期待する出力形式、具体的な要件を追加することを推奨します。'
            });
        } else if (analysis.length > 2000) {
            suggestions.push({
                type: 'length',
                priority: 'medium',
                message: 'プロンプトが長すぎる可能性があります。重要な部分に焦点を当ててください。',
                example: '最も重要な要件を優先し、補足情報は別途提供することを検討してください。'
            });
        }

        // 構造に関する提案
        if (!analysis.structure.hasInstructions) {
            suggestions.push({
                type: 'structure',
                priority: 'high',
                message: '明確な指示を追加してください。',
                example: '「以下の要素を含めてください」「次の形式で出力してください」など'
            });
        }

        // 明確性に関する提案
        if (!analysis.clarity.hasOutputFormat) {
            suggestions.push({
                type: 'clarity',
                priority: 'medium',
                message: '期待する出力形式を明確にしてください。',
                example: 'Markdown形式、箇条書き、段落形式など'
            });
        }

        // コンテキストに関する提案
        if (!analysis.context.hasBackground && !analysis.context.hasPurpose) {
            suggestions.push({
                type: 'context',
                priority: 'medium',
                message: '背景情報や目的を追加すると、より良い結果が得られます。',
                example: 'なぜこの内容が必要なのか、どのような場面で使用するのかを説明してください。'
            });
        }

        return suggestions;
    }

    /**
     * 最適化を適用
     */
    applyOptimizations(prompt, suggestions, options = {}) {
        let optimized = prompt;

        // 自動最適化が有効な場合
        if (options.autoOptimize) {
            suggestions.forEach(suggestion => {
                switch (suggestion.type) {
                    case 'structure':
                        if (!optimized.includes('以下') && !optimized.includes('次の')) {
                            optimized += '\n\n以下の要素を含めてください：';
                        }
                        break;
                    case 'clarity':
                        if (!optimized.includes('形式') && !optimized.includes('フォーマット')) {
                            optimized += '\n\n出力形式：適切な形式で整理して出力してください。';
                        }
                        break;
                    case 'context':
                        if (!optimized.includes('目的') && !optimized.includes('背景')) {
                            optimized = '【目的】この内容は実用的な目的で使用されます。\n\n' + optimized;
                        }
                        break;
                }
            });
        }

        return optimized;
    }

    /**
     * 改善度を計算
     */
    calculateImprovements(analysis) {
        const improvements = {
            structure: analysis.complexity > 0.3 ? 'good' : 'needs_improvement',
            clarity: analysis.clarity.hasSpecificInstructions ? 'good' : 'needs_improvement',
            specificity: analysis.specificity.specificity_score > 0.7 ? 'good' : 'needs_improvement',
            context: (analysis.context.hasBackground || analysis.context.hasPurpose) ? 'good' : 'needs_improvement'
        };

        const overallScore = Object.values(improvements).filter(v => v === 'good').length / 4;
        improvements.overall = overallScore > 0.6 ? 'good' : overallScore > 0.3 ? 'fair' : 'poor';

        return improvements;
    }
}

/**
 * プロンプト履歴マネージャー
 */
export class PromptHistoryManager {
    constructor(options = {}) {
        this.options = {
            maxEntries: 100,
            autoSave: true,
            storageKey: 'prompt-history',
            ...options
        };
        this.history = this.loadHistory();
    }

    /**
     * 履歴を読み込み
     */
    loadHistory() {
        return StorageUtils.get(this.options.storageKey, []);
    }

    /**
     * 履歴を保存
     */
    saveHistory() {
        if (this.options.autoSave) {
            StorageUtils.set(this.options.storageKey, this.history);
        }
    }

    /**
     * エントリを追加
     */
    addEntry(prompt, metadata = {}) {
        const entry = {
            id: this.generateId(),
            prompt,
            metadata: {
                timestamp: new Date().toISOString(),
                ...metadata
            },
            usage: {
                count: 0,
                last_used: null
            }
        };

        this.history.unshift(entry);

        // 最大エントリ数を超えた場合は古いものを削除
        if (this.history.length > this.options.maxEntries) {
            this.history = this.history.slice(0, this.options.maxEntries);
        }

        this.saveHistory();
        return entry.id;
    }

    /**
     * エントリを取得
     */
    getEntry(id) {
        return this.history.find(entry => entry.id === id);
    }

    /**
     * 履歴を取得
     */
    getHistory(filters = {}) {
        let filtered = [...this.history];

        // 期間フィルター
        if (filters.dateFrom || filters.dateTo) {
            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.metadata.timestamp);
                const from = filters.dateFrom ? new Date(filters.dateFrom) : new Date(0);
                const to = filters.dateTo ? new Date(filters.dateTo) : new Date();
                return entryDate >= from && entryDate <= to;
            });
        }

        // 検索フィルター
        if (filters.search) {
            const query = filters.search.toLowerCase();
            filtered = filtered.filter(entry => 
                entry.prompt.toLowerCase().includes(query) ||
                (entry.metadata.template_id && entry.metadata.template_id.toLowerCase().includes(query))
            );
        }

        // ソート
        if (filters.sort) {
            switch (filters.sort) {
                case 'newest':
                    filtered.sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp));
                    break;
                case 'oldest':
                    filtered.sort((a, b) => new Date(a.metadata.timestamp) - new Date(b.metadata.timestamp));
                    break;
                case 'most_used':
                    filtered.sort((a, b) => b.usage.count - a.usage.count);
                    break;
            }
        }

        return filtered;
    }

    /**
     * エントリを更新
     */
    updateEntry(id, updates) {
        const entry = this.getEntry(id);
        if (entry) {
            Object.assign(entry, updates);
            this.saveHistory();
            return true;
        }
        return false;
    }

    /**
     * エントリを削除
     */
    deleteEntry(id) {
        const index = this.history.findIndex(entry => entry.id === id);
        if (index !== -1) {
            this.history.splice(index, 1);
            this.saveHistory();
            return true;
        }
        return false;
    }

    /**
     * 使用回数を増やす
     */
    incrementUsage(id) {
        const entry = this.getEntry(id);
        if (entry) {
            entry.usage.count++;
            entry.usage.last_used = new Date().toISOString();
            this.saveHistory();
            return true;
        }
        return false;
    }

    /**
     * 統計情報を取得
     */
    getStatistics() {
        const totalEntries = this.history.length;
        const totalUsage = this.history.reduce((sum, entry) => sum + entry.usage.count, 0);
        const averageLength = this.history.reduce((sum, entry) => sum + entry.prompt.length, 0) / totalEntries || 0;
        
        const templateUsage = {};
        this.history.forEach(entry => {
            if (entry.metadata.template_id) {
                templateUsage[entry.metadata.template_id] = (templateUsage[entry.metadata.template_id] || 0) + 1;
            }
        });

        const mostUsedTemplate = Object.entries(templateUsage)
            .sort(([,a], [,b]) => b - a)[0] || [null, 0];

        return {
            totalEntries,
            totalUsage,
            averageLength: Math.round(averageLength),
            mostUsedTemplate: mostUsedTemplate[0],
            templateUsage
        };
    }

    /**
     * IDを生成
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 履歴をクリア
     */
    clearHistory() {
        this.history = [];
        this.saveHistory();
    }

    /**
     * 履歴をエクスポート
     */
    exportHistory() {
        return {
            data: this.history,
            exported_at: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * 履歴をインポート
     */
    importHistory(data) {
        if (data.data && Array.isArray(data.data)) {
            this.history = data.data;
            this.saveHistory();
            return true;
        }
        return false;
    }
}

/**
 * 統合プロンプトエンジン
 */
export class PromptEngine {
    constructor(options = {}) {
        this.templateManager = new PromptTemplateManager();
        this.optimizer = new PromptOptimizer();
        this.historyManager = new PromptHistoryManager(options.history);
        this.options = {
            autoOptimize: false,
            saveToHistory: true,
            ...options
        };
    }

    /**
     * プロンプトを生成
     */
    async generatePrompt(templateId, variables, options = {}) {
        const result = this.templateManager.generatePrompt(templateId, variables);
        
        let finalPrompt = result.prompt;

        // 最適化オプションが有効な場合
        if (options.optimize || this.options.autoOptimize) {
            const optimization = this.optimizer.optimize(finalPrompt, options);
            finalPrompt = optimization.optimized;
            result.optimization = optimization;
        }

        // バリデーション
        const validation = PromptValidators.validatePromptText(finalPrompt);
        result.validation = validation;

        // 履歴に保存
        if (options.saveToHistory !== false && this.options.saveToHistory) {
            const historyId = this.historyManager.addEntry(finalPrompt, {
                template_id: templateId,
                variables_used: variables,
                optimization_applied: !!result.optimization
            });
            result.historyId = historyId;
        }

        result.prompt = finalPrompt;
        return result;
    }

    /**
     * プロンプトを最適化
     */
    optimizePrompt(prompt, options = {}) {
        const optimization = this.optimizer.optimize(prompt, options);
        
        if (options.saveToHistory !== false && this.options.saveToHistory) {
            const historyId = this.historyManager.addEntry(optimization.optimized, {
                original_prompt: prompt,
                optimization_applied: true,
                improvements: optimization.improvements
            });
            optimization.historyId = historyId;
        }

        return optimization;
    }

    /**
     * テンプレートを取得
     */
    getTemplates(filters = {}) {
        return this.templateManager.getTemplates(filters);
    }

    /**
     * 履歴を取得
     */
    getHistory(filters = {}) {
        return this.historyManager.getHistory(filters);
    }

    /**
     * 統計情報を取得
     */
    getStatistics() {
        return {
            templates: {
                total: this.templateManager.templates.size,
                categories: this.templateManager.getCategories()
            },
            history: this.historyManager.getStatistics()
        };
    }
}

export { PromptEngine as default, PromptTemplateManager, PromptOptimizer, PromptHistoryManager }; 