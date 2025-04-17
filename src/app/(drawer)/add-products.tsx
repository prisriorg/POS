import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  FlatList,
  Image,
} from "react-native";
import Checkbox from "expo-checkbox";
import React, { useState, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { EvilIcons, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { Dropdown } from "react-native-element-dropdown";
import { Spacer20 } from "@/src/utils/Spacing";
import { Button, TextInput, List, Divider } from "react-native-paper";
import { useAppSelector } from "@/src/store/reduxHook";
import { productBarcode, productTypes } from "@/src/utils/GetData";
import * as ImagePicker from "expo-image-picker";
import { ScrollView } from "react-native-gesture-handler";
import { BASE_URL } from "@/src/utils/config";

interface HSCodes {
  hs_code: string;
  description: string;
}

const AddProduct = () => {
  const router = useRouter();
  const { hscodes, brands } = useAppSelector((state) => state.home);

  const { domain, user } = useAppSelector((state) => state.auth);
  const [showHSCodes, setShowHSCodes] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedHSCode, setSelectedHSCode] = useState<HSCodes>({
    hs_code: "",
    description: "",
  });
  const [featured, setFeatured] = useState(false);
  const [HSCodes, setHSCodes] = useState<HSCodes[]>(hscodes || []);
  const [image, setImage] = useState<{
    uri: string;
    width: number;
    height: number;
    type: string | undefined;
    fileName: string | null | undefined;
  }>({
    uri: "",
    width: 0,
    height: 0,
    type: "",
    fileName: "",
  });

  const [formData, setFormData] = useState({
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
  });

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      // base64: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage({
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
        type: result.assets[0].type,
        fileName: result.assets[0].fileName,
      });
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
    data.append("image", image.uri);

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
    console.log("UPload ", result);
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
                  router.back();
                }}
                style={{
                  padding: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#65558F",
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
            {image.uri ? (
              <Image
                source={{ uri: image.uri }}
                style={{ width: 250, height: 250 }}
              />
            ) : (
              <EvilIcons name="image" size={250} color="black" />
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
            placeholder="Select Product Type"
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
            textColor="#000"
            selectionColor="#000"
            placeholderTextColor="#000"
          />
          <Spacer20 />
          <Text style={styles.label}>Product Code / SKU</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Product Code / SKU"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, productCode: text }))
            }
            textColor="#000"
            selectionColor="#000"
            placeholderTextColor="#000"
          />

          <Spacer20 />
          <Text style={styles.label}>HS Code</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Or Select HS Code"
            value={selectedHSCode.hs_code}
            editable={false}
            pointerEvents="none"
            textColor="#000"
            selectionColor="#000"
            placeholderTextColor="#000"
          ></TextInput>

          <Button
            mode="contained"
            style={{
              marginTop: 10,
              backgroundColor: "#65558F",
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
          <Spacer20 />

          <Text style={styles.label}>Barcode Symbology</Text>
          <Dropdown
            style={styles.input}
            data={productBarcode}
            labelField="label"
            valueField="id"
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
            labelField="label"
            valueField="id"
            placeholder="Select Product Type"
            onChange={(val) => setFormData((prev) => ({ ...prev, brand: val }))}
          />
          <Spacer20 />
          <Text style={styles.label}>Category</Text>
          <Dropdown
            style={styles.input}
            data={[]}
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
            data={[]}
            value={""}
            labelField="label"
            valueField="id"
            placeholder="Select Product Type"
            onChange={(val) => setFormData((prev) => ({ ...prev, unit: val }))}
          />

          <Spacer20 />

          <Text style={styles.label}>Sale Unit</Text>
          <Dropdown
            style={styles.input}
            data={[]}
            value={""}
            labelField="label"
            valueField="id"
            placeholder="Select Product Type"
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, saleUnit: val }))
            }
          />

          <Spacer20 />

          <Text style={styles.label}>Purchase Unit</Text>
          <Dropdown
            style={styles.input}
            data={[]}
            value={""}
            labelField="label"
            valueField="id"
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
            textColor="#000"
            selectionColor="#000"
            placeholderTextColor="#000"
          />

          <Spacer20 />

          <Text style={styles.label}>Selling Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Selling Price"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, sellingPrice: text }))
            }
            textColor="#000"
            selectionColor="#000"
            placeholderTextColor="#000"
          />

          <Spacer20 />

          <Text style={styles.label}>Wholesale Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Wholesale Price"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, wholesalePrice: text }))
            }
            textColor="#000"
            selectionColor="#000"
            placeholderTextColor="#000"
          />

          <Spacer20 />

          <Text style={styles.label}>Daily Sale Objective</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Daily Sale Objective"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, dailySaleObjective: text }))
            }
            textColor="#000"
            selectionColor="#000"
            placeholderTextColor="#000"
          />
          <Spacer20 />

          <Text style={styles.label}>Low Stock Alert</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Low Stock Alert"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, lowStockAlert: text }))
            }
            textColor="#000"
            selectionColor="#000"
            placeholderTextColor="#000"
          />
          <Spacer20 />
          <Text style={styles.label}>Tax</Text>
          <Dropdown
            style={styles.input}
            data={[]}
            labelField="label"
            valueField="id"
            placeholder="Enter Tax"
            onChange={(val) => setFormData((prev) => ({ ...prev, tax: val }))}
          />
          <Spacer20 />

          <Text style={styles.label}>Tax Method</Text>
          <Dropdown
            style={styles.input}
            data={[
              { id: 1, label: "Inclusive" },
              { id: 2, label: "Exclusive" },
            ]}
            labelField="label"
            valueField="id"
            placeholder="Select Tax Method"
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, taxMethod: val }))
            }
          />

          <Spacer20 />

          <Text style={styles.label}>Is Active</Text>
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
            style={{
              borderColor: "#ccc",
              backgroundColor: "white",
              borderWidth: 1,
              borderRadius: 4,
              paddingHorizontal: 8,
            }}
            placeholder="Enter Product Description"
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            multiline={true}
            numberOfLines={6}
            textColor="#000"
            selectionColor="#000"
            placeholderTextColor="#000"
          />
          <Spacer20 />

          <Button
            mode="contained"
            style={{
              marginTop: 10,
              backgroundColor: "#65558F",
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

            <TextInput
              style={styles.searchInput}
              placeholder="Search by code or description"
              placeholderTextColor="#000"
              textColor="#000"
              selectionColor="#000"
              onChangeText={setSearchText}
              value={searchText}
              mode="outlined"
            />

            {HSCodes.length > 0 ? (
              <FlatList
                data={HSCodes}
                renderItem={renderHSCodeItem}
                keyExtractor={(item) => item.hs_code}
                style={styles.list}
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
    fontWeight: "bold",
    color: Colors.colors.text,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "white",
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
    fontSize: 18,
    fontWeight: "bold",
  },
  searchInput: {
    marginBottom: 10,
  },
  list: {
    marginTop: 10,
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
