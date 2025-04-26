import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Spacer15, Spacer20 } from "@/src/utils/Spacing";
import { Button } from "react-native-paper";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { useAppSelector } from "@/src/store/reduxHook";

const SalesAddPayment = () => {
  const router = useRouter();
  const visualFeedback = useVisualFeedback();
  const prm = useLocalSearchParams();
  const { id } = prm;

  const { user, domain } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = React.useState({
    sale_id: id,
    paying_amount: "",
    amount: "",
    paid_by_id: "",
    account_id: "",
    note: "",
  });

  const handleSubmit = async () => {
    // Handle form submission logic here
    try {
      visualFeedback.showLoadingBackdrop();
      // Simulate a network request or any other async operation
      const response = await fetch(
        `${domain}add-payment/sale?user_id=${user?.id}$&tenant_id=${domain}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, sale_id: id }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 200) {
            visualFeedback.hideLoadingBackdrop();
            router.replace("/(drawer)/sales");
          } else {
            visualFeedback.hideLoadingBackdrop();
            alert("Error adding payment. Please try again.");
          }
        });
    } catch (error) {
      console.error("Error showing loading backdrop:", error);
    }
  };

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
                  router.replace("/(drawer)/sales");
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
            onChangeText={(e) => setFormData({ ...formData, amount: e })}
          />
          <Text style={styles.text}>Payment Method</Text>
          <TextInput style={styles.input} placeholder="Enter payment method" />
          <Text style={styles.text}>Change</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter change"
            keyboardType="numeric"
            onChangeText={(e) => setFormData({ ...formData, paying_amount: e })}
          />
          <Text style={styles.text}>Payment Receiver</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter payment receiver"
            onChangeText={(e) => setFormData({ ...formData, paid_by_id: e })}
          />
          <Text style={styles.text}>Account</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter account"
            onChangeText={(e) => setFormData({ ...formData, account_id: e })}
          />

          <Text style={styles.text}>Note</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Enter note"
            multiline={true}
            numberOfLines={4}
            onChangeText={(e) => setFormData({ ...formData, note: e })}
          />
          <Spacer20 />
          <Spacer20 />
          <Button
            mode="contained"
            onPress={handleSubmit}
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

export default SalesAddPayment;

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
