import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";

import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { BASE_URL, IMAGE_BASE_URL } from "@/src/utils/config";
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import { Image } from "expo-image";
import DeleteProductDialog from "@/src/components/Delete";
import { Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setProducts } from "@/src/store/reducers/homeReducer";

const ViewProduct = () => {
  const { user, domain } = useAppSelector((state) => state.auth);
  const { brands, categories, taxes } = useAppSelector((state) => state.home);
  const visualFeedback = useVisualFeedback();
  const navigation = useNavigation();
  const prms = useLocalSearchParams();
  const router = useRouter();
  const [productData, setProduct] = React.useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteData, setDeleteData] = useState("");
  const dispatch = useAppDispatch();
  const [getVeriants, setGetVariants] = useState([]);
  useFocusEffect(
    useCallback(() => {
      if (prms.id) {
        getProduct(prms.id as string);
      }
      return () => {
        // Any cleanup code here
      };
    }, [prms.id, user?.id, domain])
  );

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
  const getProduct = async (id: string) => {
    try {
      // Show loading feedback
      visualFeedback.showLoadingBackdrop();
      // Fetch product details from API using the id
      await fetch(
        `${BASE_URL}product/${id}?user_id=${user?.id}&tenant_id=${domain}`
      )
        .then((response) => response.json())
        .then((data) => {
          // Handle the fetched product data
          setProduct(data.product);
          console.log("Product data:", data.product);
          setGetVariants(data.lims_product_variant_data);
          visualFeedback.hideLoadingBackdrop();
        })
        .catch((error) => {
          console.error("Error fetching product:", error);
          visualFeedback.hideLoadingBackdrop();
        });
    } catch (error) {
      console.error("Error fetching product:", error);
      visualFeedback.hideLoadingBackdrop();
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "View Product",
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
                  router.replace("/(drawer)/products-inventory");
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
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.productHeader}>
          <Image
            source={{
              uri: `${IMAGE_BASE_URL}${productData?.image}`, // Replace with your image URL
            }}
            style={styles.productImage}
            resizeMode="stretch"
          />

          <View style={styles.priceContainer}>
            <Text style={styles.productName}>{productData?.name || "NA"}</Text>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Buying Price:</Text>
              <Text style={styles.priceValue}>{productData?.cost}</Text>
            </View>

            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Selling Price:</Text>
              <Text style={styles.priceValue}>{productData?.price}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.inputField}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.input}>
              <Text style={styles.value}>{productData?.type}</Text>
            </View>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.label}>Product HS Code</Text>
            <View style={styles.input}>
              <Text style={styles.value}>{productData?.hs_code}</Text>
            </View>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.label}>Code / SKU</Text>
            <View style={styles.input}>
              <Text style={styles.value}>{productData?.code}</Text>
            </View>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.label}>Brand</Text>
            <View style={styles.input}>
              <Text style={styles.value}>
                {(brands &&
                  brands.find((pro: any) => pro?.id === productData?.brand_id)
                    ?.title) ||
                  "NA"}
              </Text>
            </View>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.input}>
              <Text style={styles.value}>
                {(categories &&
                  categories.find(
                    (pro: any) => pro?.id === productData?.brand_id
                  )?.name) ||
                  "NA"}
              </Text>
            </View>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.label}>Unit</Text>
            <View style={styles.input}>
              <Text style={styles.value}>
                {productData?.unit_id === 1 ? "Piece" : "NA"}
              </Text>
            </View>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.label}>Tax</Text>
            <View style={styles.input}>
              <Text style={styles.value}>
                {
                  taxes.find((pro: any) => pro?.id === productData?.tax_id)
                    ?.name
                }
              </Text>
            </View>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.label}>Tax Method</Text>
            <View style={styles.input}>
              <Text style={styles.value}>
                {productData?.tax_method === 1
                  ? "Inclusive"
                  : productData?.tax_method === 2
                  ? "Exclusive"
                  : "NA"}
              </Text>
            </View>
          </View>
        </View>

        {/* <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Warehouse Quantity</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Warehouse</Text>
            <Text style={[styles.headerText, styles.quantityHeader]}>
              Quantity
            </Text>
          </View>

          <View style={styles.tableContent}>
            <View style={styles.tableRow}>
              <Text style={styles.warehouseName}>Harare</Text>
              <Text style={styles.quantity}>20</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.tableRow}>
              <Text style={styles.warehouseName}>Kwekwe Branch</Text>
              <Text style={styles.quantity}>30</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.tableRow}>
              <Text style={styles.warehouseName}>Gweru</Text>
              <Text style={styles.quantity}>30</Text>
            </View>
          </View>
        </View> */}
        {productData?.is_variant === 1 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Product Variant</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Variant</Text>
              <Text style={[styles.headerText, styles.codeHeader]}>
                Item Code
              </Text>
            </View>

            <View style={styles.tableContent}>
              {getVeriants?.map((item: any) => (
                <View key={item.id}>
                  <View style={styles.tableRow}>
                    <Text style={styles.variantName}>
                      {item.item_code
                        .replace("-" + productData?.code, " ")
                        .replace("/", " ")}
                    </Text>
                    <Text style={styles.variantCode}>{item.item_code}</Text>
                  </View>
                  <View style={styles.divider} />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => setShowDeleteDialog(true)}
            mode="contained"
            buttonColor={Colors.colors.background}
            style={{ flex: 1, marginRight: 8 }}
            textColor="gray"
          >
            Delete Product
          </Button>
          <Button
            onPress={() => {
              router.push(`/(drawer)/edit-product?id=${productData?.id}`);
            }}
            mode="contained"
            buttonColor={Colors.colors.primary}
            style={{ flex: 1, marginLeft: 8 }}
            textColor="#fff"
          >
            Edit Product
          </Button>
        </View>
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
      </ScrollView>
    </View>
  );
};

export default ViewProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: 10,
  },
  iconButton: {
    padding: 4,
  },
  iconContainer: {
    backgroundColor: "#090a78",
    borderRadius: 50,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    marginLeft: 20,
    color: "#000000",

    textAlign: "center",
    alignSelf: "center",
    flex: 1,
    alignItems: "center",
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
  },
  productImage: {
    height: 100,
    width: 120,
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
    color: "#000000",
  },
  priceContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  priceItem: {
    flexDirection: "row",
    alignContent: "center",
    textAlign: "center",
    alignItems: "center",
    gap: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: "#696666",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  detailsContainer: {
    paddingHorizontal: 15,
  },
  inputField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#696666",
    marginBottom: 6,
  },
  input: {
    padding: 2,
  },
  value: {
    fontSize: 16,
    color: "#000000",
  },
  sectionContainer: {
    marginTop: 25,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#cecece",
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  quantityHeader: {
    marginRight: 20,
  },
  codeHeader: {
    marginRight: 20,
  },
  tableContent: {
    borderWidth: 1,
    borderColor: "#cecece",
    borderTopWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  warehouseName: {
    fontSize: 16,
    color: "#000000",
  },
  variantName: {
    fontSize: 16,
    color: "#000000",
  },
  quantity: {
    fontSize: 18,
    color: "#000000",
    marginRight: 20,
  },
  variantCode: {
    fontSize: 18,
    color: "#000000",
  },
  divider: {
    height: 1,
    backgroundColor: "#cecece",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginTop: 30,
    marginBottom: 20,
  },
  deleteButton: {
    borderRadius: 100,
    padding: 10,
    backgroundColor: "rgba(29, 27, 32, 0.12)",
    width: "47%",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#1d1b20",
    fontSize: 16,
    fontWeight: "400",
    opacity: 0.38,
  },
  editButton: {
    borderRadius: 100,
    padding: 15,
    backgroundColor: "#090a78",
    width: "47%",
    alignItems: "center",
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
});
