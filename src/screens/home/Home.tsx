import { useAppSelector } from "@/src/store/reduxHook";
import { AntDesign, Entypo, Feather, Fontisto } from "@expo/vector-icons";
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
    const newValue = value * currencyRate;
    return newValue;
  };

  const itemRenderer = (item: any) => {
    return (
      <View style={styles.box}>
        <View style={{ flexDirection: "column", alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              padding: "10%",
            }}
          >
            <View>
              {item.id === 1 && (
                <Feather
                  name="bar-chart"
                  size={24}
                  color={
                    item.id === 1
                      ? "purple"
                      : item.id === 2
                      ? "orange"
                      : item.id === 3
                      ? "darkgreen"
                      : "blue"
                  }
                />
              )}
              {item.id === 2 && (
                <Fontisto
                  name="arrow-return-left"
                  size={24}
                  color={
                    item.id === 1
                      ? "purple"
                      : item.id === 2
                      ? "orange"
                      : item.id === 3
                      ? "darkgreen"
                      : "blue"
                  }
                />
              )}
              {item.id === 3 && (
                <Entypo
                  name="loop"
                  size={30}
                  color={
                    item.id === 1
                      ? "purple"
                      : item.id === 2
                      ? "orange"
                      : item.id === 3
                      ? "darkgreen"
                      : "blue"
                  }
                />
              )}
              {item.id === 4 && (
                <AntDesign
                  name="Trophy"
                  size={24}
                  color={
                    item.id === 1
                      ? "purple"
                      : item.id === 2
                      ? "orange"
                      : item.id === 3
                      ? "darkgreen"
                      : "blue"
                  }
                />
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 8,gap:4 }}>
              <Text style={styles.boxTitle}>{getValue(item.value)}</Text>

              <Text
                style={[
                  styles.boxTitle,
                  {
                    color:
                      item.id === 1
                        ? "purple"
                        : item.id === 2
                        ? "orange"
                        : item.id === 3
                        ? "darkgreen"
                        : "blue",
                  },
                ]}
              >
                {item.name}
              </Text>
            </View>
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
        {[
          { id: 1, name: "Revenue", value: 500 },
          { id: 2, name: "Sale Return", value: 20002 },
          { id: 3, name: "Purchase Return", value: 8467 },
          { id: 4, name: "Profit", value: 764276 },
        ].map((item) => itemRenderer(item))}
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
