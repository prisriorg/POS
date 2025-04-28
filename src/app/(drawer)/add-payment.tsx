import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Spacer15, Spacer20 } from "@/src/utils/Spacing";
import { Button } from "react-native-paper";

const AddPayment = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "Add Payment",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#fff",
          },

          headerTitleStyle: {
            color: Colors.colors.text,
          },
          headerLeft(props) {
            return (
              <Pressable
                onPress={() => {
                  router.replace("/(drawer)/purchases");
                }}
                style={{
                  padding: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.colors.primary,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="arrow-back-outline" size={24} color="white" />
                </View>
              </Pressable>
            );
          },
        }}
      />

      <ScrollView>
        <View style={{ margin: 20 }}>
          <Text style={styles.text}>Amount Due</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount due"
            keyboardType="numeric"
          />
          <Text style={styles.text}>Payment Method</Text>
          <TextInput style={styles.input} placeholder="Enter payment method" />
          <Text style={styles.text}>Change</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter change"
            keyboardType="numeric"
          />
          <Text style={styles.text}>Payment Receiver</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter payment receiver"
          />
          <Text style={styles.text}>Account</Text>
          <TextInput style={styles.input} placeholder="Enter account" />

          <Text style={styles.text}>Note</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Enter note"
            multiline={true}
            numberOfLines={4}
          />
          <Spacer20 />
          <Spacer20 />
          <Button
            mode="contained"
            onPress={() => {
              router.replace("/(drawer)/products-inventory");
            }}
            style={{
              backgroundColor: Colors.colors.primary,
            }}
          >
            Add Payment
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddPayment;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
    color: Colors.colors.text,
  },
});
