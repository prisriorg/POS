import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import {
  AntDesign,
  Feather,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { MenuItem } from "./menu/items";
import { useColorScheme } from "../hooks/useColorScheme.web";

export function CustomDrawerContent(props: any) {
  const router = useRouter();
  const theme = useColorScheme();
  const [peopleOpen, setPeopleOpen] = useState(false);

  const togglePeople = () => {
    setPeopleOpen(!peopleOpen);
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Header Close */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 5,
            top: 6,
            // borderWidth: 1,
            // padding: 2,
          }}
          onPress={() => props.navigation.closeDrawer()}
        >
          <AntDesign name="close" size={30} />
        </TouchableOpacity>
      </View>

      {/* Drawer Items */}
      <View style={styles.drawerItems}>
        {/* Home Item */}
        <MenuItem
          onPress={() => {
            router.push("/(drawer)/(tabs)");
          }}
          title="Dashboard"
          icon={<AntDesign name="appstore-o" size={24}/>}
        />
        <MenuItem
          onPress={() => {
            router.push("/(drawer)/products-inventory");
          }}
          title="Products & Inventory"
          icon={<Feather name="box" size={24}/>}
        />

        <MenuItem
          onPress={() => {
            router.push("/(drawer)/purchases");
          }}
          title="Purchases"
          icon={<AntDesign name="creditcard" size={24} color="black" />}
        />

        <MenuItem
          onPress={() => {
            router.push("/(drawer)/sales");
          }}
          title="Sales"
          icon={<AntDesign name="shoppingcart" size={24} />}
        />
        <MenuItem
          onPress={() => {
            router.push("/(drawer)/expenses");
          }}
          title="Expenses"
          icon={<AntDesign name="wallet" size={24} color="black" />}
        />

        <MenuItem
          onPress={togglePeople}
          title="People"
          open={peopleOpen}
          icon={<SimpleLineIcons name="user" size={24} color="black" />}
          lastIcon={true}
        />

        {peopleOpen && (
          <View style={styles.submenuContainer}>
            <MenuItem
              onPress={() => {
                router.push("/(drawer)/users");
              }}
              title="All Users"
              icon={<Ionicons name="people-outline" size={24} color="black" />}
            />
            <MenuItem
              onPress={() => {
                router.push("/(drawer)/customers");
              }}
              title="All Customers"
              icon={<Feather name="user-plus" size={24} color="black" />}
            />
          </View>
        )}

        <MenuItem
          onPress={() => {
            // router.push("/(drawer)/expenses");
            // router.push("/(drawer)/details-sales");
          }}
          title="Reports"
          icon={
            <Ionicons name="document-text-outline" size={24} color="black" />
          }
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    padding: 16,
    marginBottom: 8,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  drawerItems: {
    marginTop: 8,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  drawerItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
  arrowIcon: {
    marginLeft: "auto",
  },
  submenuContainer: {
    paddingLeft: "20%",
  },
  submenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  submenuText: {
    fontSize: 14,
    color: "#555",
  },
});
