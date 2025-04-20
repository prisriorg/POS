import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  FlatList,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import Checkbox from "expo-checkbox";
import React, { useState, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { EvilIcons, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { Dropdown } from "react-native-element-dropdown";
import { Spacer10, Spacer20 } from "@/src/utils/Spacing";
import { Button, List, Divider, Searchbar } from "react-native-paper";
import { useAppSelector } from "@/src/store/reduxHook";
import {
  getRandomNumber,
  productBarcode,
  productTypes,
} from "@/src/utils/GetData";
import * as ImagePicker from "expo-image-picker";
import { ScrollView } from "react-native-gesture-handler";
import { BASE_URL } from "@/src/utils/config";
import { ImagePickerAsset } from "expo-image-picker";

interface HSCodes {
  hs_code: string;
  description: string;
}

const AddProduct = () => {
  const router = useRouter();
  const { hscodes, brands, categories, taxes } = useAppSelector(
    (state) => state.home
  );
  const { domain, user } = useAppSelector((state) => state.auth);
  const [showHSCodes, setShowHSCodes] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedHSCode, setSelectedHSCode] = useState<HSCodes>({
    hs_code: "",
    description: "",
  });
  const [featured, setFeatured] = useState(false);
  const [HSCodes, setHSCodes] = useState<HSCodes[]>(hscodes || []);
  const [image, setImage] = useState<ImagePickerAsset>();

  const [formData, setFormData] = useState({
    type: "",
    productName: "",
    productCode: "",
    promotional: false,
    hsCode: "",
    barcodeSymbology: "",
    brand: "",
    category: "",
    unit: "",
    saleUnit: "",
    purchaseUnit: "",
    buyingPrice: "",
    sellingPrice: "",
    wholesalePrice: "",
    dailySaleObjective: "",
    lowStockAlert: "",
    tax: "",
    taxMethod: "inclusive",
    isActive: false,
    description: "",
    image: null,
    IMEI: false,
  });

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      // base64: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // Filter HS codes based on search text
  useEffect(() => {
    setHSCodes(hscodes);
  }, [hscodes]);

  const formSubmit = async () => {
    const data = new FormData();
    data.append("type", formData.type); // Assuming product type is 1 for now
    data.append("name", formData.productName);
    data.append("code", formData.productCode);
    data.append("hs_code", selectedHSCode.hs_code);
    data.append("barcode_symbology", formData.barcodeSymbology);
    data.append("brand_id", formData.brand);
    data.append("category_id", formData.category);
    data.append("unit", formData.unit);
    data.append("sale_unit", formData.saleUnit);
    data.append("purchase_unit_id", formData.purchaseUnit);
    data.append("cost", formData.buyingPrice);
    data.append("price", formData.sellingPrice);
    data.append("dailySaleObjective", formData.dailySaleObjective);
    data.append("lowStockAlert", formData.lowStockAlert);
    data.append("tax_id", formData.tax);
    data.append("tax_method", formData.taxMethod);
    data.append("image", JSON.stringify(image));

    const response = await fetch(
      `${BASE_URL}save/product?user_id=${user?.id}&tenat_id=${domain}`,
      {
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const result = await response.json();
    console.log("Upload ", result);
    if (result.status === "success") {
      // router.back();
    }

    // data.append("description", formData.description);
  };

  // Select HS code and close modal
  const handleSelectHSCode = (item: HSCodes) => {
    setSelectedHSCode(item);
    setShowHSCodes(false);
  };

  const renderHSCodeItem = ({ item }: { item: HSCodes }) => (
    <>
      <List.Item
        title={item.hs_code}
        description={item.description}
        onPress={() => handleSelectHSCode(item)}
        right={(props) => (
          <List.Icon
            {...props}
            icon="chevron-right"
            style={{ alignSelf: "center" }}
          />
        )}
        titleStyle={{ fontWeight: "bold" }}
        style={{ paddingVertical: 8 }}
      />
      <Divider />
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: "Add Product",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#fff",
          },

          headerTitleStyle: {
            color: Colors.colors.text,
            fontWeight: "bold",
          },
          headerLeft(props) {
            return (
              <Pressable
                onPress={() => {
                  router.replace("/(drawer)/products-inventory");
                  setFormData({
                    promotional: false,
                    type: "",
                    productName: "",
                    productCode: "",
                    hsCode: "",
                    barcodeSymbology: "",
                    brand: "",
                    category: "",
                    unit: "",
                    saleUnit: "",
                    purchaseUnit: "",
                    buyingPrice: "",
                    sellingPrice: "",
                    wholesalePrice: "",
                    dailySaleObjective: "",
                    lowStockAlert: "",
                    tax: "",
                    taxMethod: "inclusive",
                    isActive: false,
                    description: "",
                    image: null,
                    IMEI: false,
                  });
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

      <ScrollView>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Pressable onPress={pickImage}>
            {image?.uri ? (
              <Image
                source={{ uri: image.uri }}
                style={{ width: 250, height: 250 }}
              />
            ) : (
              <View
                style={{
                  margin: 20,
                  borderRadius: 10,
                  height: Dimensions.get("window").height * 0.25,
                  width: Dimensions.get("window").height * 0.25,
                  justifyContent: "center",
                  alignItems: "center",
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: "rgba(161,155,183,1)",
                }}
              >
                <EvilIcons name="image" size={50} color="black" />
                <Text style={{ fontSize: 16, color: "#000" }}>
                  Select Image
                </Text>
              </View>
            )}
          </Pressable>
        </View>
        <View
          style={{
            margin: 20,
          }}
        >
          <Text style={styles.label}>Product Type</Text>

          <Dropdown
            style={styles.input}
            data={productTypes}
            labelField="label"
            valueField="id"
            placeholderStyle={{
              color: "#cecece",
            }}
            placeholder={"Select Product Type"}
            onChange={(val) => {
              setFormData(
                (prev) => ({
                  ...prev,
                  type: val,
                }) /* Assuming product type is 1 for now */
              );
            }}
          />
          <Spacer20 />
          <Text style={styles.label}>Product Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Product Name"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, productName: text }))
            }
            selectionColor="lightgrey"
          />
          <Spacer20 />
          <Text style={styles.label}>Product Code / SKU</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter Product Code / SKU"
              value={formData.productCode}
              keyboardType="numeric"
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, productCode: text }))
              }
              selectionColor="lightgrey"
            />
            <Pressable
              onPress={() => {
                // Add reload logic here
                setFormData((prev) => ({
                  ...prev,
                  productCode: getRandomNumber(),
                }));
              }}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="reload" size={24} color={Colors.colors.primary} />
            </Pressable>
          </View>

          <Spacer20 />
          <Text style={styles.label}>HS Code</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Or Select HS Code"
            value={selectedHSCode.hs_code}
            editable={false}
            pointerEvents="none"
            selectionColor="lightgrey"
          />

          <Button
            mode="contained"
            style={{
              marginTop: 10,
              backgroundColor: Colors.colors.primary,
              borderRadius: 8,
            }}
            onPress={() => setShowHSCodes(true)}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
              }}
            >
              Select HS Code
            </Text>
          </Button>

          <Spacer10 />

          <Text style={styles.label}>Barcode Symbology</Text>
          <Dropdown
            style={styles.input}
            data={productBarcode}
            labelField="label"
            valueField="id"
            placeholderStyle={{
              color: "lightgrey",
            }}
            value={formData.barcodeSymbology}
            placeholder="Select Barcode Symbology"
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, barcodeSymbology: val }))
            }
          />

          <Spacer20 />

          <Text style={styles.label}>Brand</Text>
          <Dropdown
            style={styles.input}
            data={brands.map((brand: any) => ({
              id: brand.id,
              label: brand.title,
            }))}
            placeholderStyle={{
              color: "lightgrey",
            }}
            value={formData.brand}
            labelField="label"
            valueField="id"
            placeholder="Select Product Type"
            onChange={(val) => setFormData((prev) => ({ ...prev, brand: val }))}
          />
          <Spacer20 />
          <Text style={styles.label}>Category</Text>
          <Dropdown
            style={styles.input}
            data={categories.map((category: any) => ({
              id: category.id,
              label: category.name,
            }))}
            value={formData.category}
            placeholderStyle={{
              color: "lightgrey",
            }}
            labelField="label"
            valueField="id"
            placeholder="Select Product Type"
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, category: val }))
            }
          />

          <Spacer20 />
          <Text style={styles.label}>Unit</Text>
          <Dropdown
            style={styles.input}
            data={[
              {
                id: 1,
                label: "piece",
              },
            ]}
            value={formData.unit}
            placeholderStyle={{
              color: "lightgrey",
            }}
            labelField="label"
            valueField="id"
            placeholder="Select Product Type"
            onChange={(val) => setFormData((prev) => ({ ...prev, unit: val }))}
          />

          <Spacer20 />

          <Text style={styles.label}>Sale Unit</Text>
          <Dropdown
            style={styles.input}
            data={[
              {
                id: 1,
                label: "piece",
              },
            ]}
            value={formData.saleUnit}
            labelField="label"
            valueField="id"
            placeholderStyle={{
              color: "lightgrey",
            }}
            placeholder="Select Product Type"
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, saleUnit: val }))
            }
          />

          <Spacer20 />

          <Text style={styles.label}>Purchase Unit</Text>
          <Dropdown
            style={styles.input}
            data={[
              {
                id: 1,
                label: "piece",
              },
            ]}
            value={formData.purchaseUnit}
            labelField="label"
            valueField="id"
            placeholderStyle={{
              color: "lightgrey",
            }}
            placeholder="Select Product Type"
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, purchaseUnit: val }))
            }
          />

          <Spacer20 />

          <Text style={styles.label}>Buying Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Buying Price"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, buyingPrice: text }))
            }
            selectionColor="lightgrey"
          />

          <Spacer20 />

          <Text style={styles.label}>Selling Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Selling Price"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, sellingPrice: text }))
            }
            selectionColor="lightgrey"
          />

          <Spacer20 />

          <Text style={styles.label}>Wholesale Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Wholesale Price"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, wholesalePrice: text }))
            }
            selectionColor="lightgrey"
          />

          <Spacer20 />

          <Text style={styles.label}>Daily Sale Objective</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Daily Sale Objective"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, dailySaleObjective: text }))
            }
            selectionColor="lightgrey"
          />
          <Spacer20 />

          <Text style={styles.label}>Low Stock Alert</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Low Stock Alert"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, lowStockAlert: text }))
            }
            selectionColor="lightgrey"
          />
          <Spacer20 />
          <Text style={styles.label}>Tax</Text>
          <Dropdown
            style={styles.input}
            data={taxes.map((tax: any) => ({
              id: tax.id,
              label: tax.name,
            }))}
            value={formData.tax}
            labelField="label"
            valueField="id"
            placeholder="Enter Tax"
            placeholderStyle={{
              color: "lightgrey",
            }}
            onChange={(val) => setFormData((prev) => ({ ...prev, tax: val }))}
          />
          <Spacer20 />

          <Text style={styles.label}>Tax Method</Text>
          <Dropdown
            style={styles.input}
            data={[
              { id: "inclusive", label: "Inclusive" },
              { id: "exclusive", label: "Exclusive" },
            ]}
            labelField="label"
            valueField="id"
            placeholder="Select Tax Method"
            placeholderStyle={{
              color: "lightgrey",
            }}
            value={formData.taxMethod}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, taxMethod: val }))
            }
          />

          <Spacer20 />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              style={{}}
              value={featured}
              onValueChange={() => setFeatured(!featured)}
              color={featured ? "#4630EB" : undefined}
            />
            <View>
              <Text style={{ marginLeft: 8 }}>Featured</Text>
              <Text style={{ marginLeft: 8 }}>
                Featured product will be displayed in POS
              </Text>
            </View>
          </View>

          <Spacer20 />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[
              styles.input,
              {
                height: 100,
                textAlign: "left",
                paddingTop: 10,
                textAlignVertical: "top",
              },
            ]}
            value={formData.description}
            placeholder="Enter Product Description"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            multiline={true}
            numberOfLines={6}
            selectionColor="lightgrey"
          />
          <Spacer20 />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              style={{}}
              value={featured}
              onValueChange={() => setFeatured(!featured)}
              color={featured ? "#4630EB" : undefined}
            />
            <Text style={{ marginLeft: 8 }}>This product has variants</Text>
          </View>
          <Spacer20 />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              style={{}}
              value={featured}
              onValueChange={() => setFeatured(!featured)}
              color={featured ? "#4630EB" : undefined}
            />
            <Text style={{ marginLeft: 8 }}>
              This product has different prices for different warehouses
            </Text>
          </View>
          <Spacer20 />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              style={{}}
              value={featured}
              onValueChange={() => setFeatured(!featured)}
              color={featured ? "#4630EB" : undefined}
            />
            <Text style={{ marginLeft: 8 }}>
              This product has batch and expiration date
            </Text>
          </View>
          <Spacer20 />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              value={formData.IMEI}
              onValueChange={() => {
                setFormData((prev) => ({
                  ...prev,
                  IMEI: !formData.IMEI,
                }));
              }}
              color={formData.IMEI ? "#4630EB" : undefined}
            />
            <Text style={{ marginLeft: 8 }}>
              This product has IMEI or Serial numbers
            </Text>
          </View>
          <Spacer20 />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              value={formData.promotional}
              onValueChange={() => {
                setFormData((prev) => ({
                  ...prev,
                  promotional: !formData.promotional,
                }));
              }}
              color={formData.promotional ? "#4630EB" : undefined}
            />
            <Text style={{ marginLeft: 8 }}>Add Promotional Price</Text>
          </View>
          <Spacer20 />
          {formData.promotional && (
            <>
              <Text style={styles.label}>Promotional Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter the price of selling the product."
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, promotionalPrice: text }))
                }
                selectionColor="lightgrey"
              />
              <Spacer20 />
              <Text style={styles.label}>Promotion Starts</Text>
              <TextInput
                style={styles.input}
                placeholder="16-04-2025"
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    promotionalPriceStart: text,
                  }))
                }
                selectionColor="lightgrey"
              />
              <Spacer20 />
              <Text style={styles.label}>Promotion Ends</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose Date"
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    promotionalPriceEnd: text,
                  }))
                }
                selectionColor="lightgrey"
              />
            </>
          )}
          <Spacer20 />
          <Spacer20 />

          <Button
            mode="contained"
            style={{
              marginTop: 10,
              backgroundColor: Colors.colors.primary,
              borderRadius: 8,
            }}
            onPress={formSubmit}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
              }}
            >
              Add Product
            </Text>
          </Button>

          {/* Bottom Sheet Modal for HS Codes */}
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHSCodes}
        onRequestClose={() => setShowHSCodes(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.dismissArea}
            onPress={() => setShowHSCodes(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select HS Code</Text>
              <Pressable onPress={() => setShowHSCodes(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <Searchbar
              style={[
                styles.searchInput,
                {
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#Cecece",
                },
              ]}
              placeholder="Search by code or description"
              placeholderTextColor="#000"
              selectionColor="lightgrey"
              onChangeText={(text) => {
                setSearchText(text);
                setHSCodes(
                  hscodes.filter(
                    (item) =>
                      item.description
                        .toLowerCase()
                        .includes(text.toLowerCase()) ||
                      item.hs_code.includes(text)
                  )
                );
              }}
              value={searchText}
            />

            {HSCodes.length > 0 ? (
              <FlatList
                data={HSCodes}
                renderItem={renderHSCodeItem}
                keyExtractor={(item) => item.hs_code}
              />
            ) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No HS codes found</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: Colors.colors.text,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "white",
    color: "#000",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
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
  searchInput: {
    marginBottom: 10,
  },
  noResults: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    color: "#888",
    fontSize: 16,
  },
});
