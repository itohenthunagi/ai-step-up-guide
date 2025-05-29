/**
 * 環境変数バリデーション機能
 * 開発・本番環境での環境変数の型チェック・必須チェックを行う
 */

/**
 * 単一の環境変数をバリデーションする
 * @param {string} variableName - 環境変数名
 * @param {Object} options - バリデーションオプション
 * @param {boolean} options.required - 必須かどうか
 * @param {string} options.type - 期待する型（string, number, boolean, url）
 * @param {any} options.defaultValue - デフォルト値
 * @returns {Object} バリデーション結果
 */
function validateVariable(variableName, options = {}) {
  const {
    required = false,
    type = 'string',
    defaultValue = null
  } = options;

  const value = process.env[variableName];
  const errors = [];

  // 必須チェック
  if (required && (value === undefined || value === '')) {
    return {
      isValid: false,
      errors: [`${variableName} is required but not set`],
      value: defaultValue
    };
  }

  // 値が設定されていない場合でもrequiredでなければOK
  if (value === undefined || value === '') {
    return {
      isValid: true,
      errors: [],
      value: defaultValue
    };
  }

  // 型チェック
  let isValidType = true;
  let validatedValue = value;

  switch (type) {
    case 'boolean':
      if (!['true', 'false'].includes(value.toLowerCase())) {
        errors.push(`${variableName} is not a valid boolean`);
        isValidType = false;
      } else {
        validatedValue = value.toLowerCase() === 'true';
      }
      break;

    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${variableName} is not a valid number`);
        isValidType = false;
      } else {
        validatedValue = numValue;
      }
      break;

    case 'url':
      try {
        new URL(value);
        validatedValue = value;
      } catch (error) {
        errors.push(`${variableName} is not a valid URL`);
        isValidType = false;
      }
      break;

    case 'string':
    default:
      // 文字列の場合は特別な検証は不要
      validatedValue = value;
      break;
  }

  return {
    isValid: isValidType,
    errors: errors,
    value: validatedValue
  };
}

/**
 * 複数の環境変数を一括でバリデーションする
 * @param {Object} config - 環境変数設定オブジェクト
 * @returns {Object} バリデーション結果
 */
function validateEnvironmentVariables(config) {
  const allErrors = [];
  const validatedValues = {};

  for (const [variableName, options] of Object.entries(config)) {
    const result = validateVariable(variableName, options);
    
    if (!result.isValid) {
      allErrors.push(...result.errors);
    }
    
    validatedValues[variableName] = result.value;
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    values: validatedValues
  };
}

/**
 * プロジェクト固有の環境変数設定
 */
const PROJECT_ENV_CONFIG = {
  // 基本設定
  NODE_ENV: { 
    required: true, 
    type: 'string',
    description: '実行環境（development/production/test）'
  },
  SITE_URL: { 
    required: true, 
    type: 'url',
    description: 'サイトのベースURL'
  },
  SITE_TITLE: { 
    required: true, 
    type: 'string',
    description: 'サイトタイトル'
  },
  DEBUG_MODE: { 
    required: true, 
    type: 'boolean',
    description: 'デバッグモードの有効/無効'
  },
  APP_VERSION: { 
    required: true, 
    type: 'string',
    description: 'アプリケーションバージョン'
  },

  // オプション設定
  ANALYTICS_ID: { 
    required: false, 
    type: 'string',
    description: 'Google Analytics ID'
  },
  GTM_ID: { 
    required: false, 
    type: 'string',
    description: 'Google Tag Manager ID'
  },
  GOOGLE_SITE_VERIFICATION: { 
    required: false, 
    type: 'string',
    description: 'Google Search Console 認証コード'
  },

  // パフォーマンス設定
  PERFORMANCE_BUDGET_FCP: { 
    required: false, 
    type: 'number',
    defaultValue: 1500,
    description: 'First Contentful Paint の目標値（ms）'
  },
  PERFORMANCE_BUDGET_LCP: { 
    required: false, 
    type: 'number',
    defaultValue: 2500,
    description: 'Largest Contentful Paint の目標値（ms）'
  },
  PERFORMANCE_BUDGET_CLS: { 
    required: false, 
    type: 'number',
    defaultValue: 0.1,
    description: 'Cumulative Layout Shift の目標値'
  },

  // セキュリティ設定
  SECURITY_HEADERS_ENABLED: { 
    required: false, 
    type: 'boolean',
    defaultValue: true,
    description: 'セキュリティヘッダーの有効/無効'
  },
  CSP_ENABLED: { 
    required: false, 
    type: 'boolean',
    defaultValue: true,
    description: 'Content Security Policy の有効/無効'
  }
};

/**
 * 現在の環境変数をプロジェクト設定でバリデーションする
 * @returns {Object} バリデーション結果
 */
function validateCurrentEnvironment() {
  return validateEnvironmentVariables(PROJECT_ENV_CONFIG);
}

/**
 * 環境変数の設定状況をコンソールに表示する
 * @param {Object} validationResult - バリデーション結果
 */
function displayEnvironmentStatus(validationResult) {
  console.log('\n🔧 環境変数バリデーション結果');
  console.log('=' .repeat(50));

  if (validationResult.isValid) {
    console.log('✅ 全ての環境変数が正しく設定されています');
  } else {
    console.log('❌ 環境変数の設定に問題があります');
    console.log('\n⚠️  エラー詳細:');
    validationResult.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
  }

  console.log('\n📋 設定済み環境変数:');
  Object.entries(validationResult.values).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      // セキュリティのため、機密情報は表示しない
      const sensitiveKeys = ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'];
      const isSensitive = sensitiveKeys.some(sensitive => key.includes(sensitive));
      const displayValue = isSensitive ? '***' : value;
      console.log(`   ${key}: ${displayValue}`);
    }
  });

  console.log('=' .repeat(50));
}

/**
 * 環境変数の初期化とバリデーション
 * アプリケーション起動時に呼び出される
 */
function initializeEnvironment() {
  // dotenvを使用してファイルから環境変数を読み込み
  if (typeof require !== 'undefined') {
    try {
      require('dotenv').config();
    } catch (error) {
      console.warn('⚠️  dotenv パッケージが見つかりません。手動で環境変数を設定してください。');
    }
  }

  // バリデーション実行
  const result = validateCurrentEnvironment();
  
  // 開発環境では詳細表示
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_MODE === 'true') {
    displayEnvironmentStatus(result);
  }

  // エラーがある場合は警告表示
  if (!result.isValid) {
    console.error('\n🚨 環境変数の設定を確認してください。');
    
    // 本番環境でエラーがある場合はプロセスを停止
    if (process.env.NODE_ENV === 'production') {
      console.error('本番環境では正しい環境変数設定が必須です。');
      process.exit(1);
    }
  }

  return result;
}

module.exports = {
  validateVariable,
  validateEnvironmentVariables,
  validateCurrentEnvironment,
  displayEnvironmentStatus,
  initializeEnvironment,
  PROJECT_ENV_CONFIG
}; 