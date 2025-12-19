import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config"; // path adjust karo

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to fetch posts"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const { file, body } = userData;

    try {
      const formData = new FormData();
      formData.append("body", body);
      formData.append("media", file);

      const response = await clientServer.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return thunkAPI.fulfillWithValue("Post Uploaded");
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Post not Uploaded"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post_id, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: localStorage.getItem("token"),
          post_id: post_id,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Delete failed");
    }
  }
);

export const incrementLike = createAsyncThunk(
  "post/incrementLike",
  async ({ post_id }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      const response = await clientServer.post(
        "/increment_post_likes",
        { post_id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ THIS WAS MISSING
          },
        }
      );

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Like failed");
    }
  }
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async ({ post_id }, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_comments", {
        params: { post_id },
      });

      return thunkAPI.fulfillWithValue({
        comments: response.data,
        post_id,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to fetch comments"
      );
    }
  }
);


export const postComment = createAsyncThunk(
  "post/postComment",
  async (commentData, thunkAPI) => {
    try {
      const response = await clientServer.post("/comment", {
        token: localStorage.getItem("token"),
        post_id: commentData.post_id,
        commentBody: commentData.body,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Something went wrong"
      );
    }
  }
);


export const getPostsByUser = createAsyncThunk(
  "post/getPostsByUser",
  async (userId, thunkAPI) => {
    try {
      const response = await clientServer.get(
        `/user-posts?userId=${userId}`
      );

      return thunkAPI.fulfillWithValue(response.data.posts);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to fetch user posts"
      );
    }
  }
);


export const editPost = createAsyncThunk(
  "post/editPost",
  async ({ post_id, body }, thunkAPI) => {
    try {
      const response = await clientServer.put(
        "/edit_post",
        { post_id, body },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue(response.data.post);
    } catch (err) {
      return thunkAPI.rejectWithValue("Edit failed");
    }
  }
);
