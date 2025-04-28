import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL, IMAGE_BASE_URL } from "@/src/utils/config";
import { Spacer10, Spacer20, Spacer30, Spacer5 } from "@/src/utils/Spacing";
import NetInfo from "@react-native-community/netinfo";
import {
  addToCart,
  removeFromCart,
  setCart,
  setQRCode,
  updateItemQty,
} from "@/src/store/reducers/homeReducer";
import { Button, Divider, Modal } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";

// Component for dropdown field with label
const LabeledDropdown = ({ label, data, value, onChange, placeholder }) => (
  <View style={styles.rowContainer}>
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <View style={styles.inputContainer}>
      <Dropdown
        style={styles.dropdown}
        data={data}
        value={value}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        onChange={onChange}
      />
    </View>
  </View>
);

// Component for text input field with label
const LabeledTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "numeric",
}: {
  label: string;
  placeholder?: string;
  value?: string | number | undefined;
  onChangeText: (text: string) => void;
  keyboardType?: "numeric" | "default";
}) => (
  <View style={styles.rowContainer}>
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <View style={styles.inputContainer}>
      <TextInput
        keyboardType={keyboardType}
        style={styles.textInput}
        placeholder={placeholder || "0.00"}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  </View>
);

// Main component
const CartScreen = () => {
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

  // State
  const [discount, setDiscount] = useState(0);
  const [customer, setCustomer] = useState(
    customers[0]?.id || customers[1]?.id || 1
  );
  const [print, setPrint] = useState(false);
  const [currency, setCurrency] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [amountReceived, setAmountReceived] = useState("0.00");
  const [warehouse, setWarehouse] = useState(warehouses[0]?.id || 1);

  useFocusEffect(
    React.useCallback(() => {
      setAmountReceived(calculateTotalWithDiscount());
    }, [currency, currencies])
  );

  // Calculations
  const calculateSubTotal = () => {
    return originalCart
      .reduce(
        (total, item) =>
          total +
          item.count * item.price * (selectedCurrency?.exchange_rate || 1),
        0
      )
      .toFixed(2);
  };

  const calculateTotalWithDiscount = () => {
    const subTotal = parseFloat(calculateSubTotal());
    return (subTotal - discount).toFixed(2);
  };

  const calculateStandardAmount = () => {
    return originalCart
      .reduce(
        (total, item) =>
          total +
          item.count * item.tax_amount * (selectedCurrency?.exchange_rate || 1),
        0
      )
      .toFixed(2);
  };

  const calculateNetAmount = () => {
    return originalCart
      .reduce(
        (total, item) =>
          total +
          item.count *
            item.actual_price *
            (selectedCurrency?.exchange_rate || 1),
        0
      )
      .toFixed(2);
  };

  const calculateChangeAmount = () => {
    const netAmount = parseFloat(calculateNetAmount());
    const received = amountReceived || 0;
    return Math.max(0, received - netAmount).toFixed(2);
  };

  // Render cart item
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item?.image}` }}
        style={styles.productImage}
      />
      <Spacer5 />
      <View style={styles.productInfoContainer}>
        <View style={styles.productTextContainer}>
          <Text style={styles.productNameText}>{item?.name}</Text>
          <Spacer20 />
          <Text style={styles.priceText}>
            {selectedCurrency?.code || "USD"}{" "}
            {(
              item.price *
              item.count *
              (selectedCurrency?.exchange_rate || 1)
            ).toFixed(2)}
          </Text>
        </View>
        <View style={styles.quantityControls}>
          <MaterialIcons
            name="remove"
            size={22}
            color={Colors.colors.primary}
            style={styles.removeIcon}
            onPress={() => dispatch(removeFromCart(item))}
          />
          <TextInput
            keyboardType="numeric"
            style={styles.quantityInput}
            value={`${item.count}`}
            onChangeText={(val) =>
              dispatch(updateItemQty({ item: item, count: val }))
            }
          />
          <MaterialIcons
            name="add"
            size={24}
            color="white"
            style={styles.addIcon}
            onPress={() => dispatch(addToCart(item))}
          />
        </View>
      </View>
    </View>
  );

  // Handle submit/checkout
  const handleSubmit = async () => {
    const netInfo = await NetInfo.fetch();

    try {
      visualFeedback.showLoadingBackdrop();

      const productIds = originalCart.map((c) => c.id);
      const quantities = originalCart.map((c) => c.count);
      const paidAmount =
        amountReceived === 0
          ? calculateTotalWithDiscount()
          : amountReceived.toString();

      const saleData = {
        tenant_id: domain,
        biller_id: "1",
        product_id: JSON.stringify(productIds),
        product_qty: JSON.stringify(quantities),
        customer_id: customer.toString(),
        warehouse_id: warehouse.toString(),
        grand_total: calculateTotalWithDiscount(),
        paid_amount: paidAmount,
        user_id: user.id.toString(),
        pos: "true",
        coupon_id: "1",
        currency_id: currency.toString(),
        exchange_rate: selectedCurrency?.exchange_rate || 1,
        reference_no: `sr-${Date.now()}`,
      };

      // Handle offline mode
      if (!netInfo.isConnected) {
        const roles = await AsyncStorage.getItem("getOffline");
        if (roles) {
          const offlineData = JSON.parse(roles);
          const updatedOfflineData = [...offlineData, saleData];
          await AsyncStorage.setItem(
            "getOffline",
            JSON.stringify(updatedOfflineData)
          );

          saveReceiptData(saleData.reference_no, "");
        }
        return;
      }

      // Online mode - send to server
      const response = await fetch(`${BASE_URL}product/save`, {
        method: "POST",
        body: JSON.stringify(saleData),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result && response.status === 201) {
        saveReceiptData(result.qrText, result.qrCode);
      }
    } catch (e) {
      console.log(e);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  // Save receipt data for printing
  const saveReceiptData = (qrText, qrCode) => {
    const receiptData = {
      qrCode,
      qrText,
      customer,
      sdRate: calculateStandardAmount(),
      growAmount: calculateNetAmount(),
      total: calculateTotalWithDiscount(),
      netAmount: (
        parseFloat(calculateSubTotal()) - parseFloat(calculateStandardAmount())
      ).toFixed(2),
      amount: calculateSubTotal(),
      date: dayjs().format("YYYY-MM-DD hh:mm A"),
      selectedCurrency,
    };

    dispatch(setQRCode(receiptData));
    setPrint(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Complete Order",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTitleStyle: {
            color: Colors.colors.text,
          },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.backButtonContainer}
            >
              <View style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="white" />
              </View>
            </Pressable>
          ),
        }}
      />
      {/* Cart Items */}
      <FlatList
        scrollEnabled={true}
        data={originalCart}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartListContent}
        style={{
          height:
            originalCart.length >= 3
              ? Dimensions.get("screen").height * 0.18 * 3
              : originalCart.length === 2
              ? Dimensions.get("screen").height * 0.15 * 2
              : Dimensions.get("screen").height * 0.13 * 1,
        }}
      />

      <ScrollView>
        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Warehouse and Currency */}
          <LabeledDropdown
            label="Currency"
            data={
              currencies?.map((curr) => ({
                id: curr.id,
                label: curr.name,
                value: curr.id,
              })) || []
            }
            value={customer}
            placeholder="Select Customer"
            onChange={(val) => setCurrency(parseInt(val.value))}
          />

          {/* Payment Dropdown */}
          <LabeledDropdown
            label="Payment Method"
            data={[
              {
                id: 1,
                label: "Cash",
                value: 1,
              },
            ]}
            value={customer}
            placeholder="Select Customer"
            onChange={(val) => setCurrency(parseInt(val.value))}
          />

          {/* Customer Dropdown */}
          <LabeledDropdown
            label="Customer"
            data={
              customers?.map((cust) => ({
                id: cust.id,
                label: cust.name,
                value: cust.id,
              })) || []
            }
            value={customer}
            placeholder="Select Customer"
            onChange={(val) => setCustomer(parseInt(val.value))}
          />

          {/* Discount Input */}
          <LabeledTextInput
            label="Discount"
            placeholder="0.00"
            onChangeText={(val) => setDiscount(Number(val))}
            // value={undefined}
          />

          {/* Amount Received Input */}
          <LabeledTextInput
            label="Amount Received"
            placeholder="0.00"
            onChangeText={(val) => setAmountReceived(val)}
            value={amountReceived}
          />
        </View>

        {/* Payment Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <Spacer10 />

          <View style={styles.summaryItemsContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {selectedCurrency?.code || "USD"} {calculateSubTotal()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>
                {selectedCurrency?.code || "USD"} {discount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Total and Change */}
        <View style={styles.totalContainer}>
          <Divider />
          <Spacer10 />

          <View style={styles.summaryItemsContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                {selectedCurrency?.code || "USD"} {calculateTotalWithDiscount()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Change</Text>
              <Text style={styles.summaryValue}>
                {selectedCurrency?.code || "USD"} {calculateChangeAmount()}
              </Text>
            </View>
          </View>
        </View>

        {/* Spacers for footer spacing */}
        <Spacer30 />
        <Spacer30 />
        <Spacer30 />
        <Spacer30 />
      </ScrollView>

      {/* Footer with action buttons */}
      <View style={styles.footer}>
        <View style={styles.footerButtonContainer}>
          <Button
            onPress={() => {
              dispatch(setCart([]));
              router.back();
            }}
            mode="outlined"
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Button>
        </View>

        <View style={styles.footerButtonContainer}>
          <Button
            onPress={handleSubmit}
            mode="contained"
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </Button>
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={print}
        // onDismiss={() => {
        //   setPrint(false);
        // }}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.successIconContainer}>
          <Ionicons
            name="checkmark-outline"
            size={70}
            color={Colors.colors.card}
            style={styles.successIcon}
          />
        </View>

        <Spacer30 />
        <Text style={styles.successText}>Payment Completed</Text>
        <Spacer30 />

        <View style={styles.modalButtonsContainer}>
          <Button
            onPress={() => {
              dispatch(setCart([]));
              router.push("/(drawer)/pos-home");
              setPrint(false);
            }}
            mode="outlined"
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Button>

          <Button
            onPress={() => {
              router.push("/(drawer)/print");
            }}
            style={styles.printButton}
          >
            <Text style={styles.printButtonText}>Print Receipt</Text>
          </Button>
        </View>
      </Modal>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButtonContainer: {
    padding: 10,
  },
  backButton: {
    backgroundColor: Colors.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartList: {
    height: 100,
  },
  cartListContent: {
    backgroundColor: "white",
  },
  cartItem: {
    backgroundColor: Colors.colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.colors.border,
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  productImage: {
    height: Dimensions.get("window").width * 0.2,
    width: Dimensions.get("window").width * 0.2,
    borderRadius: 4,
    // borderWidth: 1,
    // borderColor: Colors.colors.border,
    resizeMode: "contain",
  },
  productInfoContainer: {
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  productTextContainer: {
    width: "60%",
  },
  productNameText: {
    fontSize: 14,
    fontWeight: "500",
  },
  productDescText: {
    fontSize: 12,
    color: "#666",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  removeIcon: {
    margin: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.colors.primary,
  },
  addIcon: {
    margin: 0,
    backgroundColor: Colors.colors.primary,
    borderRadius: 20,
  },
  quantityInput: {
    height: 24,
    width: 40,
    textAlign: "center",
    borderRadius: 5,
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  formContainer: {
    backgroundColor: "#F8F8F8",
    margin: 5,
    borderRadius: 8,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
  },
  formHalfColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: "white",
  },
  dropdown: {
    height: 40,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
  },
  labelContainer: {
    flex: 1,
    marginRight: 8,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  labelText: {
    fontSize: 16,
    color: Colors.colors.text,
    marginTop: 10,
  },
  inputContainer: {
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 8,
    backgroundColor: "white",
    borderRadius: 4,
  },
  textInput: {
    height: 40,
    textAlign: "right",
    borderRadius: 5,
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  summaryContainer: {
    padding: 15,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryItemsContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 10,
  },
  summaryRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    textAlign: "right",
  },
  totalContainer: {
    padding: 15,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },
  footer: {
    height: 90,
    width: "100%",
    backgroundColor: Colors.colors.card,
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    padding: 16,
    gap: 16,
    elevation: 10,
  },
  footerButtonContainer: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: Colors.colors.card,
    borderColor: Colors.colors.primary,
    borderRadius: 35,
    padding: 6,
  },
  cancelButtonText: {
    color: Colors.colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: Colors.colors.primary,
    borderRadius: 35,
    padding: 6,
  },
  submitButtonText: {
    color: Colors.colors.card,
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  successIconContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    backgroundColor: "#009951",
    borderRadius: 35,
    padding: 10,
  },
  successText: {
    fontSize: 24,
    color: Colors.colors.text,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  closeButton: {
    borderRadius: 25,
    padding: 6,
    flex: 1,
    marginRight: 10,
  },
  closeButtonText: {
    color: Colors.colors.text,
    fontSize: 16,
  },
  printButton: {
    backgroundColor: Colors.colors.primary,
    borderRadius: 25,
    padding: 6,
    flex: 1,
    marginLeft: 10,
  },
  printButtonText: {
    color: Colors.colors.card,
    fontSize: 16,
    textAlign: "center",
    flex: 1,
  },
});
