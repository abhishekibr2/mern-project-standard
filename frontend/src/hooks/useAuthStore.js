import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,



      // Login user
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // Dynamic import to avoid circular dependencies
          const { authAPI } = await import('../services/api');
          const response = await authAPI.login(email, password);
          const { user, token, refreshToken } = response.data.data;

          const newState = {
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          };
          
          set(newState);

          // Set default authorization header for future requests
          authAPI.setAuthToken(token);

          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register user
      register: async (userData) => {
        set({ isLoading: true });
        try {
          // Dynamic import to avoid circular dependencies
          const { authAPI } = await import('../services/api');
          const response = await authAPI.register(userData);
          const { user, token, refreshToken } = response.data.data;

          // Auto-login after successful registration
          const newState = {
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          };
          
          set(newState);

          // Set default authorization header for future requests
          authAPI.setAuthToken(token);

          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout user
      logout: () => {
        // Clear auth token from API service
        import('../services/api').then(({ authAPI }) => {
          authAPI.clearAuthToken();
        });

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Refresh token
      refreshAuthToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          // Dynamic import to avoid circular dependencies
          const { authAPI } = await import('../services/api');
          const response = await authAPI.refreshToken(refreshToken);
          const { token, refreshToken: newRefreshToken } = response.data.data;

          set({
            token,
            refreshToken: newRefreshToken,
          });

          // Update default authorization header
          authAPI.setAuthToken(token);

          return token;
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        // Dynamic import to avoid circular dependencies
        const { authAPI } = await import('../services/api');
        const response = await authAPI.updateProfile(profileData);
        const { user } = response.data;

        set({ user });

        return response;
      },

      // Check if token is expired
      isTokenExpired: () => {
        const { token } = get();
        if (!token) return true;

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          return payload.exp < currentTime;
        } catch (error) {
          return true;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),

    }
  )
);

export default useAuthStore;
