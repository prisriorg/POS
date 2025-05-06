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

import NetInfo from "@react-native-community/netinfo";

// individual metrics for a timeframe
export interface PeriodMetrics {
  revenue: number;
  profit: number;
  sale: number;
  purchase: number;
}

export default function HomeScreen() {
  const { user, domain } = useAppSelector((state) => state.auth);
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

  const getDashboard = async (warehouse_id: string) => {
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
        `${BASE_URL}dashboard?user_id=${user?.id}&tenant_id=${domain}&warehouse_id=${warehouse_id}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result && response.status === 200) {
        if (result.status === "success") {
          setDashboardData(result.data);
          await AsyncStorage.setItem("getDashboard", JSON.stringify(result));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
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
          dashboardData[currency][dateIs] && (
            <>
              {/* Revenue Box */}
              <View style={styles.box}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "10%",
                    gap: 8,
                  }}
                >
                  <Feather name={"bar-chart"} size={24} color={"purple"} />

                  <View style={{ flex: 1, marginLeft: 8, gap: 4 }}>
                    <Text style={styles.boxTitle}>
                      {dashboardData[currency][dateIs].revenue}
                    </Text>
                    <Text style={[styles.boxTitle, { color: "purple" }]}>
                      Revenue
                    </Text>
                  </View>
                </View>
              </View>

              {/* Profit Box */}
              <View style={styles.box}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "10%",
                    gap: 8,
                  }}
                >
                  <AntDesign name="Trophy" size={24} color={"blue"} />

                  <View style={{ flex: 1, marginLeft: 8, gap: 4 }}>
                    <Text style={styles.boxTitle}>
                      {dashboardData[currency][dateIs].profit}
                    </Text>
                    <Text style={[styles.boxTitle, { color: "blue" }]}>
                      Profit
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sale Return Box */}
              <View style={styles.box}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "10%",
                    gap: 8,
                  }}
                >
                  <Fontisto
                    name="arrow-return-left"
                    size={24}
                    color={"orange"}
                  />

                  <View style={{ flex: 1, marginLeft: 8, gap: 4 }}>
                    <Text style={styles.boxTitle}>
                      {dashboardData[currency][dateIs].sale}
                    </Text>
                    <Text style={[styles.boxTitle, { color: "orange" }]}>
                      Sale {"\n"}Return
                    </Text>
                  </View>
                </View>
              </View>

              {/* Purchase Return Box */}
              <View style={styles.box}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "10%",
                    gap: 8,
                  }}
                >
                  <Entypo name="loop" size={24} color={"darkgreen"} />

                  <View style={{ flex: 1, marginLeft: 8, gap: 4 }}>
                    <Text style={styles.boxTitle}>
                      {dashboardData[currency][dateIs].purchase}
                    </Text>
                    <Text style={[styles.boxTitle, { color: "darkgreen" }]}>
                      Purchase Return
                    </Text>
                  </View>
                </View>
              </View>
            </>
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
