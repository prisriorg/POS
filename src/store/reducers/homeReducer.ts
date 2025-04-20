import { createSlice } from "@reduxjs/toolkit";

export interface IHomeState {
  categories: any[];
  products: any[];
  cart: any[];
  customers: any[];
  taxes: any[];
  currencies: any[];
  users: any[];
  roles: any[];
  warehouses: any[];
  billers: any[];
  qrCode: any;
  showList: boolean;
  brands: any[];
  units: any[];
  purchases: any[];
  expenses: any[];
  hscodes: any[];
  homes: any[];
  sales: any[];

}
const initialState: IHomeState = {
  cart: [],
  products: [],
  categories: [],
  customers: [],
  taxes: [],
  currencies: [],
  users: [],
  roles: [],
  warehouses: [],
  billers: [],
  qrCode: {},
  showList: false,
  brands: [],
  units: [],
  purchases: [],
  expenses: [],
  hscodes: [],
  homes: [],
  sales: [],
};

export const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    addToCart: (state, action) => {
      const itemIndex = state.cart.findIndex(
        (item) => item.id == action.payload.id
      );
      let cardData =
        itemIndex >= 0
          ? state.cart.map((item, index) =>
              index === itemIndex
                ? { ...item, count: parseFloat(item?.count) + 1 || 1 }
                : { ...item }
            )
          : [...state.cart, { ...action.payload, count: 1 }];

      const stateValue = { ...state, cart: cardData };
      return stateValue;
    },
    updateItemQty: (state, action) => {
      const itemIndex = state.cart.findIndex(
        (item) => item.id == action.payload.item.id
      );
      const count = action.payload.count;
      let cardData =
        itemIndex >= 0
          ? state.cart.map((item, index) =>
              index === itemIndex ? { ...item, count: count } : { ...item }
            )
          : [...state.cart, { ...action.payload.item, count: count }];

      const stateValue = { ...state, cart: cardData };
      return stateValue;
    },
    removeFromCart: (state, action) => {
      const itemIndex = state.cart.findIndex(
        (item) => item.id == action.payload.id
      );
      let cardData =
        state?.cart[itemIndex]?.count > 1
          ? state.cart.map((item, index) =>
              index === itemIndex ? { ...item, count: item.count - 1 } : item
            )
          : state.cart.filter((item) => item.id !== action.payload.id);

      const stateValue = { ...state, cart: cardData };
      return stateValue;
    },
    setCart: (state, action) => {
      const stateValue = { ...state, cart: action.payload };
      return stateValue;
    },
    setCustomers: (state, action) => {
      const stateValue = { ...state, customers: action.payload };
      return stateValue;
    },
    setAllUsers: (state, action) => {
      const stateValue = { ...state, users: action.payload };
      return stateValue;
    },
    setTaxes: (state, action) => {
      const stateValue = { ...state, taxes: action.payload };
      return stateValue;
    },
    setCurrencies: (state, action) => {
      const stateValue = { ...state, currencies: action.payload };
      return stateValue;
    },
    setRoles: (state, action) => {
      const stateValue = { ...state, roles: action.payload };
      return stateValue;
    },
    setWarehouses: (state, action) => {
      const stateValue = { ...state, warehouses: action.payload };
      return stateValue;
    },
    setBillers: (state, action) => {
      const stateValue = { ...state, billers: action.payload };
      return stateValue;
    },
    setQRCode: (state, action) => {
      const stateValue = { ...state, qrCode: action.payload };
      return stateValue;
    },
    setShowList: (state, action) => {
      const stateValue = { ...state, showList: action.payload };
      return stateValue;
    },
    setBrands: (state, action) => {
      const stateValue = { ...state, brands: action.payload };
      return stateValue;
    },
    setUnits: (state, action) => {
      const stateValue = { ...state, units: action.payload };
      return stateValue;
    },
    setPurchases: (state, action) => {
      const stateValue = { ...state, purchases: action.payload };
      return stateValue;
    },
    setExpenses: (state, action) => {
      const stateValue = { ...state, expenses: action.payload };
      return stateValue;
    },
    setHSCodes: (state, action) => {
      const stateValue = { ...state, hscodes: action.payload };
      return stateValue;
    },
    setHomes: (state, action) => {
      const stateValue = { ...state, homes: action.payload };
      return stateValue;
    },
    setSales: (state, action) => {
      const stateValue = { ...state, sales: action.payload };
      return stateValue;
    },

  },
});

export const {
  addToCart,
  removeFromCart,
  setCart,
  setCategories,
  setProducts,
  setCustomers,
  setTaxes,
  setCurrencies,
  setAllUsers,
  updateItemQty,
  setRoles,
  setWarehouses,
  setBillers,
  setQRCode,
  setShowList,
  setBrands,
  setUnits,
  setPurchases,
  setExpenses,
  setHSCodes,
  setHomes,
  setSales,
} = homeSlice.actions;
export default homeSlice.reducer;
