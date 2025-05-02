import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { Colors } from "@/src/constants/Colors";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  Searchbar,
} from "react-native-paper";
import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import { useAppSelector } from "@/src/store/reduxHook";
import { paymentStatus, purchaseStatus, suppliers } from "@/src/utils/GetData";

interface Purchase {
  id: number;
  reference_no: string;
  created_at: string;
  grand_total: number;
  total_cost: number;
  payment_status: number;
  status: number;
  supplier_id: number;
  total_qty: number;
  note: string;
  currency_id: number;
  paid_amount: number;
  total_discount: number;
}

const AllPurchases = () => {
  const router = useRouter();
  const { warehouses, purchases } = useAppSelector((state) => state.home);

  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [showFilter, setShowFilter] = React.useState(false);
  const [filteredExpenses, setFilteredExpenses] = React.useState<Purchase[]>(
    []
  );
  const [filter, setFilter] = React.useState({
    paymentStatus: "",
    status: "",
    suppliers: "",
    warehoues: "",
  });
  const applyFilters = () => {
    let filtered = purchases;

    if (filter.warehoues) {
      filtered = filtered.filter(
        (product: any) => product.warehouse_id === filter.warehoues
      );
    }

    if (filter.suppliers) {
      filtered = filtered.filter(
        (product: any) => product.supplier_id === filter.suppliers
      );
    }

    if (filter.status) {
      filtered = filtered.filter(
        (product: any) => product.status === filter.status
      );
    }

    if (filter.paymentStatus) {
      filtered = filtered.filter(
        (product: any) => product.payment_status === filter.paymentStatus
      );
    }

    setFilteredExpenses(filtered);
    setShowFilter(false);
  };

  React.useEffect(() => {
    setFilteredExpenses(purchases);
  }, [purchases]);

  const renderExpenseItem = ({ item }: { item: Purchase }) => {
    const isMenuOpen = openMenuId === item.id;
    return (
      <Pressable
        onPress={() => {
          router.replace(`/(drawer)/view-purchases?id=${item.id}`);
        }}
      >
        <View style={styles.card}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Ref No:{" "}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "400",
                  color: "#333",
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
              style={{
                backgroundColor: "#fff",
              }}
            >
              <Menu.Item
                onPress={() => {
                  router.replace(`/(drawer)/edit-purcheses?id=${item.id}`);
                  setOpenMenuId(null);
                }}
                title="Edit"
                leadingIcon={(prms) => (
                  <MaterialIcons name="edit" size={20} color={prms.color} />
                )}
                style={{
                  backgroundColor: "#fff",
                }}
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  router.replace(`/(drawer)/add-payment?id=${item.id}`);
                  setOpenMenuId(null);
                }}
                style={{
                  backgroundColor: "#fff",
                }}
                title="Add Payment"
                leadingIcon={(prms) => (
                  <MaterialIcons name="edit" size={20} color={prms.color} />
                )}
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  router.replace(`/(drawer)/view-payment?id=${item.id}`);
                  setOpenMenuId(null);
                }}
                style={{
                  backgroundColor: "#fff",
                }}
                title="View Payment"
                leadingIcon={(prms) => (
                  <MaterialIcons name="edit" size={20} color={prms.color} />
                )}
              />
              <Divider />

              <Menu.Item
                onPress={() => {
                  router.replace(`/(drawer)/view-purchases?id=${item.id}`);
                  setOpenMenuId(null);
                }}
                style={{
                  backgroundColor: "#fff",
                }}
                title="Details"
                leadingIcon={(prms) => (
                  <MaterialIcons name="info" size={20} color={prms.color} />
                )}
              />
            </Menu>
          </View>
          <Spacer10 />
          <Divider />
          <Spacer10 />
          <View>
            <View style={styles.row}>
              <Text style={styles.label}>Grand Total</Text>
              <Text style={styles.value}>{item.grand_total}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Amount Paid</Text>
              <Text style={styles.value}>{item.paid_amount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Amount Due</Text>
              <Text style={styles.value}>
                {(item.grand_total - item.paid_amount).toFixed(2)}
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
                        item.status === 1 ? "#4CAF50" : "#FF9800",
                      padding: 4,
                      borderRadius: 20,
                      color: "white",
                      paddingHorizontal: 12,
                    },
                  ]}
                >
                  {purchaseStatus.find((cat) => item.status === cat.id)?.label}
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
                      paddingHorizontal: 12,
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
          <View style={{ flex: 1 }}>
            <Searchbar
              placeholder="Search purchases..."
              onChangeText={(val) => {
                setSearchQuery(val);
                const filtered = purchases.filter((product: any) =>
                  product.reference_no.toLowerCase().includes(val.toLowerCase())
                );
                setFilteredExpenses(filtered);
              }}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={{ color: "black" }}
              selectionColor={"black"}
              iconColor="black"
              placeholderTextColor="black"
              icon={() => <AntDesign name="search1" size={20} color="black" />}
              right={() => (
                <SimpleLineIcons
                  name="equalizer"
                  size={18}
                  onPress={() => {
                    setShowFilter(true);
                  }}
                  iconColor="black"
                  style={{ marginRight: 15, transform: [{ rotate: "90deg" }] }}
                />
              )}
            />
          </View>

          <View
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
                router.push("/(drawer)/add-purcheses");
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
          </View>
        </View>
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
              <Text style={styles.modalTitle}>Filter Purchese</Text>
              <Pressable
                onPress={() => {
                  setFilter({
                    paymentStatus: "",
                    status: "",
                    suppliers: "",
                    warehoues: "",
                  });
                }}
              >
                <Text style={{ fontSize: 18, color: "#0e0e0e" }}>Clear</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Purchase Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {purchaseStatus.map((brand: any) => (
                  <Chip
                    key={brand.id}
                    onPress={() => {
                      setFilter((prev) => ({
                        ...prev,
                        status: brand.value,
                      }));
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          filter.status === brand.value
                            ? Colors.colors.primary
                            : "#dedede",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: filter.status === brand.value ?  "#fff" : "#666565",
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
                {paymentStatus.map((brand: any) => (
                  <Chip
                    key={brand.id}
                    onPress={() => {
                      setFilter((prev) => ({
                        ...prev,
                        paymentStatus: brand.value,
                      }));
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          filter.paymentStatus === brand.value
                            ? Colors.colors.primary
                            : "#dedede",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          filter.paymentStatus === brand.value
                            ? "#fff" : "#666565",
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
                backgroundColor: "#fff",
                borderRadius: 8,
                padding: 10,
                width: "100%",
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#ccc",
              }}
            ></Dropdown>
            <Spacer20 />
            <Text style={styles.filterTitle}>Supplier</Text>
            <Dropdown
              data={suppliers}
              labelField="label"
              valueField="id"
              value={filter.suppliers}
              placeholder="Select Supplier"
              onChange={(item) => {
                setFilter((prev) => ({
                  ...prev,
                  suppliers: item.id,
                }));
              }}
              style={{
                backgroundColor: "#fff",
                borderRadius: 8,
                padding: 10,
                width: "100%",
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#ccc",
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
                  fontWeight: "bold",
                }}
              >
                Apply Filters
              </Text>
            </Button>
            <Spacer20 />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AllPurchases;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    marginHorizontal: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 12,
    shadowRadius: 1,
    borderColor: "#bbb",
    borderWidth: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  referenceNo: {
    fontSize: 16,
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
    marginBottom: 6,
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.colors.text,
  },
  chipContainer: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 5,
  },
  chip: {
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
    elevation: 2,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
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
    padding: 20,
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
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.colors.text,
  },
  black: {
    color: Colors.colors.text,
  },
});
