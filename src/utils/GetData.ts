export const productTypes = [
  {
    id: 1,
    label: "Standard",
    value: "standard",
  },

  {
    id: 2,
    label: "Combo",
    value: "combo",
  },
  {
    id: 3,
    label: "Digital",
    value: "digital",
  },
  {
    id: 4,
    label: "Service",
    value: "service",
  },
];

export const productBarcode = [
  {
    id: 1,
    label: "Code 128",
    value: "C128",
  },

  {
    id: 2,
    label: "Code 39",
    value: "C39",
  },
  {
    id: 3,
    label: "UPC-A",
    value: "UPCA",
  },
  {
    id: 4,
    label: "UPC-E",
    value: "UPCE",
  },
  {
    id: 5,
    label: "EAN-8",
    value: "EAN8",
  },
  {
    id: 6,
    label: "EAN-13",
    value: "EAN13",
  },
];

export const getRandomNumber = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export const getTaxMethods = [
  { id: 1, label: "Inclusive", value: "inclusive" },
  { id: 2, label: "Exclusive", value: "exclusive" },
];

export const suppliers = [
  {
    id: 1,
    label: "John Doe (Test Company)",
    value: "1",
  },
];

export const purchaseStatus = [
  {
    id: 1,
    label: "Received",
    value: "1",
  },
  {
    id: 2,
    label: "Partial",
    value: "2",
  },
  {
    id: 3,
    label: "Pending",
    value: "3",
  },
  {
    id: 4,
    label: "Ordered",
    value: "4",
  },
];

export const paymentStatus = [
  {
    id: 1,
    label: "Due",
    value: "1",
  },
  {
    id: 2,
    label: "Paid",
    value: "2",
  },
];

export const expenseCat = [
  {
    id: 1,
    label: "test (30259306)",
    value: "1",
  },
];

export const expenseAcc = [
  {
    id: 1,
    label: "Sales Account [019912229]",
    value: "1",
  },
];

export const paymentStatusSales = [
  {
    id: 1,
    label: "Pending",
    value: "1",
  },
  {
    id: 2,
    label: "Due",
    value: "2",
  },
  {
    id: 3,
    label: "Partial",
    value: "3",
  },
  {
    id: 4,
    label: "Paid",
    value: "4",
  },
];
export const salesStatus= [
  {
    id: 1,
    label: "Completed",
    value: "1",
  },
  {
    id: 2,
    label: "Pending",
    value: "2",
  },
  {
    id: 3,
    label: "Partial",
    value: "3",
  },
]
