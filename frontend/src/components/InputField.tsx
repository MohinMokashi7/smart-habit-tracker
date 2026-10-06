import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import { AppText } from './AppText';
import { IconName } from '../utils/habitVisuals';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: IconName;
  /** Adds a show/hide toggle. */
  secure?: boolean;
  hint?: string;
}

export function InputField({ label, error, icon, secure, hint, multiline, style, ...rest }: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color={colors.textMuted} style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.field, multiline && styles.fieldMultiline, { borderColor }]}>
        {icon && <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textFaint} style={styles.icon} />}
        <TextInput
          {...rest}
          multiline={multiline}
          secureTextEntry={secure ? hidden : rest.secureTextEntry}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.helper}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.textFaint} style={styles.helper}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 54,
  },
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: spacing.md },
  icon: { marginRight: spacing.md },
  input: { flex: 1, color: colors.text, ...typography.body, paddingVertical: 12 },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top', paddingVertical: 0 },
  helper: { marginTop: 6 },
});
