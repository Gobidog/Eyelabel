import api from './api';

export interface ExtractSpecsRequest {
  text: string;
  product_type?: string;
}

export interface ExtractSpecsResponse {
  specifications: Record<string, any>;
  confidence: number;
}

export interface SuggestTemplateRequest {
  product_type: string;
  product_name?: string;
  description?: string;
}

export interface SuggestTemplateResponse {
  template_type: string;
  confidence: number;
  reason: string;
}

export interface GenerateDesignRequest {
  product_name: string;
  product_code: string;
  template_type: string;
  specifications: Record<string, any>;
  canvas_width?: number;
  canvas_height?: number;
  num_variations?: number;
}

export interface DesignVariation {
  id: number;
  layout_type: string;
  description: string;
  elements: Array<{
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontSize?: number;
    text?: string;
    [key: string]: any;
  }>;
  confidence: number;
}

export interface GenerateDesignResponse {
  variations: DesignVariation[];
  status: string;
}

export class AIService {
  /**
   * Extract specifications from product description text
   */
  static async extractSpecifications(
    request: ExtractSpecsRequest
  ): Promise<ExtractSpecsResponse> {
    const response = await api.post('/ai/extract-specs', request);
    return response.data;
  }

  /**
   * Suggest appropriate template for product
   */
  static async suggestTemplate(
    request: SuggestTemplateRequest
  ): Promise<SuggestTemplateResponse> {
    const response = await api.post('/ai/suggest-template', request);
    return response.data;
  }

  /**
   * Generate label design variations
   */
  static async generateDesign(
    request: GenerateDesignRequest
  ): Promise<GenerateDesignResponse> {
    const response = await api.post('/ai/generate-design', request);
    return response.data;
  }

  /**
   * Check AI service health
   */
  static async checkHealth(): Promise<{
    status: string;
    service: string;
    version: string;
    openai_configured: boolean;
  }> {
    const response = await api.get('/ai/health');
    return response.data;
  }
}
