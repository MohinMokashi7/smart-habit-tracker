import { ReactNode, useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}

/** Subtle fade + rise used when cards first appear. */
export function FadeIn({ children, delay = 0, style }: FadeInProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 380, delay, useNativeDriver: true }).start();
  }, [progress, delay]);

  return (
    <Animated.View
      style={[
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
