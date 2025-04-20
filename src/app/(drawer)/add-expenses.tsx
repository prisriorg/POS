import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Spacer20 } from "@/src/utils/Spacing";
import { Button } from "react-native-paper";
import { BASE_URL } from "@/src/utils/config";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import { Dropdown } from "react-native-element-dropdown";
import { expenseAcc, expenseCat } from "@/src/utils/GetData";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

const AddExpenses = () => {
  const router = useRouter();
  const [date, setDate] = React.useState(new Date());
  const [formData, setFormData] = React.useState({
    warehouse_id: 1,
    expense_category_id: 1,
    amount: 0,
    note: "",
    account_id: 1,
    company: "",
    receipt_no: "",
    currency: "",
    date: new Date().toISOString().split("T")[0], // Default date
    time: `${new Date().getHours()}:${new Date().getMinutes()}`, // Default time
  });

  const visualFeedback = useVisualFeedback();
  const { user, domain } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { warehouses } = useAppSelector((state) => state.home);

  // Handle date change
  const onDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setDate(selectedDate);
      setFormData((prevState) => ({
        ...prevState,
        date: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  // Handle time change
  const onTimeChange = (event: any, selectedTime: any) => {
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      setFormData((prevState) => ({
        ...prevState,
        time: formattedTime,
      }));
    }
  };

  // Show date picker
  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onDateChange,
      mode: "date",
      is24Hour: true,
    });
  };

  // Show time picker
  const showTimepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onTimeChange,
      mode: "time",
      is24Hour: true,
    });
  };

  const formSubmit = async () => {
    try {
      visualFeedback.showLoadingBackdrop();

      const apiUrl = `${BASE_URL}save/expense?user_id=${user.id}&tenant_id=${domain}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("Expense added successfully");
        visualFeedback.hideLoadingBackdrop();
        router.replace("/(drawer)/expenses");
      } else if (data.status === "error") {
        alert(data.message);
        visualFeedback.hideLoadingBackdrop();
      }
    } catch (error) {
      console.log(error);
      alert("An error occurred while adding the expense. Please try again.");
      visualFeedback.hideLoadingBackdrop();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "Add Expenses",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTitleStyle: {
            color: Colors.colors.text,
            fontWeight: "bold",
          },
          headerLeft(props) {
            return (
              <Pressable
                onPress={() => {
                  router.back();
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
          {/* Date Picker */}
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
            Date
          </Text>
          <Pressable onPress={showDatepicker}>
            <TextInput
              style={styles.input}
              placeholder="Select date"
              editable={false}
              value={formData.date}
            />
          </Pressable>

          {/* Time Picker */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
            }}
          >
            Time
          </Text>
          <Pressable onPress={showTimepicker}>
            <TextInput
              style={styles.input}
              placeholder="Select time"
              editable={false}
              value={formData.time}
            />
          </Pressable>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Account
          </Text>
          <Dropdown
            style={styles.input}
            placeholder="Select account"
            data={expenseAcc}
            value={formData.account_id}
            labelField="label"
            valueField="value"
            onChange={(item) => {
              setFormData((prevState) => {
                return { ...prevState, account_id: item.value };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Expense Categories
          </Text>
          <Dropdown
            style={styles.input}
            placeholder="Select expense category"
            data={expenseCat}
            value={formData.expense_category_id}
            labelField="label"
            valueField="value"
            onChange={(item) => {
              setFormData((prevState) => {
                return { ...prevState, expense_category_id: item.value };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Warehouse
          </Text>
          <Dropdown
            style={styles.input}
            placeholder="Select warehouse"
            data={warehouses.map((item: any) => {
              return {
                id: item.id,
                label: item.name,
                value: item.id,
              };
            })}
            value={formData.warehouse_id}
            labelField="label"
            valueField="value"
            onChange={(item) => {
              setFormData((prevState) => {
                return { ...prevState, warehouse_id: item.value };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Company
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter company"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, company: text };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            VAT Number
          </Text>
          <TextInput style={styles.input} placeholder="Enter VAT number" />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            TIN Number
          </Text>
          <TextInput style={styles.input} placeholder="Enter TIN number" />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Receipt Number
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter receipt number"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, receipt_no: text };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Currency
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter currency"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, currency: text };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            VAT Charged
          </Text>
          <TextInput style={styles.input} placeholder="Enter VAT charged" />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,

              color: Colors.colors.text,
            }}
          >
            Amount
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, amount: parseFloat(text) };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Description
          </Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Enter description"
            multiline
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, note: text };
              });
            }}
          />
          <Spacer20 />
          <Spacer20 />
          <Button
            mode="contained"
            onPress={formSubmit}
            style={{
              backgroundColor: "#65558F",
            }}
            labelStyle={{ color: "white", fontWeight: "bold" }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Add Expense
            </Text>
          </Button>
        </View>

        <Spacer20 />
      </ScrollView>
    </View>
  );
};

export default AddExpenses;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
});
