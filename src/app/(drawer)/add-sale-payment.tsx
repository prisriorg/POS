import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import React, { useCallback } from "react";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Spacer15, Spacer20 } from "@/src/utils/Spacing";
import { Button } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { expenseAcc, paymentMethods } from "@/src/utils/GetData";
import { BASE_URL } from "@/src/utils/config";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { useAppSelector } from "@/src/store/reduxHook";

const AddPayment = () => {
  const router = useRouter();

  const prams = useLocalSearchParams();
  const visualFeedback = useVisualFeedback();
  const { user, domain } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = React.useState({
    sale_id: prams?.id,
    amount: prams?.due,
    paying_amount: prams?.due,
    paid_by_id: '',
    account_id: "",
    payment_note: "",
  });

  const updateFormData = (key, value) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  }

  useFocusEffect(
    useCallback(() => {
      console.log("prams", prams);
      updateFormData("sale_id", prams?.id);
      updateFormData("amount", prams?.due);
      updateFormData("paying_amount", prams?.due);
      return () => {
        // Any cleanup code here
      };
    }, [prams?.id, prams?.due])
  );

  const handleSubmit = async () => {
    try {
      visualFeedback.showLoadingBackdrop();

      const apiUrl = `${BASE_URL}add-payment/sale?user_id=${user.id}&tenant_id=${domain}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        alert("Payment added successfully");
        visualFeedback.hideLoadingBackdrop();
        router.replace("/(drawer)/purchases");
      } else {
        alert(JSON.stringify(data.error));
        visualFeedback.hideLoadingBackdrop();
      }
    } catch (error) {
      console.log(error);
      alert("An error occurred while adding the expense. Please try again.");
      visualFeedback.hideLoadingBackdrop();
    } finally {
      visualFeedback.hideLoadingBackdrop();
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
          <Text style={styles.text}>
            Received Amount{" "}
            <Text
              style={{
                color: "red",
              }}
            >
              *
            </Text>
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData?.amount}
            onChangeText={(text) => {
              setFormData({ ...formData, amount: text });
            }}
          />

          <Text style={styles.text}>
            Paying Amount{" "}
            <Text
              style={{
                color: "red",
              }}
            >
              *
            </Text>
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData?.paying_amount}
            onChangeText={(text) => {
              setFormData({ ...formData, paying_amount: text });
            }}
          />
          <Text style={styles.text}>Payment Method</Text>
          <Dropdown
            style={styles.input}
            placeholder="Select payment method"
            data={paymentMethods}
            labelField="label"
            valueField="value"
            placeholderStyle={{ color: "#B9B9B9" }}
            selectedTextStyle={{ color: "#000" }}
            maxHeight={300}
            value={""}
            onChange={(item) => {
              setFormData({ ...formData, paid_by_id: item.id });
            }}
          />

          <Text style={styles.text}>Change</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter change"
            keyboardType="numeric"
            editable={false}
            value={(
              Number(formData.paying_amount) - Number(formData.amount)
            ).toString()}
          />

          <Text style={styles.text}>Account</Text>
          <Dropdown
            style={styles.input}
            placeholder="Select account"
            data={expenseAcc}
            labelField="label"
            valueField="value"
            placeholderStyle={{ color: "#B9B9B9" }}
            selectedTextStyle={{ color: "#000" }}
            maxHeight={300}
            value={""}
            onChange={(item) => {
              setFormData({ ...formData, account_id: item.id });
            }}
          />

          <Text style={styles.text}>Note</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Enter note"
            multiline={true}
            numberOfLines={4}
            onChangeText={(text) => {
              setFormData({ ...formData, payment_note: text });
            }}
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
