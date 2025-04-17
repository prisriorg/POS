import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
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
            borderWidth: 1,
            padding: 2,
          }}
          onPress={() => props.navigation.closeDrawer()}
        >
          <AntDesign name="close" size={24} />
        </TouchableOpacity>
      </View>

      {/* Drawer Items */}
      <View style={styles.drawerItems}>
        {/* Home Item */}

        <MenuItem
          onPress={() => {
            router.push("/(drawer)/products-inventory");
          }}
          title="Products & Inventory"
        />

        <MenuItem
          onPress={() => {
            router.push("/(drawer)/purchases");
          }}
          title="Purchases"
        />

        <MenuItem onPress={() => {
          router.push("/(drawer)/sales");
        }} title="Sales" />

        <MenuItem onPress={togglePeople} title="People" open={peopleOpen} />

        {peopleOpen && (
          <View style={styles.submenuContainer}>
            <MenuItem onPress={() => {
              router.push("/(drawer)/users");
            }} title="All Users" />
            <MenuItem onPress={() => {
              router.push("/(drawer)/customers");
            }} title="All Customers" />
          </View>
        )}

        <MenuItem
          onPress={() => {
            router.push("/(drawer)/expenses");
          }}
          title="Reports"
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
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
