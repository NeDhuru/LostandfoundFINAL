import { createSlice } from "@reduxjs/toolkit";
const featuresSlice = createSlice({
  name: "featureName",
  initialState: {
    userDetails: {
      fullName: "",
      emailId: "",
      phoneNumber: "",
    },
  },
  reducers: {
    addUserDetails: (state, action) => {
      const key = Object.keys(action.payload)[0];
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          [key]: action.payload[key],
        },
      };
    },
  },
  extraReducers: {},
});

export const { addUserDetails } = featuresSlice.actions;
export default featuresSlice.reducer;
