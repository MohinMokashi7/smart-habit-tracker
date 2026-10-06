import { NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Habits: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  HabitForm: { habitId?: number } | undefined;
  HabitDetail: { habitId: number };
};

/** Navigation to the signed-in stack (works from tab screens too — actions bubble up). */
export const useAppNavigation = () => useNavigation<NativeStackNavigationProp<AppStackParamList>>();
