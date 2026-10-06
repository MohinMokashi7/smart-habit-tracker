import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { HabitDetailScreen } from '../screens/habits/HabitDetailScreen';
import { HabitFormScreen } from '../screens/habits/HabitFormScreen';
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors, navigationTheme } from '../theme';
import { TabBar } from './TabBar';
import { AppStackParamList, AuthStackParamList, MainTabParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="History" component={HistoryScreen} />
      <Tabs.Screen name="Habits" component={HabitsScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }}
    >
      <AppStack.Screen name="Tabs" component={MainTabs} />
      <AppStack.Screen
        name="HabitForm"
        component={HabitFormScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <AppStack.Screen name="HabitDetail" component={HabitDetailScreen} />
    </AppStack.Navigator>
  );
}

/**
 * Splash -> (signed in ? app : auth). Because the navigator is chosen from auth state,
 * logging out (or an expired JWT) swaps in the auth flow and drops all protected screens.
 */
export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') return <SplashScreen />;

  return (
    <NavigationContainer theme={navigationTheme}>
      {status === 'signedIn' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
