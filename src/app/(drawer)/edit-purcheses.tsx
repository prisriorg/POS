import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Modal,
  Dimensions,
  FlatList,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Colors } from "@/src/constants/Colors";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import { Button, Divider, Searchbar } from "react-native-paper";
import { BASE_URL, IMAGE_BASE_URL } from "@/src/utils/config";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import { Dropdown } from "react-native-element-dropdown";
import {
  expenseAcc,
  expenseCat,
  purchaseStatus,
  suppliers,
} from "@/src/utils/GetData";

import { Image } from "expo-image";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

const EditPurcheses = () => {
  const router = useRouter();
  const [date, setDate] = React.useState(new Date());
  const [show, setShow] = React.useState(false);
  const [showProducts, setShowProducts] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(0);
  const visualFeedback = useVisualFeedback();
  const { user, domain } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { warehouses, currencies, products } = useAppSelector(
    (state) => state.home
  );

  const prms = useLocalSearchParams();
  const [purData, setPurData] = React.useState<any>(null);
  const [currency, setCurrency] = React.useState<string>("USD");

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

  const [formData, setFormData] = React.useState({
    created_at: new Date().toISOString().split("T")[0],
    warehouse_id: "1",
    supplier_id: "1",
    status: "1",
    currency_id: "1",
    exchange_rate: "1",
    product_code_name: null,
    qty: ["4"],
    recieved: ["4"],
    batch_no: [null],
    expired_date: [null],
    // product_code: [" kg/-62502311 "],
    product_id: ["2"],
    purchase_unit: ["piece"],
    net_unit_cost: ["0.43"],
    discount: ["0.00"],
    tax_rate: ["15.00"],
    tax: ["0.26"],
    subtotal: ["2.00"],
    imei_number: [null],
    total_qty: "4",
    total_discount: "0.00",
    total_tax: "0.26",
    total_cost: "2.00",
    item: "1",
    order_tax: "0.00",
    grand_total: "2.00",
    paid_amount: "0.00",
    payment_status: "1",
    order_tax_rate: "0",
    order_discount: "1",
    shipping_cost: "1",
    note: "test",
  });
  const [searchText, setSearchText] = React.useState("");

  const [allProduct, setAllProduct] = React.useState(products);

  const [dataProducts, setProducts] = React.useState<
    {
      id: number;
      name: string;
      price: string;
      quantity: string;
      discount: string;
      code: string;
      tax_amount: string;
      tax_rate: string;
    }[]
  >([]);

  useEffect(() => {
    setAllProduct(products);
  }, [products]);

  // Handle date change
  const onDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setDate(selectedDate);
      setFormData((prevState) => ({
        ...prevState,
        created_at: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  // Show date picker
  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onDateChange,
      mode: "date",
      is24Hour: true,
    });
  };

  // product item renderer
  const renderProductItem = ({ item }: any) => {
    return (
      <Pressable
        onPress={() => {
          setShowProducts(false);
          const existingProduct = dataProducts.find(
            (product) => product.id === item.id
          );

          if (existingProduct) {
            setProducts((prevProducts) =>
              prevProducts.map((product) =>
                product.id === item.id
                  ? {
                      ...product,
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      discount: item.discount,
                      code: item.code,
                      tax_amount: item.tax_amount,
                      tax_rate: item.tax_percentage,
                      quantity: (Number(product.quantity) + 1).toString(),
                    }
                  : product
              )
            );
          } else {
            setProducts((prevProducts) => [
              ...prevProducts,
              {
                id: item.id,
                name: item.name,
                quantity: "1",
                discount: "0.0",
                price: item.price,
                code: item.code,
                tax_amount: item.tax_amount,
                tax_rate: item.tax_percentage,
              },
            ]);
          }

          console.log(products[0]);
        }}
        style={{
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            paddingBottom: 5,
          }}
        >
          <Image
            source={{
              uri: `${IMAGE_BASE_URL}${item?.image}`,
            }}
            style={{
              width: 50,
              height: 50,
            }}
            contentFit="cover"
          />
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              paddingLeft: 15,
            }}
          >
            <Text
              style={{
                color: Colors.colors.text,
                // fontSize: 12,
                fontWeight: "bold",
              }}
            >
              Product:{" "}
              <Text
                style={{
                  fontWeight: "400",
                }}
              >
                {item?.name}
              </Text>
            </Text>
            <Spacer10 />
            <Text
              style={{
                color: Colors.colors.text,
                // fontSize: 12,
                fontWeight: "bold",
              }}
            >
              Code/ SKU:{" "}
              <Text
                style={{
                  fontWeight: "400",
                }}
              >
                {item?.code}
              </Text>
            </Text>

            <Spacer10 />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="greater-than"
              size={24}
              color="#ccc"
            />
          </View>
        </View>
      </Pressable>
    );
  };

  const formSubmit = async () => {
    try {
      visualFeedback.showLoadingBackdrop();

      console.log(
        "Form Data",
        JSON.stringify({
          ...formData,

          product_code_name: dataProducts.map((item) => item.name),
          qty: dataProducts.map((item) => item.quantity),
          product_id: dataProducts.map((item) => item.id),
          net_unit_cost: dataProducts.map((item) => item.price),
          discount: dataProducts.map((item) => item.discount),
          subtotal: dataProducts.map(
            (item) => parseInt(item.price) * parseInt(item.quantity)
          ),
          product_code: dataProducts.map((item) => item.code),
          total_qty: dataProducts.reduce(
            (acc, item) => acc + parseInt(item.quantity),
            0
          ),
          total_discount: dataProducts.reduce(
            (acc, item) => acc + parseFloat(item.discount),
            0
          ),
          total_cost: dataProducts.reduce(
            (acc, item) => acc + parseInt(item.price) * parseInt(item.quantity),
            0
          ),
          grand_total: dataProducts.reduce(
            (acc, item) =>
              acc +
              parseInt(item.price) * parseInt(item.quantity) -
              parseFloat(item.discount),
            0
          ),
        })
      );

      const apiUrl = `${BASE_URL}save/purchase?user_id=${user.id}&tenant_id=${domain}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          {
            ...formData,

            ...formData,

            product_code_name: dataProducts.map((item) => item.name),
            qty: dataProducts.map((item) => item.quantity),
            product_id: dataProducts.map((item) => item.id),
            net_unit_cost: dataProducts.map((item) => item.price),
            discount: dataProducts.map((item) => item.discount),
            subtotal: dataProducts.map(
              (item) => parseInt(item.price) * parseInt(item.quantity)
            ),
            product_code: dataProducts.map((item) => item.code),
            total_qty: dataProducts.reduce(
              (acc, item) => acc + parseInt(item.quantity),
              0
            ),
            total_discount: dataProducts.reduce(
              (acc, item) => acc + parseFloat(item.discount),
              0
            ),
            total_cost: dataProducts.reduce(
              (acc, item) =>
                acc + parseInt(item.price) * parseInt(item.quantity),
              0
            ),
            grand_total: dataProducts.reduce(
              (acc, item) =>
                acc +
                parseInt(item.price) * parseInt(item.quantity) -
                parseFloat(item.discount),
              0
            ),
          },
          null,
          2
        ),
      });
      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        alert("Purchese added successfully");
        visualFeedback.hideLoadingBackdrop();
        router.replace("/(drawer)/purchases");
      }
      {
        alert(JSON.stringify(data.error || data.errors));
        visualFeedback.hideLoadingBackdrop();
      }
    } catch (error) {
      console.log(error);
      alert("An error occurred while adding the expense. Please try again.");
      visualFeedback.hideLoadingBackdrop();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "Edit Purchase",
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
                  router.replace("/(drawer)/purchases");
                  setProducts([]);
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
          {/* Date Picker */}
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Date</Text>
          <Pressable onPress={showDatepicker}>
            <TextInput
              style={styles.input}
              placeholder="Select date"
              editable={false}
              value={formData.created_at}
            />
          </Pressable>

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
            style={styles.input}
            placeholder="Select warehouse"
            data={warehouses.map((item: any) => {
              return {
                id: item.id,
                label: item.name,
                value: item.id,
              };
            })}
            value={formData.warehouse_id}
            labelField="label"
            valueField="value"
            onChange={(item) => {
              setFormData((prevState) => {
                return { ...prevState, warehouse_id: item.value };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Supplier
          </Text>
          <Dropdown
            style={styles.input}
            placeholder="Select Supplier"
            data={expenseAcc}
            value={formData.supplier_id}
            labelField="label"
            valueField="value"
            onChange={(item) => {
              setFormData((prevState) => {
                return { ...prevState, supplier_id: item.value };
              });
            }}
          />

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Purchase Status
          </Text>
          <Dropdown
            style={styles.input}
            placeholder="Purchase status"
            data={purchaseStatus}
            value={formData.status}
            labelField="label"
            valueField="value"
            onChange={(item) => {
              setFormData((prevState) => {
                return { ...prevState, status: item.value };
              });
            }}
          />

          {/* <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Full Name
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Full name"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, full_name: text };
              });
            }}
            value={formData.full_name}
          /> */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <View
              style={{
                flex: 1,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  color: Colors.colors.text,
                }}
              >
                Currency
              </Text>
              <Dropdown
                style={styles.input}
                placeholder="Currency"
                data={currencies.map((item: any) => {
                  return {
                    id: item.id,
                    label: item.name,
                    value: item.id,
                  };
                })}
                value={formData.currency_id}
                labelField="label"
                valueField="value"
                onChange={(item) => {
                  setFormData((prevState) => {
                    return { ...prevState, currency_id: item.value };
                  });
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  color: Colors.colors.text,
                }}
              >
                Exchange Rate
              </Text>
              <TextInput
                style={[styles.input, { textAlign: "right" }]}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setFormData((prevState) => {
                    return { ...prevState, exchange_rate: text };
                  });
                }}
                value={formData.exchange_rate}
              />
            </View>
          </View>
          <Spacer20 />

          <Button
            mode="outlined"
            onPress={() => {
              setShowProducts(true);
            }}
            style={{
              // backgroundColor: Colors.colors.primary,
              borderColor: Colors.colors.primary,
              borderWidth: 1,
              borderRadius: 8,
            }}
            labelStyle={{ color: "white" }}
          >
            <Text
              style={{
                color: Colors.colors.primary,
                fontSize: 16,
              }}
            >
              Select New Product
            </Text>
          </Button>
          <Spacer20 />
          {/* Product Table */}

          <View
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4 }}
          >
            <View
              style={{
                flexDirection: "row",
                padding: 8,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: Colors.colors.text,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Product Name
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: Colors.colors.text,
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                Amount
              </Text>
            </View>
            {/* Example row */}

            {dataProducts.map((item, index) => (
              <>
                <Pressable
                  onPress={() => {
                    setShow(true);
                    setSelectedProduct(index);
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: 8,
                      borderTopWidth: 1,
                      borderTopColor: "#ccc",
                    }}
                  >
                    <Text style={{ flex: 1, textAlign: "left" }}>
                      {item?.name}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ textAlign: "right" }}>
                        {(Number(item?.price) * Number(item?.quantity)).toFixed(
                          2
                        )}
                      </Text>
                      <Text
                        style={{
                          textAlign: "right",
                          color: Colors.colors.border,
                        }}
                      >
                        {item?.quantity} x {Number(item?.price).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                <Divider />
              </>
            ))}
          </View>
          <View
            style={{
              flexDirection: "row",
              padding: 8,
            }}
          >
            <Text
              style={{
                flex: 1,
                color: Colors.colors.text,
                fontWeight: "bold",
                textAlign: "left",
              }}
            >
              Total Items
            </Text>
            <Text
              style={{
                flex: 1,
                color: Colors.colors.text,
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              {dataProducts.length}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Discount
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, discount: text };
              });
            }}
            value={formData.discount}
            placeholder="Enter discount"
          />

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Shipping Cost
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, shipping_cost: text };
              });
            }}
            value={formData.shipping_cost}
            placeholder="Enter shipping cost"
          />

          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
              color: Colors.colors.text,
            }}
          >
            Note
          </Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Enter note"
            multiline
            onChangeText={(text) => {
              setFormData((prevState) => {
                return { ...prevState, note: text };
              });
            }}
            value={formData.note}
          />
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
              {dataProducts
                .reduce(
                  (acc, item) =>
                    acc + Number(item.price) * Number(item.quantity),
                  0
                )
                .toFixed(2)}
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
              {dataProducts
                .reduce((acc, item) => acc + Number(item.discount), 0)
                .toFixed(2)}
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
              {dataProducts
                .reduce(
                  (acc, item) =>
                    acc + Number(item.price) * Number(item.quantity),
                  0
                )
                .toFixed(2)}
            </Text>
          </View>

          <Spacer20 />
          <Button
            mode="contained"
            onPress={formSubmit}
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
              Save Purchese
            </Text>
          </Button>
        </View>

        <Spacer20 />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={show}
        onRequestClose={() => {
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
                    fontSize: 16,
                    fontWeight: "bold",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    flex: 1,
                    color: Colors.colors.text,
                  }}
                >
                  Product Information
                </Text>
                <Pressable
                  onPress={() => {
                    setShow(false);
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
                Product Name:
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                onChangeText={(text) => {
                  setProducts((prevProducts) =>
                    prevProducts.map((product, index) =>
                      index === selectedProduct
                        ? { ...product, name: text }
                        : product
                    )
                  );
                }}
                value={dataProducts[selectedProduct]?.name}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  marginTop: 16,
                  color: Colors.colors.text,
                }}
              >
                Product Price:
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                onChangeText={(text) => {
                  setProducts((prevProducts) =>
                    prevProducts.map((product, index) =>
                      index === selectedProduct
                        ? { ...product, price: text }
                        : product
                    )
                  );
                }}
                value={dataProducts[selectedProduct]?.price}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  marginTop: 16,
                  color: Colors.colors.text,
                }}
              >
                Product Quantity:
              </Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                onChangeText={(text) => {
                  setProducts((prevProducts) =>
                    prevProducts.map((product, index) =>
                      index === selectedProduct
                        ? { ...product, quantity: text }
                        : product
                    )
                  );
                }}
                value={dataProducts[selectedProduct]?.quantity}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  marginTop: 16,
                  color: Colors.colors.text,
                }}
              >
                Discount
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0.0"
                onChangeText={(text) => {
                  setProducts((prevProducts) =>
                    prevProducts.map((product, index) =>
                      index === selectedProduct
                        ? { ...product, discount: text }
                        : product
                    )
                  );
                }}
                value={dataProducts[selectedProduct]?.discount}
              />
              <Spacer20 />
              <Button
                mode="contained"
                onPress={() => {
                  setShow(false);
                }}
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
                  Save
                </Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showProducts}
        onRequestClose={() => setShowProducts(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.dismissArea}
            onPress={() => setShowProducts(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
              <Pressable onPress={() => setShowProducts(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <Searchbar
              style={[
                styles.searchInput,
                {
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#Cecece",
                },
              ]}
              placeholder="Search by product name or code"
              placeholderTextColor="#000"
              selectionColor="lightgrey"
              onChangeText={(text) => {
                setSearchText(text);
                setAllProduct(
                  products.filter(
                    (item: any) =>
                      item.name.toLowerCase().includes(text.toLowerCase()) ||
                      item.code.includes(text)
                  )
                );
                // setHSCodes(
                //   hscodes.filter(
                //     (item: any) =>
                //       item.description
                //         .toLowerCase()
                //         .includes(text.toLowerCase()) ||
                //       item.hs_code.includes(text)
                //   )
                // );
              }}
              value={searchText}
            />

            {allProduct.length > 0 ? (
              <FlatList
                data={allProduct}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No product found</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditPurcheses;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%", // Takes up to 80% of screen height
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    color: Colors.colors.text,
  },
  dismissArea: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 10,
  },
  noResults: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    color: "#888",
    fontSize: 16,
  },
});
