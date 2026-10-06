import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { BrandMark } from '../../components/BrandMark';
import { FadeIn } from '../../components/FadeIn';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { AuthStackParamList } from '../../navigation/types';
import { colors, radius, spacing } from '../../theme';
import { IconName } from '../../utils/habitVisuals';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const FEATURES: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: 'checkmark-done-circle', title: 'Check off your day', text: 'See exactly what is scheduled today and tick it off.' },
  { icon: 'flame', title: 'Build streaks', text: 'Stay consistent and watch your streaks grow.' },
  { icon: 'stats-chart', title: 'See your progress', text: 'Weekly overview and per-habit history.' },
];

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
      <FadeIn style={styles.hero}>
        <BrandMark size={84} />
        <AppText variant="h2" style={styles.tagline}>
          Small habits build a better you.
        </AppText>
      </FadeIn>

      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <FadeIn key={f.title} delay={150 + i * 90}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <AppText variant="bodyStrong">{f.title}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {f.text}
                </AppText>
              </View>
            </View>
          </FadeIn>
        ))}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Get Started" icon="arrow-forward" onPress={() => navigation.navigate('Register')} />
        <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginLink} accessibilityRole="button">
          <AppText variant="body" color={colors.textMuted}>
            Already have an account? <AppText variant="bodyStrong" color={colors.primary}>Login</AppText>
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between' },
  hero: { alignItems: 'center', marginTop: spacing.xxl },
  tagline: { marginTop: spacing.xl, textAlign: 'center' },
  features: { marginVertical: spacing.xl },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: { flex: 1 },
  actions: { paddingBottom: spacing.sm },
  loginLink: { alignItems: 'center', paddingVertical: spacing.lg },
});
