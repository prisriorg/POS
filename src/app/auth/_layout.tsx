import { Stack } from "expo-router";
import { View, StyleSheet, StatusBar } from "react-native";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import React from "react";
export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <Stack
        screenOptions={{
          headerShown: false,
        
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Login",
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
