import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import {
  Text,
  Searchbar,
  Button,
  Chip,
  Divider,
  Menu,
} from "react-native-paper";

import NetInfo from "@react-native-community/netinfo";
import { useAppSelector, useAppDispatch } from "@/src/store/reduxHook";
import { Stack, useFocusEffect, useRouter } from "expo-router";
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
import { BASE_URL, IMAGE_BASE_URL } from "@/src/utils/config";
import { Colors } from "@/src/constants/Colors";
import DeleteProductDialog from "@/src/components/Delete";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setProducts } from "@/src/store/reducers/homeReducer";

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
    category: "",
    brand: "",
    stock: "",
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteData, setDeleteData] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const { user, domain } = useAppSelector((state) => state.auth);
  const visualFeedback = useVisualFeedback();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      getAllProducts();
      return () => {
        // Any cleanup code here
      };
    }, [user?.id, domain])
  );

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}product/delete/${deleteData}?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Product deleted successfully:", data);
        getAllProducts();
        Alert.alert("Success", "Product deleted successfully");
      } else {
        console.log("Error deleting product:", data.message);
      }
    } catch (error) {
      console.log("Error deleting product:", error);
    }
    // Call your delete API here using deleteData
    // After successful deletion, you can update the state or refetch data
    setShowDeleteDialog(false);
  };

  const applyFilters = () => {
    let filtered = products;

    if (filter.category) {
      filtered = filtered.filter(
        (product: any) =>
          Number(product.category_id) === Number(filter.category)
      );
    }

    if (filter.brand) {
      filtered = filtered.filter(
        (product: any) => Number(product.brand_id) === Number(filter.brand)
      );
    }

    if (filter.stock) {
      if (filter.stock === "In Stock") {
        filtered = filtered.filter((product: any) => Number(product.quantity) > 0);
      } else if (filter.stock === "Low Stock") {
        filtered = filtered.filter(
          (product: any) => Number(product.quantity) > 0 && Number(product.quantity) <= 10
        );
      } else if (filter.stock === "Out of Stock") {
        filtered = filtered.filter((product: any) => Number(product.quantity) <= 0);
      }
    }

    setFilteredProducts(filtered);
    setShowFilter(false);
  };

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

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
          setFilteredProducts(result?.products);
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

  const renderProductItem = ({
    item,
  }: {
    item: {
      id: number;
      name: string;
      image: string;
      price: number;
      quantity: number;
      code: string;
      hs_code: string;
    };
  }) => {
    const isMenuOpen = openMenuId === item.id;
    return (
      <Pressable
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
        onPress={() => {
          router.push(`/(drawer)/view-product?id=${item.id}`);
        }}
      >
        <View>
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
              resizeMode="contain"
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
              In Stock: {item.quantity}
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
                contentStyle={{
                  backgroundColor: "#fff",
                }}
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
                    router.push(`/(drawer)/edit-product?id=${item.id}`);
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
                    setShowDeleteDialog(true);
                    setDeleteData(item.id.toString());

                    setOpenMenuId(null);
                  }}
                  style={{
                    backgroundColor: "#fff",
                  }}
                  title="Delete"
                  leadingIcon={(prms) => (
                    <MaterialIcons name="info" size={20} color={prms.color} />
                  )}
                />
              </Menu>
            </View>
          </View>
        </View>
      </Pressable>
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
                    product.code.includes(val) ||
                    product.hs_code.includes(val)
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
                        category: category.id,
                      }));
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          filter.category === category.id
                            ? Colors.colors.primary
                            : "#dedede",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          filter.category === category.id ? "#fff" : "#666565",
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
                        brand: brand.id,
                      }));
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          filter.brand === brand.id
                            ? Colors.colors.primary
                            : "#dedede",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: filter.brand === brand.id ? "#fff" : "#666565",
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

      <DeleteProductDialog
        visible={showDeleteDialog}
        onDismiss={() => {
          console.log("Delete dialog dismissed");
          setShowDeleteDialog(false);
          setDeleteData("");
        }}
        onDelete={() => {
          setShowDeleteDialog(false);
          handleDelete();
        }}
      />
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
