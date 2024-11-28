import { configureStore, combineReducers } from "@reduxjs/toolkit";

import FeatureSlice from "./features/FeatureSlice";
const rootReducer = combineReducers({
  featureName: FeatureSlice,
});

const store = configureStore({
  reducer: {
    feature: rootReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export default store;
