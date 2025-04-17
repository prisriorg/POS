import React from "react";
import { View, StyleSheet, Alert, Text, Image, TextInput } from "react-native";
import { Spacer20, Spacer25, Spacer40 } from "../../utils/Spacing";
import { Formik } from "formik";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useVisualFeedback from "../../hooks/VisualFeedback/useVisualFeedback";
import { useAppDispatch } from "../../store/reduxHook";
import { setDomain, setUser } from "../../store/reducers/authReducer";
import { BASE_URL } from "../../utils/config";
import { Button } from "react-native-paper";
import { signInFormValidation } from "@/src/utils/ValidationSchema";
import { useRouter } from "expo-router";

interface IValues {
  email: string;
  password: string;
  domain: string;
}

const LoginScreen = () => {
  const initialValues = { domain: "", email: "", password: "" };
  const visualFeedback = useVisualFeedback();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const login = async (values: IValues) => {
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(`${BASE_URL}login`, {
        mode: "no-cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: values.email,
          password: values.password,
          tenant_id: values.domain,
        }),
      });
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setUser(result.user));
          dispatch(setDomain(values.domain));
          router.replace("/(drawer)/(tabs)");
          // NavService.reset(EStacks.BOTTOM_STACK);
        } else {
          Alert.alert("Login Failed", result.message, [
            { text: "OK", onPress: () => console.log("ok") },
          ]);
        }
      } else {
        result &&
          Alert.alert("Login Failed", result.message, [
            { text: "OK", onPress: () => console.log("ok") },
          ]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  return (
    <KeyboardAwareScrollView
      extraScrollHeight={100}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      style={styles.scroll}
    >
      <View style={styles.container}>
        <Formik
          initialValues={initialValues}
          validationSchema={signInFormValidation}
          onSubmit={(values, actions) => {
            login(values);
          }}
        >
          {({
            handleBlur,
            handleChange,
            handleSubmit,
            values,
            touched,
            errors,
          }) => (
            <View>
              <Image
                source={require("../../../assets/images/logo.png")}
                style={styles.image}
                resizeMode="contain"
              />
              <Spacer20 />
              <Spacer40 />
              <Text style={{ marginBottom: 5 }}>Username</Text>

              <TextInput
                placeholder="Username"
                style={styles.input}
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
              />

              <Spacer20 />

              <Text style={{ marginBottom: 5 }}>Password</Text>

              <TextInput
                placeholder="Password"
                value={values.password}
                style={styles.input}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry
              />
              <Spacer20 />

              <Text style={{ marginBottom: 5 }}>Domain</Text>
              <TextInput
                placeholder="Enter subdomain only (e.g., 'mail')"
                value={values.domain}
                style={styles.input}
                onChangeText={handleChange("domain")}
                onBlur={handleBlur("domain")}
              />
              <Spacer20 />

              <Spacer40 />
              <Spacer40 />
              <Button
                mode="contained"
                onPress={() => {
                  handleSubmit();
                }}
                style={styles.button}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                
                >
                Login
                
                  
                </Text>
              </Button>
            </View>
          )}
        </Formik>
        <Spacer25 />
        <Spacer40 />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: "8%",
    paddingTop: 100,
    backgroundColor: "#fff",
  },
  image: { width: 200, height: 150, alignSelf: "center" },
  scroll: { flex: 1 },
  button: {
    backgroundColor: "#090A78",
  },
  input: {
    borderRadius: 8,
    padding: 10,
    height: 40,
    backgroundColor: "#FBFBFB",
    color: "#000",
  },
});
export default LoginScreen;
