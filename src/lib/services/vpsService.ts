import axios from 'axios';

interface ExecutionRequest {
  code: string;
  language: 'python' | 'javascript' | 'bash';
  timeout?: number;
}

interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

class VPSService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.VPS_API_URL || '';
    this.apiKey = process.env.VPS_API_KEY || '';
  }

  get isConfigured() {
    return !!this.apiUrl && !!this.apiKey;
  }

  async executeCode(request: ExecutionRequest): Promise<ExecutionResult> {
    if (!this.isConfigured) {
      throw new Error("VPS is not configured. Please set VPS_API_URL and VPS_API_KEY.");
    }

    try {
      const response = await axios.post(`${this.apiUrl}/execute`, request, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: request.timeout || 30000
      });

      return response.data as ExecutionResult;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const serverError =
          (error.response?.data as { error?: string } | undefined)?.error ?? error.message;
        throw new Error(serverError || 'Failed to execute code on VPS');
      }
      throw new Error('Failed to execute code on VPS');
    }
  }

  async checkHealth(): Promise<boolean> {
    if (!this.isConfigured) return false;
    try {
      await axios.get(`${this.apiUrl}/health`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        timeout: 5000
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const vpsService = new VPSService();
