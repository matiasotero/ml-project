
const _ = require('loadsh');

const config = require('./config.json');
const defaultConfig = config.development;
const enviroment = process.env.NODE_ENV || 'development';
const enviromentConfig = config[enviroment];
const finalConfig = _.merge(defaultConfig, enviromentConfig);

global.gConfig = finalConfig;