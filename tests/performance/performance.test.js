/**
 * 生成AIステップアップガイド - パフォーマンステスト
 * @version 1.0.0
 * @description ページ読み込み・JavaScript実行・メモリ使用量の測定
 */

import { JSDOM } from 'jsdom';
import { performance, PerformanceObserver } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

/**
 * パフォーマンス測定ユーティリティ
 */
class PerformanceMeasurer {
    constructor() {
        this.measurements = new Map();
        this.observers = [];
        this.setupPerformanceObserver();
    }

    setupPerformanceObserver() {
        const obs = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.measurements.set(entry.name, {
                    duration: entry.duration,
                    startTime: entry.startTime,
                    entryType: entry.entryType,
                    timestamp: new Date()
                });
            });
        });
        
        obs.observe({ entryTypes: ['measure', 'mark'] });
        this.observers.push(obs);
    }

    /**
     * パフォーマンス測定開始
     */
    startMeasure(name) {
        performance.mark(`${name}-start`);
    }

    /**
     * パフォーマンス測定終了
     */
    endMeasure(name) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const measurement = this.measurements.get(name);
        return measurement ? measurement.duration : null;
    }

    /**
     * 非同期関数の実行時間測定
     */
    async measureAsync(name, asyncFunction) {
        this.startMeasure(name);
        try {
            const result = await asyncFunction();
            const duration = this.endMeasure(name);
            return { result, duration };
        } catch (error) {
            this.endMeasure(name);
            throw error;
        }
    }

    /**
     * 関数の実行時間測定
     */
    measureSync(name, syncFunction) {
        this.startMeasure(name);
        try {
            const result = syncFunction();
            const duration = this.endMeasure(name);
            return { result, duration };
        } catch (error) {
            this.endMeasure(name);
            throw error;
        }
    }

    /**
     * 測定結果取得
     */
    getMeasurements() {
        return Object.fromEntries(this.measurements);
    }

    /**
     * 測定データクリア
     */
    clearMeasurements() {
        this.measurements.clear();
        performance.clearMarks();
        performance.clearMeasures();
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.observers.forEach(obs => obs.disconnect());
        this.clearMeasurements();
    }
}

/**
 * メモリ使用量監視
 */
class MemoryMonitor {
    constructor() {
        this.snapshots = [];
        this.isMonitoring = false;
        this.interval = null;
    }

    /**
     * メモリ監視開始
     */
    startMonitoring(intervalMs = 1000) {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.interval = setInterval(() => {
            this.takeSnapshot();
        }, intervalMs);
    }

    /**
     * メモリ監視停止
     */
    stopMonitoring() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isMonitoring = false;
    }

    /**
     * メモリスナップショット取得
     */
    takeSnapshot() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const usage = process.memoryUsage();
            this.snapshots.push({
                timestamp: new Date(),
                heapUsed: usage.heapUsed,
                heapTotal: usage.heapTotal,
                external: usage.external,
                rss: usage.rss
            });
        }
    }

    /**
     * メモリ使用量統計
     */
    getStatistics() {
        if (this.snapshots.length === 0) return null;

        const heapUsed = this.snapshots.map(s => s.heapUsed);
        const heapTotal = this.snapshots.map(s => s.heapTotal);

        return {
            snapshots: this.snapshots.length,
            heapUsed: {
                min: Math.min(...heapUsed),
                max: Math.max(...heapUsed),
                avg: heapUsed.reduce((a, b) => a + b, 0) / heapUsed.length,
                current: heapUsed[heapUsed.length - 1]
            },
            heapTotal: {
                min: Math.min(...heapTotal),
                max: Math.max(...heapTotal),
                avg: heapTotal.reduce((a, b) => a + b, 0) / heapTotal.length,
                current: heapTotal[heapTotal.length - 1]
            }
        };
    }

    /**
     * メモリリーク検出
     */
    detectMemoryLeaks() {
        if (this.snapshots.length < 10) return null;

        const recent = this.snapshots.slice(-10);
        const growth = recent[recent.length - 1].heapUsed - recent[0].heapUsed;
        const threshold = 1024 * 1024; // 1MB

        return {
            possibleLeak: growth > threshold,
            growth: growth,
            percentage: (growth / recent[0].heapUsed) * 100
        };
    }

    /**
     * スナップショットクリア
     */
    clearSnapshots() {
        this.snapshots = [];
    }
}

/**
 * DOM操作パフォーマンステスト
 */
class DOMPerformanceTester {
    constructor() {
        this.dom = null;
        this.window = null;
        this.document = null;
    }

    /**
     * DOM環境初期化
     */
    async setupDOM(htmlContent = '<html><body></body></html>') {
        this.dom = new JSDOM(htmlContent, {
            pretendToBeVisual: true,
            runScripts: 'dangerously'
        });
        
        this.window = this.dom.window;
        this.document = this.window.document;
        
        // 必要なAPIの模擬実装
        this.setupMockAPIs();
    }

    /**
     * Mock APIの設定
     */
    setupMockAPIs() {
        // requestAnimationFrameのモック
        this.window.requestAnimationFrame = (callback) => {
            return setTimeout(callback, 16); // 60fps
        };

        // ResizeObserverのモック
        this.window.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        };

        // IntersectionObserverのモック
        this.window.IntersectionObserver = class {
            constructor(callback) {
                this.callback = callback;
            }
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    }

    /**
     * 大量DOM要素作成テスト
     */
    testMassiveElementCreation(count = 1000) {
        const startTime = performance.now();
        
        const container = this.document.createElement('div');
        this.document.body.appendChild(container);

        for (let i = 0; i < count; i++) {
            const element = this.document.createElement('div');
            element.className = `item-${i}`;
            element.textContent = `Item ${i}`;
            element.dataset.index = i;
            container.appendChild(element);
        }

        const endTime = performance.now();
        
        return {
            duration: endTime - startTime,
            elementsCreated: count,
            averagePerElement: (endTime - startTime) / count
        };
    }

    /**
     * DOM検索パフォーマンステスト
     */
    testDOMQuery(selectors, iterations = 100) {
        const results = {};
        
        // テスト用の要素を準備
        this.setupTestElements();
        
        selectors.forEach(selector => {
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                this.document.querySelectorAll(selector);
            }
            
            const endTime = performance.now();
            
            results[selector] = {
                duration: endTime - startTime,
                iterations,
                averagePerQuery: (endTime - startTime) / iterations
            };
        });
        
        return results;
    }

    /**
     * テスト用要素の準備
     */
    setupTestElements() {
        const container = this.document.createElement('div');
        container.id = 'test-container';
        
        // 様々な構造の要素を作成
        for (let i = 0; i < 100; i++) {
            const section = this.document.createElement('section');
            section.className = `section-${i % 5}`;
            
            for (let j = 0; j < 10; j++) {
                const div = this.document.createElement('div');
                div.className = 'item';
                div.setAttribute('data-type', j % 3 === 0 ? 'special' : 'normal');
                
                const p = this.document.createElement('p');
                p.textContent = `Content ${i}-${j}`;
                div.appendChild(p);
                
                section.appendChild(div);
            }
            
            container.appendChild(section);
        }
        
        this.document.body.appendChild(container);
    }

    /**
     * イベントハンドリングパフォーマンステスト
     */
    testEventHandling(eventCount = 1000) {
        const button = this.document.createElement('button');
        this.document.body.appendChild(button);
        
        let handlerCount = 0;
        const handler = () => handlerCount++;
        
        const startTime = performance.now();
        
        // イベントリスナー追加
        for (let i = 0; i < eventCount; i++) {
            button.addEventListener('click', handler);
        }
        
        // イベント発火
        const event = new this.window.MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });
        button.dispatchEvent(event);
        
        const endTime = performance.now();
        
        return {
            duration: endTime - startTime,
            eventListeners: eventCount,
            handlerExecutions: handlerCount,
            averagePerListener: (endTime - startTime) / eventCount
        };
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        if (this.dom) {
            this.dom.window.close();
        }
    }
}

/**
 * JavaScript実行パフォーマンステスト
 */
describe('生成AIステップアップガイド - パフォーマンステスト', () => {
    let measurer;
    let memoryMonitor;
    let domTester;

    beforeAll(async () => {
        measurer = new PerformanceMeasurer();
        memoryMonitor = new MemoryMonitor();
        domTester = new DOMPerformanceTester();
        
        await domTester.setupDOM();
    });

    afterAll(() => {
        measurer.destroy();
        memoryMonitor.stopMonitoring();
        domTester.cleanup();
    });

    beforeEach(() => {
        measurer.clearMeasurements();
        memoryMonitor.clearSnapshots();
    });

    /**
     * ページ読み込みパフォーマンステスト
     */
    describe('ページ読み込みパフォーマンス', () => {
        test('HTMLファイル読み込み速度', async () => {
            const pages = [
                'index.html',
                'src/pages/ai-basics.html',
                'src/pages/improve-resolution.html',
                'src/pages/prompt-engineering.html',
                'src/pages/prompt-creator.html'
            ];

            const results = {};

            for (const page of pages) {
                const { duration } = await measurer.measureAsync(`load-${page}`, async () => {
                    const fullPath = path.resolve(page);
                    if (fs.existsSync(fullPath)) {
                        return fs.readFileSync(fullPath, 'utf-8');
                    }
                    return null;
                });

                results[page] = duration;
                
                // 500ms以下での読み込みを期待
                expect(duration).toBeLessThan(500);
            }

            console.log('📊 ページ読み込み時間:', results);
        });

        test('CSSファイル読み込み・パース速度', async () => {
            const cssPath = 'style.css';
            
            const { duration } = await measurer.measureAsync('css-parse', async () => {
                if (fs.existsSync(cssPath)) {
                    const cssContent = fs.readFileSync(cssPath, 'utf-8');
                    
                    // CSSパースシミュレーション
                    const lines = cssContent.split('\n');
                    const rules = lines.filter(line => line.includes('{'));
                    
                    return { lines: lines.length, rules: rules.length };
                }
                return null;
            });

            // 100ms以下でのCSS処理を期待
            expect(duration).toBeLessThan(100);
        });

        test('JavaScript module loading simulation', async () => {
            const jsFiles = [
                'src/js/app.js',
                'src/js/utils.js',
                'src/js/validators.js',
                'src/js/components.js',
                'src/js/prompt-engine.js',
                'src/js/ui-enhancements.js'
            ];

            const loadTimes = {};

            for (const file of jsFiles) {
                const { duration } = await measurer.measureAsync(`js-${file}`, async () => {
                    if (fs.existsSync(file)) {
                        const content = fs.readFileSync(file, 'utf-8');
                        
                        // JavaScriptファイルサイズと複雑性の分析
                        return {
                            size: content.length,
                            lines: content.split('\n').length,
                            functions: (content.match(/function\s+\w+/g) || []).length,
                            classes: (content.match(/class\s+\w+/g) || []).length
                        };
                    }
                    return null;
                });

                loadTimes[file] = duration;
            }

            // 平均読み込み時間が200ms以下であることを確認
            const averageLoadTime = Object.values(loadTimes).reduce((a, b) => a + b, 0) / Object.keys(loadTimes).length;
            expect(averageLoadTime).toBeLessThan(200);

            console.log('📊 JavaScript読み込み時間:', loadTimes);
        });
    });

    /**
     * DOM操作パフォーマンステスト
     */
    describe('DOM操作パフォーマンス', () => {
        test('大量要素作成パフォーマンス', () => {
            const result = domTester.testMassiveElementCreation(1000);
            
            // 1000要素を1秒以内で作成できることを確認
            expect(result.duration).toBeLessThan(1000);
            expect(result.averagePerElement).toBeLessThan(1);
            
            console.log('📊 要素作成パフォーマンス:', result);
        });

        test('DOM検索パフォーマンス', () => {
            const selectors = [
                'div',
                '.item',
                '[data-type="special"]',
                'section > div',
                '.section-1 .item',
                'p:first-child'
            ];

            const results = domTester.testDOMQuery(selectors, 100);
            
            // 各クエリが50ms以内で完了することを確認
            Object.values(results).forEach(result => {
                expect(result.duration).toBeLessThan(50);
            });

            console.log('📊 DOM検索パフォーマンス:', results);
        });

        test('イベントハンドリングパフォーマンス', () => {
            const result = domTester.testEventHandling(100);
            
            // 100個のイベントリスナーを50ms以内で処理
            expect(result.duration).toBeLessThan(50);
            expect(result.handlerExecutions).toBe(100);
            
            console.log('📊 イベントハンドリングパフォーマンス:', result);
        });
    });

    /**
     * メモリ使用量テスト
     */
    describe('メモリ使用量', () => {
        test('メモリ使用量監視', async () => {
            memoryMonitor.startMonitoring(100);
            
            // メモリを使用する処理をシミュレート
            const largeArray = [];
            for (let i = 0; i < 10000; i++) {
                largeArray.push({
                    id: i,
                    data: 'test'.repeat(100),
                    timestamp: new Date()
                });
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            memoryMonitor.stopMonitoring();
            const stats = memoryMonitor.getStatistics();
            
            expect(stats).toBeDefined();
            expect(stats.snapshots).toBeGreaterThan(0);
            
            console.log('📊 メモリ使用量統計:', stats);
        });

        test('メモリリーク検出', async () => {
            memoryMonitor.startMonitoring(50);
            
            // メモリリークをシミュレート
            const leakArray = [];
            for (let i = 0; i < 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // メモリを増やし続ける
                leakArray.push(new Array(1000).fill('memory-leak-test'));
            }
            
            memoryMonitor.stopMonitoring();
            const leakDetection = memoryMonitor.detectMemoryLeaks();
            
            if (leakDetection) {
                console.log('📊 メモリリーク検出:', leakDetection);
                
                // 大きなメモリ増加が検出されることを確認
                expect(leakDetection.growth).toBeGreaterThan(0);
            }
        });
    });

    /**
     * アルゴリズムパフォーマンステスト
     */
    describe('アルゴリズムパフォーマンス', () => {
        test('配列操作パフォーマンス', () => {
            const testData = Array.from({ length: 10000 }, (_, i) => ({
                id: i,
                value: Math.random(),
                category: i % 10
            }));

            const operations = {
                filter: () => testData.filter(item => item.value > 0.5),
                map: () => testData.map(item => ({ ...item, processed: true })),
                reduce: () => testData.reduce((acc, item) => acc + item.value, 0),
                sort: () => [...testData].sort((a, b) => a.value - b.value),
                find: () => testData.find(item => item.id === 5000)
            };

            const results = {};

            Object.entries(operations).forEach(([name, operation]) => {
                const { duration } = measurer.measureSync(`array-${name}`, operation);
                results[name] = duration;
                
                // 各操作が100ms以内で完了することを確認
                expect(duration).toBeLessThan(100);
            });

            console.log('📊 配列操作パフォーマンス:', results);
        });

        test('オブジェクト操作パフォーマンス', () => {
            const testObject = {};
            for (let i = 0; i < 1000; i++) {
                testObject[`key_${i}`] = { value: i, data: 'test'.repeat(10) };
            }

            const operations = {
                'Object.keys': () => Object.keys(testObject),
                'Object.values': () => Object.values(testObject),
                'Object.entries': () => Object.entries(testObject),
                'JSON.stringify': () => JSON.stringify(testObject),
                'Object.assign': () => Object.assign({}, testObject)
            };

            const results = {};

            Object.entries(operations).forEach(([name, operation]) => {
                const { duration } = measurer.measureSync(`object-${name}`, operation);
                results[name] = duration;
                
                // 各操作が50ms以内で完了することを確認
                expect(duration).toBeLessThan(50);
            });

            console.log('📊 オブジェクト操作パフォーマンス:', results);
        });

        test('文字列処理パフォーマンス', () => {
            const longText = 'テスト用の長いテキスト。'.repeat(1000);

            const operations = {
                'split': () => longText.split('。'),
                'replace': () => longText.replace(/テスト/g, 'TEST'),
                'match': () => longText.match(/\w+/g),
                'toLowerCase': () => longText.toLowerCase(),
                'substring': () => longText.substring(0, 1000)
            };

            const results = {};

            Object.entries(operations).forEach(([name, operation]) => {
                const { duration } = measurer.measureSync(`string-${name}`, operation);
                results[name] = duration;
                
                // 各操作が30ms以内で完了することを確認
                expect(duration).toBeLessThan(30);
            });

            console.log('📊 文字列処理パフォーマンス:', results);
        });
    });

    /**
     * 総合パフォーマンステスト
     */
    describe('総合パフォーマンス', () => {
        test('アプリケーション初期化シミュレーション', async () => {
            memoryMonitor.startMonitoring(100);
            
            const { result, duration } = await measurer.measureAsync('app-initialization', async () => {
                // アプリケーション初期化をシミュレート
                const steps = [
                    () => domTester.testMassiveElementCreation(100),
                    () => domTester.testDOMQuery(['div', '.item'], 10),
                    () => domTester.testEventHandling(50),
                    () => new Promise(resolve => setTimeout(resolve, 100))
                ];

                const results = [];
                for (const step of steps) {
                    results.push(await step());
                }
                
                return results;
            });

            memoryMonitor.stopMonitoring();
            
            // アプリケーション初期化が1秒以内で完了することを確認
            expect(duration).toBeLessThan(1000);
            
            const memoryStats = memoryMonitor.getStatistics();
            console.log('📊 アプリケーション初期化:', { duration, memoryStats });
        });

        test('パフォーマンス回帰テスト', () => {
            // ベースライン性能の設定
            const baselines = {
                domCreation: 500,    // ms
                domQuery: 50,        // ms
                eventHandling: 50,   // ms
                arrayOperation: 100, // ms
                stringOperation: 30  // ms
            };

            const results = {
                domCreation: domTester.testMassiveElementCreation(1000).duration,
                domQuery: Object.values(domTester.testDOMQuery(['div', '.item'], 100))[0].duration,
                eventHandling: domTester.testEventHandling(100).duration
            };

            // すべての操作がベースラインを満たすことを確認
            Object.entries(baselines).forEach(([operation, baseline]) => {
                if (results[operation] !== undefined) {
                    expect(results[operation]).toBeLessThan(baseline);
                }
            });

            console.log('📊 パフォーマンス回帰テスト:', { results, baselines });
        });
    });
}); 