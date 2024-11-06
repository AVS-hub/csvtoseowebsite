import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import axios from 'axios';

// API Configuration
const api = axios.create({
  baseURL: 'http://localhost:1337/api',
});

// Axios interceptor for adding auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
interface UserAuth {
  is_authenticated: boolean;
  user_id: string | null;
  token: string | null;
  expires_at: number | null;
}

interface UserProfile {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: number | null;
  last_login: number | null;
}

interface Notification {
  id: string;
  type: string;
  content: string;
  created_at: number;
  read: boolean;
}

interface NotificationsState {
  unread_count: number;
  notifications: Notification[];
}

interface CurrentProject {
  project_id: string | null;
  name: string | null;
  description: string | null;
  created_at: number | null;
  updated_at: number | null;
  status: string | null;
  default_language: string | null;
}

// Async Thunks
export const login_user = createAsyncThunk(
  'userAuth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/login', { email, password });
      localStorage.setItem('auth_token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetch_user_profile = createAsyncThunk(
  'userProfile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetch_notifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const set_current_project = createAsyncThunk(
  'currentProject/setProject',
  async (project_id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${project_id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slices
const user_auth_slice = createSlice({
  name: 'user_auth',
  initialState: {
    is_authenticated: false,
    user_id: null,
    token: null,
    expires_at: null,
  } as UserAuth,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('auth_token');
      return {
        is_authenticated: false,
        user_id: null,
        token: null,
        expires_at: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login_user.fulfilled, (state, action: PayloadAction<UserAuth>) => {
      return {
        ...state,
        ...action.payload,
        is_authenticated: true,
      };
    });
  },
});

const user_profile_slice = createSlice({
  name: 'user_profile',
  initialState: {
    email: null,
    first_name: null,
    last_name: null,
    created_at: null,
    last_login: null,
  } as UserProfile,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetch_user_profile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
      return {
        ...state,
        ...action.payload,
      };
    });
  },
});

const notifications_slice = createSlice({
  name: 'notifications',
  initialState: {
    unread_count: 0,
    notifications: [],
  } as NotificationsState,
  reducers: {
    mark_notification_as_read: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unread_count -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetch_notifications.fulfilled, (state, action: PayloadAction<NotificationsState>) => {
      return {
        ...state,
        ...action.payload,
      };
    });
  },
});

const current_project_slice = createSlice({
  name: 'current_project',
  initialState: null as CurrentProject | null,
  reducers: {
    clear_current_project: () => null,
  },
  extraReducers: (builder) => {
    builder.addCase(set_current_project.fulfilled, (_, action: PayloadAction<CurrentProject>) => {
      return action.payload;
    });
  },
});

// Persist Config
const persist_config = {
  key: 'root',
  storage,
  whitelist: ['user_auth', 'user_profile'],
};

// Root Reducer
const root_reducer = {
  user_auth: user_auth_slice.reducer,
  user_profile: user_profile_slice.reducer,
  notifications: notifications_slice.reducer,
  current_project: current_project_slice.reducer,
};

const persisted_reducer = persistReducer(persist_config, root_reducer);

// Store Configuration
const store = configureStore({
  reducer: persisted_reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Action Creators
export const { logout } = user_auth_slice.actions;
export const { mark_notification_as_read } = notifications_slice.actions;
export const { clear_current_project } = current_project_slice.actions;

// Type Definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;