import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';
import {Colors} from '../constants/colors';
import {OTP_CONFIG} from '../constants/config';
import apiService from '../services/apiService';
import smsService from '../services/smsService';
import {ApiError} from '../types/api';

type VerifyOTPScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VerifyOTP'
>;

type VerifyOTPScreenRouteProp = RouteProp<RootStackParamList, 'VerifyOTP'>;

interface Props {
  navigation: VerifyOTPScreenNavigationProp;
  route: VerifyOTPScreenRouteProp;
}

const VerifyOTPScreen: React.FC<Props> = ({navigation, route}) => {
  const {mobile} = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(OTP_CONFIG.RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const verifyOtp = async (otpString: string) => {
    if (otpString.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Verifying OTP:', otpString, 'for mobile:', mobile);
      const response = await apiService.verifyOTP(mobile, otpString);
      console.log('Verify OTP Response:', response);
      setLoading(false);

      if (response.status === 'success') {
        navigation.replace('Success');
      } else {
        setError(response.msg || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setLoading(false);
      const apiError = err as ApiError;
      console.error('Verify OTP Error:', apiError);
      setError(apiError.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const initSmsAutoRead = async () => {
      try {
        await smsService.startSmsRetriever();
        smsService.listenForOtp(autoFilledOtp => {
          if (autoFilledOtp && autoFilledOtp.length === 4) {
            const otpArray = autoFilledOtp.split('');
            setOtp(otpArray);
            setTimeout(() => {
              verifyOtp(otpArray.join(''));
            }, 300);
          }
        });
      } catch (err) {
        console.log('SMS auto-read not available:', err);
      }
    };

    initSmsAutoRead();

    return () => {
      clearInterval(timer);
      smsService.removeSmsListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    
    if (cleaned.length === 0) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      setError('');
      
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (cleaned.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = cleaned;
      setOtp(newOtp);
      setError('');

      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      } else {
        const fullOtp = [...newOtp.slice(0, index), cleaned].join('');
        if (fullOtp.length === 4) {
          verifyOtp(fullOtp);
        }
      }
    } else if (cleaned.length > 1) {
      const otpArray = cleaned.slice(0, 4).split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      setError('');

      const lastIndex = Math.min(index + otpArray.length, 3);
      if (lastIndex === 3 && newOtp.every(d => d !== '')) {
        verifyOtp(newOtp.join(''));
      } else {
        inputRefs.current[lastIndex]?.focus();
      }
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || resendLoading) {
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      const response = await apiService.resendOTP(mobile);
      setResendLoading(false);

      if (response.status === 'success' && response.data && response.data[0]?.otpSent) {
        setResendTimer(OTP_CONFIG.RESEND_TIMEOUT);
        setCanResend(false);
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();

        const timer = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.msg || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setResendLoading(false);
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleChangeNumber = () => {
    navigation.goBack();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to{'\n'}
              <Text style={styles.mobileText}>+91 {mobile}</Text>
            </Text>
            <TouchableOpacity onPress={handleChangeNumber}>
              <Text style={styles.changeNumberText}>Change Number</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.otpSection}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null,
                    error ? styles.otpInputError : null,
                  ]}
                  value={digit}
                  onChangeText={value => handleOtpChange(value, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!loading}
                  selectTextOnFocus
                />
              ))}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.resendSection}>
            {canResend ? (
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={resendLoading}>
                {resendLoading ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <Text style={styles.resendText}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend OTP in {formatTime(resendTimer)}
              </Text>
            )}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Verifying OTP...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  mobileText: {
    fontWeight: '600',
    color: Colors.text,
  },
  changeNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  otpSection: {
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.inputBackground,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.text,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  otpInputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  timerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});

export default VerifyOTPScreen;
