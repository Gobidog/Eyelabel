import { Request, Response } from 'express';
import settingsService from '../services/settings.service';

export class SettingsController {
  /**
   * Get all settings (admin only, sensitive values masked)
   */
  async getAllSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await settingsService.getAllSettings();

      // Map settings to safe format (don't expose encrypted values)
      const safeSettings = settings.map((setting) => ({
        key: setting.key,
        description: setting.description,
        isEncrypted: setting.isEncrypted,
        hasValue: !!setting.value,
        updatedAt: setting.updatedAt,
      }));

      res.json(safeSettings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get OpenAI API key status (masked)
   */
  async getOpenAIKeyStatus(_req: Request, res: Response): Promise<void> {
    try {
      const maskedKey = await settingsService.getOpenAIKeyMasked();

      res.json({
        configured: !!maskedKey,
        maskedKey: maskedKey || null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update OpenAI API key
   */
  async updateOpenAIKey(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey } = req.body;

      // Log received key (masked)
      const keyPreview = apiKey && apiKey.length > 11
        ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`
        : 'invalid/empty';
      console.log(`🔑 [Controller] Received API key: ${keyPreview} (length: ${apiKey?.length || 0})`);

      if (!apiKey || typeof apiKey !== 'string') {
        console.log('🔑 [Controller] Rejected: API key is missing or not a string');
        res.status(400).json({ error: 'API key is required' });
        return;
      }

      // Basic validation
      if (!apiKey.startsWith('sk-')) {
        console.log('🔑 [Controller] Rejected: API key does not start with sk-');
        res.status(400).json({
          error: 'Invalid OpenAI API key format (should start with sk-)',
        });
        return;
      }

      console.log('🔑 [Controller] Validation passed, calling settingsService.updateOpenAIKey');
      const result = await settingsService.updateOpenAIKey(apiKey);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message,
        });
      }
    } catch (error: any) {
      console.error('Error updating OpenAI key:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Test AI service connection
   */
  async testAIConnection(_req: Request, res: Response): Promise<void> {
    try {
      const result = await settingsService.testAIConnection();

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete setting (admin only)
   */
  async deleteSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;

      const deleted = await settingsService.deleteSetting(key);

      if (deleted) {
        res.json({ success: true, message: `Setting '${key}' deleted` });
      } else {
        res.status(404).json({ error: `Setting '${key}' not found` });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SettingsController();
