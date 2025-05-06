import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback } from "react";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import { BASE_URL } from "@/src/utils/config";

const ViewSalesPayment = () => {
  const router = useRouter();
  const visualFeedback = useVisualFeedback();
  const { user, domain } = useAppSelector((state) => state.auth);

  const [payments, setPayments] = React.useState<any>([]);
  const dispatch = useAppDispatch();
  const prms = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      if (prms.id) {
        getProduct(prms.id as string);
      }
      return () => {
        // Any cleanup code here
      };
    }, [prms.id, user?.id, domain])
  );
  const getProduct = async (id: string) => {
    try {
      // Show loading feedback
      visualFeedback.showLoadingBackdrop();
      // Fetch product details from API using the id
      await fetch(
        `${BASE_URL}sale/${id}?user_id=${user?.id}&tenant_id=${domain}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Product data:", data.payments);
          if (data?.payments) {
            setPayments(data.payments);
          } else {
            console.log("No payments found for this product.");
          }
          // Handle the fetched product data
          // setProduct(data.product);
          // console.log("Product data:", data.product);
          // setGetVariants(data.lims_product_variant_data);
          visualFeedback.hideLoadingBackdrop();
        })
        .catch((error) => {
          console.error("Error fetching product:", error);
          visualFeedback.hideLoadingBackdrop();
        });
    } catch (error) {
      console.error("Error fetching product:", error);
      visualFeedback.hideLoadingBackdrop();
    }
  };
  const itemrender = ({item}:any) => {
    console.log("item", item);
    return (
      <View
        style={{
          backgroundColor: "white",
          paddingBottom: 10,
          paddingTop: 15,
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.text}>Date</Text>
          <Text style={styles.text}>Amount</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.text}>{new Date(item?.created_at).toDateString()}</Text>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              // marginTop: 16,
              color: "blue",
            }}
          >
            {item?.amount}{" "}
            <MaterialCommunityIcons
              name="greater-than"
              size={16}
              color="#ddd"
            />
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "View Payments",
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
          <FlatList
            data={payments}
            renderItem={itemrender}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ViewSalesPayment;

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
    // marginTop: 16,
    color: Colors.colors.text,
  },
});
