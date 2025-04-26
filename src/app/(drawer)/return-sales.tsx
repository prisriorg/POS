import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Image } from "expo-image";
import { Button, Divider } from "react-native-paper";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { useAppSelector } from "@/src/store/reduxHook";
import { BASE_URL, IMAGE_BASE_URL } from "@/src/utils/config";

const ReturnSales = () => {
  const router = useRouter();
  const prms = useLocalSearchParams();
  const { user, domain } = useAppSelector((state) => state.auth);

  const { products, currencies } = useAppSelector((state) => state.home);
  const visualFeedback = useVisualFeedback();
  const [formData, setFormData] = React.useState<{
    sale_id: number;
    return_note: string;
  }>({
    sale_id: Number(prms.id),
    return_note: "",
  });

  const [returnData, setReturnData] = React.useState<any>();

  const handleReturn = async () => {
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}return/${prms.id}?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            sale_id: Number(prms.id),
            return_note: formData.return_note,
          }),
        }
      );
      const data = await response.json();
      if (response.status === 200) {
        // Handle success
        console.log("Return details:", data);
        router.replace("/(drawer)/sales");
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

  const getDetails = async (id: string) => {
    try {
      visualFeedback.showLoadingBackdrop();

      const response = await fetch(
        `${BASE_URL}sale/${id}?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(
        "Return data",
        `${BASE_URL}return/${id}?user_id=${user?.id}&tenant_id=${domain}`
      );
      if (response.status === 200) {
        // Handle success
        console.log("Purchase details:", data);
        // setCurrency(
        //   currencies.find(
        //     (daa) => daa.exchange_rate === data?.purchase?.exchange_rate
        //   )?.code || "USD"
        // );
        setReturnData(data);
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
          title: "Sale Return",
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

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "white",
          padding: 15,
        }}
      >
        <View
          style={{
            flex: 1,
            // margin: 10,
            borderRadius: 10,
            // borderWidth: 1,
            // borderColor: Colors.colors.border,
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
              {returnData?.sale?.reference_no}
            </Text>
          </Text>

          <Text
            style={{
              fontWeight: "400",
            }}
          >
            {new Date(returnData?.sale?.created_at).toDateString()}
          </Text>
          <Spacer10 />
          <Divider />
          {returnData?.product_sale_data?.map((data) => {
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
                    uri: `http://${domain}${IMAGE_BASE_URL}${
                      products[data?.product_id]?.image
                    }`,
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
                    <Text>{products[data?.product_id]?.actual_price}</Text>
                    <Text>Qty: {data?.qty} </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <Spacer20 />

          <Text
            style={{
              fontSize: 16,
              paddingBottom: 8,
            }}
          >
            Return Note
          </Text>
          <TextInput
            editable={false}
            value={returnData?.sale?.sale_note}
            multiline
            numberOfLines={4}
            onChangeText={(text) => {
              setFormData({ ...formData, return_note: text });
            }}
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
          <Text style={{ flex: 1, textAlign: "right" }}>
            {returnData?.sale?.total_price}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingBottom: 8,
          }}
        >
          <Text style={{ flex: 1, textAlign: "left" }}>Discount</Text>
          <Text style={{ flex: 1, textAlign: "right" }}>
            {returnData?.sale?.total_discount}
          </Text>
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
            {returnData?.sale?.grand_total}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleReturn}
          style={{
            backgroundColor: Colors.colors.primary,
            margin: 20,
          }}
          labelStyle={{ color: "white", fontWeight: "bold" }}
        >
          Submit
        </Button>
      </ScrollView>
    </View>
  );
};

export default ReturnSales;

const styles = StyleSheet.create({});
