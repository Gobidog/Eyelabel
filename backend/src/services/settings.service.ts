import { AppDataSource } from '../config/database';
import { Settings } from '../entities/Settings.entity';
import { encrypt, decrypt } from '../utils/crypto.utils';
import axios from 'axios';

export class SettingsService {
  private settingsRepository = AppDataSource.getRepository(Settings);

  /**
   * Get all settings (non-sensitive values only)
   */
  async getAllSettings(): Promise<Settings[]> {
    return this.settingsRepository.find();
  }

  /**
   * Get setting by key
   */
  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({ where: { key } });

    if (!setting) return null;

    if (setting.isEncrypted) {
      return decrypt(setting.value);
    }

    return setting.value;
  }

  /**
   * Check if setting exists
   */
  async hasSetting(key: string): Promise<boolean> {
    const count = await this.settingsRepository.count({ where: { key } });
    return count > 0;
  }

  /**
   * Set or update a setting
   */
  async setSetting(
    key: string,
    value: string,
    isEncrypted: boolean = false,
    description?: string
  ): Promise<Settings> {
    const existingSetting = await this.settingsRepository.findOne({ where: { key } });

    const valueToStore = isEncrypted ? encrypt(value) : value;

    if (existingSetting) {
      existingSetting.value = valueToStore;
      existingSetting.isEncrypted = isEncrypted;
      if (description) existingSetting.description = description;
      return this.settingsRepository.save(existingSetting);
    }

    const newSetting = this.settingsRepository.create({
      key,
      value: valueToStore,
      isEncrypted,
      description,
    });

    return this.settingsRepository.save(newSetting);
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string): Promise<boolean> {
    const result = await this.settingsRepository.delete({ key });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Update OpenAI API key and test connection
   */
  async updateOpenAIKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    try {
      const keyPreview = `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`;
      console.log(`🔑 [Service] updateOpenAIKey called with key: ${keyPreview} (length: ${apiKey.length})`);

      // First, update AI service with new key
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:5000';
      console.log(`🔑 [Service] Attempting to update AI service at ${aiServiceUrl}`);

      try {
        const updateResult = await axios.post(`${aiServiceUrl}/api/update-key`, {
          api_key: apiKey,
        });
        console.log('🔑 [Service] AI service update response:', updateResult.data);
      } catch (error: any) {
        console.error('🔑 [Service] Failed to update AI service:', error.message);
        return {
          success: false,
          message: `Failed to update AI service: ${error.message}`,
        };
      }

      // Test the connection
      try {
        console.log(`🔑 [Service] Testing AI connection at ${aiServiceUrl}`);
        const testResult = await axios.get(`${aiServiceUrl}/api/test-ai`);
        console.log('🔑 [Service] AI test response:', testResult.data);

        if (!testResult.data.success) {
          console.log(`🔑 [Service] AI test failed: ${testResult.data.message}`);
          return {
            success: false,
            message: testResult.data.message || 'API key validation failed',
          };
        }
      } catch (error: any) {
        console.error('🔑 [Service] AI test failed:', error.message);
        return {
          success: false,
          message: `API key test failed: ${error.message}`,
        };
      }

      // Save encrypted key to database
      console.log('🔑 [Service] Saving encrypted key to database...');
      await this.setSetting(
        'openai_api_key',
        apiKey,
        true,
        'OpenAI API Key for AI-powered label generation'
      );
      console.log('🔑 [Service] Key saved successfully to database');

      // Verify what was saved by reading it back
      const savedKey = await this.getSetting('openai_api_key');
      const savedKeyPreview = savedKey ? `${savedKey.substring(0, 7)}...${savedKey.substring(savedKey.length - 4)}` : 'null';
      console.log(`🔑 [Service] Verification - Read back from DB: ${savedKeyPreview} (length: ${savedKey?.length || 0})`);

      if (savedKey !== apiKey) {
        console.error('🔑 [Service] ERROR: Saved key does not match input key!');
        console.error(`🔑 [Service] Input:  ${keyPreview}`);
        console.error(`🔑 [Service] Saved:  ${savedKeyPreview}`);
      } else {
        console.log('🔑 [Service] ✓ Verification passed - saved key matches input');
      }

      return {
        success: true,
        message: 'OpenAI API key updated and validated successfully',
      };
    } catch (error: any) {
      console.error('🔑 [Service] Error in updateOpenAIKey:', error);
      throw new Error(`Failed to update OpenAI key: ${error.message}`);
    }
  }

  /**
   * Test AI service connection
   */
  async testAIConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:5000';

      // Test health endpoint
      const healthResult = await axios.get(`${aiServiceUrl}/health`);

      if (healthResult.data.openai_configured) {
        // Test actual AI functionality
        const testResult = await axios.get(`${aiServiceUrl}/api/test-ai`);

        return {
          success: testResult.data.success,
          message: testResult.data.message,
          details: testResult.data,
        };
      } else {
        return {
          success: false,
          message: 'OpenAI is not configured in AI service',
          details: healthResult.data,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `AI service connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Get masked OpenAI API key (for display)
   */
  async getOpenAIKeyMasked(): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({
      where: { key: 'openai_api_key' }
    });

    if (!setting) return null;

    const decrypted = decrypt(setting.value);
    if (!decrypted || decrypted.length < 8) return '****';

    return `${decrypted.substring(0, 7)}...${decrypted.substring(decrypted.length - 4)}`;
  }
}

export default new SettingsService();
