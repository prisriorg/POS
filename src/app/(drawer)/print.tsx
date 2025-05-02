import { Alert, Modal, Pressable, ScrollView,Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { Stack, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHook";
import BluetoothPrinter, {
  type iDevice,
} from "@linvix-sistemas/react-native-bluetooth-printer";
// import SunmiPrinter, { AlignValue } from "@heasy/react-native-sunmi-printer";

import {
  Printer,
  Style,
  Align,
  Model,
  InMemory,
  Cut,
} from "@linvix-sistemas/react-native-escpos-buffer";
import { setCart } from "@/src/store/reducers/homeReducer";
import LCPrinter from "@/src/utils/LCPrinter";
import { Spacer20 } from "@/src/utils/Spacing";
import QRCode from "react-native-qrcode-svg";

interface Currency {
  code: string;
  exchange_rate: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  count: number;
  actual_price: number;
  tax_amount: number;
}

const PrintPage = () => {
  const router = useRouter();
  const {
    qrCode,
    customers,
    cart: originalCart,
    currencies,
  } = useAppSelector((state) => state.home);

  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const [Devices, setDevices] = useState<iDevice[]>([]);
  const [showDevices, setShowDevices] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    qrCode?.selectedCurrency || currencies[0]
  );
  
  const [selectedDevice, setSelectedDevice] = useState<iDevice>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPrinters, setShowPrinters] = useState(false);
  const [qrRef, setQrRef] = useState<any>(null);
  const [pData, setPData] = useState({
    wName: (user.warehouses[0]?.name || "").toUpperCase(),
    wAddress: user.warehouses[0]?.address || "",
    wEmail: user.warehouses[0]?.email || "",
    wPhone: user.warehouses[0]?.phone || "",
    date: qrCode?.date || "",
    ref: qrCode?.qrText || "",
    total: qrCode?.total || 0,
    netAmount: qrCode?.netAmount || 0,
    sdRate: qrCode?.sdRate || 0,
    growAmount: qrCode?.growAmount || 0,
    qrCode: qrCode.qrCode || "",
    qrText: qrCode.qrText || "",
    amount: qrCode.amount || 0,
    code: selectedCurrency?.code || "USD",
  });

  // Step 2: Create a function to generate base64 from QR code
  const generateQRBase64 = useCallback(() => {
    if (qrRef && pData?.qrText) {
        qrRef.toDataURL((dataURL) => {
          // Extract the base64 part without the data URL prefix
          const base64Data = dataURL.split(",")[1];
          // Update state with the QR code base64 data
          setPData((prevData) => ({
            ...prevData,
            qrCode: dataURL,
          }));
        });
    }
  }, [qrRef, pData?.qrText]);
  useEffect(() => {
    if (qrRef && pData?.qrText) {
      generateQRBase64();
    }
  }, [qrRef, pData?.qrText, generateQRBase64]);

  useEffect(() => {
    goEnableBluetooth();
  }, []);

  const convertBufferToBytes = (buffer: Buffer) => {
    const bytes: number[] = [];
    Array.from(buffer).map((byte) => {
      bytes.push(byte);
    });
    return bytes;
  };

  useEffect(() => {
    const foundListener = BluetoothPrinter.onDeviceFound((device: iDevice) => {
      console.log(device);
      setDevices((old) => {
        if (!old.some((d) => d.address === device.address)) {
          old.push(device);
        }

        return [...old];
      });
    });

    // Listen for already paired devices
    const pairedListener = BluetoothPrinter.onDeviceAlreadyPaired(
      (devices: iDevice[]) => {
        (devices ?? []).map((device) => {
          setDevices((old) => {
            if (!old.some((d) => d.address === device.address)) {
              old.push(device);
            }

            return [...old];
          });
        });
      }
    );

    const ontts = BluetoothPrinter.onScanDone((data) => {
      console.log("Dtaa", data);
    });

    return () => {
      foundListener?.remove();
      pairedListener?.remove();
      ontts?.remove();
    };
  }, []);

  const goScanDevices = async () => {
    try {
      setDevices([]);
      setIsLoading(true);

      const devices = await BluetoothPrinter.scanDevices();
      console.log(devices);
      setIsLoading(false);
    } catch (error: Error | any) {
      console.log("Scan: ", error);
      setIsLoading(false);
      // Alert.alert("Scan ", error.message);
    }
  };

  const goEnableBluetooth = async () => {
    try {
      await BluetoothPrinter.requestPermission();
      await BluetoothPrinter.enableBluetooth();
      if (await BluetoothPrinter.isBluetoothEnabled()) {
        setIsBluetoothEnabled(true);
        await goScanDevices();
      }
    } catch (error: Error | any) {
      Alert.alert(error.message);
    }
  };

  const goConnect = async (device: iDevice) => {
    try {
      const connect = await BluetoothPrinter.connect(device.address);
      console.log(connect);
      setShowDevices(false);
      printWithBluetoothPrinter(connect);
    } catch (error: Error | any) {
      console.log("" + error);
      // Alert.alert(error.message);
    }
  };

  // const printWithSunmiPrinter = async () => {
  //   try {
  //     const cust = customers.find((c) => c.id === qrCode?.customer);
  //     const warehouse = user.warehouses[0];
  //     const result = await SunmiPrinter.hasPrinter();

  //     if (result) {
  //       // Start printing - match the preview format exactly
  //       SunmiPrinter.setAlignment(AlignValue.CENTER);
  //       SunmiPrinter.setFontSize(30);
  //       SunmiPrinter.setFontWeight(true);
  //       SunmiPrinter.printerText(`${warehouse?.name || ""}\n`);
  //       SunmiPrinter.lineWrap(1);

  //       // Store Details
  //       SunmiPrinter.setFontWeight(false);
  //       SunmiPrinter.setFontSize(24);
  //       SunmiPrinter.setAlignment(AlignValue.CENTER);
  //       SunmiPrinter.printerText(`${warehouse?.address || ""}\n`);
  //       SunmiPrinter.printerText(`${warehouse?.email || ""}\n`);
  //       SunmiPrinter.printerText(`${warehouse?.phone || ""}\n`);
  //       SunmiPrinter.lineWrap(1);

  //       // Invoice header
  //       SunmiPrinter.setAlignment(AlignValue.CENTER);
  //       SunmiPrinter.setFontWeight(false);
  //       SunmiPrinter.printerText("----------------------------\n");
  //       SunmiPrinter.setFontWeight(true);
  //       SunmiPrinter.setFontSize(28);
  //       SunmiPrinter.setAlignment(AlignValue.CENTER);
  //       SunmiPrinter.printerText(`FISCAL TAX INVOICE\n`);
  //       SunmiPrinter.setFontWeight(false);
  //       SunmiPrinter.setFontSize(24);
  //       SunmiPrinter.setAlignment(AlignValue.CENTER);
  //       SunmiPrinter.printerText("----------------------------\n");
  //       SunmiPrinter.lineWrap(1);

  //       // Customer info
  //       SunmiPrinter.setFontWeight(false);
  //       SunmiPrinter.setFontSize(24);
  //       SunmiPrinter.setAlignment(AlignValue.LEFT);
  //       SunmiPrinter.printerText(`Date: ${pData.date}\n`);
  //       SunmiPrinter.printerText(`Reference: ${pData?.qrText || ""}\n`);
  //       SunmiPrinter.printerText(`Customer: ${cust?.name || ""}\n`);
  //       SunmiPrinter.printerText(`Address: ${cust?.address || ""}\n`);
  //       SunmiPrinter.printerText(`Phone: ${cust?.phone_number || ""}\n`);
  //       SunmiPrinter.printerText("----------------------------\n");
  //       SunmiPrinter.lineWrap(1);

  //       // Items header
  //       SunmiPrinter.setFontWeight(false);
  //       SunmiPrinter.setFontSize(20);
  //       SunmiPrinter.printColumnsString(
  //         ["Description", "Amount"],
  //         [60, 40],
  //         [AlignValue.LEFT, AlignValue.RIGHT]
  //       );

  //       // Items
  //       SunmiPrinter.setFontSize(16);
  //       for (const item of originalCart) {
  //         SunmiPrinter.printColumnsString(
  //           [
  //             `${item?.name}\n${item?.count} X ${item?.price}`,
  //             `${selectedCurrency?.code || "USD"} ${
  //               item?.price *
  //               item?.count *
  //               (selectedCurrency?.exchange_rate || 1)
  //             }`,
  //           ],
  //           [60, 40],
  //           [AlignValue.LEFT, AlignValue.RIGHT]
  //         );
  //       }

  //       // Totals
  //       SunmiPrinter.setFontSize(24);
  //       SunmiPrinter.lineWrap(1);
  //       SunmiPrinter.printerText("----------------------------\n");
  //       SunmiPrinter.lineWrap(1);

  //       // Total row
  //       SunmiPrinter.printColumnsString(
  //         [
  //           "Total",
  //           `${selectedCurrency?.code || "USD"} ${qrCode?.amount || 0}`,
  //         ],
  //         [60, 40],
  //         [AlignValue.LEFT, AlignValue.RIGHT]
  //       );

  //       // Currency info
  //       SunmiPrinter.setAlignment(AlignValue.CENTER);
  //       SunmiPrinter.setFontWeight(false);
  //       SunmiPrinter.printerText("----------------------------\n");
  //       SunmiPrinter.printerText(
  //         `Invoiced Currency: ${selectedCurrency?.code || "USD"}\n`
  //       );
  //       SunmiPrinter.printerText("----------------------------\n");

  //       // Final totals
  //       SunmiPrinter.setAlignment(AlignValue.LEFT);
  //       SunmiPrinter.printColumnsString(
  //         [
  //           "Net Amount:",
  //           `${selectedCurrency?.code || "USD"} ${qrCode?.netAmount || 0}`,
  //         ],
  //         [60, 40],
  //         [AlignValue.LEFT, AlignValue.RIGHT]
  //       );
  //       SunmiPrinter.printColumnsString(
  //         [
  //           "Standard Rated",
  //           `${selectedCurrency?.code || "USD"} ${qrCode?.sdRate || 0}`,
  //         ],
  //         [60, 40],
  //         [AlignValue.LEFT, AlignValue.RIGHT]
  //       );
  //       SunmiPrinter.printColumnsString(
  //         [
  //           "Gross Amount:",
  //           `${selectedCurrency?.code || "USD"} ${qrCode?.growAmount || 0}`,
  //         ],
  //         [60, 40],
  //         [AlignValue.LEFT, AlignValue.RIGHT]
  //       );

  //       SunmiPrinter.lineWrap(2);

  //       // Print QR code
  //       SunmiPrinter.setAlignment(AlignValue.CENTER);
  //       if (qrCode?.qrCode) {
  //         try {
  //           // Try to print QR directly
  //           SunmiPrinter.printQRCode(pData.qrText, 4, 1);
  //         } catch (qrError) {
  //           console.log("Error printing QR code directly:", qrError);
  //           try {
  //             // If direct printing fails, try printing as image
  //             SunmiPrinter.printBitmap(
  //               `data:image/png;base64,${pData.qrCode}`,
  //               4
  //             );
  //           } catch (imgError) {
  //             console.error("Error printing QR as image:", imgError);
  //           }
  //         }
  //       }
  //       SunmiPrinter.lineWrap(2);
  //       SunmiPrinter.printerText("Scan this QR code\n");
  //       SunmiPrinter.lineWrap(1);

  //       SunmiPrinter.cutPaper();

  //       // Clear cart and go back
  //       Alert.alert("Success", "Receipt printed successfully");
  //       afterPrint();
  //     } else {
  //       Alert.alert("Failed", "Sunmi printer not available");
  //     }
  //   } catch (error: Error | any) {
  //     console.log("Error printing:", error);
  //     Alert.alert("Error", `Failed to print receipt: ${error}`);
  //   }
  // };
  // const printWithBluetoothPrinter = async (device: iDevice) => {
  //   try {
  //     if (!device?.address) {
  //       throw new Error("No printer selected or printer address missing");
  //     }

  //     const customer = customers.find((c) => c.id === qrCode?.customer);
  //     const warehouse = user.warehouses[0];

  //     // Create a printer instance for formatting
  //     const connection = new InMemory();
  //     const printer = await Printer.CONNECT("TM-T20", connection);

  //     // Header - Store Name
  //     // await printer.setStyles([Style.Bold, Style.DoubleHeight, Style.DoubleWidth]);
  //     await printer.setAlignment(Align.Center);
  //     await printer.writeln(warehouse?.name || "");
  //     // Removed non-existent setStyles method
  //     await printer.feed(1);
  //     var width = await printer.columns;
  //     console.log("Printer Width", width);

  //     // Store Details
  //     await printer.setAlignment(Align.Center);
  //     await printer.writeln(warehouse?.address || "");
  //     if (warehouse?.email) {
  //       await printer.writeln(warehouse?.email || "");
  //     }
  //     await printer.writeln(warehouse?.phone || "");
  //     await printer.feed(1);

  //     // Invoice header
  //     await printer.setAlignment(Align.Center);
  //     await printer.writeln("--------------------------------");
  //     await printer.writeln("FISCAL TAX INVOICE", Style.Bold);
  //     await printer.writeln("--------------------------------");
  //     await printer.feed(1);

  //     // Customer info
  //     await printer.setAlignment(Align.Left);
  //     await printer.writeln(`Date: ${pData.date}}`);
  //     await printer.writeln(`Reference: ${pData?.qrText || ""}`);
  //     await printer.writeln(`Customer: ${customer?.name || ""}`);
  //     await printer.writeln(`Address: ${customer?.address || ""}`);
  //     await printer.writeln(`Phone: ${customer?.phone_number || ""}`);
  //     await printer.writeln("--------------------------------");
  //     await printer.feed(1);

  //     // Items header - use formatted text with fixed width columns
  //     await printer.setAlignment(Align.Left);
  //     await printer.writeln(
  //       formatTableLine("Description", "Amount", (printer.columns || 42) + 4),
  //       Style.Bold,
  //       Align.Center
  //     );
  //     await printer.writeln("");
  //     // Items - format each line with proper spacing
  //     for (const item of originalCart) {
  //       const itemName =
  //         item.name.length > 20
  //           ? item.name.substring(0, 17) + "..."
  //           : item.name;
  //       const qtyPrice = `${item.count} x ${item.price.toFixed(2)}`;
  //       const amount = `${selectedCurrency?.code || "USD"} ${(
  //         item.count *
  //         item.price *
  //         (selectedCurrency?.exchange_rate || 1)
  //       ).toFixed(2)}`;

  //       // Print item name
  //       await printer.writeln(itemName);

  //       // Print quantity and price on one line, with amount right-aligned
  //       const line = formatTableLine(
  //         qtyPrice,
  //         amount,
  //         (printer.columns || 42) + 4
  //       );
  //       await printer.writeln(line);

  //       // Add a small space between items
  //       await printer.writeln("");
  //     }

  //     // Totals
  //     await printer.feed(1);
  //     await printer.writeln("--------------------------------");
  //     await printer.feed(1);

  //     // Total row - format with proper alignment
  //     const totalLine = formatTableLine(
  //       "Total",
  //       `${selectedCurrency?.code || "USD"} ${qrCode?.amount || 0}`,
  //       (printer.columns || 42) + 4
  //     );
  //     await printer.writeln(totalLine);

  //     // Currency info
  //     await printer.setAlignment(Align.Center);
  //     await printer.writeln("--------------------------------");
  //     await printer.writeln(
  //       `Invoiced Currency: ${selectedCurrency?.code || "USD"}`
  //     );
  //     await printer.writeln("--------------------------------");

  //     // Final totals - format each line
  //     await printer.setAlignment(Align.Left);
  //     const netAmountLine = formatTableLine(
  //       "Net Amount:",
  //       `${selectedCurrency?.code || "USD"} ${qrCode?.netAmount || 0}`,
  //       (printer.columns || 42) + 4
  //     );
  //     await printer.writeln(netAmountLine);

  //     const standardRatedLine = formatTableLine(
  //       "Standard Rated",
  //       `${selectedCurrency?.code || "USD"} ${qrCode?.sdRate || 0}`,
  //       (printer.columns || 42) + 4
  //     );
  //     await printer.writeln(standardRatedLine);

  //     const grossAmountLine = formatTableLine(
  //       "Gross Amount:",
  //       `${selectedCurrency?.code || "USD"} ${qrCode?.growAmount || 0}`,
  //       (printer.columns || 42) + 4
  //     );
  //     await printer.writeln(grossAmountLine);

  //     // Print QR code if available
  //     if (qrCode?.qrCode) {
  //       await printer.feed(1);
  //       await printer.setAlignment(Align.Center);

  //       // QR code
  //       await printer.qrcode(qrCode.qrText, 7);

  //       await printer.feed(1);
  //       await printer.writeln("Scan this QR code");
  //     }

  //     // Print footer
  //     await printer.feed(1);
  //     await printer.setAlignment(Align.Center);
  //     // await printer.writeln('Thank you for your business!');
  //     await printer.writeln("--------------------------------");
  //     await printer.feed(3);
  //     await printer.cutter(Cut.Full);
  //     await printer.close();

  //     // Get buffer and convert to bytes for printing
  //     const buffer = connection.buffer();
  //     const bytes = convertBufferToBytes(buffer);

  //     // Print the formatted content
  //     const result = await BluetoothPrinter.printRaw(bytes);
  //     console.log("Print result:", result);

  //     Alert.alert("Success", "Receipt printed successfully");

  //     afterPrint();
  //   } catch (error) {
  //     console.error("Error printing with Bluetooth printer:", error);
  //     Alert.alert("Print Error", "Failed to print receipt. Please try again.");
  //     throw error;
  //   }
  // };
  const printWithLCPrinter = async () => {
    try {
      setIsLoading(true);

      // Initialize printer
      await LCPrinter.initPrinter();

      const customer = customers.find((c) => c.id === qrCode?.customer);
      const warehouse = user.warehouses[0];

      // Print receipt using the formatted API similar to Sunmi
      await LCPrinter.printReceipt({
        storeName: warehouse?.name || "",
        storeAddress: warehouse?.address || "",
        storeEmail: warehouse?.email || "",
        storePhone: warehouse?.phone || "",
        customerName: customer?.name || "",
        customerAddress: customer?.address || "",
        customerPhone: customer?.phone_number || "",
        date: pData.date,
        reference: qrCode?.qrText || "",
        currency: selectedCurrency?.code || "USD",
        totalAmount: (qrCode?.amount || 0).toString(),
        netAmount: (qrCode?.netAmount || 0).toString(),
        stdRate: (qrCode?.sdRate || 0).toString(),
        grossAmount: (qrCode?.growAmount || 0).toString(),
        items: originalCart.map((item) => ({
          name: item.name,
          price: item.price,
          count: item.count,
          total:
            item.price * item.count * (selectedCurrency?.exchange_rate || 1),
        })),
        qrCode: pData.qrText || "",
      });

      Alert.alert("Success", "Receipt printed successfully");
      afterPrint();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Print Error", "Failed to print receipt. Please try again.");
    }
  };

  const afterPrint = () => {
    dispatch(setCart([]));
    router.back();
  };
  // Helper function to format table lines with proper alignment
  const formatTableLine = (
    leftText: string,
    rightText: string,
    totalWidth: number
  ) => {
    // Calculate spaces needed between left and right text
    const spacesNeeded = totalWidth / 1.6 - leftText.length - rightText.length;
    const spaces = " ".repeat(Math.max(1, spacesNeeded));
    return `${leftText}${spaces}${rightText}`;
  };

  const printerList = [
    {
      name: "Sunmi Built-in Printer",
      icon: "printer",
      description: "Print using the device's built-in printer",
      onPress: () => {
        setShowPrinters(false);
        printWithSunmiPrinter();
      },
    },
    {
      name: "Bluetooth Printer",
      icon: "printer",
      description: "Connect to an external Bluetooth printer",

      onPress: () => {
        setShowPrinters(false);
        setShowDevices(true);
      },
    },
    {
      name: "H3 Yokoscan Printer",
      icon: "printer",
      description: "Print using the H3 Yokoscan  printer",
      onPress: () => {
        setShowPrinters(false);
        try {
          printWithLCPrinter();
        } catch (e) {
          Alert.alert(e);
        }
      },
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen
        options={{
          title: "Print Receipt",
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
      <ScrollView style={styles.content}>
        <View style={styles.previewContainer}>
          {/* Store Name - Centered, Large */}
          <Text   style={styles.centerText}>
            {pData.wName}
          </Text>
          <Spacer20 />

          {/* Store Details - Centered */}
          <Text   style={styles.centerText}>
            {pData.wAddress}
          </Text>
          {pData.wEmail && (
            <Text   style={styles.centerText}>
              {pData.wEmail}
            </Text>
          )}
          <Text   style={styles.centerText}>
            {pData.wPhone}
          </Text>

          <Spacer20 />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Invoice Header - Centered */}
          <Text  style={styles.centerText}>
            FISCAL TAX INVOICE
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Date and Customer Info - Left Aligned */}
          <Text  >
            Date: {pData.date || ""}
          </Text>
          <Text  >
            Reference: {pData.qrText || ""}
          </Text>
          <Text  >
            Customer:{" "}
            {customers.find((c) => c.id === qrCode?.customer)?.name || ""}
          </Text>
          <Text  >
            Address:{" "}
            {customers.find((c) => c.id === qrCode?.customer)?.address || ""}
          </Text>
          <Text  >
            Phone:{" "}
            {customers.find((c) => c.id === qrCode?.customer)?.phone_number ||
              ""}
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Items Header */}
          <View style={styles.itemsHeader}>
            <Text   style={styles.descriptionColumn}>
              Description
            </Text>
            <Text   style={styles.amountColumn}>
              Amount
            </Text>
          </View>

          {/* Items */}
          {originalCart.map((item: CartItem) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.descriptionColumn}>
                <Text  >
                  {item.name}
                </Text>
                <Text >
                  {item.count} X {item.price}
                </Text>
              </View>
              <Text   style={styles.amountColumn}>
                {selectedCurrency?.code || "USD"}{" "}
                {(
                  item.price *
                  item.count *
                  (selectedCurrency?.exchange_rate || 1)
                ).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Divider */}
          {/* <View style={styles.divider} /> */}

          {/* Totals */}
          <View style={styles.totalRow}>
            <Text  >
              Total
            </Text>
            <Text  >
              {pData?.code || "USD"} {pData.amount || 0}
            </Text>
          </View>
          <View style={styles.divider} />
          {/* Currency Info */}
          <Text   style={styles.centerText}>
            Invoiced Currency: {pData?.code || "USD"}
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Final Totals */}
          <View style={styles.totalRow}>
            <Text  >
              Net Amount:
            </Text>
            <Text  >
              {pData?.code || "USD"} {pData?.netAmount || 0}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text  >
              Standard Rated
            </Text>
            <Text  >
              {pData?.code || "USD"} {pData?.sdRate || 0}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text  >
              Gross Amount:
            </Text>
            <Text >
              {pData?.code || "USD"} {pData?.growAmount || 0}
            </Text>
          </View>

          {/* QR Code Preview */}
          <View style={styles.qrContainer}>
            {pData?.qrText ? (
              <Image
                source={{
                  uri: `data:image/png;base64,${pData.qrCode}`,
                }}
                style={{ height: 100, width: 100 }}
                resizeMode="contain"
              />
              // <QRCode
              //   value={pData?.qrText}
              //   size={100}
              //   getRef={(ref) => setQrRef(ref)}
              // />
            ) : (
              <View style={styles.qrError}>
                <Text>
                  QR Code not available
                </Text>

                <Spacer20 />
              </View>
            )}
            <Text style={styles.qrHint}  >
              Scan this QR code
            </Text>
          </View>
        </View>

        <View style={styles.divider} />
        <Spacer20 />
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => {
            dispatch(setCart([]));
            // NavService.navigate(EHomeStack.SALES);
          }}
        >
          <Text >
            Cancel
          </Text>
        </Pressable>
        <Pressable
          style={styles.printButton}
          onPress={() => setShowPrinters(true)}
          disabled={isPrinting}
        >
          {/* <PrinterIcon color={theme.colors.white} size={24} /> */}
          <Text style={{ color:"#fff" }}>
            {isPrinting ? "Printing..." : "Print Receipt"}
          </Text>
        </Pressable>
      </View>

      {/* Printer Type Modal */}
      <Modal visible={showPrinters} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent]}>
            <View style={styles.modalHeader}>
              <Text >
                Select Printer Type
              </Text>
              <Pressable onPress={() => setShowPrinters(false)}>
                <Text>
                  Close
                </Text>
              </Pressable>
            </View>

            <View style={styles.printerTypeContainer}>
              {printerList.map((printer) => (
                <TouchableOpacity
                  key={printer.name}
                  style={styles.printerTypeOption}
                  onPress={printer.onPress}
                >
                  <View style={styles.printerIconContainer}>
                    {/* <PrinterIcon size={32} color={theme.colors.primary} /> */}
                  </View>
                  <Text >
                    {printer.name}
                  </Text>
                  <Text>
                    Print using the device's built-in printer
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Bluetooth Device Modal */}
      <Modal visible={showDevices} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text >
                Select Printer
              </Text>
              <Pressable onPress={() => setShowDevices(false)}>
                <Text >
                  Close
                </Text>
              </Pressable>
            </View>

            <View style={styles.scanHeader}>
              <Text >
                Available Printers
              </Text>
              <View style={styles.scanControls}>
                {!isBluetoothEnabled ? (
                  <Pressable
                    style={styles.bluetoothButton}
                    onPress={() => goEnableBluetooth()}
                  >
                    <Text color="red" variant="t12M">
                      Enable Bluetooth
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[
                      styles.refreshButton,
                      isLoading && styles.refreshButtonActive,
                    ]}
                    onPress={async () => {
                      console.log("click");
                      await goScanDevices();
                    }}
                    disabled={false}
                  >
                    {/* <RefreshCwIcon
                      size={20}
                      color={
                        isLoading ? theme.colors.primary : theme.colors.textGray
                      }
                    /> */}
                  </Pressable>
                )}
              </View>
            </View>

            <ScrollView style={styles.deviceList}>
              {isLoading ? (
                <View style={styles.scanningIndicator}>
                  <Text color="textGray" variant="t12N">
                    Scanning for devices...
                  </Text>
                </View>
              ) : (
                Devices.map((device, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.deviceItem,
                      selectedDevice?.name === device.name &&
                        styles.selectedDevice,
                    ]}
                    onPress={() => {
                      setSelectedDevice(device);
                      goConnect(device);
                    }}
                    disabled={isLoading}
                  >
                    <View style={styles.deviceInfo}>
                      <Text color="black" variant="t16M">
                        {device.name}
                      </Text>

                      <Text color="textGray" variant="t12N">
                        {device.address}
                      </Text>
                      <Text color="textGray" variant="t12N">
                        Bluetooth Printer
                      </Text>
                    </View>
                    {/* {selectedDevice?.name === device.name && (
                      <CheckIcon color={theme.colors.primary} size={24} />
                    )} */}
                  </TouchableOpacity>
                ))
              )}

              {!isLoading && Devices.length === 0 && (
                <View style={styles.noDevices}>
                  <Text color="textGray" variant="t12N">
                    No printers found. Tap refresh to scan again.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PrintPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.colors.card,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    padding: 20,
    backgroundColor: Colors.colors.card,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.colors.border,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  footer: {
    height: 90,
    width: "100%",
    backgroundColor: Colors.colors.card,
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    padding: 16,
    gap: 16,
    elevation: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.colors.primary,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  printButton: {
    flex: 1,
    backgroundColor: Colors.colors.primary,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    color: "white",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  deviceList: {
    maxHeight: 400,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.colors.border,
  },
  selectedDevice: {
    backgroundColor: Colors.colors.card,
  },
  deviceInfo: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  scanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scanControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
  refreshButtonActive: {
    backgroundColor: Colors.colors.primary,
  },
  scanningIndicator: {
    padding: 15,
    alignItems: "center",
  },
  noDevices: {
    padding: 20,
    alignItems: "center",
  },
  centerText: {
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.colors.border,
    marginVertical: 10,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  descriptionColumn: {
    flex: 0.6,
  },
  amountColumn: {
    flex: 0.4,
    textAlign: "right",
  },
  qrContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: Colors.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.colors.border,
  },
  qrError: {
    alignItems: "center",
    padding: 10,
  },
  retryButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: Colors.colors.background,
    borderRadius: 4,
  },
  bluetoothButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: Colors.colors.background,
  },
  qrCodeContainer: {
    alignItems: "center",
    padding: 10,
  },
  qrHint: {
    marginTop: 10,
    textAlign: "center",
  },
  printerTypeContainer: {
    marginTop: 10,
    gap: 16,
  },
  printerTypeOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.colors.border,
    borderRadius: 8,
    backgroundColor: Colors.colors.card,
  },
  printerIconContainer: {
    marginBottom: 12,
  },
});
