import { useAppSelector } from "@/src/store/reduxHook";
import { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const { currencies, warehouses } = useAppSelector((state) => state.home);
  const [warehouse, setWarehouse] = useState(warehouses[0]?.id || 1);
  const [currency, setCurrency] = useState(currencies[0]?.id || 1);

  useEffect(() => {
    setCurrency(currencies[0]?.id);
    setWarehouse(warehouses[0]?.id);
  }, [user, currencies, warehouses]);

  const getValue = (value: number) => {
    const selectedCurrency = currencies?.find(
      (item: any) => item.id === currency
    );
    const currencyRate = selectedCurrency?.exchange_rate || 1;
    const currencySymbol = selectedCurrency?.code || "";
    const newValue = currencySymbol + " " + value * currencyRate;
    return newValue;
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={{ fontSize: 32 }}>Welcome {user?.name || ""}</Text>
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
              onChange={(item) => setWarehouse(item.value)}
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
                  id: currency.id,
                  label: currency.name,
                  value: currency.id,
                })) || []
              }
              value={currency}
              labelField="label"
              valueField="value"
              placeholder="Select Currency"
              onChange={(val) => setCurrency(parseInt(val.value))}
            />
          </View>
        </View>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Revenue</Text>
          <Text style={styles.boxValue}>{getValue(1000)}</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Profit</Text>
          <Text style={styles.boxValue}>{getValue(500)}</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Sales Returns</Text>
          <Text style={styles.boxValue}>{getValue(500)}</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Purchases Returns</Text>
          <Text style={styles.boxValue}>{getValue(500)}</Text>
        </View>
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
    padding: 10,
    marginBottom: 16,
    // alignItems: "center",
  },
  boxTitle: {
    width: "100%",
    fontSize: 16,
    margin: "5%",
  },
  boxValue: {
    fontSize: 28,
    color: "#333",
    margin: "5%",
  },
});
