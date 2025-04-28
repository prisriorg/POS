import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
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
import { Spacer15, Spacer20 } from "@/src/utils/Spacing";
import { Button } from "react-native-paper";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL } from "@/src/utils/config";
import { useAppSelector } from "@/src/store/reduxHook";

const AddDeposit = () => {
  const router = useRouter();
  const prms = useLocalSearchParams();
  const { domain, user } = useAppSelector((sate) => sate.auth);
  const visualFeedback = useVisualFeedback();
  const [formData, setFormData] = useState({
    amount: "0",
    note: "",
  });

  const getData = async (id: string) => {
    try {
      visualFeedback.showLoadingBackdrop();

      const response = await fetch(
        `${BASE_URL}deposit/${id}?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.status === 200) {
        setFormData(data.deposit);
      } else {
        // Handle error
        console.error("Error fetching purchase details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (prms.id) {
        getData(prms.id as string);
      }
      return () => {
        // Any cleanup code here
      };
    }, [prms.id, user?.id, domain])
  );

  const handleSubmit = async () => {
    try {
      visualFeedback.showLoadingBackdrop();

      const response = await fetch(
        `${BASE_URL}deposit/update/${prms?.id}?tenant_id=${domain}&user_id=${user?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: formData.amount,
            note: formData.note,
          }),
        }
      );
      const result = await response.json();
      if (response.status === 200) {
        router.push("/(drawer)/view-deposit");
      }
    } catch (err) {
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "Add Deposit",
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
                  router.replace("/(drawer)/customers");
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
          <Text style={styles.text}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, amount: text };
              });
            }}
          />

          <Text style={styles.text}>Note</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Enter note"
            multiline={true}
            numberOfLines={4}
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, note: text };
              });
            }}
          />
          <Spacer20 />
          <Spacer20 />
        </View>
      </ScrollView>
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={{
          backgroundColor: Colors.colors.primary,
        }}
      >
        Add Deposit
      </Button>
    </View>
  );
};

export default AddDeposit;

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
