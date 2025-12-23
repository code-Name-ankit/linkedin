import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  getAboutUser,
  getAllUsers,
  getConnectionsRequest,
  getMyconnectionsRequests,
} from "../../action/authAction/index.js";

const initialState = {
  user: undefined, // user object (if returned)
  token: null, // token string (if returned)
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  isTokenThere: false,
  message: "",
  profileFetched: false,
  connections: [],
  connectionRequest: [],
  all_users: [],
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,

    handleLoginUser: (state) => {
      state.message = "hello";
    },

    emptyMessage: (state) => {
      state.message = "";
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Knocking the door...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;

        state.token = action.payload?.token;
        state.user = action.payload?.user;
        state.message = action.payload?.message || "Login successful";
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        // action.payload may be an object or string
        state.message =
          (action.payload && (action.payload.message ?? action.payload)) ??
          action.error?.message ??
          "Login failed";
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Registering you...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = !!action.payload?.token || state.loggedIn;

        state.token = action.payload?.token ?? state.token;
        state.user = action.payload?.user ?? state.user;
        state.message =
          action.payload?.message ?? "Registration successful, Please login in";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message =
          (action.payload && (action.payload.message ?? action.payload)) ??
          action.error?.message ??
          "Registration failed";
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload.profile;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload?.profiles ?? [];
      })
      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.connections = action.payload || [];
      })
      .addCase(getConnectionsRequest.rejected, (state, action) => {
        state.message = action.payload;
      })
      .addCase(getMyconnectionsRequests.fulfilled, (state, action) => {
        state.connectionRequest = action.payload;
      })
      .addCase(getMyconnectionsRequests.rejected, (state, action) => {
        state.message = action.payload;
      });
  },
});

export const {
  reset,
  handleLoginUser,
  emptyMessage,
  setTokenIsThere,
  setTokenIsNotThere,
} = authSlice.actions;
export default authSlice.reducer;
