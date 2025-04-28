import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  SectionList,
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
} from "react-native-paper";
import { useAppSelector, useAppDispatch } from "@/src/store/reduxHook";
import { Stack, useRouter } from "expo-router";
import {
  AntDesign,
  Ionicons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import { BASE_URL, IMAGE_BASE_URL } from "@/src/utils/config";
import { Colors } from "@/src/constants/Colors";
import {
  addToCart,
  removeFromCart,
  updateItemQty,
} from "@/src/store/reducers/homeReducer";

const modalData = [
  "Cash Register Details",
  "Please review the transaction and payments.",
];

const POSScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState({
    category: "",
    brand: "",
    stock: "",
  });
  const [show, setShow] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  const [registerData, setRegisterData] = useState<
    { id: number; name: string; usd: number; local: number }[]
  >([
    {
      id: 1,
      name: "Cash in hand",
      local: 0,
      usd: 0,
    },
    {
      id: 2,
      name: "Total Sale Amount:",
      local: 0,
      usd: 0,
    },
    {
      id: 3,
      name: "Total Payment:",
      local: 0,
      usd: 0,
    },
    {
      id: 4,
      name: "Cash Payment:",
      local: 0,
      usd: 0,
    },
    {
      id: 5,
      name: "Bank Payment:",
      local: 0,
      usd: 0,
    },
    {
      id: 6,
      name: "Mobile Money Payment:",
      local: 0,
      usd: 0,
    },
    {
      id: 7,
      name: "Deposit Payment:",
      local: 0,
      usd: 0,
    },
    {
      id: 8,
      name: "Total Sale Return:",
      local: 0,
      usd: 0,
    },
    {
      id: 9,
      name: "Total Expense:",
      local: 0,
      usd: 0,
    },
    {
      id: 10,
      name: "Total Cash:",
      local: 0,
      usd: 0,
    },
  ]);

  const FAVORITES_ID = -1;

  const categoryListRef = useRef<FlatList>(null);
  const productListRef = useRef<SectionList>(null);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, domain } = useAppSelector((state) => state.auth);
  const { cart, products, categories, brands, registers } = useAppSelector(
    (state) => state.home
  );

  // Group products by category for SectionList
  const getProductsByCategory = () => {
    // Filter products first if search is active
    const productsToGroup = searchQuery ? filteredProducts : products;

    const sections = [];

    // Add Favorites section if Favorites is selected
    if (activeCategory === FAVORITES_ID) {
      sections.push({
        id: FAVORITES_ID,
        title: "Favorites",
        data: favoriteProducts,
      });
    }

    // Add regular category sections
    categories
      .map((category: any) => {
        const categoryProducts = productsToGroup.filter(
          (product: any) => product.category_id === category.id
        );

        return {
          id: category.id,
          title: category.name,
          data: categoryProducts,
        };
      })
      .filter((section: any) => section.data.length > 0)
      .forEach((section) => sections.push(section));

    return sections;
  };

  // Track which section is currently visible
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const firstItem = viewableItems[0];
      // Get the category ID from the section
      const categoryId = firstItem.section?.id;

      if (categoryId && categoryId !== activeCategory) {
        setActiveCategory(categoryId);

        // Find index of this category in the category list
        const categoryIndex = categories.findIndex(
          (cat: any) => cat.id === categoryId
        );

        // Scroll category list to show active category
        if (categoryIndex !== -1 && categoryListRef.current) {
          categoryListRef.current.scrollToIndex({
            index: categoryIndex,
            animated: true,
            viewPosition: 0.5, // Center the item
          });
        }
      }
    }
  }).current;

  useEffect(() => {
    setFilteredProducts(products);
    console.log("Products: ", user);

    // Set first category as active by default if not set
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [products, categories]);

  useEffect(() => {
    // For demo, just use the first 5 products as favorites
    if (products.length > 0) {
      setFavoriteProducts(products.slice(0, 5));
    }
    getRegistersData();
  }, [products, registers]);

  const getRegistersData = async () => {
    const register =
      registers.find((reg: any) => reg.user_id === user?.id)?.id || 1;
    const response = await fetch(
      `${BASE_URL}register/${register}?user_id=${user?.id}&tenant_id=${domain}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    const rd = data?.data || {};
    setRegisterData([
      {
        id: 1,
        name: "Cash in hand",
        local: rd?.register_info?.cash_in_hand_local || 0,
        usd: rd?.register_info?.cash_in_hand_usd || 0,
      },
      {
        id: 2,
        name: "Total Sale Amount:",
        local: rd?.sales?.total_local || 0,
        usd: rd?.sales?.total_usd || 0,
      },
      {
        id: 3,
        name: "Total Payment:",
        local: rd?.payments?.total_local || 0,
        usd: rd?.payments?.total_usd || 0,
      },
      {
        id: 4,
        name: "Cash Payment:",
        local: rd?.payments?.by_method?.cash_local || 0,
        usd: rd?.payments?.by_method.cash_usd || 0,
      },
      {
        id: 5,
        name: "Bank Payment:",
        local: rd?.payments?.by_method?.cheque || 0,
        usd: rd?.payments?.by_method.cheque || 0,
      },
      {
        id: 6,
        name: "Mobile Money Payment:",
        local: rd?.payments?.by_method?.paypal || 0,
        usd: rd?.payments?.by_method.paypal || 0,
      },
      {
        id: 7,
        name: "Deposit Payment:",
        local: rd?.payments?.by_method?.deposit || 0,
        usd: rd?.payments?.by_method.deposit || 0,
      },
      {
        id: 8,
        name: "Total Sale Return:",
        local: rd?.returns?.total_local || 0,
        usd: rd?.returns?.total_usd || 0,
      },
      {
        id: 9,
        name: "Total Expense:",
        local: rd?.expenses?.total_local || 0,
        usd: rd?.expenses?.total_usd || 0,
      },
      {
        id: 10,
        name: "Total Cash:",
        local: rd?.summary?.total_cash_local || 0,
        usd: rd?.summary?.total_cash_usd || 0,
      },
    ]);
  };

  const getTotalCount = () => {
    return cart.reduce(
      (total: number, item: any) => total + (item.count || 0),
      0
    );
  };

  const renderProductItem = ({ item }: any) => {
    const cartData = cart.find((cartItem: any) => cartItem.id === item.id);
    const count = cartData ? cartData?.count : 0;

    return (
      <View style={styles.productCard} key={`products-${item.name}`}>
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
            style={styles.productImage}
            resizeMode="contain"
            contentFit="contain"
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.stockText}>In Stock: {item.quantity}</Text>
            <Spacer10 />

            <View style={styles.priceContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.priceText}>{item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.quantityContainer}>
                {Number(count) > 0 ? (
                  <MaterialIcons
                    name="remove"
                    size={20}
                    color={Colors.colors.primary}
                    style={styles.removeButton}
                    onPress={() => {
                      dispatch(removeFromCart(item));
                    }}
                  />
                ) : (
                  <></>
                )}

                {Number(count) > 0 ? (
                  <TextInput
                    keyboardType="numeric"
                    style={styles.quantityInput}
                    value={`${count}`}
                    onChangeText={(val) =>
                      dispatch(updateItemQty({ item: item, count: val }))
                    }
                  />
                ) : (
                  <></>
                )}
                <MaterialIcons
                  name="add"
                  size={24}
                  color="white"
                  style={styles.addButton}
                  onPress={() => {
                    dispatch(addToCart(item));
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleCategoryPress = (category: any) => {
    setActiveCategory(category.id);

    // Scroll to the selected category section
    const sectionIndex = getProductsByCategory().findIndex(
      (section: any) => section.id === category.id
    );

    if (sectionIndex !== -1 && productListRef.current) {
      productListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Choose Products",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTitleStyle: {
            color: Colors.colors.text,
          },

          headerLeft(props) {
            return (
              <Pressable
                onPress={() => {
                  router.replace("/(drawer)/(tabs)");
                }}
                style={{
                  padding: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.colors.primary,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="arrow-back-outline" size={24} color="white" />
                </View>
              </Pressable>
            );
          },
          headerRight(props) {
            return (
              <>
                {/* <MaterialIcons
                name="exit-to-app"
                onPress={() => {
                  router.replace("/(drawer)/(tabs)");
                }}
                size={32}
                style={{ marginRight: 10 }}
                color="black"
              />
              <Svg width="32" height="32" viewBox="0 0 100 100">
                <Rect x="10" y="10" width="80" height="80" fill="blue" />

                <Circle cx="50" cy="50" r="30" fill="red" />

                <Path
                  d="M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80"
                  stroke="black"
                  strokeWidth="2"
                  fill="none"
                />
              </Svg> */}
                <Pressable
                  onPress={() => {
                    setShow(true);
                  }}
                
                >
                  <Image
                    source={{
                      uri: `data:image/png;base64,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`,
                    }}
                    style={{
                      width: 38,
                      height: 38,
                      marginRight: 10,
                    }}
                  />
                </Pressable>
              </>
            );
          },
        }}
      />
      <View style={styles.searchContainer}>
        <View style={{ flex: 1 }}>
          <Searchbar
            placeholder="Search by product name or code..."
            onChangeText={(val) => {
              setSearchQuery(val);
              if (val) {
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
              } else {
                setFilteredProducts(products);
              }
            }}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={{ color: "black", paddingBottom: 5 }}
            selectionColor={"black"}
            iconColor="black"
            placeholderTextColor="black"
            icon={() => <AntDesign name="search1" size={20} color="black" />}
            right={() => (
              <SimpleLineIcons
                name="equalizer"
                size={20}
                onPress={() => setShowFilter(true)}
                style={{ marginRight: 15, transform: [{ rotate: "90deg" }] }}
              />
            )}
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.categoriesContainer}>
          {categories.length > 0 ? (
            <FlatList
              ref={categoryListRef}
              data={[
                // Add Favorites as first item
                { id: FAVORITES_ID, name: "Featured" },
                // Then include all regular categories
                ...categories,
              ]}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleCategoryPress(item)}>
                  <View
                    style={[
                      styles.categoryCard,
                      activeCategory === item.id
                        ? styles.activeCategoryCard
                        : null,
                      // Special styling for Favorites
                      // item.id === FAVORITES_ID ? styles.favoritesCard : null,
                    ]}
                  >
                    {/* {item.id === FAVORITES_ID && (
                      <AntDesign
                        name="star"
                        size={18}
                        color={
                          activeCategory === FAVORITES_ID ? "black" : "#ffc107"
                        }
                        style={{ marginRight: 6 }}
                      />
                    )} */}
                    <Text
                      style={[
                        styles.categoryText,
                        activeCategory === item.id
                          ? styles.activeCategoryText
                          : null,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
              style={{
                // paddingTop: 20,
                backgroundColor: "#F8F8F8",
                // borderTopRightRadius: 8,
                // borderTopLeftRadius: 8,
              }}
            />
          ) : (
            <Text style={styles.emptyText}>No categories found</Text>
          )}
        </View>

        <View style={styles.productsContainer}>
          {products.length > 0 ? (
            <SectionList
              ref={productListRef}
              sections={getProductsByCategory()}
              renderItem={renderProductItem}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{section.title}</Text>
                </View>
              )}
              stickySectionHeadersEnabled={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 50,
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No products found</Text>
              }
            />
          ) : (
            <Text style={styles.emptyText}>No products found</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.cartInfoContainer}>
          <View style={styles.cartSummary}>
            <View style={styles.cartIconContainer}>
              <MaterialIcons
                name="shopping-cart"
                size={32}
                color={Colors.colors.primary}
              />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalCount()}</Text>
              </View>
            </View>
            <Text style={styles.totalPrice}>
              $
              {cart
                .reduce(
                  (acc, item) =>
                    acc + parseFloat(item.price) * (item.count || 0),
                  0
                )
                .toFixed(2)}
            </Text>
          </View>
          <Pressable
            style={styles.checkoutButton}
            onPress={() => {
              if (cart.length > 0) {
                router.push("/(drawer)/carts");
              }
            }}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
            <MaterialIcons
              name="arrow-forward"
              size={20}
              color="white"
              style={{ marginLeft: 5 }}
            />
          </Pressable>
        </View>
      </View>

      {/* Filter Modal (unchanged) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={show}
        onRequestClose={() => {
          setShow(false);
          // setFormData({
          //   cash_in_hand_usd: "",
          //   warehouse_id: "",
          //   cash_in_hand_local: "",
          // });
          // setShow(false);
        }}
      >
        <ScrollView>
          <View
            style={{
              flex: 1,
              // justifyContent: "center",
              paddingVertical: Dimensions.get("window").height / 10,
              width: "100%",
              height: Dimensions.get("window").height,
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                width: "95%",
                backgroundColor: "white",

                borderRadius: 10,
                padding: 15,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    flex: 1,
                    color: Colors.colors.text,
                  }}
                >
                  {modalData[0]}
                </Text>
                <Pressable
                  onPress={() => {
                    router.replace("/(drawer)/(tabs)");
                  }}
                >
                  <AntDesign name="close" size={20} color="black" />
                </Pressable>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.colors.text,
                  textAlign: "center",
                  paddingBottom: 10,
                }}
              >
                {modalData[1]}
              </Text>
              <View
                style={{
                  padding: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 10,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.colors.text,
                        textAlign: "center",
                      }}
                    >
                      {" "}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.colors.text,
                        textAlign: "center",
                      }}
                    >
                      Local
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.colors.text,
                        textAlign: "center",
                      }}
                    >
                      USD
                    </Text>
                  </View>
                </View>
                {registerData.map((item, index) => {
                  return (
                    <View
                    key={`index+1${index}`}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingBottom: 10,
                        paddingTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: Colors.colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: "60%",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: Colors.colors.text,
                            textAlign: "left",
                            fontWeight: item.id === 10 ? "bold" : "400",
                          }}
                        >
                          {item.name}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: Colors.colors.text,
                            textAlign: "right",
                          }}
                        >
                          {item.local}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: Colors.colors.text,
                            textAlign: "right",
                          }}
                        >
                          {item.usd}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
              <Spacer20 />

              <Button
                mode="contained"
                onPress={() => {}}
                style={{
                  backgroundColor: Colors.colors.primary,
                  alignContent: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
                labelStyle={{ color: "white", fontWeight: "bold" }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                  }}
                >
                  Close Register
                </Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 10,
    alignItems: "center",
    padding: 10,
  },
  searchBar: {
    width: "100%",
    height: 53,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#bbb",
    color: "#000",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  categoriesContainer: {
    height: "100%",
    width: "30%",
  },
  productsContainer: {
    height: "100%",
    width: "70%",
  },
  categoryCard: {
    alignContent: "center",
    justifyContent: "center",
    padding: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: "#bbb",
    borderRadius: 0,
    backgroundColor: "#F8F8F8",
  },
  activeCategoryCard: {
    backgroundColor: "#fff",
    color: "#363333",
  },
  favoritesCard: {
    // backgroundColor: "#fffcf0", // Light yellow background
    // flexDirection: "row",
    // alignItems: "center",
    // borderBottomWidth: 2,
    // borderBottomColor: "#ffc107",
  },
  categoryText: {
    fontSize: 15,
    color: "black",
  },
  activeCategoryText: {
    color: "black",
    fontSize: 15,
  },
  productCard: {
    flex: 1,
    margin: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  productImage: {
    height: Dimensions.get("window").width * 0.2,
    width: Dimensions.get("window").width * 0.2,
    borderRadius: 10,
  },
  productDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 18,
    color: "black",
    paddingLeft: 10,
  },
  stockText: {
    color: "#5E5D5D",
    fontSize: 14,
    paddingLeft: 10,
  },
  priceContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
  },
  priceText: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeButton: {
    margin: 0,
    borderWidth: 1,
    borderColor: Colors.colors.primary,
    borderRadius: 20,
  },
  addButton: {
    margin: 0,
    backgroundColor: Colors.colors.primary,
    borderRadius: 20,
  },
  quantityInput: {
    height: 24,
    width: 40,
    textAlign: "center",
    borderRadius: 5,
    borderWidth: 0,
    padding: 0,
    margin: 0,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    padding: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    color: Colors.colors.text,
  },
  footer: {
    height: 80,
    width: "100%",
    backgroundColor: Colors.colors.card,
  },
  cartInfoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 10,
  },
  cartSummary: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.colors.card,
    borderRadius: 5,
  },
  cartIconContainer: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -15,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 22,
    // fontWeight: "bold",
    color: "red",
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: Colors.colors.primary,
    borderRadius: 25,
    marginHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: 100,
  },
  checkoutText: {
    color: "white",
    fontSize: 18,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 20,
    marginTop: 20,
    color: "#000",
  },
  // Filter modal styles (unchanged)
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
    maxHeight: "80%",
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
});

export default POSScreen;
