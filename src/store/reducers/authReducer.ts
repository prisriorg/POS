import {createSlice} from '@reduxjs/toolkit';

export interface AuthState {
  user: any | null;
  domain: string | null;
}
const initialState: AuthState = {user: null, domain: null};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const stateValue = {...state, user: action.payload};
      return stateValue;
    },
    setDomain: (state, action) => {
      const stateValue = {...state, domain: action.payload};
      return stateValue;
    },
  },
});

export const {setUser, setDomain} = authSlice.actions;
export default authSlice.reducer;
