import {Platform, PermissionsAndroid} from 'react-native';
import SmsRetriever from 'react-native-sms-retriever';

class SmsService {
  async requestSmsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to your SMS to auto-read OTP',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('SMS permission error:', err);
      return false;
    }
  }

  async startSmsRetriever(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      return await SmsRetriever.startSmsRetriever();
    } catch (error) {
      console.error('Error starting SMS retriever:', error);
      return false;
    }
  }

  async listenForOtp(callback: (otp: string) => void): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await SmsRetriever.requestPhoneNumber();
      const registered = await SmsRetriever.startSmsRetriever();
      
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          if (event && event.message) {
            const otpMatch = event.message.match(/\d{4}/);
            if (otpMatch) {
              callback(otpMatch[0]);
              SmsRetriever.removeSmsListener();
            }
          }
        });
      }
    } catch {
      // SMS auto-read not available (emulator or permissions denied)
      // Fail silently - user can manually enter OTP
    }
  }

  removeSmsListener(): void {
    if (Platform.OS === 'android') {
      try {
        SmsRetriever.removeSmsListener();
      } catch (error) {
        console.error('Error removing SMS listener:', error);
      }
    }
  }
}

export default new SmsService();
