export interface SendOTPRequest {
  mobile: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: any;
  token?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
