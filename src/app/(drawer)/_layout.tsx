import { CustomDrawerContent } from "@/src/components/CustomDrawerContent";
import { Colors } from "@/src/constants/Colors";
import { FontAwesome6 } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Pressable } from "react-native";

export default function TabsLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerType: "front",
        drawerStyle: {
          width: "70%",
          marginRight: 20,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          backgroundColor: Colors.colors.background,
        },
        headerStyle: {
          backgroundColor: Colors.colors.primary,
        },
        headerTitleAlign: "center",
        headerTintColor: Colors.colors.background,
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          color: "white",
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "",
        }}
      />

      <Drawer.Screen
        name="products-inventory"
        options={{
          title: "Products & Inventory",
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />

      <Drawer.Screen
        name="add-products"
        options={{
          title: "Add Products",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="expenses"
        options={{
          title: "All Expenses",
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="add-expenses"
        options={{
          title: "Add Expenses",
          headerShown: true,
        }}
      />

      <Drawer.Screen
        name="purchases"
        options={{
          title: "All Purchases",
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />

      <Drawer.Screen
        name="add-purchases"
        options={{
          title: "Add Purchases",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="sales"
        options={{
          title: "All Sales",
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />

      <Drawer.Screen
        name="add-sales"
        options={{
          title: "Add Sales",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="customers"
        options={{
          title: "All Customers",
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="add-customers"
        options={{
          title: "Add Customers",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="users"
        options={{
          title: "All Users",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="add-users"
        options={{
          title: "Add Users",
          headerShown: true,
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="pos"
        options={{
          title: "About",
          headerShown: true,
          
          headerTitleAlign: "center",
        }}
      />
    </Drawer>
  );
}
