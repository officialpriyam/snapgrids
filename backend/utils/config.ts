import fs from 'fs';
import yaml from 'yaml';
import path from 'path';

const configPath = path.join(__dirname, '../config.yml');
let config: any = {};

try {
    const file = fs.readFileSync(configPath, 'utf8');
    config = yaml.parse(file);
    // Mask sensitive fields before logging
    const safeConfig = { ...config };
    if (safeConfig.openrouter_api_key) safeConfig.openrouter_api_key = safeConfig.openrouter_api_key.slice(0, 8) + '***';
    if (safeConfig.nvidia_api_key) safeConfig.nvidia_api_key = safeConfig.nvidia_api_key.slice(0, 8) + '***';
    console.log('Configuration utility initialized with:', safeConfig);
} catch (e) {
    console.error('Failed to load config.yml at', configPath, e);
}

export default config;
