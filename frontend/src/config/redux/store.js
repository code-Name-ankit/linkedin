import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";
/**
 *
 * staps for state management
 * submit action
 * handleactions is it's reducer
 * Register here ->reducer
 *
 */

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
  },
});
