import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  FlatList,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import { Image } from "expo-image";
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
import useVisualFeedback from "@/src/hooks/VisualFeedback/useVisualFeedback";

// Types
interface HSCodes {
  hs_code: string;
  description: string;
}

const AddProduct = () => {
  const router = useRouter();
  const visualFeedback = useVisualFeedback();
  const { hscodes, brands, categories, taxes, warehouses } = useAppSelector(
    (state) => state.home
  );
  const { domain, user } = useAppSelector((state) => state.auth);

  // State
  const [showHSCodes, setShowHSCodes] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedHSCode, setSelectedHSCode] = useState<HSCodes>({
    hs_code: "",
    description: "",
  });
  const [productVariantsData, setProductVariantsData] = useState([
    { name: "", value: "" },
  ]);

  const [warehouseStoke, setWarehouseStoke] = useState<
    { id: number; price: string }[]
  >([]);
  const [HSCodes, setHSCodes] = useState<HSCodes[]>(hscodes || []);
  const [image, setImage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    code: "",
    barcode_symbology: "",
    brand_id: "",
    category_id: "",
    hs_code: "",
    image: null,
    unit_id: "",
    sale_unit_id: "",
    purchase_unit_id: "",
    cost: "0",
    price: "0",
    wholesale_price: "0",
    tax_id: "",
    tax_method: "1",
    qty: 0,
    alert_quantity: "0",
    daily_sale_objective: "0",
    is_initial_stock: false,
    featured: false,
    is_embeded: false,
    product_details: "",
    is_variant: false,
    is_diffPrice: false,
    is_batch: false,
    is_imei: false,
    promotion: false,
    promotion_price: "0",
    starting_date: "2025-05-01",
    last_date: "2025-05-31",
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access gallery was denied"
      );
      return;
    }

    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // base64: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      console.log("Image URI: ", result.assets[0]);
      console.log("Image: ", result);
    }
  };

  // Filter HS codes based on search text
  useEffect(() => {
    setHSCodes(hscodes);
  }, [hscodes]);

  const formSubmit = async () => {
    try {
      visualFeedback.showLoadingBackdrop();
      const formDataObj = new FormData();

      // Add text fields
      formDataObj.append("name", formData.name);
      formDataObj.append("type", formData.type);
      formDataObj.append("code", formData.code);
      formDataObj.append("barcode_symbology", formData.barcode_symbology);
      formDataObj.append("brand_id", formData.brand_id);
      formDataObj.append("category_id", formData.category_id);
      formDataObj.append("hs_code", formData.hs_code);
      formDataObj.append("unit_id", formData.unit_id);
      formDataObj.append("sale_unit_id", formData.sale_unit_id);
      formDataObj.append("purchase_unit_id", formData.purchase_unit_id);

      formDataObj.append("cost", formData.cost);
      formDataObj.append("price", formData.price);
      formDataObj.append("wholesale_price", formData.wholesale_price);
      formDataObj.append("tax_id", formData.tax_id);
      formDataObj.append("tax_method", formData.tax_method);
      formDataObj.append("qty", formData.qty.toString());
      formDataObj.append("alert_quantity", formData.alert_quantity);
      formDataObj.append("daily_sale_objective", formData.daily_sale_objective);
      // formDataObj.append("is_active", formData.is_active ? "1" : "0");
      formData.is_embeded && formDataObj.append("is_embeded", "1");
      if (formData.is_initial_stock) {
        formDataObj.append("is_initial_stock", "1");
      }
      formData.featured && formDataObj.append("featured", "1");

      if (formData.is_diffPrice) {
        formDataObj.append("is_diffPrice", "1");
        warehouseStoke.forEach((item) => {
          formDataObj.append(`stock_warehouse_id[]`, item.id.toString());
          formDataObj.append(`warehouse_id[]`, item.id.toString());
          formDataObj.append(`diffPrice[]`, item.price);
        });
      }
      formData.is_batch && formDataObj.append("is_batch", "1");
      formData.is_imei && formDataObj.append("is_imei", "1");

      if (formData.promotion) {
        formDataObj.append("promotion", "1");
        formDataObj.append("promotion_price", formData.promotion_price);
        formDataObj.append("starting_date", formData.starting_date);
        formDataObj.append("last_date", formData.last_date);
      }

      formDataObj.append("product_details", formData.product_details);
      if (formData.is_variant) {
        formDataObj.append("is_variant", "1");
        productVariantsData[0].name
          ? productVariantsData.forEach((item) => {
              formDataObj.append("variant_option[]", item.name);
            })
          : formDataObj.append("variant_option", JSON.stringify([]));

        productVariantsData[0].value
          ? productVariantsData.forEach((item) => {
              formDataObj.append("variant_value[]", item.value);
            })
          : formDataObj.append("variant_value", JSON.stringify([]));

        productVariantsData[0].name
          ? productVariantsData.forEach((item) => {
              formDataObj.append("variant_name[]", item.name);
            })
          : formDataObj.append("variant_name", JSON.stringify([]));
      }

      if (image?.uri) {
        const localUri = image.uri;
        const filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : `image`;
        formDataObj.append("image", {
          uri: localUri,
          name: filename,
          type,
        } as unknown as Blob);
      }

      console.log("Form Data: ", formDataObj);

      const response = await fetch(
        `${BASE_URL}save/product?user_id=${user?.id}&tenant_id=${domain}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formDataObj,
        }
      );
      const result = await response.json();
      console.log("Upload ", result);
      if (result.status === "success") {
        visualFeedback.hideLoadingBackdrop();
        Alert.alert(
          "Success",
          "Product added successfully",
          [
            {
              text: "OK",
              onPress: () => {
                setFormData({
                  name: "",
                  type: "",
                  code: "",
                  barcode_symbology: "",
                  brand_id: "",
                  category_id: "",
                  hs_code: "",
                  image: null,
                  unit_id: "",
                  sale_unit_id: "",
                  purchase_unit_id: "",
                  cost: "0",
                  price: "0",
                  wholesale_price: "0",
                  tax_id: "",
                  tax_method: "1",
                  qty: 0,
                  alert_quantity: "0",
                  daily_sale_objective: "0",
                  is_initial_stock: false,
                  featured: false,
                  is_embeded: false,
                  product_details: "",
                  is_variant: false,
                  is_diffPrice: false,
                  is_batch: false,
                  is_imei: false,
                  promotion: false,
                  promotion_price: "0",
                  starting_date: "2025-05-01",
                  last_date: "2025-05-31",
                });
                setImage(null);
                router.replace("/(drawer)/products-inventory");
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        visualFeedback.hideLoadingBackdrop();
        Alert.alert("Error", JSON.stringify(result.error), [{ text: "OK" }], {
          cancelable: false,
        });
      }
    } catch (error) {
      console.log("Error: ", error);
      visualFeedback.hideLoadingBackdrop();
    } finally {
      visualFeedback.hideLoadingBackdrop();
    }
  };

  // Select HS code and close modal
  const handleSelectHSCode = (item: HSCodes) => {
    setSelectedHSCode(item);
    setFormData((prev) => ({ ...prev, hs_code: item.hs_code }));
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

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
          },
          headerLeft(props) {
            return (
              <Pressable
                onPress={() => {
                  router.replace("/(drawer)/products-inventory");
                  setFormData({
                    name: "",
                    type: "",
                    code: "",
                    barcode_symbology: "",
                    brand_id: "",
                    category_id: "",
                    hs_code: "",
                    image: null,
                    unit_id: "",
                    sale_unit_id: "",
                    purchase_unit_id: "",
                    cost: "0",
                    price: "0",
                    wholesale_price: "0",
                    tax_id: "",
                    tax_method: "1",
                    qty: 0,
                    alert_quantity: "0",
                    daily_sale_objective: "0",
                    is_initial_stock: false,
                    featured: false,
                    is_embeded: false,
                    product_details: "",
                    is_variant: false,
                    is_diffPrice: false,
                    is_batch: false,
                    is_imei: false,
                    promotion: false,
                    promotion_price: "0",
                    starting_date: "2025-05-01",
                    last_date: "2025-05-31",
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
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={{
                  height: Dimensions.get("window").height * 0.25,
                  width: Dimensions.get("window").height * 0.25,
                }}
              />
            ) : (
              // <>
              //   <Text>{JSON.stringify(image)}</Text>
              // </>
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
        <View style={styles.formContainer}>
          {/* Product Type */}
          <Text style={styles.label}>
            Product Type <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.input}
            data={productTypes}
            labelField="label"
            valueField="id"
            placeholderStyle={styles.placeholderStyle}
            placeholder="Select Product Type"
            onChange={(val) => updateFormData("type", val.value)}
          />
          <Spacer20 />

          {/* Product Name */}
          <Text style={styles.label}>
            Product Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Product Name"
            value={formData.name}
            onChangeText={(text) => updateFormData("name", text)}
            selectionColor="lightgrey"
          />
          <Spacer20 />

          {/* Product Code */}
          <Text style={styles.label}>
            Product Code / SKU <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWithIcon}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter Product Code / SKU"
              value={formData.code}
              keyboardType="numeric"
              onChangeText={(text) => updateFormData("code", text)}
              selectionColor="lightgrey"
            />
            <Pressable
              onPress={() => updateFormData("code", getRandomNumber())}
              style={styles.iconButton}
            >
              <Ionicons name="reload" size={24} color={Colors.colors.primary} />
            </Pressable>
          </View>
          <Spacer20 />

          {/* HS Code */}

          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => setShowHSCodes(true)}
          >
            <Text
              style={{
                color: Colors.colors.primary,
                fontSize: 16,
              }}
            >
              Select HS Code
            </Text>
          </Button>
          <Text
            style={{
              fontSize: 16,
              color: Colors.colors.text,
              marginBottom: 10,
              marginTop: 10,
              fontWeight: "bold",
            }}
          >
            Code:{" "}
            <Text
              style={{
                fontSize: 16,
                color: Colors.colors.text,
                fontWeight: "400",
              }}
            >
              {formData.hs_code ? formData.hs_code : "No HS Code selected"}
            </Text>
          </Text>
          <Spacer10 />

          {/* Barcode Symbology */}
          <Text style={styles.label}>
            Barcode Symbology <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.input}
            data={productBarcode}
            labelField="label"
            valueField="value"
            placeholderStyle={styles.placeholderStyle}
            value={formData.barcode_symbology}
            placeholder="Select Barcode Symbology"
            onChange={(val) => updateFormData("barcode_symbology", val.value)}
          />
          <Spacer20 />

          {/* Brand */}
          <Text style={styles.label}>Brand</Text>
          <Dropdown
            style={styles.input}
            data={brands.map((brand: any) => ({
              id: brand.id,
              label: brand.title,
              value: brand.id,
            }))}
            placeholderStyle={styles.placeholderStyle}
            value={formData.brand_id}
            labelField="label"
            valueField="value"
            placeholder="Select Product Brand"
            onChange={(val) => updateFormData("brand_id", val.value)}
          />
          <Spacer20 />

          {/* Category */}
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.input}
            data={categories.map((category: any) => ({
              id: category.id,
              label: category.name,
              value: category.id,
            }))}
            value={formData.category_id}
            placeholderStyle={styles.placeholderStyle}
            labelField="label"
            valueField="value"
            placeholder="Select Product Category"
            onChange={(val) => updateFormData("category_id", val.value)}
          />
          <Spacer20 />

          {/* Units Section */}
          <Text style={styles.label}>
            Unit <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.input}
            data={[{ id: 1, label: "piece", value: 1 }]}
            value={formData.unit_id}
            placeholderStyle={styles.placeholderStyle}
            labelField="label"
            valueField="value"
            placeholder="Select Product Unit"
            onChange={(val) => updateFormData("unit_id", val.value)}
          />
          <Spacer20 />

          <Text style={styles.label}>
            Sale Unit <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.input}
            data={[{ id: 1, label: "piece", value: 1 }]}
            value={formData.sale_unit_id}
            labelField="label"
            valueField="id"
            placeholderStyle={styles.placeholderStyle}
            placeholder="Select Sale Unit"
            onChange={(val) => updateFormData("sale_unit_id", val.value)}
          />
          <Spacer20 />

          <Text style={styles.label}>
            Purchase Unit <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.input}
            data={[{ id: 1, label: "piece", value: 1 }]}
            value={formData.purchase_unit_id}
            labelField="label"
            valueField="id"
            placeholderStyle={styles.placeholderStyle}
            placeholder="Select Purchase Unit"
            onChange={(val) => updateFormData("purchase_unit_id", val.value)}
          />
          <Spacer20 />

          {/* Pricing Section */}
          <Text style={styles.label}>
            Buying Price <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Buying Price"
            keyboardType="numeric"
            onChangeText={(text) => updateFormData("cost", text)}
            selectionColor="lightgrey"
          />
          <Spacer20 />

          <Text style={styles.label}>
            Selling Price <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter Selling Price"
            onChangeText={(text) => updateFormData("price", text)}
            selectionColor="lightgrey"
          />
          <Spacer20 />

          <Text style={styles.label}>Wholesale Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Wholesale Price"
            keyboardType="numeric"
            onChangeText={(text) => updateFormData("wholesale_price", text)}
            selectionColor="lightgrey"
          />
          <Spacer20 />

          {/* Stock Section */}
          <Text style={styles.label}>Daily Sale Objective</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Daily Sale Objective"
            keyboardType="numeric"
            onChangeText={(text) =>
              updateFormData("daily_sale_objective", text)
            }
            selectionColor="lightgrey"
          />
          <Spacer20 />

          <Text style={styles.label}>Low Stock Alert</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Low Stock Alert"
            keyboardType="numeric"
            onChangeText={(text) => updateFormData("alert_quantity", text)}
            selectionColor="lightgrey"
          />
          <Spacer20 />

          {/* Tax Section */}
          <Text style={styles.label}>Tax</Text>
          <Dropdown
            style={styles.input}
            data={taxes.map((tax: any) => ({
              id: tax.id,
              label: tax.name,
              value: tax.id,
            }))}
            value={formData.tax_id}
            labelField="label"
            valueField="id"
            placeholder="Select Tax"
            placeholderStyle={styles.placeholderStyle}
            onChange={(val) => updateFormData("tax_id", val.value)}
          />
          <Spacer20 />

          <Text style={styles.label}>Tax Method</Text>
          <Dropdown
            style={styles.input}
            data={[
              { id: "inclusive", label: "Inclusive", value: "1" },
              { id: "exclusive", label: "Exclusive", value: "2" },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Tax Method"
            placeholderStyle={styles.placeholderStyle}
            value={formData.tax_method}
            onChange={(val) => updateFormData("tax_method", val.value)}
          />
          <Spacer20 />

          {/* Featured Checkbox */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={formData.featured}
              onValueChange={(newValue) => {
                updateFormData("featured", newValue);
              }}
              color={formData.featured ? "#000" : undefined}
            />
            <View>
              <Text style={styles.checkboxLabel}>Featured</Text>
              <Text style={styles.checkboxDescription}>
                Featured product will be displayed in POS
              </Text>
            </View>
          </View>
          <Spacer20 />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            value={formData.product_details}
            placeholder="Enter Product Description"
            onChangeText={(text) => updateFormData("product_details", text)}
            multiline={true}
            numberOfLines={6}
            selectionColor="lightgrey"
          />
          <Spacer20 />

          {/* Variants Section */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={formData.is_variant}
              onValueChange={() =>
                updateFormData("is_variant", !formData.is_variant)
              }
              color={formData.is_variant ? "#000" : undefined}
            />
            <Text style={styles.checkboxLabel}>This product has variants</Text>
          </View>

          {formData.is_variant && (
            <>
              {productVariantsData.map((item, index) => (
                <View key={`variant-${index}`}>
                  <Spacer20 />
                  <Text style={styles.label}>
                    Option <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Size, Color, etc."
                    onChangeText={(text) => {
                      const newVariants = [...productVariantsData];
                      newVariants[index].name = text;
                      setProductVariantsData(newVariants);
                    }}
                    selectionColor="lightgrey"
                  />
                  <Spacer20 />
                  <Text style={styles.label}>
                    Value <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Variant value separated by comma"
                    onChangeText={(text) => {
                      const newVariants = [...productVariantsData];
                      newVariants[index].value = text;
                      setProductVariantsData(newVariants);
                    }}
                    selectionColor="lightgrey"
                  />
                </View>
              ))}
              <Button
                mode="contained"
                style={styles.addVariantButton}
                onPress={() => {
                  setProductVariantsData([
                    ...productVariantsData,
                    { name: "", value: "" },
                  ]);
                }}
              >
                <Text style={styles.buttonText}>Add Variant</Text>
              </Button>
              <Spacer20 />
            </>
          )}

          {/* Different Prices Section */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={formData.is_diffPrice}
              onValueChange={() =>
                updateFormData("is_diffPrice", !formData.is_diffPrice)
              }
              color={formData.is_diffPrice ? "#000" : undefined}
            />
            <Text style={styles.checkboxLabel}>
              This product has different prices for different warehouses
            </Text>
          </View>
          <Spacer20 />

          {formData.is_diffPrice && (
            <View>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Warehouses</Text>
                <Text style={styles.tableHeaderText}>Price</Text>
              </View>

              {warehouses.map((warehouse: any) => (
                <View key={warehouse.id} style={styles.tableRow}>
                  <Text style={styles.label}>{warehouse.name}</Text>
                  <TextInput
                    style={styles.warehousePriceInput}
                    placeholder="Enter price"
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      setWarehouseStoke((prev) => {
                        const updatedStock = [...prev];
                        const index = updatedStock.findIndex(
                          (item) => item.id === warehouse.id
                        );
                        if (index !== -1) {
                          updatedStock[index].price = text;
                        } else {
                          updatedStock.push({ id: warehouse.id, price: text });
                        }
                        return updatedStock;
                      });
                      console.log("Warehouse Stock: ", warehouseStoke);
                    }}
                    selectionColor="lightgrey"
                  />
                </View>
              ))}
              <Spacer20 />
            </View>
          )}

          {/* Batch and IMEI Sections */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={formData.is_batch}
              onValueChange={() =>
                updateFormData("is_batch", !formData.is_batch)
              }
              color={formData.is_batch ? "#000" : undefined}
            />
            <Text style={styles.checkboxLabel}>
              This product has batch and expiration date
            </Text>
          </View>
          <Spacer20 />

          <View style={styles.checkboxContainer}>
            <Checkbox
              value={formData.is_imei}
              onValueChange={() => updateFormData("is_imei", !formData.is_imei)}
              color={formData.is_imei ? "#000" : undefined}
            />
            <Text style={styles.checkboxLabel}>
              This product has IMEI or Serial numbers
            </Text>
          </View>
          <Spacer20 />

          {/* Promotion Section */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={formData.promotion}
              onValueChange={() =>
                updateFormData("promotion", !formData.promotion)
              }
              color={formData.promotion ? "#000" : undefined}
            />
            <Text style={styles.checkboxLabel}>Add Promotional Price</Text>
          </View>
          <Spacer20 />

          {formData.promotion && (
            <>
              <Text style={styles.label}>Promotional Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter the price of selling the product"
                keyboardType="numeric"
                onChangeText={(text) => updateFormData("promotion_price", text)}
                selectionColor="lightgrey"
              />
              <Spacer20 />

              <Text style={styles.label}>Promotion Starts</Text>
              <TextInput
                style={styles.input}
                placeholder="16-04-2025"
                onChangeText={(text) => updateFormData("starting_date", text)}
                selectionColor="lightgrey"
              />
              <Spacer20 />

              <Text style={styles.label}>Promotion Ends</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose Date"
                onChangeText={(text) => updateFormData("last_date", text)}
                selectionColor="lightgrey"
              />
            </>
          )}
          <Spacer20 />
          <Spacer20 />

          {/* Submit Button */}
          <Button
            mode="contained"
            style={styles.submitButton}
            onPress={formSubmit}
          >
            <Text style={styles.buttonText}>Add Product</Text>
          </Button>
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
                    (item: any) =>
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
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 20,
  },
  imagePickerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    height: Dimensions.get("window").height * 0.25,
    width: Dimensions.get("window").height * 0.25,
    borderRadius: 10,
  },
  imagePlaceholder: {
    margin: 20,
    borderRadius: 10,
    height: Dimensions.get("window").height * 0.25,
    width: Dimensions.get("window").height * 0.25,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(161,155,183,1)",
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: "#000",
  },
  formContainer: {
    margin: 20,
  },
  label: {
    fontSize: 16,
    color: Colors.colors.text,
    marginBottom: 10,
  },
  required: {
    color: "red",
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
  placeholderStyle: {
    color: "lightgrey",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 10,
  },
  textArea: {
    height: 100,
    textAlign: "left",
    paddingTop: 10,
    textAlignVertical: "top",
    borderColor: "#ccc",
    backgroundColor: "white",
    color: "#000",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  actionButton: {
    marginTop: 10,
    color: Colors.colors.primary,
    borderColor: Colors.colors.primary,
    borderWidth: 1,

    borderRadius: 8,
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: Colors.colors.primary,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.colors.card,
    fontSize: 16,
  },
  checkboxContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  checkboxDescription: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  addVariantButton: {
    marginTop: 10,
    backgroundColor: Colors.colors.primary,
    borderRadius: 8,
    width: "50%",
  },
  tableHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tableRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  warehousePriceInput: {
    width: "40%",
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
    flex: 1,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    color: Colors.colors.text,
  },
  searchInput: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#Cecece",
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
