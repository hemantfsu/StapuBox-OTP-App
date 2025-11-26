import axios, {AxiosInstance, AxiosError} from 'axios';
import {API_CONFIG} from '../constants/config';
import {
  SendOTPResponse,
  VerifyOTPResponse,
  ApiError,
} from '../types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': API_CONFIG.API_TOKEN,
      },
      timeout: 15000,
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      let message = (error.response.data as any)?.message || 'Something went wrong. Please try again.';
      
      if (status === 401) {
        message = 'Invalid API token. Please update the token in config.ts';
      } else if (status === 403) {
        message = 'Access forbidden. Check your API token.';
      }
      
      return {
        message,
        status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Network error. Please check your internet connection.',
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }

  async sendOTP(mobile: string): Promise<SendOTPResponse> {
    try {
      const response = await this.api.post<SendOTPResponse>(
        API_CONFIG.ENDPOINTS.SEND_OTP,
        {mobile},
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  async resendOTP(mobile: string): Promise<SendOTPResponse> {
    try {
      const response = await this.api.post<SendOTPResponse>(
        `${API_CONFIG.ENDPOINTS.RESEND_OTP}?mobile=${mobile}`,
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  async verifyOTP(mobile: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      const response = await this.api.post<VerifyOTPResponse>(
        `${API_CONFIG.ENDPOINTS.VERIFY_OTP}?mobile=${mobile}&otp=${otp}`,
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }
}

export default new ApiService();
