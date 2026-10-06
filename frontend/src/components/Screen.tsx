import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  /** Soft green glow behind the top of the screen. */
  glow?: boolean;
  /** Pinned below the scroll area (e.g. a submit button). */
  footer?: ReactNode;
}

export function Screen({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  edges = ['top'],
  contentStyle,
  glow = true,
  footer,
}: ScreenProps) {
  return (
    <View style={styles.root}>
      {glow && (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(74,222,90,0.16)', 'rgba(74,222,90,0)']}
          style={styles.glow}
        />
      )}
      <SafeAreaView style={styles.flex} edges={edges}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {scroll ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={[styles.content, contentStyle]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                onRefresh ? (
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                    progressBackgroundColor={colors.card}
                  />
                ) : undefined
              }
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
          )}
          {footer}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
  content: { paddingHorizontal: spacing.screen, paddingTop: spacing.md, paddingBottom: spacing.xl, flexGrow: 1 },
});
