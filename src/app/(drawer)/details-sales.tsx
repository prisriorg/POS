import { Colors } from "@/src/constants/Colors";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { useAppSelector } from "@/src/store/reduxHook";
import { BASE_URL, IMAGE_BASE_URL } from "@/src/utils/config";
import {
  paymentStatus,
  paymentStatusSales,
  salesStatus,
} from "@/src/utils/GetData";
import { Spacer10, Spacer15 } from "@/src/utils/Spacing";
import { Ionicons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { Divider, TextInput } from "react-native-paper";

interface SaleDetails {
  biller_id: number;
  cash_register_id: number;
  coupon_discount: number | null;
  coupon_id: number | null;
  created_at: string;
  currency_id: number;
  customer_id: number;
  data: any | null;
  device_signature: string | null;
  document: string | null;
  exchange_rate: number;
  fdms_signature: string | null;
  fiscal_day_no: number | null;
  global_no: string | null;
  grand_total: number;
  hash: string | null;
  id: number;
  item: number;
  order_discount: number | null;
  order_discount_type: string | null;
  order_discount_value: number | null;
  order_tax: number | null;
  order_tax_rate: number | null;
  paid_amount: number;
  payment_status: number;
  posted: string | null;
  prev_hash: string | null;
  queue: string | null;
  receipt_no: string | null;
  reference_no: string;
  sale_note: string | null;
  sale_status: number;
  shipping_cost: number;
  staff_note: string | null;
  table_id: number | null;
  thumbprint: string | null;
  total_discount: number;
  total_price: number;
  total_qty: number;
  total_tax: number;
  updated_at: string | null;
  user_id: number;
  validation_error_codes: string | null;
  warehouse_id: number;
}

const DetailsSales = () => {
  const router = useRouter();
  const prms = useLocalSearchParams();
  const { sales, products } = useAppSelector((state) => state.home);
  const { user, domain } = useAppSelector((state) => state.auth);
  const [sale, setSale] = useState<SaleDetails>(sales[0]);
  const [purData, setPurData] = useState<any>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const visualFeedback = useVisualFeedback();
  const { currencies } = useAppSelector((state) => state.home);

  const item = useLocalSearchParams();

  const getDetails = async (id: string) => {
    try {
      visualFeedback.showLoadingBackdrop();
      // return setSale(sales.find((im) => im.id === Number(id)) || sales[0]);
      await fetch(
        `${BASE_URL}sale/${id}?user_id=${user?.id}&tenant_id=${domain}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Product data:", data.sale);
          if (data?.sale) {
            setSale(data.sale);
            setPurData(data.product_sale_data);
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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Detailed Sale",
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
                  router.push("/(drawer)/sales");
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

      <View style={styles.infoSection}>
        <Text style={styles.referenceNo}>
          Ref No:{" "}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "400",
            }}
          >
            {sale.reference_no}
          </Text>
        </Text>
        <Text>{new Date(sale.created_at).toDateString()}</Text>
        <Spacer10 />
        <Divider />
        <Spacer15 />

        {purData?.map((data) => {

          const product = products[data?.product_id];
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

        <View style={styles.summarySection}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={styles.summaryValue}>{sale.total_price}</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValue}>{sale.total_discount}</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.summaryLabel}>Sale Status</Text>
            <Text style={styles.summaryValueV}>{sale.sale_status}</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValueV}>Cash</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.summaryLabel}>Payment Status</Text>
            <Text style={styles.summaryValueV}>{sale.payment_status}</Text>
          </View>
        </View>
        <Spacer15 />
        <Text style={styles.summaryLabel}>Note</Text>
        <Text
          style={{
            borderWidth: 1,
            borderColor: Colors.colors.border,
            borderRadius: 8,

            padding: 8,
            height: 100,
          }}
        >
          {sale.sale_note ? sale.sale_note : "No note added for this sale."}
        </Text>
        <Spacer15 />
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            router.push(`/(drawer)/return-sales?id=${sale.id}`);
          }}
        >
          <View style={[styles.button, styles.secondaryButton]}>
            <Text style={styles.buttonText}>Refund/Cancel</Text>
          </View>
        </Pressable>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Print Receipt</Text>
        </View>
      </View>
    </View>
  );
};

export default DetailsSales;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButton: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#090a78",
    borderRadius: 35,
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    marginLeft: 16,
  },
  infoSection: {
    marginBottom: 16,
    padding: 10,

    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.colors.border,
  },
  referenceNo: {
    fontSize: 16,
    fontWeight: "500",
  },
  date: {
    fontSize: 13,
    color: "#000",
  },
  time: {
    fontSize: 13,
    color: "#000",
  },
  divider: {
    width: "100%",
    height: 1,
    marginVertical: 16,
  },
  productSection: {
    marginBottom: 16,
  },
  product: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  productImage: {
    width: 96,
    height: 88,
    marginRight: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "500",
  },
  productQty: {
    fontSize: 15,
    color: "#000",
  },
  summarySection: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  summaryValueV: {
    fontSize: 15,
    fontWeight: "400",
    backgroundColor: "#ddd",
    color: "#7b7b7b",
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#090a78",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#d9d9d9",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
