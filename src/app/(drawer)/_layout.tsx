import { CustomDrawerContent } from "@/src/components/CustomDrawerContent";
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
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "",

          headerRight: (props) => (
            <Pressable
              onPress={() => {
                console.log("search");
              }}
            >
              <FontAwesome6
                name="circle-user"
                size={24}
                color={props.tintColor}
                style={{ marginRight: 10 }}
              />
            </Pressable>
          ),
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
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="add-users"
        options={{
          title: "Add Users",
          headerShown: true,
        }}
      />
    </Drawer>
  );
}
