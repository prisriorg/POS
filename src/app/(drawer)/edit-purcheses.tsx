import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import { Button, Divider } from "react-native-paper";
import { BASE_URL } from "@/src/utils/config";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import { Dropdown } from "react-native-element-dropdown";
import {
  expenseAcc,
  expenseCat,
  purchaseStatus,
  suppliers,
} from "@/src/utils/GetData";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

const EditPurcheses = () => {
  const router = useRouter();
  const [date, setDate] = React.useState(new Date());
  const [formData, setFormData] = React.useState({
    warehouse_id: 1,
    expense_category_id: 1,
    supplier_id: 1,
    purchase_status: 1,
    full_name: "",
    curency_id: 1,
    exchange_rate: "1",
    amount: "1",
    discount: "0",
    shipping_cost: "0",
    note: "",
    product: [],
    date: new Date().toISOString().split("T")[0], // Default date
    time: `${new Date().getHours()}:${new Date().getMinutes()}`, // Default time
  });

  const prm = useLocalSearchParams();

  const [products, useProducts] = useState([]);

  const visualFeedback = useVisualFeedback();
  const { user, domain } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { warehouses, currencies } = useAppSelector((state) => state.home);

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

      const apiUrl = `${BASE_URL}purchase/update/${prm?.id}?user_id=${user.id}&tenant_id=${domain}`;

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
          title: "Edit Purchase",
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
          {/* Date Picker */}
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Date</Text>
          <Pressable onPress={showDatepicker}>
            <TextInput
              style={styles.input}
              placeholder="Select date"
              editable={false}
              value={formData.date}
            />
          </Pressable>

          <Text
            style={{
              fontSize: 16,
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
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Supplier
          </Text>
          <Dropdown
            style={styles.input}
            placeholder="Select Supplier"
            data={expenseAcc}
            value={formData.supplier_id}
            labelField="label"
            valueField="value"
            onChange={(item) => {
              setFormData((prevState) => {
                return { ...prevState, supplier_id: item.value };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Purchase Status
          </Text>
          <Dropdown
            style={styles.input}
            placeholder="Purchase status"
            data={purchaseStatus}
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
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Full Name
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Full name"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, full_name: text };
              });
            }}
            value={formData.full_name}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <View
              style={{
                flex: 1,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  color: Colors.colors.text,
                }}
              >
                Currency
              </Text>
              <Dropdown
                style={styles.input}
                placeholder="Currency"
                data={currencies.map((item: any) => {
                  return {
                    id: item.id,
                    label: item.name,
                    value: item.id,
                  };
                })}
                value={formData.curency_id}
                labelField="label"
                valueField="value"
                onChange={(item) => {
                  setFormData((prevState) => {
                    return { ...prevState, curency_id: item.value };
                  });
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  color: Colors.colors.text,
                }}
              >
                Exchange Rate
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setFormData((prevState) => {
                    return { ...prevState, exchange_rate: text };
                  });
                }}
                value={formData.exchange_rate}
              />
            </View>
          </View>
          <Spacer20 />

          <Button
            mode="outlined"
            onPress={() => {}}
            style={{
              // backgroundColor: Colors.colors.primary,
              borderColor: Colors.colors.primary,
            }}
            labelStyle={{ color: "white" }}
          >
            <Text
              style={{
                color: Colors.colors.primary,
                fontSize: 16,
              }}
            >
              Select New Product
            </Text>
          </Button>
          <Spacer20 />
          {/* Product Table */}

          <View
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4 }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#ccc",
                padding: 8,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: Colors.colors.text,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Product Name
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: Colors.colors.text,
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                Amount
              </Text>
            </View>
            {/* Example row */}
            {products.map((ide:any) => (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                  }}
                >
                  <Text style={{ flex: 1, textAlign: "left" }}>
                    {ide.name}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ textAlign: "right" }}>$100.00</Text>
                    <Text
                      style={{
                        textAlign: "right",
                        color: Colors.colors.border,
                      }}
                    >
                      34567
                    </Text>
                  </View>
                </View>
                <Divider />
              </>
            ))}
          </View>
          <View
            style={{
              flexDirection: "row",
              padding: 8,
            }}
          >
            <Text
              style={{
                flex: 1,
                color: Colors.colors.text,
                fontWeight: "bold",
                textAlign: "left",
              }}
            >
              Total Items
            </Text>
            <Text
              style={{
                flex: 1,
                color: Colors.colors.text,
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              {products.length}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Discount
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, discount: text };
              });
            }}
            value={formData.discount}
            placeholder="Enter discount"
          />

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Shipping Cost
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, shipping_cost: text };
              });
            }}
            value={formData.shipping_cost}
            placeholder="Enter shipping cost"
          />

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Note
          </Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Enter note"
            multiline
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, note: text };
              });
            }}
            value={formData.note}
          />
          <Spacer20 />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 8,
              color: Colors.colors.text,
            }}
          >
            Payment Summary
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 8,
            }}
          >
            <Text style={{ flex: 1, textAlign: "left" }}>Subtotal</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>$100.00</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 8,
            }}
          >
            <Text style={{ flex: 1, textAlign: "left" }}>Discount</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>$10.00</Text>
          </View>
          <Spacer10 />
          <Divider />
          <Spacer10 />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 8,
            }}
          >
            <Text
              style={{
                flex: 1,
                textAlign: "left",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Grand Total
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: "right",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              $10.00
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 8,
              paddingTop: 4,
            }}
          >
            <Text style={{ flex: 1, textAlign: "left" }}>Change</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>$10.00</Text>
          </View>

          <Spacer20 />
          <Spacer20 />
          <Button
            mode="contained"
            onPress={formSubmit}
            style={{
              backgroundColor: Colors.colors.primary,
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
              Add Purchese
            </Text>
          </Button>
        </View>

        <Spacer20 />
      </ScrollView>
    </View>
  );
};

export default EditPurcheses;

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
