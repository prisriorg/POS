import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useCallback } from "react";
import { Image } from "expo-image";
import { Colors } from "@/src/constants/Colors";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { Button, Card, Divider } from "react-native-paper";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import { useLocalSearchParams } from "expo-router/build/hooks";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL, IMAGE_BASE_URL } from "@/src/utils/config";
import { useAppSelector } from "@/src/store/reduxHook";
import { purchaseStatus } from "@/src/utils/GetData";

const ViewPurchases = () => {
  const router = useRouter();
  const prms = useLocalSearchParams();
  const { user, domain } = useAppSelector((state) => state.auth);
  const { products, currencies } = useAppSelector((state) => state.home);
  const [purData, setPurData] = React.useState<any>(null);
  const [currency, setCurrency] = React.useState<string>("USD");
  const visualFeedback = useVisualFeedback();

  const getDetails = async (id: string) => {
    try {
      visualFeedback.showLoadingBackdrop();

      const response = await fetch(
        `${BASE_URL}purchase/${id}?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.status === 200) {
        // Handle success
        console.log("Purchase details:", data);
        setCurrency(
          currencies.find(
            (daa) => daa.exchange_rate === data?.purchase?.exchange_rate
          )?.code || "USD"
        );
        setPurData(data);
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

  // Use useFocusEffect to run getDetails every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (prms.id) {
        getDetails(prms.id as string);
      }

      // Optional cleanup function
      return () => {
        // Any cleanup code here
      };
    }, [prms.id, user?.id, domain])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "Purchase Details",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTitleStyle: {
            color: Colors.colors.text,
            fontWeight: "semibold",
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

      <View
        style={{
          flex: 1,
          margin: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: Colors.colors.border,
          padding: 15,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
          }}
        >
          Ref No:{" "}
          <Text
            style={{
              fontWeight: "400",
            }}
          >
            {purData?.purchase?.reference_no}
          </Text>
        </Text>

        <Text
          style={{
            fontWeight: "400",
          }}
        >
          {new Date(purData?.purchase?.created_at).toDateString()}
        </Text>
        <Spacer10 />
        <Divider />
        {purData?.product_purchase_data?.map((data) => {
          return (
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                borderBottomWidth: 1,
                borderBottomColor: Colors.colors.border,
                paddingBottom: 5,
              }}
            >
              <Image
                source={{
                  uri: `${IMAGE_BASE_URL}${products[data?.product_id]?.image}`,
                }}
                style={{
                  width: 70,
                  height: 70,
                }}
                contentFit="cover"
              />
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  justifyContent: "center",
                  paddingLeft: 10,
                }}
              >
                <Text>{products[data?.product_id]?.name}</Text>
                <Spacer10 />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>
                    {products[data?.product_id]?.actual_price} {currency}
                  </Text>
                  <Text>Qty: {data?.qty} </Text>
                </View>
              </View>
            </View>
          );
        })}

        <View
          style={{
            marginTop: 10,
            backgroundColor: Colors.colors.background,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 5,
            }}
          >
            <Text>Grand Total</Text>
            <Text>
              {currency} {purData?.purchase?.grand_total}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",

              padding: 5,
            }}
          >
            <Text>Discount</Text>
            <Text>
              {currency} {purData?.purchase?.total_discount}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",

              padding: 5,
            }}
          >
            <Text>Purchase Status</Text>
            <Text
              style={{
                backgroundColor:
                  purData?.purchase?.status === 1 ? "#4CAF50" : "#FF9800",
                paddingVertical: 2,
                paddingHorizontal: 10,
                color: "white",
                borderRadius: 15,
              }}
            >
              {
                purchaseStatus.find(
                  (data) => data.id === purData?.purchase?.status
                )?.label
              }
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",

              padding: 5,
            }}
          >
            <Text>Warehouse</Text>
            <Text>
              {
                purData?.warehouse_list?.find(
                  (data) => purData?.purchase?.warehouse_id === data.id
                )?.name
              }
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",

              padding: 5,
            }}
          >
            <Text>Supplier</Text>
            <Text>
              {
                purData?.supplier_list?.find(
                  (data) => purData?.purchase?.supplier_id === data.id
                )?.name
              }
            </Text>
          </View>
          <Spacer20 />
        </View>
        <Spacer20 />

        <Text
          style={{
            fontSize: 16,
            paddingBottom: 8,
          }}
        >
          Note
        </Text>
        <TextInput
          editable={false}
          value={purData?.purchase?.note}
          multiline
          numberOfLines={4}
          style={{
            borderColor: Colors.colors.border,
            borderWidth: 1,

            padding: 6,
            borderRadius: 6,
            height: 100,
            textAlignVertical: "top",
          }}
          placeholder="Comments/Remarks"
          placeholderTextColor={Colors.colors.border}
        />
      </View>
      <Button
        mode="contained"
        onPress={() => {
          router.push(`/(drawer)/edit-purcheses?id=${prms.id}`);
        }}
        style={{
          backgroundColor: Colors.colors.primary,
          margin: 20,
        }}
        labelStyle={{ color: "white", fontWeight: "bold" }}
      >
        Edit Purchase
      </Button>
    </View>
  );
};

export default ViewPurchases;

const styles = StyleSheet.create({});
