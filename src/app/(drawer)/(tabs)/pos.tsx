import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import {
  Text,
  Searchbar,
  Button,
  Chip,
  Divider,
  FAB,
  Card,
  IconButton,
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
} from "@expo/vector-icons";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import { IMAGE_BASE_URL } from "@/src/utils/config";
import { Colors } from "@/src/constants/Colors";
import {
  addToCart,
  removeFromCart,
  updateItemQty,
} from "@/src/store/reducers/homeReducer";

const POSScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
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
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, domain } = useAppSelector((state) => state.auth);
  const { cart, products, categories, brands } = useAppSelector(
    (state) => state.home
  );
  const [filteredProducts, setFilteredProducts] = useState([]);

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
  }, [products]);

  const getTotalCount = () => {
    let totalCount = 0;
    cart.map((item: any) => {
      totalCount = totalCount + item.count;
    });
    return totalCount || 0;
  };

  const renderProductItem = ({
    item,
  }: {
    item: {
      id: number;
      name: string;
      image: string;
      price: number;
      qty: number;
    };
  }) => {
    const cartData = cart.find((cartItem: any) => cartItem.id === item.id);
    const count = cartData ? cartData?.count : 0;
    const cost = item.price || 0;
    const price = item.price || 0;
    return (
      <View
        style={{
          flex: 1,
          margin: 8,
          borderRadius: 5,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          borderWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "#fff",
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
              uri: `http://${domain}${IMAGE_BASE_URL}${item?.image}`,
            }}
            style={{
              height: Dimensions.get("window").width * 0.3,
              width: Dimensions.get("window").width * 0.2,
              borderRadius: 10,
              margin: Dimensions.get("window").width * 0.01,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              padding: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "black",
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                color: "black",
              }}
            >
              In Stock: {item.qty}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "black",
              }}
            >
              $ {item.price.toFixed(2)}
            </Text>
            <Spacer10 />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <MaterialIcons
                name="add"
                size={24}
                color="white"
                style={{
                  margin: 0,
                  backgroundColor: "black",
                  borderRadius: 2,
                }}
                onPress={() => {
                  dispatch(addToCart(item));
                }}
              />
              <TextInput
                keyboardType="numeric"
                style={{
                  height: 24,
                  width: 40,
                  textAlign: "center",
                  borderRadius: 5,
                  borderWidth: 0,
                  padding: 0,
                  margin: 0,
                  backgroundColor: "#F5F5F5",
                }}
                value={`${count}`}
                onChangeText={(val) =>
                  dispatch(updateItemQty({ item: item, count: val }))
                }
              />
              <MaterialIcons
                name="remove"
                size={24}
                color="white"
                style={{
                  margin: 0,
                  backgroundColor: "black",
                  borderRadius: 2,
                }}
                onPress={() => {
                  dispatch(removeFromCart(item));
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
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
            selectionColor={"black"}
            iconColor="black"
            placeholderTextColor="black"
            icon={() => <AntDesign name="search1" size={20} color="black" />}
          />
        </View>

        <View
          style={{
            width: 50,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            // backgroundColor: Colors.colors.primary,

            borderRadius: "50%",
          }}
        >
          <Pressable
            onPress={() => {
              setShowFilter(true);
            }}
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconButton icon="filter-outline" size={50} iconColor="black" />
          </Pressable>
        </View>
      </View>

      <Spacer20 />

      <View
        style={{
          flex: 1,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            height: "100%",
            width: "30%",
          }}
        >
          {categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setFilter((prev) => ({
                      ...prev,
                      category: item.name,
                    }));
                    const filtered = products.filter(
                      (product: any) => product.category_id === item.id
                    );
                    setFilteredProducts(filtered);
                  }}
                >
                  <Card
                    style={{
                      flex: 1,
                      alignContent: "center",
                      justifyContent: "center",
                      padding: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "#bbb",
                      borderRadius: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: "black",
                      }}
                    >
                      {item.name}
                    </Text>
                  </Card>
                </Pressable>
              )}
              keyExtractor={(item) => item.id.toString()}
              style={{
                flex: 1,
              }}
            />
          ) : (
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
                marginTop: 20,
                color: "#000",
              }}
            >
              No Category found
            </Text>
          )}
        </View>
        <View
          style={{
            height: "100%",
            width: "70%",
          }}
        >
          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id.toString()}
              style={{
                flex: 1,
                paddingHorizontal: 5,
              }}
              // numColumns={1}
            />
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
        </View>
      </View>
      <View style={styles.footer}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            height: 50,
            paddingHorizontal: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 50,
              flexDirection: "row",
              justifyContent: "flex-start",
              gap: 10,
              alignItems: "center",
              padding: 10,
              backgroundColor: Colors.colors.card,
              borderRadius: 5,
            }}
          >
            <View style={{ position: "relative" }}>
              <MaterialIcons
                name="shopping-cart"
                size={32}
                color={Colors.colors.primary}
                style={{
                  flex: 1,
                  margin: 0,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: -15,
                  right: -5,
                  backgroundColor: "red",
                  borderRadius: 10,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {getTotalCount()}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "red",
              }}
            >
              ${" "}
              {cart
                .reduce(
                  (acc: any, item: any) =>
                    acc + parseFloat(item.price) * (item.count || 0),
                  0
                )
                .toFixed(2)}
            </Text>
          </View>
          <Pressable
            style={[
              styles.cartBtn,
              {
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            onPress={() => {
              try {
                if (cart.length > 0) {
                  router.push("/(drawer)/carts");
                }
              } catch (err) {
                console.log("err: ", err);
              }
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Checkout
            </Text>
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color="white"
              style={{
                marginLeft: 5,
              }}
            />
          </Pressable>
        </View>
      </View>

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
                <Text style={{ fontSize: 18, color: "#65558F" }}>Clear</Text>
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
                    mode="outlined"
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
                            : "#fff",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          filter.category === category.name ? "#fff" : "#000",
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
                    mode="outlined"
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
                            : "#fff",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: filter.brand === brand.title ? "#fff" : "#000",
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
                {["In Stock", "Low Stock", "Out of Stock"].map((stock) => (
                  <Chip
                    key={stock}
                    mode="outlined"
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
                            : "#fff",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: filter.stock === stock ? "#fff" : "#000",
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
    backgroundColor: "#f5f5f5",
  },
  searchBar: {
    elevation: 2,
    backgroundColor: "#ECE6F0",
    color: "#000",
  },
  filterContainer: {
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "bold",
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
  footer: {
    height: 80,
    width: "100%",
    backgroundColor: Colors.colors.card,
  },

  cartBtn: {
    flex: 1,
    backgroundColor: Colors.colors.primary,
    borderRadius: 4,
    // margin: 10,
    marginHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,

    width: 100,
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
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.colors.text,
  },
  black: {
    color: Colors.colors.text,
  },
});

export default POSScreen;
