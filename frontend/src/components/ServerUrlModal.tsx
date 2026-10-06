import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { DEFAULT_BASE_URL, getBaseUrl, normalizeBaseUrl, setBaseUrl } from '../api/config';
import { clearApiUrl, saveApiUrl } from '../storage/secureStorage';
import { colors, radius, shadows, spacing } from '../theme';
import { AppText } from './AppText';
import { InputField } from './InputField';
import { PrimaryButton } from './PrimaryButton';

interface ServerUrlModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Lets you point an installed APK at your API Gateway without rebuilding. */
export function ServerUrlModal({ visible, onClose }: ServerUrlModalProps) {
  const [value, setValue] = useState(getBaseUrl());

  useEffect(() => {
    if (visible) setValue(getBaseUrl());
  }, [visible]);

  const save = async () => {
    const url = normalizeBaseUrl(value);
    setBaseUrl(url);
    await saveApiUrl(url);
    onClose();
  };

  const reset = async () => {
    setBaseUrl(DEFAULT_BASE_URL);
    await clearApiUrl();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <AppText variant="h3">Server address</AppText>
          <AppText variant="caption" color={colors.textMuted} style={styles.help}>
            The API Gateway URL (port 8080). Emulator: http://10.0.2.2:8080. Real phone: http://YOUR-PC-IP:8080
          </AppText>
          <InputField
            label="API Gateway URL"
            value={value}
            onChangeText={setValue}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            icon="server-outline"
            placeholder="http://192.168.1.10:8080"
          />
          <View style={styles.actions}>
            <PrimaryButton label="Reset" variant="secondary" onPress={reset} style={styles.half} />
            <PrimaryButton label="Save" onPress={save} style={styles.half} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xl },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    ...shadows.card,
  },
  help: { marginTop: spacing.sm, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});
