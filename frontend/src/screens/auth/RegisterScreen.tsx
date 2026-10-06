import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { Header } from '../../components/Header';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { InlineBanner } from '../../components/StateViews';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';
import { toApiError } from '../../utils/errors';
import { isValidEmail, PASSWORD_MIN_LENGTH } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

type FieldErrors = { fullName?: string; email?: string; password?: string; confirm?: string };

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next: FieldErrors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email)) next.email = 'Invalid email format';
    if (!password) next.password = 'Password is required';
    else if (password.length < PASSWORD_MIN_LENGTH) next.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await signUp(fullName, email, password);
      // Registered and signed in — the root navigator swaps to the app automatically.
    } catch (e) {
      const err = toApiError(e);
      setErrors({
        fullName: err.fieldErrors?.fullName,
        email: err.kind === 'conflict' ? err.message : err.fieldErrors?.email,
        password: err.fieldErrors?.password,
      });
      setFormError(err.kind === 'conflict' ? null : err.message);
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Create account" onBack={() => navigation.goBack()} />

      <View style={styles.intro}>
        <AppText variant="h1">Let's get started</AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.sub}>
          Create your account and start building better habits.
        </AppText>
      </View>

      {formError && <InlineBanner message={formError} />}

      <InputField
        label="Full name"
        icon="person-outline"
        value={fullName}
        onChangeText={setFullName}
        error={errors.fullName}
        placeholder="Your name"
        autoCapitalize="words"
        textContentType="name"
        autoComplete="name"
      />
      <InputField
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />
      <InputField
        label="Password"
        icon="lock-closed-outline"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters`}
        placeholder="Create a password"
        autoCapitalize="none"
        textContentType="newPassword"
      />
      <InputField
        label="Confirm password"
        icon="lock-closed-outline"
        secure
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
        placeholder="Repeat your password"
        autoCapitalize="none"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <PrimaryButton label="Create account" icon="arrow-forward" onPress={submit} loading={loading} style={styles.button} />

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.link} accessibilityRole="button">
        <AppText color={colors.textMuted}>
          Already have an account? <AppText variant="bodyStrong" color={colors.primary}>Login</AppText>
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: spacing.xl },
  sub: { marginTop: 4 },
  button: { marginTop: spacing.sm },
  link: { alignItems: 'center', paddingVertical: spacing.lg },
});
