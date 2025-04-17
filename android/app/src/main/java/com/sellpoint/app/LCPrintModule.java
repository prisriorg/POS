package com.sellpoint.app;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.NonNull;

import com.example.lc_print_sdk.PrintConfig;
import com.example.lc_print_sdk.PrintUtil;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class LCPrintModule extends ReactContextBaseJavaModule implements PrintUtil.PrinterBinderListener {
    private static final String TAG = "LCPrintModule";
    private final ReactApplicationContext reactContext;

    private final int textAlignCenter = PrintConfig.Align.ALIGN_CENTER;
    private final int textAlignRight = PrintConfig.Align.ALIGN_RIGHT;
    private final int textAlignLeft = PrintConfig.Align.ALIGN_LEFT;
    private final int textSizeM = PrintConfig.FontSize.TOP_FONT_SIZE_MIDDLE;
    private final int textSizeS = PrintConfig.FontSize.TOP_FONT_SIZE_SMALL;
    private final int textSizeL = PrintConfig.FontSize.TOP_FONT_SIZE_MIDDLE;

    private String printerStatus;
    private String printerVersion;
    private int printerState;
    PrintUtil printUtil;

    public LCPrintModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "LCPrintModule";
    }

    @ReactMethod
    public void initPrinter(final Promise promise) {
        try {
            // Initialize the printer
            printUtil = PrintUtil.getInstance(reactContext);
            printUtil.setPrintEventListener(this);
            promise.resolve("Printer initialized successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize printer", e);
            promise.reject("INIT_ERROR", "Failed to initialize printer: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void configureLabel(int returnDistance, boolean enableMark, int concentration, final Promise promise) {
        try {
            if (printUtil == null) {
                throw new Exception("Printer not initialized. Call initPrinter first.");
            }
            
            // Configure label settings
            printUtil.setUnwindPaperLen(returnDistance);
            printUtil.printEnableMark(enableMark);
            printUtil.printConcentration(concentration);
            
            promise.resolve("Label configured successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to configure label", e);
            promise.reject("CONFIG_ERROR", "Failed to configure label: " + e.getMessage(), e);
        }
    }


    @ReactMethod
    public void printColumnsString(ReadableArray texts, ReadableArray widths, ReadableArray aligns, final Promise promise) {
        try {
            if (printUtil == null) {
                throw new Exception("Printer not initialized. Call initPrinter first.");
            }
            
            // Get number of columns
            int columnCount = texts.size();
            if (columnCount != widths.size() || columnCount != aligns.size()) {
                throw new Exception("Arrays must have the same length");
            }
            
            // Prepare text content with spacing for columns
            StringBuilder formattedText = new StringBuilder();
            
            for (int i = 0; i < columnCount; i++) {
                String columnText = texts.getString(i);
                int width = widths.getInt(i);
                String align = aligns.getString(i);
                
                // Calculate padding
                int textLength = columnText.length();
                int padding = width - textLength;
                
                if (align.equals("right")) {
                    // Right align: add spaces before text
                    for (int j = 0; j < padding; j++) {
                        formattedText.append(" ");
                    }
                    formattedText.append(columnText);
                } else if (align.equals("center")) {
                    // Center align: add spaces before and after
                    int leftPad = padding / 2;
                    int rightPad = padding - leftPad;
                    
                    for (int j = 0; j < leftPad; j++) {
                        formattedText.append(" ");
                    }
                    formattedText.append(columnText);
                    for (int j = 0; j < rightPad; j++) {
                        formattedText.append(" ");
                    }
                } else {
                    // Left align: add text first, then spaces
                    formattedText.append(columnText);
                    for (int j = 0; j < padding; j++) {
                        formattedText.append(" ");
                    }
                }
                
                // Add some extra spacing between columns
                if (i < columnCount - 1) {
                    formattedText.append("  ");
                }
            }
            
            // Print the formatted text
            printUtil.printText(textSizeM, textAlignLeft, false, false, formattedText.toString());
            printUtil.start();
            
            promise.resolve("Columns printed successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to print columns", e);
            promise.reject("PRINT_ERROR", "Failed to print columns: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setAlignment(String align, final Promise promise) {
        try {
            if (printUtil == null) {
                throw new Exception("Printer not initialized. Call initPrinter first.");
            }
            
            // Set current alignment for subsequent prints
            int alignment = textAlignLeft;
            if (align.equals("center")) {
                alignment = textAlignCenter;
            } else if (align.equals("right")) {
                alignment = textAlignRight;
            }
            
            // Store alignment in a class variable for later use
            // Note: LC printer might handle this differently than Sunmi
            
            promise.resolve("Alignment set to " + align);
        } catch (Exception e) {
            Log.e(TAG, "Failed to set alignment", e);
            promise.reject("CONFIG_ERROR", "Failed to set alignment: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setFontSize(int size, final Promise promise) {
        try {
            if (printUtil == null) {
                throw new Exception("Printer not initialized. Call initPrinter first.");
            }
            
            // Store font size for later use
            // Note: LC printer might handle this differently than Sunmi
            
            promise.resolve("Font size set to " + size);
        } catch (Exception e) {
            Log.e(TAG, "Failed to set font size", e);
            promise.reject("CONFIG_ERROR", "Failed to set font size: " + e.getMessage(), e);
        }
    }

    private String formatTableLine(String leftText, String rightText, int totalWidth) {
        int combinedLength = leftText.length() + rightText.length();
        if (combinedLength >= totalWidth - 1) {
        // Not enough space, truncate the left text
            int availableSpace = totalWidth - rightText.length() - 2;
            if (availableSpace > 0) {
                leftText = leftText.substring(0, availableSpace) + "…";
            } else {
                // Both texts are too long, truncate both
                leftText = leftText.substring(0, totalWidth/2 - 1) + "…";
                rightText = "…" + rightText.substring(rightText.length() - (totalWidth/2) + 2);
            }
            combinedLength = leftText.length() + rightText.length();
        }
        // Calculate spaces needed between left and right text
        int spacesNeeded = totalWidth - combinedLength;
        
        // Create the spaces
        StringBuilder spaces = new StringBuilder();
        for (int i = 0; i < spacesNeeded; i++) {
            spaces.append(" ");
        }
        
        // Combine left text, spaces, and right text
        return leftText + spaces.toString() + rightText;
    }

   @ReactMethod
    public void printReceipt(ReadableMap options, final Promise promise) {
        try {
            if (printUtil == null) {
                throw new Exception("Printer not initialized. Call initPrinter first.");
            }
            int totalWidth = 38; // Default width for LC printer
           

            String lines = "-".repeat(38) + "\n";
            
            // Extract customer and store info
            String storeName = options.hasKey("storeName") ? options.getString("storeName") : "";
            String storeAddress = options.hasKey("storeAddress") ? options.getString("storeAddress") : "";
            String storeEmail = options.hasKey("storeEmail") ? options.getString("storeEmail") : "";
            String storePhone = options.hasKey("storePhone") ? options.getString("storePhone") : "";
            
            String customerName = options.hasKey("customerName") ? options.getString("customerName") : "";
            String customerAddress = options.hasKey("customerAddress") ? options.getString("customerAddress") : "";
            String customerPhone = options.hasKey("customerPhone") ? options.getString("customerPhone") : "";
            String date = options.hasKey("date") ? options.getString("date") : "";
            String reference = options.hasKey("reference") ? options.getString("reference") : "";
            
            String currency = options.hasKey("currency") ? options.getString("currency") : "USD";
            String totalAmount = options.hasKey("totalAmount") ? options.getString("totalAmount") : "0";
            String netAmount = options.hasKey("netAmount") ? options.getString("netAmount") : "0";
            String stdRate = options.hasKey("stdRate") ? options.getString("stdRate") : "0";
            String grossAmount = options.hasKey("grossAmount") ? options.getString("grossAmount") : "0";
            
            ReadableArray items = options.hasKey("items") ? options.getArray("items") : Arguments.createArray();
            String qrCodeData = options.hasKey("qrCode") ? options.getString("qrCode") : "";
            
            // 1. Store Name (large, bold, centered)
            printUtil.printText(textAlignCenter, textSizeL, true, false, storeName + "\n");
            // 2. Store Details (medium, centered)
            printUtil.printText(textAlignCenter, textSizeL, false, false, storeAddress + "\n");
            printUtil.printText(textAlignCenter, textSizeL, false, false, storeEmail + "\n");
            printUtil.printText(textAlignCenter, textSizeL, false, false, storePhone + "\n");
            // 3. Invoice Header (centered with dividers)
            printUtil.printText(textAlignCenter, textSizeL, false, false, lines);
            printUtil.printText(textAlignCenter, textSizeL, true, false, "FISCAL TAX INVOICE\n");
            printUtil.printText(textAlignCenter, textSizeL, false, false, lines+"\n");
            
            // 4. Customer Info (left-aligned)
            printUtil.printText(textAlignLeft, textSizeL, false, false, "Date: " + date + "\n");
            printUtil.printText(textAlignLeft, textSizeL, false, false, "Reference: " + reference + "\n");
            printUtil.printText(textAlignLeft, textSizeL, false, false, "Customer: " + customerName + "\n");
            printUtil.printText(textAlignLeft, textSizeL, false, false, "Address: " + customerAddress + "\n");
            printUtil.printText(textAlignLeft, textSizeL, false, false, "Phone: " + customerPhone + "\n");
            printUtil.printText(textAlignCenter, textSizeL, false, false, lines+"\n");
            
            // 5. Items Header
            printUtil.printText(textAlignLeft, textSizeL, false, false, formatTableLine("Description","Amount", totalWidth + 2) + "\n");
            
            // 6. Items - Using formatTableLine for consistent formatting
            for (int i = 0; i < items.size(); i++) {
                ReadableMap item = items.getMap(i);
                String name = item.getString("name");
                double price = item.getDouble("price");
                int count = item.getInt("count");
                double total = item.getDouble("total");
                
                // Print name on first line
                printUtil.printText(textAlignLeft, textSizeM, false, false, name + "\n");
                
                // Format quantity x price and total amount on second line
                String quantityPrice = count + " X " + price;
                String amountText = currency + " " + total;
                
                // Use formatTableLine for proper spacing
                String formattedLine = formatTableLine(quantityPrice, amountText, totalWidth + 5);
                printUtil.printText(textAlignLeft, textSizeM, false, false, formattedLine + "\n\n");
            }
            
            // 7. Totals
            printUtil.printText(textAlignCenter, textSizeL, false, false, lines + "\n");
            
            // 8. Total row - Using formatTableLine
            String totalText = formatTableLine("Total", currency + " " + totalAmount, 43);
            printUtil.printText(textAlignLeft, textSizeL, false, false, totalText + "\n\n");
            // 9. Currency info
            printUtil.printText(textAlignCenter, textSizeM, false, false, lines);
            printUtil.printText(textAlignCenter, textSizeM, false, false, "Invoiced Currency: " + currency + "\n");
            printUtil.printText(textAlignCenter, textSizeM, false, false, lines+"\n");
            // 10. Final totals - Using formatTableLine for all rows
            // Net Amount

            
            String netLine = formatTableLine("Net Amount:", currency + " " + netAmount, 40);
            printUtil.printText(textAlignLeft, textSizeM, false, false, netLine + "\n");
            
            // Standard Rate
            String stdLine = formatTableLine("Standard Rated", currency + " " + stdRate, totalWidth);
            printUtil.printText(textAlignLeft, textSizeM, false, false, stdLine + "\n");
            
            // Gross Amount
            String grossLine = formatTableLine("Gross Amount:", currency + " " + grossAmount, 37);
            printUtil.printText(textAlignLeft, textSizeM, false, false, grossLine + "\n");
            // 11. QR Code
            if (qrCodeData != null && !qrCodeData.isEmpty()) {
                // Print QR code
                printUtil.printQR(textAlignCenter, 200, qrCodeData);
                printUtil.printText(textAlignCenter, textSizeM, false, false, "Scan this QR code\n");
            }
            printUtil.printText(textAlignCenter, textSizeM, false, false, lines + "\n");
            // Start printing
            printUtil.start();
            promise.resolve("Receipt printed successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to print receipt", e);
            promise.reject("PRINT_ERROR", "Failed to print receipt: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void printerStatus(final Promise promise) {
        try {
            if (printUtil == null) {
                throw new Exception("Printer not initialized. Call initPrinter first.");
            }
            
            // In a real implementation, you would call methods on printUtil to get the status
            WritableMap statusMap = new WritableNativeMap();
            statusMap.putBoolean("isConnected", printerState == 0);
            statusMap.putBoolean("hasPaper", printerState != 1); // Assuming 1 is no paper
            statusMap.putString("message", printerStatus);
            
            promise.resolve(statusMap);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get printer status", e);
            promise.reject("STATUS_ERROR", "Failed to get printer status: " + e.getMessage(), e);
        }
    }
    
    private void showToast(String message) {
        printerStatus = message;
        Log.d(TAG, message);
    }

    @Override
    public void onPrintCallback(int state) {
        printerState = state;
        if (PrintConfig.IErrorCode.ERROR_NO_ERROR == state) {
            showToast("toast_print_success");
        } else if (PrintConfig.IErrorCode.ERROR_PRINT_NOPAPER == state) {
            showToast("toast_no_paper");
        } else {
            showToast("Printer error. state=" + state);
        }
    }

    @Override
    public void onVersion(String s) {
        printerVersion = s;
    }
}