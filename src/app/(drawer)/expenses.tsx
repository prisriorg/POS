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
import React from "react";
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
import { expenseCat } from "@/src/utils/GetData";
import { Colors } from "@/src/constants/Colors";
import { Dropdown } from "react-native-element-dropdown";

interface Expense {
  id: number;
  reference_no: string;
  receipt_no: string;
  amount: number;
  created_at: string;
  updated_at: string;
  note: string;
  company: string;
  currency: string;
  expense_category_id: number;
  account_id: number;
  user_id: number;
  warehouse_id: number;
  cash_register_id: number;
  tax_no: number;
  vat: number;
  vat_number: number;
}

const Expenses = () => {
  const router = useRouter();
  const [showFilter, setShowFilter] = React.useState(false);
  const { expenses, warehouses } = useAppSelector((state) => state.home);
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
    setFilteredExpenses(expenses);
  }, [expenses]);

  const applyFilters = () => {
    let filtered = expenses;

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
      <View style={styles.card}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 5,
          }}
        >
          <Text style={styles.referenceNo}>
            Ref No:{" "}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "400",
                color: "#333",
              }}
            >
              {item.reference_no}{" "}
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
                console.log("Details", item.id);
                setOpenMenuId(null);
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
            paddingTop: 5,
          }}
        >
          <View style={styles.row}>
            <Text style={styles.label}>Company:</Text>
            <Text style={styles.value}>{item?.company}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>
              {item.amount.toFixed(2)} {item.currency}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>
              {item.expense_category_id === 1 ? "test (30259306)" : ""}
            </Text>
          </View>
          <Spacer10 />
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
            paddingVertical: 15,
            paddingHorizontal: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Searchbar
              placeholder="Search expenses..."
              onChangeText={(val) => {
                setSearchQuery(val);
                const filtered = expenses.filter((product: any) =>
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
              inputStyle={{ color: "black", fontSize: 14, paddingBottom: 5 }}
              selectionColor={"black"}
              iconColor="black"
              placeholderTextColor="black"
              icon={() => <AntDesign name="search1" size={18} color="black" />}
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
              <Text style={styles.modalTitle}>Filter Products</Text>
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
            <Text style={styles.filterTitle}>Date</Text>
            <TextInput
              placeholder="Choose Date"
              onChangeText={(text) => {
                setFilter((prev) => ({
                  ...prev,
                  date: text,
                }));
              }}
              selectionColor={"black"}
              placeholderTextColor="#ddd"
              editable={false}
              style={{
                borderRadius: 8,
                padding: 10,
                width: "100%",
                color: "black",
                borderWidth: 1,
                borderColor: "#bbb",
              }}
            />
            <Spacer20 />
            <Text style={styles.filterTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {expenseCat.map((brand: any) => (
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
                          filter.category === brand.value ? "#fff" : "#666565",
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
                borderWidth: 1,
                borderColor: "#bbb",
                borderRadius: 8,
                padding: 10,
                width: "100%",
                marginBottom: 10,
              }}
              placeholderStyle={{
                color: "#ddd",
                fontSize: 14,
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

export default Expenses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 8,
    shadowRadius: 1,
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
    fontSize: 18,
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
    borderColor: "#bbb",
    height: 53,

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
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: Colors.colors.text,
  },
  black: {
    color: Colors.colors.text,
  },
});
