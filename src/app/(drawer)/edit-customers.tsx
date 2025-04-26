import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { useAppSelector } from "@/src/store/reduxHook";
import { Spacer20 } from "@/src/utils/Spacing";
import { Button } from "react-native-paper";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL } from "@/src/utils/config";
import Checkbox from "expo-checkbox";
import { customerGroup } from "@/src/utils/GetData";
import AllCustomers from "./customers";

const AddCustomers = () => {
  const router = useRouter();
  const { roles, warehouses, billers, customers } = useAppSelector(
    (state) => state.home
  );
  const { domain, user } = useAppSelector((state) => state.auth);
  const prms = useLocalSearchParams();
  const visualFeedback = useVisualFeedback();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    both: false, // Default to active
    customer_name: "",
    company_name: "",
    tax_no: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    role_id: "5", // Default to customer role
    customer_group: "1",
    vat_number: "",
    province: "",
    user: false,
  });

  useFocusEffect(
    useCallback(() => {
      const currentUses = customers.find(
        (user) => user.id === Number(prms?.id)
      );

      if (currentUses) {
        setFormData({
          name: currentUses.name || "",
          email: currentUses.email || "",
          password: currentUses.password || "",
          phone_number: currentUses.phone_number || "",
          both: currentUses.both === 1, // Default to active
          customer_name: currentUses.customer_name || "",
          company_name: currentUses.company_name || "",
          tax_no: currentUses.tax_no || "",
          address: currentUses.address || "",
          city: currentUses.city || "",
          state: currentUses.state || "",
          postal_code: currentUses.postal_code || "",
          country: currentUses.country || "",
          role_id: currentUses.role_id || "5", // Default to customer role
          customer_group: currentUses.customer_group || "1",
          vat_number: currentUses.vat_number || "",
          province: currentUses.province || "",
          
          user: currentUses.name ? true : false,
        });
      }

      console.log("currentUses", currentUses);
    }, [prms?.id, user?.id, domain, customers])
  );

  // Update the handleSubmit function to handle both create and update
  const handleSubmit = async () => {
    // Validate email format
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }
    }

    try {
      visualFeedback.showLoadingBackdrop();
      setIsSubmitting(true);

      // Create base request body

      // Determine URL and method based on whether we're updating or creating
      const url = `${BASE_URL}user/update/${prms.id}?tenant_id=${domain}&user_id=${user?.id}`;

      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          both: formData.both ? 1 : 0,
          user: formData.user ? 1 : 0,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      console.log(
        "URL:",
        `${BASE_URL}user/update/${prms?.id}?tenant_id=${domain}&user_id=${user?.id}`
      );
      console.log("Request Body:", {
        ...formData,
        both: formData.both ? 1 : 0,
        user: formData.user ? 1 : 0,
      });

      console.log("Result:", result);

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
          title: "Edit Customer",
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
                  router.push("/(drawer)/customers");
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    phone_number: "",
                    both: false, // Default to active
                    customer_name: "",
                    company_name: "",
                    tax_no: "",
                    address: "",
                    city: "",
                    state: "",
                    postal_code: "",
                    country: "",
                    user: false,
                    role_id: "5", // Default to customer role
                    customer_group: "1",
                    vat_number: "",
                    province: "",
                  });
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
          {/* <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Checkbox
              style={{}}
              value={formData.both}
              onValueChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  both: !formData.both,
                }))
              }
              color={formData.both ? "#000" : undefined}
            />
            <Text style={{ marginLeft: 8 }}>Both Customer and Supplier.</Text>
          </View> */}
          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Customer Group <Text style={{ color: "red" }}>*</Text>
          </Text>
          <Dropdown
            style={styles.input}
            placeholder="Select Group"
            data={customerGroup}
            value={formData.customer_group}
            onChange={(item) =>
              setFormData((prev) => ({
                ...prev,
                customerGroup: item.value,
              }))
            }
            labelField="label"
            valueField="value"
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Name <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={formData.customer_name}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                customer_name: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Company Name
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter company name"
            value={formData.company_name}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                company_name: e,
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
            value={formData.phone_number}
            keyboardType="phone-pad"
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                phone_number: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Tax Number
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter tax number"
            value={formData.tax_no}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                tax_no: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            VAT Registration Number
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter VAT registration number"
            value={formData.vat_number}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                vat_number: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Address <Text style={{ color: "red" }}>*</Text>
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
            Province <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter province"
            value={formData.province}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                province: e,
              }))
            }
          />

          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
            Postal Code
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter postal code"
            value={formData.postal_code}
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                postal_code: e,
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

          <Spacer20 />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              style={{}}
              value={formData.user}
              onValueChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  user: !formData.user,
                }))
              }
              color={formData.user ? "#000" : undefined}
            />
            <Text style={{ marginLeft: 8 }}>Add User.</Text>
          </View>

          <Spacer20 />
          {formData.user && (
            <>
              <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
                UserName <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                value={formData.name}
                onChangeText={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e,
                  }))
                }
              />

              <Spacer20 />
              <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10 }}>
                Password <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={formData.password}
                onChangeText={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e,
                  }))
                }
              />
            </>
          )}
          <Spacer20 />

          <Button
            mode="contained"
            onPress={() => handleSubmit()}
            style={{ marginTop: 20, backgroundColor: Colors.colors.primary }}
            labelStyle={{ color: "white", fontWeight: "bold" }}
          >
            Save Changes
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
