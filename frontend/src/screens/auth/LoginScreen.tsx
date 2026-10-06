import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { getBaseUrl } from '../../api/config';
import { AppText } from '../../components/AppText';
import { BrandMark } from '../../components/BrandMark';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { ServerUrlModal } from '../../components/ServerUrlModal';
import { InlineBanner } from '../../components/StateViews';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';
import { toApiError } from '../../utils/errors';
import { isValidEmail } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn, sessionNotice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverModal, setServerModal] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email)) next.email = 'Invalid email format';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await signIn(email, password);
      // On success the root navigator swaps to the app automatically.
    } catch (e) {
      const err = toApiError(e);
      setErrors({ email: err.fieldErrors?.email, password: err.fieldErrors?.password });
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.logo}>
        <BrandMark size={64} showWordmark={false} />
        <AppText variant="h1" style={styles.title}>
          Welcome back
        </AppText>
        <AppText variant="body" color={colors.textMuted}>
          Sign in to continue your streak.
        </AppText>
      </View>

      {sessionNotice && <InlineBanner tone="info" message={sessionNotice} onDismiss={clearNotice} />}
      {formError && <InlineBanner message={formError} />}

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
        returnKeyType="next"
      />
      <InputField
        label="Password"
        icon="lock-closed-outline"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="Your password"
        autoCapitalize="none"
        textContentType="password"
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <PrimaryButton label="Login" icon="arrow-forward" onPress={submit} loading={loading} style={styles.button} />

      <Pressable onPress={() => navigation.navigate('Register')} style={styles.link} accessibilityRole="button">
        <AppText color={colors.textMuted}>
          New here? <AppText variant="bodyStrong" color={colors.primary}>Create an account</AppText>
        </AppText>
      </Pressable>

      <Pressable onPress={() => setServerModal(true)} style={styles.server} accessibilityRole="button">
        <AppText variant="tiny" color={colors.textFaint} numberOfLines={1}>
          Server: {getBaseUrl()} · change
        </AppText>
      </Pressable>

      <ServerUrlModal visible={serverModal} onClose={() => setServerModal(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  logo: { alignItems: 'center', marginBottom: spacing.xl },
  title: { marginTop: spacing.lg, marginBottom: 4 },
  button: { marginTop: spacing.sm },
  link: { alignItems: 'center', paddingVertical: spacing.lg },
  server: { alignItems: 'center', paddingVertical: spacing.sm },
});
