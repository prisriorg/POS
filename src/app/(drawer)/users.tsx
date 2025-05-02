import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback } from "react";
import { Colors } from "@/src/constants/Colors";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import { Divider, Menu, Searchbar } from "react-native-paper";
import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { BASE_URL } from "@/src/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface Users {
  biller_id: number | null;
  company_name: string;
  created_at: string;
  email: string;
  id: number;
  name: string;
  phone: string;
  role_id: number;
  updated_at: string;
  warehouse_id: number | null;
}

const AllUsers = () => {
  const { warehouses, users, roles, billers } = useAppSelector(
    (state) => state.home
  );
  const { user, domain } = useAppSelector((state) => state.auth);
  const visualFeedback = useVisualFeedback();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredUsers, setFilteredUsers] = React.useState<Users[]>([]);

  React.useEffect(() => {
    setFilteredUsers(users);
    getAllUsers();
  }, [users]);

  // Use useFocusEffect to run getDetails every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      getAllUsers();
    }, [user?.id, domain])
  );

  const getAllUsers = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const users = await AsyncStorage.getItem("getAllUsers");
      if (users) {
        dispatch(setFilteredUsers(JSON.parse(users)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}users?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setFilteredUsers(result?.roles));
          await AsyncStorage.setItem(
            "getAllUsers",
            JSON.stringify(result?.roles)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const renderExpenseItem = ({ item }: { item: Users }) => {
    const isMenuOpen = openMenuId === item.id;
    return (
      <Pressable
        onPress={() => {
          router.push(`/(drawer)/edit-users?id=${item.id}`);
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
                  router.push(`/(drawer)/edit-users?id=${item.id}`);
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
            </Menu>
          </View>
          <Divider />
          <View
            style={{
              paddingTop: 6,
            }}
          >
            <View style={styles.row}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>
                {roles.find((role: any) => role.id === item.role_id)?.name}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Branch</Text>
              <Text style={styles.value}>
                {billers.find((ite: any) => ite.id === item.biller_id)?.name}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Warehouse</Text>
              <Text style={styles.value}>
                {
                  warehouses.find((ite: any) => ite.id === item.warehouse_id)
                    ?.name
                }
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
                      backgroundColor: "#4CAF50",
                      padding: 4,
                      borderRadius: 20,
                      color: "white",
                      paddingHorizontal: 12,
                    },
                  ]}
                >
                  Active
                </Text>
              </View>

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
              placeholder="Search users..."
              onChangeText={(val) => {
                setSearchQuery(val);
                const filtered = users.filter((product: Users) =>
                  product.name.toLowerCase().includes(val.toLowerCase())
                );
                setFilteredUsers(filtered);
              }}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={{ color: "black", paddingBottom: 8 }}
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
                router.push("/(drawer)/add-users");
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
        {filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id.toString()}
            style={{
              flex: 1,
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

export default AllUsers;

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
