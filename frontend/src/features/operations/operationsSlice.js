import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// جلب العمليات (optionally with query params)
export const fetchOperations = createAsyncThunk(
  "operations/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // params could be { salesperson_id, unit_id, page, from, to }
      const res = await api.get("/operations/index.php", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to load operations");
    }
  }
);

// إضافة عملية (حجز / بيع) — API قد يستقبل add_payment flag ودفعات
export const addOperation = createAsyncThunk(
  "operations/add",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/operations/add.php", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to add operation");
    }
  }
);

// تحديث عملية
export const updateOperation = createAsyncThunk(
  "operations/update",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.put("/operations/update.php", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update operation");
    }
  }
);

// حذف
export const deleteOperation = createAsyncThunk(
  "operations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/operations/delete.php?id=${id}`);
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete operation");
    }
  }
);

const operationsSlice = createSlice({
  name: "operations",
  initialState: {
    list: [],
    status: "idle",
    error: null,
    meta: null, // for paginations/summary from API
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperations.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchOperations.fulfilled, (s, action) => {
        s.status = "succeeded";
        // assume API returns { operations: [...], meta: {...} } or array
        if (action.payload.operations) {
          s.list = action.payload.operations;
          s.meta = action.payload.meta || null;
        } else {
          s.list = action.payload;
        }
      })
      .addCase(fetchOperations.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload;
      })

      .addCase(addOperation.fulfilled, (s, action) => {
        // API returns created operation object
        if (action.payload.operation) s.list.unshift(action.payload.operation);
      })

      .addCase(updateOperation.fulfilled, (s, action) => {
        const updated = action.payload.operation;
        if (updated) s.list = s.list.map((o) => (o.id == updated.id ? updated : o));
      })

      .addCase(deleteOperation.fulfilled, (s, action) => {
        s.list = s.list.filter((o) => o.id != action.payload.id);
      });
  },
});

export default operationsSlice.reducer;
