import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function ScreensLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#8e8e8e',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#dbdbdb',
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Explore"
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Reels"
        options={{
          tabBarLabel: 'Reels',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="EditProfile"
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="SearchFriends"
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="FriendRequests"
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="BlockedUsers"
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="AllFriends"
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
