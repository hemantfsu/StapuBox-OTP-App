export interface SendOTPRequest {
  mobile: string;
}

export interface SendOTPResponse {
  status: string;
  msg: string;
  err: any;
  data?: Array<{
    message: string;
    expirySeconds: number | null;
    sessionId: number;
    mobile: string;
    otpSent: boolean;
    expiryTime: string;
    retryCount: number;
    new_profile: any;
  }>;
}

export interface VerifyOTPResponse {
  status: string;
  msg: string;
  err: any;
  data?: any;
  token?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
