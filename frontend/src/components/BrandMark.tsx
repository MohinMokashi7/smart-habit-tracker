import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, shadows } from '../theme';
import { AppText } from './AppText';

/** The SHT logo: leaf-in-a-tile plus wordmark. */
export function BrandMark({ size = 72, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.3 }, shadows.glow]}>
        <Ionicons name="leaf" size={size * 0.52} color={colors.onPrimary} />
      </View>
      {showWordmark && (
        <>
          <AppText variant="display" style={styles.word}>
            SHT
          </AppText>
          <AppText variant="label" color={colors.primary} style={styles.sub}>
            SMART HABIT TRACKER
          </AppText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  tile: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  word: { marginTop: 16, letterSpacing: 2 },
  sub: { letterSpacing: 3, marginTop: 2 },
});
