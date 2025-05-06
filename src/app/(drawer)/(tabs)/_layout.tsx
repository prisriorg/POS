import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/src/components/HapticTab";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { AntDesign, Feather, Fontisto, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import {
  setCategories,
  setProducts,
  setCustomers,
  setTaxes,
  setCurrencies,
  setAllUsers,
  setRoles,
  setBillers,
  setWarehouses,
  setBrands,
  setUnits,
  setPurchases,
  setExpenses,
  setHSCodes,
  setSales,
  setDashboard,
  setRegisters,
} from "@/src/store/reducers/homeReducer";

import NetInfo from "@react-native-community/netinfo";

import { useRouter } from "expo-router";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/src/utils/config";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
export default function TabLayout() {
  const { user, domain } = useAppSelector((state) => state.auth);
  const visualFeedback = useVisualFeedback();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    getCategories();
    getAllProducts();
    getCustomers();
    getTax();
    getCurrencies();
    getAllUsers();
    getRoles();
    getBillers();
    getWarehouses();
    getBrands();
    getUnits();
    getPurchases();
    getExpenses();
    getOffline();
    getHsCodes();
    getSales();
    getDashboard();
    getRegisters();

    
  }, []);


  const getRegisters = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const registers = await AsyncStorage.getItem("getRegisters");
      if (registers) {
        dispatch(setRegisters(JSON.parse(registers)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}registers?user_id=${user?.id}&tenant_id=${domain}&status=1`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setRegisters(result?.registers));
          await AsyncStorage.setItem(
            "getRegisters",
            JSON.stringify(result?.registers)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  }

  const getDashboard = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const dashboard = await AsyncStorage.getItem("getDashboard");
      if (dashboard) {
        dispatch(setDashboard(JSON.parse(dashboard)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}dashboard?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setDashboard(result.data));
          await AsyncStorage.setItem(
            "getDashboard",
            JSON.stringify(result)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  }

  const getCurrencies = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const currencies = await AsyncStorage.getItem("getCurrencies");
      if (currencies) {
        dispatch(setCurrencies(JSON.parse(currencies)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}currencies?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setCurrencies(result?.currencies));
          await AsyncStorage.setItem(
            "getCurrencies",
            JSON.stringify(result?.currencies)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };
  
  const getSales = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const currencies = await AsyncStorage.getItem("getSales");
      if (currencies) {
        dispatch(setSales(JSON.parse(currencies)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}sales?user_id=${user?.id}&tenant_id=${domain}&start=0&length=20`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setSales(result?.sales));
          await AsyncStorage.setItem(
            "getSales",
            JSON.stringify(result?.currencies)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getTax = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const currencies = await AsyncStorage.getItem("getTax");
      if (currencies) {
        dispatch(setCurrencies(JSON.parse(currencies)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();

      const response = await fetch(
        `${BASE_URL}taxes?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setTaxes(result?.taxes));
          await AsyncStorage.setItem("getTax", JSON.stringify(result?.taxes));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getCustomers = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const currencies = await AsyncStorage.getItem("customers");
      if (currencies) {
        dispatch(setCurrencies(JSON.parse(currencies)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}customers?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setCustomers(result?.customers));
          await AsyncStorage.setItem(
            "customers",
            JSON.stringify(result?.customers)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getCategories = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const categories = await AsyncStorage.getItem("getCategories");
      if (categories) {
        dispatch(setCategories(JSON.parse(categories)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}categories?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setCategories(result?.categories));
          await AsyncStorage.setItem(
            "getCategories",
            JSON.stringify(result?.categories)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getAllProducts = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const products = await AsyncStorage.getItem("getProducts");
      if (products) {
        dispatch(setProducts(JSON.parse(products)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}products?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setProducts(result?.products));
          await AsyncStorage.setItem(
            "getProducts",
            JSON.stringify(result?.products)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };
  const getAllUsers = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const users = await AsyncStorage.getItem("getAllUsers");
      if (users) {
        dispatch(setAllUsers(JSON.parse(users)));
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
          dispatch(setAllUsers(result?.roles));
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

  const getRoles = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const roles = await AsyncStorage.getItem("getRoles");
      if (roles) {
        dispatch(setRoles(JSON.parse(roles)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}roles?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          const roles: [] = result?.roles;
          dispatch(setRoles(roles));
          await AsyncStorage.setItem("getRoles", JSON.stringify(roles));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getBillers = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const billers = await AsyncStorage.getItem("getBillers");
      if (billers) {
        dispatch(setBillers(JSON.parse(billers)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}billers?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setBillers(result?.billers));
          await AsyncStorage.setItem(
            "getBillers",
            JSON.stringify(result?.billers)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getWarehouses = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const warehouses = await AsyncStorage.getItem("getWarehouses");
      if (warehouses) {
        dispatch(setWarehouses(JSON.parse(warehouses)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}warehouses?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setWarehouses(result?.warehouses));
          await AsyncStorage.setItem(
            "getWarehouses",
            JSON.stringify(result?.warehouses)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getBrands = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const brands = await AsyncStorage.getItem("getBrands");
      if (brands) {
        dispatch(setBrands(JSON.parse(brands)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}brands?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setBrands(result?.brands));
          await AsyncStorage.setItem(
            "getBrands",
            JSON.stringify(result?.brands)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getPurchases = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const purchases = await AsyncStorage.getItem("getPurchases");
      if (purchases) {
        dispatch(setPurchases(JSON.parse(purchases)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}purchases?user_id=${user?.id}&tenant_id=${domain}&length=15&start=0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setPurchases(result?.purchases));
          await AsyncStorage.setItem(
            "getPurchases",
            JSON.stringify(result?.purchases)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getExpenses = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const expenses = await AsyncStorage.getItem("getExpenses");
      if (expenses) {
        dispatch(setExpenses(JSON.parse(expenses)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}expenses?user_id=${user?.id}&tenant_id=${domain}&length=15&start=0`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setExpenses(result?.purchases));
          await AsyncStorage.setItem(
            "getExpenses",
            JSON.stringify(result?.purchases)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getUnits = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const units = await AsyncStorage.getItem("getUnits");
      if (units) {
        dispatch(setUnits(JSON.parse(units)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}units?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setUnits(result?.units));
          await AsyncStorage.setItem("getUnits", JSON.stringify(result?.units));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  const getOffline = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return;
    }

    const offline = await AsyncStorage.getItem("getOffline");
    if (!offline) {
      await AsyncStorage.setItem("getOffline", JSON.stringify([]));
      return;
    }
    const offlineData = JSON.parse(offline);
    if (offlineData.length > 0) {
      const response = await fetch(`${BASE_URL}offline/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant_id: domain,
          user_id: user?.id,
          request: offlineData,
        }),
      });
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          await AsyncStorage.setItem("getOffline", JSON.stringify([]));
        }
      }
    }
  };

  const getHsCodes = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const hsCodes = await AsyncStorage.getItem("getHsCodes");
      if (hsCodes) {
        dispatch(setHSCodes(JSON.parse(hsCodes)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}codes?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          dispatch(setHSCodes(result?.hs_codes));
          await AsyncStorage.setItem(
            "getHsCodes",
            JSON.stringify(result?.hs_codes)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.colors.text,
        headerShown: false,
        headerTitle: "Home",
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          headerShown: false,
          title: "POS",
          headerBackgroundContainerStyle: {
            backgroundColor: "#fff",
          },
          tabBarIcon: ({ color }) => (
            <Fontisto name="shopping-pos-machine" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
