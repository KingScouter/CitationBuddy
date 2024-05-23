import fs from 'fs';
import { AppConfig, ServerConfig } from '../models';

export class ConfigService {
  configFile: string = AppConfig.CONFIG_FILE_DEFAULT;
  private configs: ServerConfig[] = [];

  getConfig(guildId: string): ServerConfig {
    return this.configs.find((elem) => elem.guildId === guildId);
  }

  setConfig(config: ServerConfig): void {
    const idx = this.configs.findIndex(
      (elem) => elem.guildId === config.guildId
    );
    if (idx < 0) {
      this.configs.push(config);
    } else {
      this.configs.splice(idx, 1, config);
    }

    this.saveConfigs();
  }

  loadConfigs(): void {
    if (!fs.existsSync(this.configFile)) {
      console.log('No config exists yet, skip loading');
      return;
    }

    const data = fs.readFileSync(this.configFile, {
      encoding: AppConfig.CONFIG_FILE_ENCODING,
    });
    this.configs = JSON.parse(data);
  }

  saveConfigs(): void {
    fs.writeFileSync(this.configFile, JSON.stringify(this.configs), {
      encoding: AppConfig.CONFIG_FILE_ENCODING,
    });
  }
}

const globalConfig = new ConfigService();

export default { globalConfig };
