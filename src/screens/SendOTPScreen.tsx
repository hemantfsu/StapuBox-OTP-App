import React, {useState} from 'react';
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
import {RootStackParamList} from '../types/navigation';
import {Colors} from '../constants/colors';
import apiService from '../services/apiService';
import {ApiError} from '../types/api';

type SendOTPScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SendOTP'
>;

interface Props {
  navigation: SendOTPScreenNavigationProp;
}

const SendOTPScreen: React.FC<Props> = ({navigation}) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateMobile = (number: string): boolean => {
    // Indian mobile number validation (10 digits, starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const handleMobileChange = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    // Allow up to 10 digits
    setMobile(cleaned.slice(0, 10));
    setError('');
  };

  const handleSendOTP = async () => {
    if (!validateMobile(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Sending OTP to:', mobile);
      const response = await apiService.sendOTP(mobile);
      console.log('Send OTP Response:', response);
      setLoading(false);
      
      if (response.status === 'success' && response.data && response.data[0]?.otpSent) {
        // Navigate to Verify OTP screen
        navigation.navigate('VerifyOTP', {mobile});
      } else {
        setError(response.msg || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      const apiError = err as ApiError;
      console.error('Send OTP Error:', apiError);
      setError(apiError.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to StapuBox</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number to get started
            </Text>
          </View>

          {/* Mobile Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Mobile Number</Text>
            <View
              style={[
                styles.inputContainer,
                error ? styles.inputContainerError : null,
              ]}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor={Colors.placeholder}
                value={mobile}
                onChangeText={handleMobileChange}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
                autoFocus
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (!validateMobile(mobile) || loading) && styles.buttonDisabled,
            ]}
            onPress={handleSendOTP}
            disabled={!validateMobile(mobile) || loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </View>
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
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 40,
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
  },
  inputSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 0,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginTop: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SendOTPScreen;
