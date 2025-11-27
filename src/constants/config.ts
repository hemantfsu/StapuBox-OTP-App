export const API_CONFIG = {
  BASE_URL: 'https://stapubox.com/trial',
  API_TOKEN: 'trial_78420690_b8ce2bedf22751a6ad460227a895cc4d',
  ENDPOINTS: {
    SEND_OTP: '/sendOtp',
    RESEND_OTP: '/resendOtp',
    VERIFY_OTP: '/verifyOtp',
  },
};

export const OTP_CONFIG = {
  LENGTH: 4,
  RESEND_TIMEOUT: 60, // seconds
};
