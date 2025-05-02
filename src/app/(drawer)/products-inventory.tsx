import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import {
  Text,
  Searchbar,
  Button,
  Chip,
  Divider,
  FAB,
  Card,
  IconButton,
  Menu,
} from "react-native-paper";
import { useAppSelector, useAppDispatch } from "@/src/store/reduxHook";
import { Stack, useRouter } from "expo-router";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import {
  AntDesign,
  MaterialIcons,
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Spacer20 } from "@/src/utils/Spacing";
import { IMAGE_BASE_URL } from "@/src/utils/config";
import { Colors } from "@/src/constants/Colors";
import { black } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

const ProductsInventoryScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const stoks = ["In Stock", "Low Stock", "Out of Stock"];
  const { products, categories, brands } = useAppSelector(
    (state) => state.home
  );
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<{
    category: string;
    brand: string;
    stock: string;
  }>({
    category: categories[0]?.name,
    brand: brands[0]?.title,
    stock: stoks[0],
  });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const router = useRouter();
  const { user, domain } = useAppSelector((state) => state.auth);

  const applyFilters = () => {
    let filtered = products;

    if (filter.category) {
      const category = categories.find(
        (cat: any) => cat.name === filter.category
      )?.id;
      if (category) {
        filtered = filtered.filter(
          (product: any) => product.category_id === category
        );
      }
    }

    if (filter.brand) {
      const brand_id = categories.find(
        (bran: any) => bran.title === filter.brand
      )?.id;
      filtered = filtered.filter(
        (product: any) => product.brand_id === brand_id
      );
    }

    if (filter.stock) {
      if (filter.stock === "In Stock") {
        filtered = filtered.filter((product: any) => product.qty > 0);
      } else if (filter.stock === "Low Stock") {
        filtered = filtered.filter(
          (product: any) => product.qty > 0 && product.qty <= 10
        );
      } else if (filter.stock === "Out of Stock") {
        filtered = filtered.filter((product: any) => product.qty <= 0);
      }
    }

    setFilteredProducts(filtered);
    setShowFilter(false);
  };

  useEffect(() => {
    setFilteredProducts(products);
    setFilter({
      category: categories[0]?.name,
      brand: brands[0]?.title,
      stock: stoks[0],
    });
  }, [products]);

  const renderProductItem = ({
    item,
  }: {
    item: {
      id: number;
      name: string;
      image: string;
      price: number;
      qty: number;
      code: string;
      hs_code: string;
    };
  }) => {
    const isMenuOpen = openMenuId === item.id;
    return (
      <View
        style={{
          marginHorizontal: "2%",
          marginVertical: "2%",
          borderRadius: 8,
          elevation: 0,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#cecece",
          width: "48%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Image
            source={{
              uri: `${IMAGE_BASE_URL}${item?.image}`,
            }}
            style={{
              flex: 1,
              height: 120,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
            resizeMode="stretch"
          />
        </View>

        <View
          style={{
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "black",
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              color: "#3D3C3C",
              fontSize: 14,
            }}
          >
            Code/SKU: {item.code}
          </Text>
          <Text
            style={{
              color: "#3D3C3C",
              fontSize: 14,
            }}
          >
            In Stock: {item.qty}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 5,
              marginBottom: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "black",
                fontWeight: "bold",
              }}
            >
              ${item.price.toFixed(2)}
            </Text>

            

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
                  console.log("Edit item", item.id);
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
              <Divider />
              <Menu.Item
                onPress={() => {
                  console.log("Details", item.id);
                  setOpenMenuId(null);
                }}
                style={{
                  backgroundColor: "#fff",
                }}
                title="Details"
                leadingIcon={(prms) => (
                  <MaterialIcons name="info" size={20} color={prms.color} />
                )}
              />
            </Menu>
          </View>
        </View>
      </View>
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
              placeholder="Search products..."
              onChangeText={(val) => {
                setSearchQuery(val);
                const filtered = products.filter(
                  (product: any) =>
                    product.name.toLowerCase().includes(val.toLowerCase()) ||
                    product.code.toLowerCase().includes(val.toLowerCase()) ||
                    product.hs_code.toLowerCase().includes(val.toLowerCase()) ||
                    product.barcode_symbology
                      .toLowerCase()
                      .includes(val.toLowerCase())
                );
                setFilteredProducts(filtered);
              }}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={{ color: "black" }}
              selectionColor="lightgray"
              iconColor="black"
              placeholderTextColor="black"
              icon={() => <AntDesign name="search1" size={20} color="black" />}
              right={() => (
                <SimpleLineIcons
                  name="equalizer"
                  size={18}
                  onPress={() => {
                    setShowFilter(true);
                  }}
                  iconColor="black"
                  style={{ marginRight: 15, transform: [{ rotate: "90deg" }] }}
                />
              )}
            />
          </View>

          <View
            style={{
              width: 50,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "black",

              borderRadius: "50%",
            }}
          >
            <Pressable
              onPress={() => {
                router.push("/(drawer)/add-products");
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

        {filteredProducts.length > 0 ? (
          <View
            style={{
              flex: 1,
              paddingBottom: 20,
            }}
          >
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id.toString()}
              style={{
                paddingRight: "6%",
                paddingLeft: "2%",
              }}
              numColumns={2}
            />
          </View>
        ) : (
          <Text
            style={{
              textAlign: "center",
              fontSize: 20,
              marginTop: 20,
              color: "#000",
            }}
          >
            No products found
          </Text>
        )}
      </ScrollView>
      <Spacer20 />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilter}
        onRequestClose={() => setShowFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.dismissArea}
            onPress={() => setShowFilter(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Products</Text>
              <Pressable
                onPress={() => {
                  setFilter({
                    category: "",
                    brand: "",
                    stock: "",
                  });
                }}
              >
                <Text style={{ fontSize: 18, color: "#0e0e0e" }}>Clear</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {categories.map((category: any) => (
                  <Chip
                    key={category.id}
                    onPress={() => {
                      setFilter((prev) => ({
                        ...prev,
                        category: category.name,
                      }));
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          filter.category === category.name
                            ? Colors.colors.primary
                            : "#dedede",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          filter.category === category.name
                            ? "#fff"
                            : "#666565",
                      }}
                    >
                      {category.name}
                    </Text>
                  </Chip>
                ))}
              </View>
            </ScrollView>
            <Spacer20 />
            <Text style={styles.filterTitle}>Brand</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {brands.map((brand: any) => (
                  <Chip
                    key={brand.id}
                    onPress={() => {
                      setFilter((prev) => ({
                        ...prev,
                        brand: brand.title,
                      }));
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          filter.brand === brand.title
                            ? Colors.colors.primary
                            : "#dedede",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          filter.brand === brand.title ? "#fff" : "#666565",
                      }}
                    >
                      {brand.title}
                    </Text>
                  </Chip>
                ))}
              </View>
            </ScrollView>
            <Spacer20 />
            <Text style={styles.filterTitle}>Stock</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {stoks.map((stock) => (
                  <Chip
                    key={stock}
                    // mode="outlined"
                    onPress={() => {
                      setFilter((prev) => ({
                        ...prev,
                        stock: stock,
                      }));
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          filter.stock === stock
                            ? Colors.colors.primary
                            : "#dedede",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: filter.stock === stock ? "#fff" : "#666565",
                      }}
                    >
                      {stock}
                    </Text>
                  </Chip>
                ))}
              </View>
            </ScrollView>
            <Spacer20 />
            <Spacer20 />
            <Button
              mode="contained"
              onPress={() => {
                console.log("Apply Filters", filter);
                applyFilters();
                setShowFilter(false);
              }}
              style={styles.sortContainer}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Apply Filters
              </Text>
            </Button>
            <Spacer20 />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBar: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cecece",
  },
  filterContainer: {
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  filterTitle: {
    fontSize: 20,
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
    backgroundColor: Colors.colors.primary,
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
    maxHeight: "80%", // Takes up to 80% of screen height
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
    flex: 1,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    color: Colors.colors.text,
  },
  black: {
    color: Colors.colors.text,
  },
});

export default ProductsInventoryScreen;
