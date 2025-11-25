import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// جلب كل الوحدات
export const fetchUnits = createAsyncThunk(
  "units/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/units/index.php");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to load units");
    }
  }
);

// إضافة وحدة
export const addUnit = createAsyncThunk(
  "units/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/units/add.php", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to add unit");
    }
  }
);

// تحديث وحدة
export const updateUnit = createAsyncThunk(
  "units/update",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.put("/units/update.php", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update unit");
    }
  }
);

// حذف وحدة
export const deleteUnit = createAsyncThunk(
  "units/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/units/delete.php?id=${id}`);
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete unit");
    }
  }
);

const unitsSlice = createSlice({
  name: "units",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get units
      .addCase(fetchUnits.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchUnits.fulfilled, (s, action) => {
        s.status = "succeeded";
        s.list = action.payload.units || action.payload;
      })
      .addCase(fetchUnits.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload;
      })

      // Add unit
      .addCase(addUnit.fulfilled, (s, action) => {
        if (action.payload?.unit) s.list.push(action.payload.unit);
      })

      // Update unit
      .addCase(updateUnit.fulfilled, (s, action) => {
        const updated = action.payload.unit;
        s.list = s.list.map((u) => (u.id == updated.id ? updated : u));
      })

      // Delete
      .addCase(deleteUnit.fulfilled, (s, action) => {
        s.list = s.list.filter((u) => u.id != action.payload.id);
      });
  },
});

export default unitsSlice.reducer;
