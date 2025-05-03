import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { setDashboard } from "@/src/store/reducers/homeReducer";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import { BASE_URL } from "@/src/utils/config";
import { Spacer20 } from "@/src/utils/Spacing";
import { AntDesign, Entypo, Feather, Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import NetInfo from '@react-native-community/netinfo';

// individual metrics for a timeframe
export interface PeriodMetrics {
  revenue: number;
  profit: number;
  sale: number;
  purchase: number;
}

export default function HomeScreen() {
  const { user,domain } = useAppSelector((state) => state.auth);
  const { currencies, warehouses, dashboard } = useAppSelector(
    (state) => state.home
  );
  const dateList = [
    {
      id: "today",
      label: "Today",
      value: "today",
    },
    {
      id: "week",
      label: "This Week",
      value: "week",
    },
    {
      id: "month",
      label: "This Month",
      value: "month",
    },
    {
      id: "year",
      label: "This Year",
      value: "year",
    },
  ];

  const [dateIs, setDateIs] = useState("today");

  const [dashboardData, setDashboardData] = useState(dashboard || {});
  const [warehouse, setWarehouse] = useState(warehouses[0]?.id || 1);
  const [currency, setCurrency] = useState("USD");
  const visualFeedback = useVisualFeedback();
  const dispatch = useAppDispatch();


  useEffect(() => {
    setCurrency(currencies[0]?.code || "USD");
    setWarehouse(warehouses[0]?.id || 1);
    setDashboardData(dashboard);
  }, [user, currencies, warehouses, dashboard]);
  const ICONS = {
    1: { Icon: Feather, name: "bar-chart", color: "purple" },
    2: { Icon: Fontisto, name: "arrow-return-left", color: "orange" },
    3: { Icon: Entypo, name: "loop", color: "darkgreen" },
    4: { Icon: AntDesign, name: "Trophy", color: "blue" },
  };

  const getDashboard = async (warehouse_id: string) => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const dashboard = await AsyncStorage.getItem('getDashboard');
      if (dashboard) {
        dispatch(setDashboard(JSON.parse(dashboard)));
      }
      return;
    }
    try {
      visualFeedback.showLoadingBackdrop();
      const response = await fetch(
        `${BASE_URL}dashboard?user_id=${user?.id}&tenant_id=${domain}&warehouse_id=${warehouse_id}`,
        {
          method: 'GET',
        },
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === 'success') {
          setDashboardData(result.data);
          await AsyncStorage.setItem('getDashboard', JSON.stringify(result));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };
  const itemRenderer = (item: { id: number; name: string; value: number }) => {
      const { Icon, name: iconName, color } = ICONS[item.id] || {};

    if (!Icon) return null; // In case the item.id is not 1-4

    return (
      <View style={styles.box}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: "10%",
            gap: 8,
          }}
        >
          <Icon name={iconName} size={24} color={color} />

          <View style={{ flex: 1, marginLeft: 8, gap: 4 }}>
            <Text style={styles.boxTitle}>{item.value}</Text>
            <Text style={[styles.boxTitle, { color }]}>{item.name}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={{ fontSize: 32 }}>Welcome {user?.name || ""}</Text>
      </View>

      <Spacer20 />

      <View
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          paddingHorizontal: 8,
          backgroundColor: "white",
          borderRadius: 4,
        }}
      >
        <Dropdown
          style={{ height: 40 }}
          data={dateList}
          value={dateIs}
          labelField="label"
          valueField="value"
          placeholder="Select date"
          onChange={(val) => setDateIs(val.value)}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              backgroundColor: "white",
              borderRadius: 4,
              paddingHorizontal: 8,
            }}
          >
            <Dropdown
              style={{ height: 40 }}
              data={
                warehouses?.map((warehouse: any) => ({
                  label: warehouse.name,
                  value: warehouse.id,
                })) || []
              }
              value={warehouse}
              labelField="label"
              valueField="value"
              placeholder="Select Warehouse"
              onChange={(item) => {
                setWarehouse(item.value);
                getDashboard(item.value);
              }}
            />
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              paddingHorizontal: 8,
              backgroundColor: "white",
              borderRadius: 4,
            }}
          >
            <Dropdown
              style={{ height: 40 }}
              data={
                currencies?.map((currency: any) => ({
                  id: currency.code,
                  label: currency.name,
                  value: currency.code,
                })) || []
              }
              value={currency}
              labelField="label"
              valueField="value"
              placeholder="Select Currency"
              onChange={(val) => setCurrency(val.value)}
            />
          </View>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {dashboardData &&
          dashboardData[currency] &&
          dashboardData[currency][dateIs] &&
          Object.entries(dashboardData[currency][dateIs] as PeriodMetrics).map(
            ([key, value], index) => {
              return itemRenderer({
                id: index + 1 ,
                name: key,
                value: value,
              });
            }
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: "5%",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  box: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 6,
    // padding: 6,
    marginBottom: 16,
  },
  boxTitle: {
    width: "100%",
    fontSize: 16,
    margin: "2%",
  },
  boxValue: {
    fontSize: 20,
    margin: "2%",
  },
});
