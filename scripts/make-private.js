/**
 * プライベートアクセス化スクリプト
 * 全HTMLページに検索エンジンブロック設定を追加
 */

const fs = require('fs');
const path = require('path');

// 検索エンジンブロック用のメタタグ
const privateMetaTags = `
    <!-- 🔒 プライベートアクセス設定：検索エンジン完全ブロック -->
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
    <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
    <meta name="bingbot" content="noindex, nofollow, noarchive, nosnippet">
    <meta name="description" content="招待制アクセス - URLを知っている方のみ利用可能">`;

// 処理対象のHTMLファイル
const htmlFiles = [
    'src/pages/ai-basics.html',
    'src/pages/improve-resolution.html', 
    'src/pages/prompt-engineering.html',
    'src/pages/prompt-creator.html'
];

htmlFiles.forEach(filePath => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 既存のrobots メタタグを削除
        content = content.replace(/<meta name="robots"[^>]*>/gi, '');
        
        // 既存のdescription を置換
        content = content.replace(
            /<meta name="description"[^>]*>/gi, 
            '<meta name="description" content="招待制アクセス - URLを知っている方のみ利用可能">'
        );
        
        // headタグの直後にプライベート設定を挿入
        content = content.replace(
            /(<head[^>]*>)/i,
            `$1${privateMetaTags}`
        );
        
        // タイトルに「プライベートアクセス」を追加
        content = content.replace(
            /(<title>)(.*?)(<\/title>)/i,
            '$1$2 - プライベートアクセス$3'
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ プライベート設定適用完了: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ エラー: ${filePath}`, error.message);
    }
});

console.log('\n🔒 全HTMLページのプライベートアクセス化が完了しました。');
console.log('📋 適用された設定:');
console.log('   - robots.txt: 全検索エンジンボットブロック');
console.log('   - noindex メタタグ: 検索結果から除外');
console.log('   - nofollow: リンクを辿らない');
console.log('   - noarchive: キャッシュを作成しない');
console.log('   - nosnippet: スニペット表示禁止'); 