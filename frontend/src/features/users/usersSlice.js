import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// جلب المستخدمين
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users/index.php");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to load users");
    }
  }
);

// إضافة مستخدم جديد
export const addUser = createAsyncThunk(
  "users/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/users/add.php", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to add user");
    }
  }
);

// تحديث مستخدم
export const updateUser = createAsyncThunk(
  "users/update",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.put("/users/update.php", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update user");
    }
  }
);

// تفعيل/تعطيل أو حذف مستخدم
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/delete.php?id=${id}`);
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete user");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchUsers.fulfilled, (s, action) => {
        s.status = "succeeded";
        s.list = action.payload.users || action.payload;
      })
      .addCase(fetchUsers.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload;
      })

      .addCase(addUser.fulfilled, (s, action) => {
        if (action.payload?.user) s.list.unshift(action.payload.user);
      })

      .addCase(updateUser.fulfilled, (s, action) => {
        const updated = action.payload.user;
        if (updated) s.list = s.list.map((u) => (u.id == updated.id ? updated : u));
      })

      .addCase(deleteUser.fulfilled, (s, action) => {
        s.list = s.list.filter((u) => u.id != action.payload.id);
      });
  },
});

export default usersSlice.reducer;
