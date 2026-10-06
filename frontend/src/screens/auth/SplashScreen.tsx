import { StyleSheet, View } from 'react-native';

import { BrandMark } from '../../components/BrandMark';
import { LoadingIndicator } from '../../components/StateViews';
import { colors } from '../../theme';

/** Shown while the stored session is being checked. */
export function SplashScreen() {
  return (
    <View style={styles.root}>
      <BrandMark />
      <View style={styles.spinner}>
        <LoadingIndicator fill={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  spinner: { marginTop: 32 },
});
