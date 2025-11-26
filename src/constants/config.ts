export const API_CONFIG = {
  BASE_URL: 'https://stapubox.com/trial',
  // Temporary API token for testing
  API_TOKEN: 'trial_c4611a455fa9b64f336c284d462b16a5',
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
