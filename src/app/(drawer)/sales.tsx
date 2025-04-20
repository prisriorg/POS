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

const AllSales = () => {
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
          }}
        >
          <Text style={styles.referenceNo}>{item.reference_no}</Text>
          <Menu
            visible={isMenuOpen}
            onDismiss={() => setOpenMenuId(null)}
            anchor={
              <Pressable onPress={() => setOpenMenuId(item.id)}>
                <MaterialCommunityIcons
                  name="dots-vertical"
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
        <Spacer10 />
        <Divider />
        <Spacer10 />
        <View>
          <View style={styles.row}>
            <Text style={styles.label}>Company:</Text>
            <Text style={styles.value}>{item.company || "NA"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>
              {item.amount.toFixed(2)} {item.currency}
            </Text>
          </View>
          <Spacer10 />
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              textAlign: "right",
              marginBottom: 6,
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
            padding: 10,
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
              style={styles.searchBar}
              inputStyle={{ color: "black" }}
              selectionColor={"black"}
              iconColor="black"
              placeholderTextColor="black"
              icon={() => <AntDesign name="search1" size={20} color="black" />}
              right={() => (
                <IconButton
                  icon="filter"
                  size={20}
                  onPress={() => {
                    setShowFilter(true);
                  }}
                  iconColor="black"
                  style={{ marginRight: 10 }}
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
                <Text style={{ fontSize: 18, color: "#65558F" }}>Clear</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Date</Text>
            <TextInput
              placeholder="Select Date"
              onChangeText={(text) => {
                setFilter((prev) => ({
                  ...prev,
                  date: text,
                }));
              }}
              selectionColor={"black"}
              placeholderTextColor="black"
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
                    mode="outlined"
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
                          filter.category === brand.value ? "#65558F" : "#fff",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          filter.category === brand.value ? "#fff" : "#000",
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
                backgroundColor: "#ECE6F0",
                borderRadius: 8,
                padding: 10,
                width: "100%",
                marginBottom: 10,
              }}
            ></Dropdown>
            <Spacer20 />
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

export default AllSales;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    marginHorizontal: 10,
    padding: 16,
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
    paddingBottom: 8,
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
    backgroundColor: "#65558F",
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
    backgroundColor: "#ECE6F0",
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
