import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { persistor, store } from "@/src/store/store";
import { PersistGate } from "redux-persist/integration/react";
import VisualFeedbackComponent from "../hooks/VisualFeedback/VisualFeedbackComponent";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";

import { PaperProvider } from "react-native-paper";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { user, domain } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Load any resources or data that we need prior to rendering the app

  useEffect(() => {
    SplashScreen.hideAsync();
    if (user?.name) {
      router.replace("/(drawer)/(tabs)");
    } else {
      router.replace("/auth");
    }
  }, [user, router]);


  return (
    <ThemeProvider value={DefaultTheme}>
      <PaperProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
          initialRouteName="auth"
        >
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </PaperProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <VisualFeedbackComponent>
          <AppContent />
        </VisualFeedbackComponent>
      </PersistGate>
    </Provider>
  );
}
