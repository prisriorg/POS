import { NativeModules } from 'react-native';
const { LCPrintModule } = NativeModules;

interface PrintTextOptions {
  text: string;
  align?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large';
  bold?: boolean;
}

interface PrintReceiptOptions {
  storeName: string;
  storeAddress: string;
  storeEmail: string;
  storePhone: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  date: string;
  reference: string;
  currency: string;
  totalAmount: string;
  netAmount: string;
  stdRate: string;
  grossAmount: string;
  items: Array<{
    name: string;
    price: number;
    count: number;
    total: number;
  }>;
  qrCode?: string;
}

// Create a wrapper to match the Sunmi printer API
const LCPrinter = {
  initPrinter: () => LCPrintModule.initPrinter(),
  
  hasPrinter: async () => {
    try {
      const status = await LCPrintModule.printerStatus();
      return status.isConnected;
    } catch (error) {
      console.error('Error checking printer:', error);
      return false;
    }
  },
  
  printerStatus: () => LCPrintModule.printerStatus(),
  
  configureLabel: (returnDistance: number, enableMark: boolean, concentration: number) => 
    LCPrintModule.configureLabel(returnDistance, enableMark, concentration),
  
  printReceipt: (options: PrintReceiptOptions) => LCPrintModule.printReceipt(options),
};

export default LCPrinter;