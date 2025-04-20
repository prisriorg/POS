import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { useAppSelector } from "@/src/store/reduxHook";
import { Spacer20 } from "@/src/utils/Spacing";
import { Button } from "react-native-paper";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL } from "@/src/utils/config";

const AddCustomers = () => {
  const router = useRouter();
  const { roles, warehouses, billers } = useAppSelector((state) => state.home);
  const { domain, user } = useAppSelector((state) => state.auth);
  const visualFeedback = useVisualFeedback();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    active: true, // Default to active
    customerName: "",
    companyName: "",
    taxNo: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    warehouses_id: "",
    biller_id: "",
    role: "5", // Default to customer role
    customerGroup: "1", 
    vatRegistrationNumber: "",
  });

  // Update the handleSubmit function to handle both create and update
  const handleSubmit = async () => {
    // Validation logic (keep your existing validation)
    if (!formData.name || !formData.email) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      visualFeedback.showLoadingBackdrop();
      setIsSubmitting(true);

      // Create base request body
      const requestBody: any = {
        tenant_id: domain,
        user_id: user.id.toString(),
        name: formData.name,
        email: formData.email,
        is_active: formData.active ? 1 : 0,
      };

      // Add password for new users only
      if (!formData.password) {
        Alert.alert("Error", "Password is required for new users");
        setIsSubmitting(false);
        visualFeedback.hideLoadingBackdrop();
        return;
      }
      requestBody.password = formData.password;

      // Add optional fields if present
      if (formData.phoneNumber) {
        requestBody.phone_number = formData.phoneNumber;
      }

      if (formData.companyName) {
        requestBody.company_name = formData.name;
      }

      // Add role-specific data
      if (formData.role) {
        requestBody.role_id = formData.role;

        if (parseInt(formData.role) === 4) {
          // Cashier role
          if (!formData.biller_id || !formData.warehouses_id) {
            Alert.alert(
              "Error",
              "Biller and warehouse are required for this role"
            );
            setIsSubmitting(false);
            visualFeedback.hideLoadingBackdrop();
            return;
          }
          requestBody.biller_id = formData.biller_id.toString();
          requestBody.warehouse_id = formData.warehouses_id.toString();
        } else if (parseInt(formData.role) === 5) {
          // Customer role
          requestBody.customer_name = formData.customerName || formData.name;
          requestBody.customer_group_id = "1";

          // Optional customer fields
          if (formData.taxNo) requestBody.tax_no = formData.taxNo;
          if (formData.address) requestBody.address = formData.address;
          if (formData.city) requestBody.city = formData.city;
          if (formData.state) requestBody.state = formData.state;
          if (formData.postalCode)
            requestBody.postal_code = formData.postalCode;
          if (formData.country) requestBody.country = formData.country;
        }
      }

      // Determine URL and method based on whether we're updating or creating
      const url = `${BASE_URL}user/save`;

      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (response.ok) {
        if (result.status === "success") {
          Alert.alert("Success", "User created successfully");
          router.back();
        } else {
          Alert.alert("Error", result.message || "Operation failed");
          console.log("Operation failed:", result);
        }
      } else {
        Alert.alert(
          "Error",
          result.message || JSON.stringify(result.error || result)
        );
        console.log("Operation failed:", result);
      }
    } catch (error) {
      console.error("Operation failed:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      visualFeedback.hideLoadingBackdrop();
      setIsSubmitting(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.colors.card,
      }}
    >
      <Stack.Screen
        options={{
          title: "Add New Customer",
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
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={formData.name}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Company Name
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter company name"
            value={formData.companyName}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                companyName: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Email
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            value={formData.email}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                email: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Phone Number
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={formData.phoneNumber}
            keyboardType="phone-pad"
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                phoneNumber: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Tax Number
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter tax number"
            value={formData.taxNo}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                taxNo: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            VAT Registration Number
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter VAT registration number"
            value={formData.vatRegistrationNumber}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                vatRegistrationNumber: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Address
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter address"
            value={formData.address}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                address: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            City
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={formData.city}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                city: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Province
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter province"
            value={formData.state}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                state: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Postal Code
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter postal code"
            value={formData.postalCode}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                postalCode: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Country
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter country"
            value={formData.country}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                country: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Customer Group
          </Text>
          <Dropdown
            style={styles.input}
            placeholder="Select Group"
            data={[
              { label: "Group 1", value: "1" },
              { label: "Group 2", value: "2" },
            ]}
            value={formData.customerGroup}
            onChange={(item) =>
              setFormData((prev) => ({
                ...prev,
                customerGroup: item.value,
              }))
            }
            labelField="label"
            valueField="value"
          />

          <Button
            mode="contained"
            onPress={() => handleSubmit()}
            style={{ marginTop: 20, backgroundColor: Colors.colors.primary }}
            labelStyle={{ color: "white", fontWeight: "bold" }}
          >
            Add Customer
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddCustomers;

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
