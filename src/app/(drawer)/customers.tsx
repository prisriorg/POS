import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React from "react";
import { Colors } from "@/src/constants/Colors";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import {
  Button,
  Divider,
  IconButton,
  Menu,
  Searchbar,
} from "react-native-paper";
import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import { useAppSelector } from "@/src/store/reduxHook";
import { customerGroup } from "@/src/utils/GetData";

interface Customer {
  address: string;
  city: string;
  company_name: string | null;
  country: string;
  created_at: string;
  customer_group_id: number;
  deposit: number | null;
  email: string | null;
  expense: number | null;
  id: number;
  is_active: number;
  name: string;
  phone_number: string;
  points: number | null;
  postal_code: string | null;
  state: string | null;
  tax_no: string | null;
  updated_at: string;
  user_id: number | null;
}

const AllCustomers = () => {
  const router = useRouter();
  const { warehouses, customers } = useAppSelector((state) => state.home);

  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [showFilter, setShowFilter] = React.useState(false);
  const [filteredCustomers, setFilteredCustomers] = React.useState<Customer[]>(
    []
  );
  const [filter, setFilter] = React.useState({
    category: "",
    date: "",
    warehoues: "",
  });

  React.useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  const renderExpenseItem = ({ item }: { item: Users }) => {
    const isMenuOpen = openMenuId === item.id;
    return (
      <Pressable
        onPress={() => {
          router.push(`/(drawer)/edit-customers?id=${item.id}`);
        }}
      >
        <View style={styles.card}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 6,
            }}
          >
            <Text style={styles.referenceNo}>{item.name}</Text>
            <Menu
              style={{
                backgroundColor: "#fff",
                
              }}
            
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
                style={{
                  backgroundColor: "#fff",
                }}
                onPress={() => {
                  router.push(`/(drawer)/edit-customers?id=${item.id}`);
                  setOpenMenuId(null);
                }}
                title="Edit Customer"
                leadingIcon={(prms) => (
                  <MaterialIcons name="edit" size={22} color={prms.color} />
                )}
              />
              <Divider />
              <Menu.Item
                style={{
                  backgroundColor: "#fff",
                }}
                onPress={() => {
                  router.push(`/(drawer)/add-deposit?id=${item.id}`);
                  setOpenMenuId(null);
                }}
                title="Add Deposit"
                leadingIcon={(prms) => (
                  <AntDesign name="plus" size={22} color={prms.color} />
                )}
              />
              <Divider />
              <Menu.Item
                style={{
                  backgroundColor: "#fff",
                }}
                onPress={() => {
                  router.push(`/(drawer)/view-deposit?id=${item.id}`);
                  setOpenMenuId(null);
                }}
                title="View Deposit"
                leadingIcon={(prms) => (
                  <FontAwesome name="money" size={22} color={prms.color} />
                )}
              />
            </Menu>
          </View>
          <Divider />
          <View
            style={{
              paddingTop: 6,
            }}
          >
            <View style={styles.row}>
              <Text style={styles.label}>Group</Text>
              <Text style={styles.value}>
                {
                  customerGroup.find(
                    (cust) => item.customer_group_id === cust.id
                  )?.label
                }
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Company</Text>
              <Text style={styles.value}>{item.company_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>{item.phone_number}</Text>
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
                        item.is_active === 1 ? "#4CAF50" : "#F44336",
                      padding: 4,
                      borderRadius: 20,
                      color: "white",
                      paddingHorizontal: 12,
                    },
                  ]}
                >
                  {item.is_active === 1 ? "Active" : "Inactive"}
                </Text>
              </View>

              {/* <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  textAlign: "right",
                  marginBottom: 6,
                }}
              >
                {new Date(item.created_at).toLocaleDateString()}
              </Text> */}
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
              placeholder="Search customer..."
              onChangeText={(val) => {
                setSearchQuery(val);
                const filtered = customers.filter((product: any) =>
                  product.reference_no.toLowerCase().includes(val.toLowerCase())
                );
                setFilteredCustomers(filtered);
              }}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={{ color: "black", paddingBottom: 10 }}
              selectionColor={"black"}
              iconColor="black"
              placeholderTextColor="black"
              icon={() => <AntDesign name="search1" size={20} color="black" />}
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
                router.push("/(drawer)/add-customers");
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
        <Spacer10 />
        {filteredCustomers.length > 0 ? (
          <FlatList
            data={filteredCustomers}
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
    </View>
  );
};

export default AllCustomers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 10,
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
    height: 50,
    elevation: 2,
    backgroundColor: "white",
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
