
const _ = require('loadsh');

const config = require('./config.json');
const defaultConfig = config.development;
const enviroment = process.env.NODE_ENV || 'development';
const enviromentConfig = config[enviroment];
const finalConfig = _.merge(defaultConfig, enviromentConfig);

global.gConfig = finalConfig;

// log global.gConfig
console.log(`global.gConfig: ${JSON.stringify(global.gConfig, global.gConfig.config_id, global.gConfig.client_id, global.gConfig.secret_key, global.gConfig.redirect_uri)}`);