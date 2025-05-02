import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/src/constants/Colors";
import { Button } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { useAppSelector } from "@/src/store/reduxHook";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL } from "@/src/utils/config";
import { useFocusEffect, useRouter } from "expo-router";

const POS = () => {
  const [show, setShow] = React.useState(true);
  const [formData, setFormData] = React.useState({
    cash_in_hand_usd: "",
    warehouse_id: "",
    cash_in_hand_local: "",
  });
  const router = useRouter();
  const visualFeedback = useVisualFeedback();
  const { warehouses, registers } = useAppSelector((state) => state.home);
  const { user, domain } = useAppSelector((state) => state.auth);

  const handleSubmit = async () => {
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}register/create?user_id=${user?.id}&tenant_id=${domain}`, // Replace with your API endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cash_in_hand_usd: formData.cash_in_hand_usd,
            warehouse_id: formData.warehouse_id,
            cash_in_hand_local: formData.cash_in_hand_local,
          }),
        }
      );
      const data = await response.json();
      console.log(
        "Endpoint:",
        `${BASE_URL}register/create?user_id=${user?.id}&tenant_id=${domain}`
      ); // Log the response data
      console.log("Request Body:", {
        cash_in_hand_usd: formData.cash_in_hand_usd,
        warehouse_id: formData.warehouse_id,
        cash_in_hand_local: formData.cash_in_hand_local,
      }); // Log the response data
      console.log("Response status:", response.status); // Log the response status
      console.log("Response data:", data); // Log the response data
      if (response.status === 200) {
        // Handle success
        console.log("Success:", data);
        setShow(false);
      } else {
        // Handle error
        console.error("Error:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const register = registers.find(
        (reg: any) => reg.user_id === user?.id
      )?.status;
      if (register === 1) {
        setShow(false);
        setFormData({
          cash_in_hand_usd: "",
          warehouse_id: "",
          cash_in_hand_local: "",
        });
      } else {
        setShow(true);
        router.replace("/(drawer)/pos-home");
      }

      return () => {};
    }, [show])
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={show}
      onRequestClose={() => {
        router.replace("/(drawer)/(tabs)");
        setFormData({
          cash_in_hand_usd: "",
          warehouse_id: "",
          cash_in_hand_local: "",
        });
        setShow(false);
      }}
    >
      <ScrollView>
        <View
          style={{
            flex: 1,
            // justifyContent: "center",
            paddingVertical: Dimensions.get("window").height / 10,
            width: "100%",
            height: Dimensions.get("window").height,
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: "95%",
              backgroundColor: "white",

              borderRadius: 10,
              padding: 15,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  flex: 1,
                  color: Colors.colors.text,
                }}
              >
                Open Cash Register
              </Text>
              <Pressable
                onPress={() => {
                  router.replace("/(drawer)/(tabs)");
                }}
              >
                <AntDesign name="close" size={20} color="black" />
              </Pressable>
            </View>
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
              style={styles.dropdown}
              data={warehouses.map((item) => {
                return { label: item.name, value: item.id };
              })}
              labelField="label"
              valueField="value"
              placeholder="Select Warehouse"
              onChange={(item) => {
                setFormData((prevState) => {
                  return { ...prevState, warehouse_id: item.value };
                });
              }}
              value={formData.warehouse_id}
            />
            <Text
              style={{
                fontSize: 16,
                marginBottom: 8,
                color: Colors.colors.text,
              }}
            >
              Cash in Hand (USD)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              onChangeText={(text) => {
                setFormData((prevState) => {
                  return { ...prevState, cash_in_hand_usd: text };
                });
              }}
              value={formData.cash_in_hand_usd}
            />
            <Text
              style={{
                fontSize: 16,
                marginBottom: 8,
                color: Colors.colors.text,
              }}
            >
              Cash in Hand (Local)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              onChangeText={(text) => {
                setFormData((prevState) => {
                  return { ...prevState, cash_in_hand_local: text };
                });
              }}
              value={formData.cash_in_hand_local}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={{
                backgroundColor: Colors.colors.primary,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
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
                Submit
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Modal>
    // <Modal
    //   animationType="slide"
    //   transparent={true}
    //   visible={true}
    //   onRequestClose={() => {
    //     // setModalVisible(!modalVisible);
    //   }}
    // >
    //   <View style={{ padding: 20, backgroundColor: "#fff",

    //    }}>
    //     <View style={{ marginTop: 20 }}>
    //       <Text style={{ fontSize: 16, fontWeight: "bold" }}>Warehouse</Text>
    //       <Dropdown
    //         style={{
    //           borderWidth: 1,
    //           borderColor: "#ccc",
    //           borderRadius: 5,
    //           padding: 10,
    //           marginTop: 10,
    //         }}
    //         data={[
    //           { label: "Warehouse 1", value: "warehouse1" },
    //           { label: "Warehouse 2", value: "warehouse2" },
    //         ]}
    //         labelField="label"
    //         valueField="value"
    //         placeholder="Select Warehouse" // value={selectedValue}
    //         onChange={(item) => {
    //           // setSelectedValue(item.value);
    //         }}
    //       ></Dropdown>
    //     </View>
    //     <View style={{ marginTop: 20 }}>
    //       <Text style={{ fontSize: 16, fontWeight: "bold" }}>
    //         Cash in Hand (USD)
    //       </Text>
    //       <View
    //         style={{
    //           borderWidth: 1,
    //           borderColor: "#ccc",
    //           borderRadius: 5,
    //           marginTop: 10,
    //           padding: 10,
    //         }}
    //       >
    //         <Text>Enter Amount</Text>
    //       </View>
    //     </View>
    //     <View style={{ marginTop: 20 }}>
    //       <Text style={{ fontSize: 16, fontWeight: "bold" }}>
    //         Cash in Hand (Local)
    //       </Text>
    //       <View
    //         style={{
    //           borderWidth: 1,
    //           borderColor: "#ccc",
    //           borderRadius: 5,
    //           marginTop: 10,
    //           padding: 10,
    //         }}
    //       >
    //         <Text>Enter Amount</Text>
    //       </View>
    //     </View>
    //   </View>
    // </Modal>
  );
};

export default POS;

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.colors.border,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 16,
    color: Colors.colors.text,
    textAlign: "right",
  },
  dropdown: {
    height: 50,
    borderColor: Colors.colors.border,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});
