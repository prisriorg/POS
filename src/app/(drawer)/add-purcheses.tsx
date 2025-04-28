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
import React, { useEffect } from "react";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
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

const AddPurcheses = () => {
  const router = useRouter();
  const [date, setDate] = React.useState(new Date());
  const [show, setShow] = React.useState(false);
  const [showProducts, setShowProducts] = React.useState(false);
  const [formData, setFormData] = React.useState({
    warehouse_id: 1,
    expense_category_id: 1,
    supplier_id: 1,
    purchase_status: 1,
    full_name: "",
    curency_id: 1,
    exchange_rate: "1",
    amount: "1",
    discount: "0",
    shipping_cost: "0",
    note: "",
    product: [],
    date: new Date().toISOString().split("T")[0], // Default date
    time: `${new Date().getHours()}:${new Date().getMinutes()}`, // Default time
  });
  const [searchText, setSearchText] = React.useState("");

  const visualFeedback = useVisualFeedback();
  const { user, domain } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { warehouses, currencies, products } = useAppSelector(
    (state) => state.home
  );

  const [allProduct, setAllProduct] = React.useState(products);

  useEffect(() => {
    setAllProduct(products);
  }, [products]);

  // Handle date change
  const onDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setDate(selectedDate);
      setFormData((prevState) => ({
        ...prevState,
        date: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  // Handle time change
  const onTimeChange = (event: any, selectedTime: any) => {
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      setFormData((prevState) => ({
        ...prevState,
        time: formattedTime,
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

  // Show time picker
  const showTimepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onTimeChange,
      mode: "time",
      is24Hour: true,
    });
  };

  // product item renderer
  const renderProductItem = ({ item }: any) => {
    return (
      <Pressable
        onPress={() => {
          setShowProducts(false);
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

      const apiUrl = `${BASE_URL}save/purchase?user_id=${user.id}&tenant_id=${domain}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        alert("Expense added successfully");
        visualFeedback.hideLoadingBackdrop();
        router.replace("/(drawer)/expenses");
      } else if (data.status === "error") {
        alert(data.message);
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
          title: "Add New Purchase",
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
              value={formData.date}
            />
          </Pressable>

          {/* Time Picker */}
          {/* <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              marginTop: 16,
            }}
          >
            Time
          </Text>
          <Pressable onPress={showTimepicker}>
            <TextInput
              style={styles.input}
              placeholder="Select time"
              editable={false}
              value={formData.time}
            />
          </Pressable> */}

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
            value={formData.expense_category_id}
            labelField="label"
            valueField="value"
            onChange={(item) => {
              setFormData((prevState) => {
                return { ...prevState, expense_category_id: item.value };
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
                value={formData.curency_id}
                labelField="label"
                valueField="value"
                onChange={(item) => {
                  setFormData((prevState) => {
                    return { ...prevState, curency_id: item.value };
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
                style={styles.input}
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
            }}
            labelStyle={{ color: "white",}}
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
                backgroundColor: "#ccc",
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

            <Pressable
              onPress={() => {
                setShow(true);
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                }}
              >
                <Text style={{ flex: 1, textAlign: "left" }}>
                  Example Product
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ textAlign: "right" }}>$100.00</Text>
                  <Text
                    style={{ textAlign: "right", color: Colors.colors.border }}
                  >
                    34567
                  </Text>
                </View>
              </View>
            </Pressable>
            <Divider />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#ccc",
              }}
            >
              <Text style={{ flex: 1, textAlign: "left" }}>
                Example Product
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ textAlign: "right" }}>$100.00</Text>
                <Text
                  style={{ textAlign: "right", color: Colors.colors.border }}
                >
                  34567
                </Text>
              </View>
            </View>
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
              5
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
            <Text style={{ flex: 1, textAlign: "right" }}>$100.00</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 8,
            }}
          >
            <Text style={{ flex: 1, textAlign: "left" }}>Discount</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>$10.00</Text>
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
              $10.00
            </Text>
          </View>
          {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 8,
              paddingTop: 4,
            }}
          >
            <Text style={{ flex: 1, textAlign: "left" }}>Change</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>$10.00</Text>
          </View> */}

          <Spacer20 />
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
              Add Purchese
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
                placeholder="Cerevita Choco Malt"
                onChangeText={(text) => {
                  setFormData((prevState) => {
                    return { ...prevState, full_name: text };
                  });
                }}
                value={formData.full_name}
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
                  setFormData((prevState) => {
                    return { ...prevState, full_name: text };
                  });
                }}
                value={formData.full_name}
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
                  setFormData((prevState) => {
                    return { ...prevState, full_name: text };
                  });
                }}
                value={formData.full_name}
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
                  setFormData((prevState) => {
                    return { ...prevState, full_name: text };
                  });
                }}
                value={formData.full_name}
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

export default AddPurcheses;

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
