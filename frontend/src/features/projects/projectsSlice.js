import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// جلب كل المشاريع
export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/projects/index.php");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to load projects");
    }
  }
);

// إضافة مشروع جديد
export const addProject = createAsyncThunk(
  "projects/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/projects/add.php", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to add project");
    }
  }
);

// تحديث مشروع
export const updateProject = createAsyncThunk(
  "projects/update",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.put("/projects/update.php", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update project");
    }
  }
);

// حذف مشروع
export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/projects/delete.php?id=${id}`);
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete project");
    }
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProjects.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchProjects.fulfilled, (s, action) => {
        s.status = "succeeded";
        s.list = action.payload.projects || action.payload;
      })
      .addCase(fetchProjects.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload;
      })

      // Add
      .addCase(addProject.fulfilled, (s, action) => {
        if (action.payload?.project) {
          s.list.push(action.payload.project);
        }
      })

      // Update
      .addCase(updateProject.fulfilled, (s, action) => {
        const updated = action.payload.project;
        s.list = s.list.map((p) => (p.id == updated.id ? updated : p));
      })

      // Delete
      .addCase(deleteProject.fulfilled, (s, action) => {
        s.list = s.list.filter((p) => p.id != action.payload.id);
      });
  },
});

export default projectsSlice.reducer;
