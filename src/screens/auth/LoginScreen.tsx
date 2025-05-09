import React, { useState } from "react";
import { View, StyleSheet, Alert, Text, Image, TextInput } from "react-native";
import { Spacer10, Spacer20, Spacer25, Spacer40 } from "../../utils/Spacing";
import { Formik } from "formik";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useVisualFeedback from "../../hooks/VisualFeedback/useVisualFeedback";
import { useAppDispatch } from "../../store/reduxHook";
import { setDomain, setUser } from "../../store/reducers/authReducer";
import { BASE_URL } from "../../utils/config";
import { Button } from "react-native-paper";
import { signInFormValidation } from "@/src/utils/ValidationSchema";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const login = async (values: IValues) => {
    console.log(values);
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
              <Spacer40 />
              <Spacer10 />
              <Image
                source={require("../../../assets/images/splogo.png")}
                style={styles.image}
                resizeMode="contain"
              />
              <Spacer20 />
              <Text style={styles.lebal}>Username</Text>

              <TextInput
                placeholder="Username"
                style={styles.input}
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
              />
              <Text style={{ color: "red" }}>
                {errors.email && errors.email}
              </Text>

              <Spacer20 />
              <Text style={{ marginBottom: 5 }}>Password</Text>
              <View style={styles.dataContainer}>
                <TextInput
                  // Set secureTextEntry prop to hide
                  //password when showPassword is false
                  secureTextEntry={!showPassword}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  style={styles.input}
                  placeholder="Enter Password"
                  placeholderTextColor="#aaa"
                />
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#aaa"
                  style={{
                    marginLeft: 7,
                  }}
                  onPress={toggleShowPassword}
                />
              </View>
              <Text style={{ color: "red" }}>
                {errors.password && errors.password}
              </Text>
              <Spacer20 />

              <Text style={{ marginBottom: 5 }}>Domain</Text>
              <TextInput
                placeholder="Enter subdomain only (e.g., 'mail')"
                value={values.domain}
                style={styles.input}
                onChangeText={handleChange("domain")}
                onBlur={handleBlur("domain")}
              />
              <Text style={{ color: "red" }}>
                {errors.domain && errors.domain}
              </Text>

              <Spacer40 />
              <View
                // title="Login"
                // onPress={() => handleSubmit()}
                // color="#090A78"
                style={styles.button}
              >
                <Text
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    fontSize: 16,
                    paddingVertical: 10,
                  }}
                  onPress={() => handleSubmit()}
                >
                  Login
                </Text>
              </View>
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
    height: "100%",
    backgroundColor: "#fff",
  },
  lebal: {
    fontSize: 16,
    marginBottom: 5,
    color: "#000",
  },
  dataContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBFBFB",
    paddingRight: 10,
    borderRadius: 8,
    paddingHorizontal: 0,
  },
  image: { width: 200, height: 150, alignSelf: "center" },
  scroll: { flex: 1, backgroundColor: "#fff", height: "100%", width: "100%" },
  button: {
    backgroundColor: "#090A78",
    borderRadius: 100,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    height: 40,
    backgroundColor: "#FBFBFB",
    color: "#000",
  },
});
export default LoginScreen;
