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
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import { Button } from "react-native-paper";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL } from "@/src/utils/config";
import Checkbox from "expo-checkbox";
import { date } from "yup";

const EditUsers = () => {
  const router = useRouter();
  const prms = useLocalSearchParams();
  const { roles, warehouses, billers, users } = useAppSelector(
    (state) => state.home
  );
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
    role: "",
  });

  useFocusEffect(
    useCallback(() => {
      const currentUses = users.find((user) => user.id === Number(prms?.id));

      setFormData({
        name: currentUses?.name || "",
        email: currentUses?.email || "",
        password: currentUses?.password || "",
        phoneNumber: currentUses?.phone || "",
        active: currentUses?.is_active === 1,
        customerName: currentUses?.customer_name || "",
        companyName: currentUses?.company_name || "",
        taxNo: currentUses?.tax_no || "",
        address: currentUses?.address || "",
        city: currentUses?.city || "",
        state: currentUses?.state || "",
        postalCode: currentUses?.postal_code || "",
        country: currentUses?.country || "",
        warehouses_id: currentUses?.warehouse_id || "",
        biller_id: currentUses?.biller_id || "",
        role: currentUses?.role_id || "",
      });
      console.log("currentUses", currentUses);
    }, [prms?.id, user?.id, domain, users])
  );

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
      const url = `${BASE_URL}user/update/${prms?.id}?tenant_id=${domain}&user_id=${user?.id}`;

      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          requestBody,
          created_at: new Date(),
          date: new Date(),
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (response.ok) {
        if (result.status === "success") {
          Alert.alert("Success", "User Updated successfully");
          router.push("/(drawer)/users");
          setFormData({
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            active: true,
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
            role: "",
          });
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
          title: "Edit User",
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
                  router.push("/(drawer)/users");
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    phoneNumber: "",
                    active: true,
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
                    role: "",
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
        <View style={{ margin: 20 }}>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Username <Text style={{ color: "red" }}>*</Text>
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
          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
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
          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Email <Text style={{ color: "red" }}>*</Text>
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
          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Phone Number <Text style={{ color: "red" }}>*</Text>
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={String(formData.phoneNumber) || ""}
            keyboardType="phone-pad"
            onChangeText={(e) =>
              setFormData((prev) => ({
                ...prev,
                phoneNumber: e,
              }))
            }
          />

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Role <Text style={{ color: "red" }}>*</Text>
          </Text>
          <Dropdown
            style={styles.input}
            data={roles.slice(0, 3).map(
              (role: any) =>
                role.id !== 5 && {
                  id: role.id,
                  value: role.id,
                  label: role.name,
                }
            )}
            value={formData?.role}
            placeholder="Select Role"
            onChange={function (item: any): void {
              setFormData((prev) => ({ ...prev, role: item.value }));
            }}
            labelField={"label"}
            valueField={"value"}
          />
          {parseInt(formData.role) === 4 && (
            <>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  marginTop: 16,
                  color: Colors.colors.text,
                }}
              >
                Branch <Text style={{ color: "red" }}>*</Text>
              </Text>
              <Dropdown
                style={styles.input}
                placeholder="Select Branch"
                data={billers.map((role: any) => ({
                  id: role.id,
                  value: role.id,
                  label: role.name,
                }))}
                onChange={function (item: any): void {
                  setFormData((prev) => ({ ...prev, biller_id: item.value }));
                }}
                value={formData.biller_id}
                labelField={"label"}
                valueField={"value"}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  marginTop: 16,
                  color: Colors.colors.text,
                }}
              >
                Warehouse <Text style={{ color: "red" }}>*</Text>
              </Text>
              <Dropdown
                style={styles.input}
                placeholder="Select Warehouse"
                data={warehouses.map((role: any) => ({
                  id: role.id,
                  value: role.id,
                  label: role.name,
                }))}
                onChange={function (item: any): void {
                  setFormData((prev) => ({
                    ...prev,
                    warehouses_id: item.value,
                  }));
                }}
                value={formData.warehouses_id}
                labelField={"label"}
                valueField={"value"}
              />
            </>
          )}
          <Spacer20 />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              style={{}}
              value={formData.active}
              onValueChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  active: !formData.active,
                }))
              }
              color={formData.active ? "#000" : undefined}
            />
            <Text style={{ marginLeft: 8 }}>Active</Text>
          </View>
          <Spacer10 />
          <Spacer20 />
          <Button
            mode="contained"
            onPress={handleSubmit}
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
              Add User
            </Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditUsers;

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
