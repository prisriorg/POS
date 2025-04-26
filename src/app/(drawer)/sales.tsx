import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import { useRouter } from "expo-router";
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  Searchbar,
} from "react-native-paper";
import { useAppSelector } from "@/src/store/reduxHook";
import {
  expenseCat,
  paymentStatusSales,
  purchaseStatus,
  salesPayemnt,
  salesStatus,
} from "@/src/utils/GetData";
import { Colors } from "@/src/constants/Colors";
import { Dropdown } from "react-native-element-dropdown";

interface Expense {
  biller_id: number;
  cash_register_id: number | null;
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
  order_discount: number;
  order_discount_type: string;
  order_discount_value: number | null;
  order_tax: number;
  order_tax_rate: number;
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
  updated_at: string;
  user_id: number;
  validation_error_codes: string | null;
  warehouse_id: number;
}

const AllSales = () => {
  const router = useRouter();
  const [showFilter, setShowFilter] = React.useState(false);
  const { sales, warehouses, currencies } = useAppSelector(
    (state) => state.home
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredExpenses, setFilteredExpenses] = React.useState<Expense[]>([]);

  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);
  const [filter, setFilter] = React.useState<{
    category: string;
    date: string;
    warehoues: string;
  }>({
    category: "",
    date: "",
    warehoues: "",
  });

  React.useEffect(() => {
    setFilteredExpenses(sales);
  }, [sales]);

  const applyFilters = () => {
    let filtered = sales;

    if (filter.category) {
      const category = expenseCat.find(
        (cat: any) => cat.name === filter.category
      )?.id;
      if (category) {
        filtered = filtered.filter(
          (product: any) => product.category_id === category
        );
      }
    }

    // if (filter.date) {
    //   const date = new Date(filter.date).toISOString().split("T")[0];
    //   filtered = filtered.filter((product: any) =>
    //     product.created_at.startsWith(date)
    //   );
    // }

    if (filter.warehoues) {
      filtered = filtered.filter(
        (product: any) => product.warehouse_id === filter.warehoues
      );
    }

    setFilteredExpenses(filtered);
    setShowFilter(false);
  };
  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const isMenuOpen = openMenuId === item.id;
    return (
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/(drawer)/details-sales",
            params: { id: item.id },
          });
        }}
      >
        <View style={styles.card}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 8,
            }}
          >
            <Text style={styles.referenceNo}>
              {" "}
              Ref No:{" "}
              <Text
                style={{
                  fontWeight: "400",
                }}
              >
                {item.reference_no}
              </Text>
            </Text>
            <Menu
              visible={isMenuOpen}
              onDismiss={() => setOpenMenuId(null)}
              anchor={
                <Pressable onPress={() => setOpenMenuId(item.id)}>
                  <MaterialCommunityIcons
                    name="dots-horizontal"
                    size={24}
                    color="black"
                  />
                </Pressable>
              }
            >
              <Menu.Item
                onPress={() => {
                  console.log("Edit item", item.id);
                  setOpenMenuId(null);
                }}
                title="Edit"
                leadingIcon={(prms) => (
                  <MaterialIcons name="edit" size={20} color={prms.color} />
                )}
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  // router.push({
                  //   pathname: "/(drawer)/details-sales",
                  //   params: { id: item.id },
                  // });
                }}
                title="Details"
                leadingIcon={(prms) => (
                  <MaterialIcons name="info" size={20} color={prms.color} />
                )}
              />
            </Menu>
          </View>
          <Divider />
          <View
            style={{
              paddingTop: 8,
            }}
          >
            <View style={styles.row}>
              <Text style={styles.label}>Grand Total:</Text>
              <Text style={styles.value}>{item.grand_total || "NA"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Amount Paid:</Text>
              <Text style={styles.value}>{item.paid_amount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Amount Due:</Text>
              <Text style={styles.value}>
                {(item.grand_total - item.paid_amount).toFixed(2) || "NA"}
              </Text>
            </View>
            <Spacer10 />
            <View style={styles.row}>
              <View
                style={[
                  styles.row,
                  {
                    gap: 10,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      backgroundColor:
                        item.sale_status === 1 ? "#4CAF50" : "#FF9800",
                      padding: 4,
                      borderRadius: 20,
                      color: "white",
                      paddingHorizontal: 10,
                    },
                  ]}
                >
                  {
                    salesPayemnt.find((cat) => item.sale_status === cat.id)
                      ?.label
                  }
                </Text>
                <Text
                  style={[
                    styles.badgeText,
                    {
                      backgroundColor:
                        item.payment_status === 1 ? "#DE3163" : "#4CAF50",
                      padding: 4,
                      borderRadius: 20,
                      color: "white",
                      paddingHorizontal: 10,
                    },
                  ]}
                >
                  {item.payment_status === 1 ? "Due" : "Paid"}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  textAlign: "right",
                }}
              >
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const ddd = {
    biller_id: 3,
    cash_register_id: 14,
    coupon_discount: null,
    coupon_id: null,
    created_at: "2025-04-23 06:51:00",
    currency_id: 1,
    customer_id: 3,
    data: null,
    device_signature: null,
    document: null,
    exchange_rate: 1,
    fdms_signature: null,
    fiscal_day_no: null,
    global_no: null,
    grand_total: 3.5,
    hash: null,
    id: 403,
    item: 1,
    order_discount: 0,
    order_discount_type: "Flat",
    order_discount_value: null,
    order_tax: 0,
    order_tax_rate: 0,
    paid_amount: 3.5,
    payment_status: 4,
    posted: null,
    prev_hash: null,
    queue: null,
    receipt_no: null,
    reference_no: "posr-1745383925.2682-yP",
    sale_note: "polikjhgbvc",
    sale_status: 1,
    shipping_cost: 0,
    staff_note: null,
    table_id: null,
    thumbprint: null,
    total_discount: 0,
    total_price: 3.5,
    total_qty: 1,
    total_tax: 0,
    updated_at: "2025-04-23 06:52:05",
    user_id: 1,
    validation_error_codes: null,
    warehouse_id: 1,
  };
  return (
    <View style={styles.container}>
      <ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            gap: 10,
            alignItems: "center",
            padding: 10,
          }}
        >
          <Searchbar
            placeholder="Enter reference number."
            onChangeText={(val) => {
              setSearchQuery(val);
              const filtered = sales.filter((product: any) =>
                product.reference_no.toLowerCase().includes(val.toLowerCase())
              );
              setFilteredExpenses(filtered);
            }}
            value={searchQuery}
            style={{
              width: "100%",
              height: 53,
              backgroundColor: "#fff",

              borderWidth: 1,
              borderColor: "#bbb",
              color: "#000",
            }}
            inputStyle={{ color: "black" }}
            selectionColor={"black"}
            iconColor="black"
            placeholderTextColor="black"
            icon={() => <AntDesign name="search1" size={20} color="black" />}
            right={() => (
              <SimpleLineIcons
                name="equalizer"
                size={20}
                onPress={() => {
                  setShowFilter(true);
                }}
                iconColor="black"
                style={{ marginRight: 15, transform: [{ rotate: "90deg" }] }}
              />
            )}
          />
        </View>

        {/* <View
            style={{
              width: 50,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.colors.primary,

              borderRadius: "50%",
            }}
          >
            <Pressable
              onPress={() => {
                router.push("/(drawer)/add-expenses");
              }}
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="add" size={24} color={"white"} />
            </Pressable>
          </View> */}
        <Spacer20 />
        {filteredExpenses.length > 0 ? (
          <FlatList
            data={filteredExpenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id.toString()}
            style={{
              flex: 1,
              paddingHorizontal: 5,
            }}
          />
        ) : (
          <Text
            style={{
              textAlign: "center",
              fontSize: 20,
              marginTop: 20,
              color: "#000",
            }}
          >
            No Expense found
          </Text>
        )}
        <Spacer20 />
        <Spacer20 />
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilter}
        onRequestClose={() => setShowFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.dismissArea}
            onPress={() => setShowFilter(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Sales</Text>
              <Pressable
                onPress={() => {
                  setFilter({
                    category: "",
                    date: "",
                    warehoues: "",
                  });
                }}
              >
                <Text style={{ fontSize: 18, color: "#9F9494" }}>Clear</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.filterContainer}>
            <ScrollView>
              <Text style={styles.filterTitle}>Sale Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {salesStatus.map((brand: any) => (
                    <Chip
                      key={brand.id}
                      onPress={() => {
                        setFilter((prev) => ({
                          ...prev,
                          category: brand.value,
                        }));
                      }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            filter.category === brand.value
                              ? Colors.colors.primary
                              : "#dedede",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            filter.category === brand.value
                              ? "#fff"
                              : "#666565",
                        }}
                      >
                        {brand.label}
                      </Text>
                    </Chip>
                  ))}
                </View>
              </ScrollView>
              <Spacer20 />
              <Text style={styles.filterTitle}>Payment Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {paymentStatusSales.map((brand: any) => (
                    <Chip
                      key={brand.id}
                      onPress={() => {
                        setFilter((prev) => ({
                          ...prev,
                          category: brand.value,
                        }));
                      }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            filter.category === brand.value
                              ? Colors.colors.primary
                              : "#dedede",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            filter.category === brand.value
                              ? "#fff"
                              : "#666565",
                        }}
                      >
                        {brand.label}
                      </Text>
                    </Chip>
                  ))}
                </View>
              </ScrollView>
              <Spacer20 />
              <Text style={styles.filterTitle}>Warehouse</Text>
              <Dropdown
                data={warehouses}
                labelField="name"
                valueField="id"
                value={filter.warehoues}
                placeholder="Select Warehouse"
                onChange={(item) => {
                  setFilter((prev) => ({
                    ...prev,
                    warehoues: item.id,
                  }));
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#bbb",
                  borderRadius: 8,
                  padding: 10,
                  width: "100%",
                  marginBottom: 10,
                }}
              ></Dropdown>

              <Text style={styles.filterTitle}>Branch</Text>
              <Dropdown
                data={warehouses}
                labelField="name"
                valueField="id"
                value={filter.warehoues}
                placeholder="Select Branch"
                onChange={(item) => {
                  setFilter((prev) => ({
                    ...prev,
                    warehoues: item.id,
                  }));
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#bbb",
                  borderRadius: 8,
                  padding: 10,
                  width: "100%",
                  marginBottom: 10,
                }}
              ></Dropdown>
              <Text style={styles.filterTitle}>Currency</Text>
              <Dropdown
                data={currencies}
                labelField="name"
                valueField="id"
                value={filter.warehoues}
                placeholder="Select Currency"
                onChange={(item) => {
                  setFilter((prev) => ({
                    ...prev,
                    warehoues: item.id,
                  }));
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#bbb",
                  borderRadius: 8,
                  padding: 10,
                  width: "100%",
                  marginBottom: 10,
                }}
              ></Dropdown>
              <Text style={styles.filterTitle}>Date</Text>
              <Dropdown
                data={warehouses}
                labelField="name"
                valueField="id"
                value={filter.warehoues}
                placeholder="12/3/2023"
                onChange={(item) => {
                  setFilter((prev) => ({
                    ...prev,
                    warehoues: item.id,
                  }));
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#bbb",
                  borderRadius: 8,
                  padding: 10,
                  width: "100%",
                  marginBottom: 10,
                }}
              ></Dropdown>
              <Spacer20 />
              <Button
                mode="contained"
                onPress={() => {
                  console.log("Apply Filters", filter);
                  applyFilters();
                  setShowFilter(false);
                }}
                style={styles.sortContainer}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                  }}
                >
                  Apply Filters
                </Text>
              </Button>
              <Spacer20 />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AllSales;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    marginHorizontal: 10,
    padding: 10,
    shadowRadius: 1,
    marginBottom: 10,
    borderColor: "#bbb",
    borderWidth: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  referenceNo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },

  filterTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.colors.text,
  },
  chipContainer: {
    flex: 1,
    flexDirection: "row",
  },
  chip: {
    fontWeight: "400",
    marginRight: 8,
    borderRadius: 20,
  },
  sortContainer: {
    backgroundColor: Colors.colors.primary,
    marginBottom: 10,
    color: "white",
  },
  sortButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sortButton: {
    marginRight: 8,
    marginBottom: 8,
  },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  searchBar: {
    padding: 0,
    elevation: 2,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#bbb",
    color: "#000",
  },
  filterContainer: {
    paddingHorizontal: 20,
    backgroundColor: "white",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: "80%",
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
    fontWeight: "bold",
    color: Colors.colors.text,
    textAlign: "center",
  },
  black: {
    color: Colors.colors.text,
  },
});
