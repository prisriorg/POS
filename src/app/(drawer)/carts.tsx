import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL, IMAGE_BASE_URL } from "@/src/utils/config";
import { Spacer10, Spacer30, Spacer5 } from "@/src/utils/Spacing";
import NetInfo from "@react-native-community/netinfo";
import {
  addToCart,
  removeFromCart,
  setCart,
  setQRCode,
  updateItemQty,
} from "@/src/store/reducers/homeReducer";
import { Button, Card, Divider, Modal } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";

const CartAdd = () => {
  const router = useRouter();
  const {
    cart: originalCart,
    customers,
    currencies,
    warehouses,
  } = useAppSelector((state) => state.home);
  const { domain, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const visualFeedback = useVisualFeedback();
  // const [cart, setMyCart] = useState<any[]>([]);
  const [discount, setDiscount] = useState<number>(0.0);
  const [customer, setCustomer] = useState(
    customers[0]?.id || customers[0]?.id || customers[1]?.id
  );
  const [print, setPrint] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [currency, setCurrency] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [warehouse, setWarehouse] = useState(warehouses[0]?.id || 1);

  const renderItem = ({ item }) => (
    <View key={item.id} style={styles.catItem}>
      <Image
        source={{ uri: `http://${domain}${IMAGE_BASE_URL}${item?.image}` }}
        style={{
          height: 70,
          width: 70,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: Colors.colors.border,
          resizeMode: "contain",
        }}
      />
      <Spacer5 />
      <View style={{ padding: 8, flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: "60%" }}>
          <Text>
            {
              item?.name

              //   + "-" + item.code
            }
          </Text>
          <Spacer5 />
          <Text>{item?.des}</Text>
          <Spacer10 />
          <Text>
            {selectedCurrency?.code || "USD"}{" "}
            {/* {(item.price * (selectedCurrency?.exchange_rate || 1)).toFixed(2)} x{" "}
            {item.count} = {selectedCurrency?.code || "USD"}{" "} */}
            {(
              item.price *
              item.count *
              (selectedCurrency?.exchange_rate || 1)
            ).toFixed(2)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <MaterialIcons
            name="remove"
            size={24}
            color="white"
            style={{
              margin: 0,
              backgroundColor: "black",
              borderRadius: 2,
            }}
            onPress={() => {
              dispatch(removeFromCart(item));
            }}
          />
          <TextInput
            keyboardType="numeric"
            style={{
              height: 24,
              width: 40,
              textAlign: "center",
              borderRadius: 5,
              borderWidth: 0,
              padding: 0,
              margin: 0,
              backgroundColor: "#F5F5F5",
            }}
            value={`${item.count}`}
            onChangeText={(val) =>
              dispatch(updateItemQty({ item: item, count: val }))
            }
          />
          <MaterialIcons
            name="add"
            size={24}
            color="white"
            style={{
              margin: 0,
              backgroundColor: "black",
              borderRadius: 2,
            }}
            onPress={() => {
              dispatch(addToCart(item));
            }}
          />
        </View>
      </View>
    </View>
  );

  const getSubTotal = () => {
    let subTotal = 0;
    originalCart.forEach((element: any) => {
      const price =
        element.count * element.price * (selectedCurrency?.exchange_rate || 1);
      subTotal += price;
    });
    return subTotal.toFixed(2);
  };

  const getTotalWithDiscount = () => {
    const subTotal = parseFloat(getSubTotal());
    return (subTotal - discount).toFixed(2);
  };

  const getStandardAmount = () => {
    let subTotal = 0;
    originalCart.forEach((element: any) => {
      const price =
        element.count *
        element.tax_amount *
        (selectedCurrency?.exchange_rate || 1);
      subTotal += price;
    });
    return subTotal.toFixed(2);
  };

  const getNetAmount = () => {
    let subTotal = 0;
    originalCart.forEach((element: any) => {
      const price =
        element.count *
        element.actual_price *
        (selectedCurrency?.exchange_rate || 1);
      subTotal += price;
    });
    return subTotal.toFixed(2);
  };

  const getChangeAmount = () => {
    const netAmount = parseFloat(getNetAmount());
    const received = amountReceived || 0;
    return Math.max(0, received - netAmount).toFixed(2);
  };

  const handleSubmit = async () => {
    const netInfo = await NetInfo.fetch();

    try {
      const pId = originalCart.map((c) => c.id);
      const qty = originalCart.map((c) => c.count);
      const paidAmount =
        amountReceived === 0
          ? getTotalWithDiscount()
          : amountReceived.toString();

      visualFeedback.showLoadingBackdrop();

      const dataBody = {
        tenant_id: domain,
        biller_id: "1",
        product_id: JSON.stringify(pId),
        product_qty: JSON.stringify(qty),
        customer_id: customer.toString(),
        warehouse_id: "1",
        grand_total: getTotalWithDiscount(),
        paid_amount: paidAmount.toString(),
        user_id: user.id.toString(),
        pos: "true",
        coupon_id: "1",
        currency_id: currency.toString(),
        exchange_rate: selectedCurrency?.exchange_rate || 1,
        reference_no: `sr-${Date.now()}`,
      };

      if (!netInfo.isConnected) {
        const roles = await AsyncStorage.getItem("getOffline");
        if (roles) {
          const offlineData = JSON.parse(roles);
          const updatedOfflineData = [...offlineData, dataBody];
          await AsyncStorage.setItem(
            "getOffline",
            JSON.stringify(updatedOfflineData)
          );

          const qrText = dataBody.reference_no;
          let qrCode = "";

          const getData = {
            qrCode: qrCode,
            qrText: qrText,
            customer: customer,
            sdRate: getStandardAmount(),
            growAmount: getNetAmount(),
            total: getTotalWithDiscount(),
            netAmount: (
              parseFloat(getSubTotal()) - parseFloat(getStandardAmount())
            ).toFixed(2),
            amount: getSubTotal(),
            date: dayjs().format("YYYY-MM-DD hh:mm A"),
            selectedCurrency,
          };

          dispatch(setQRCode(getData));
          setPrint(true);
        }
        return;
      }

      const response = await fetch(`${BASE_URL}product/save`, {
        method: "POST",
        body: JSON.stringify(dataBody),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("result", result);

      if (result && response.status === 201) {
        const qrCode = result.qrCode;
        const qrText = result.qrText;

        const getData = {
          qrCode: qrCode,
          qrText: qrText,
          customer: customer,
          sdRate: getStandardAmount(),
          growAmount: getNetAmount(),
          total: getTotalWithDiscount(),
          netAmount: (
            parseFloat(getSubTotal()) - parseFloat(getStandardAmount())
          ).toFixed(2),
          amount: getSubTotal(),
          date: dayjs().format("YYYY-MM-DD hh:mm A"),
          selectedCurrency,
        };

        dispatch(setQRCode(getData));
        
        setPrint(true);
      }
    } catch (e) {
      console.log(e);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen
        options={{
          title: "Complete Order",
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
        <FlatList
          scrollEnabled={true}
          data={originalCart}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ backgroundColor: "white" }}
          style={{ height: 100 }}
        />
        <Card
          style={{
            backgroundColor: Colors.colors.card,
            borderWidth: 1,
            borderColor: Colors.colors.border,
            margin: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              margin: 10,
            }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  backgroundColor: "white",
                  borderRadius: 4,
                  paddingHorizontal: 8,
                }}
              >
                <Dropdown
                  style={{ height: 40 }}
                  data={
                    warehouses?.map((warehouse: any) => ({
                      label: warehouse.name,
                      value: warehouse.id,
                    })) || []
                  }
                  value={warehouse}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Warehouse"
                  onChange={(item) => setWarehouse(item.value)}
                />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  paddingHorizontal: 8,
                  backgroundColor: "white",
                  borderRadius: 4,
                }}
              >
                <Dropdown
                  style={{ height: 40 }}
                  data={
                    currencies?.map((currency: any) => ({
                      id: currency.id,
                      label: currency.name,
                      value: currency.id,
                    })) || []
                  }
                  value={selectedCurrency?.id}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Currency"
                  onChange={(val) =>
                    setSelectedCurrency(currencies[parseInt(val.value)])
                  }
                />
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",

              margin: 10,
            }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 4,
                  paddingHorizontal: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.colors.text,
                    fontWeight: "bold",
                    marginTop: 10,
                  }}
                >
                  Customer
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  paddingHorizontal: 8,
                  backgroundColor: "white",
                  borderRadius: 4,
                }}
              >
                <Dropdown
                  style={{ height: 40 }}
                  data={
                    customers?.map((currency: any) => ({
                      id: currency.id,
                      label: currency.name,
                      value: currency.id,
                    })) || []
                  }
                  value={customer}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Currency"
                  onChange={(val) => setCustomer(parseInt(val.value))}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",

              margin: 10,
            }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 4,
                  paddingHorizontal: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.colors.text,
                    fontWeight: "bold",
                    marginTop: 10,
                  }}
                >
                  Discount
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  paddingHorizontal: 8,
                  backgroundColor: "white",
                  borderRadius: 4,
                }}
              >
                <TextInput
                  keyboardType="numeric"
                  style={{
                    height: 40,
                    textAlign: "center",
                    borderRadius: 5,
                    borderWidth: 0,
                    padding: 0,
                    margin: 0,
                  }}
                  placeholder="0.00"
                  onChangeText={(val) => setDiscount(Number(val))}
                />
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",

              margin: 10,
            }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 4,
                  paddingHorizontal: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.colors.text,
                    fontWeight: "bold",
                    marginTop: 10,
                  }}
                >
                  Account Received
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  paddingHorizontal: 8,
                  backgroundColor: "white",
                  borderRadius: 4,
                }}
              >
                <TextInput
                  keyboardType="numeric"
                  style={{
                    height: 40,
                    textAlign: "center",
                    borderRadius: 5,
                    borderWidth: 0,
                    padding: 0,
                    margin: 0,
                  }}
                  placeholder="0.00"
                  // value={`${amountReceived}`}
                  onChangeText={(val) => setAmountReceived(Number(val))}
                />
              </View>
            </View>
          </View>
        </Card>

        <View
          style={{
            padding: 15,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Payment Summary
          </Text>
          <Spacer10 />
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16 }}>Net Amount:</Text>
              <Text style={{ fontSize: 16, textAlign: "right" }}>
                {selectedCurrency?.code || "USD"} {getSubTotal()}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, textAlign: "right" }}>
                Discount:
              </Text>
              <Text style={{ fontSize: 16, textAlign: "right" }}>
                {selectedCurrency?.code || "USD"} {discount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            padding: 15,
          }}
        >
          <Divider />
          <Spacer10 />
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16 }}>Grand Total</Text>
              <Text style={{ fontSize: 16, textAlign: "right" }}>
                {selectedCurrency?.code || "USD"} {getTotalWithDiscount()}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16 }}>Change</Text>
              <Text style={{ fontSize: 16, textAlign: "right" }}>
                {selectedCurrency?.code || "USD"} {getChangeAmount()}
              </Text>
            </View>
          </View>
        </View>
        <Spacer30 />

        <Spacer30 />

        <Spacer30 />

        <Spacer30 />
      </ScrollView>

      <View
        style={{
          height: 90,
          width: "100%",
          backgroundColor: Colors.colors.card,
          position: "absolute",
          bottom: 0,
          flexDirection: "row",
          padding: 16,
          gap: 16,
          elevation: 10,
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <Button
            onPress={() => {
              dispatch(setCart([]));
              router.back();
            }}
            mode="outlined"
            style={{
              backgroundColor: Colors.colors.card,
              borderRadius: 5,
              padding: 6,
            }}
          >
            <Text
              style={{
                color: Colors.colors.text,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Cancel
            </Text>
          </Button>
        </View>
        <View
          style={{
            flex: 1,
          }}
        >
          <Button
            onPress={handleSubmit}
            mode="contained"
            style={{
              backgroundColor: Colors.colors.primary,
              borderRadius: 5,
              padding: 6,
            }}
          >
            <Text
              style={{
                color: Colors.colors.card,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Submit
            </Text>
          </Button>
        </View>
      </View>

      <Modal
        visible={print}
        onDismiss={() => {}}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 20,
          margin: 20,
          borderRadius: 10,
        }}
      >
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="checkmark-outline"
            size={70}
            color={Colors.colors.card}
            style={{
              backgroundColor: "#009951",
              borderRadius: 35,
              padding: 10,
            }}
          />
        </View>
        <Spacer30 />
        <Text
          style={{
            fontSize: 24,
            color: Colors.colors.text,
            textAlign: "center",
          }}
        >
          Payment Completed
        </Text>

        <Spacer30 />
        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
          }}
        >
          <Button
            onPress={() => {
              dispatch(setCart([]));
              router.back();
            }}
            mode="outlined"
            style={{
              borderRadius: 25,
              padding: 6,
              flex: 1,
              marginRight: 10,
            }}
          >
            <Text
              style={{
                color: Colors.colors.text,
                fontSize: 16,
              }}
            >
              Close
            </Text>
          </Button>
          <Button
            onPress={() => {
              router.push("/(drawer)/print");
            }}
            style={{
              backgroundColor: Colors.colors.primary,
              borderRadius: 25,
              padding: 6,
              flex: 1,
              marginLeft: 10,
            }}
          >
            <Text
              style={{
                color: Colors.colors.card,
                fontSize: 16,
                textAlign: "center",
                flex: 1,
              }}
            >
              Print Receipt
            </Text>
          </Button>
        </View>
      </Modal>
    </View>
  );
};

export default CartAdd;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.colors.card,
  },
  catItem: {
    backgroundColor: Colors.colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.colors.border,
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    padding: 16,
    height: 100,
  },
});
