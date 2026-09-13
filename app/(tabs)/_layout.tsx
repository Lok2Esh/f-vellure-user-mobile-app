import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Home, CalendarDays, Compass, Heart, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../../constants/theme';

const inactive = '#8F8186';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: inactive,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: typography.sans,
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surfaceCard,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          elevation: 12,
          shadowColor: colors.wineDark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size - 3} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size - 3} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="vendors"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={size - 3} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }) => <Heart size={size - 3} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <UserRound size={size - 3} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}


