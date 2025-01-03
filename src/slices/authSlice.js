// authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: false,
    user: null,
    role: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            console.log(action.payload.user.id)
            state.isAuthenticated = true;
            state.user = {
                id: action.payload.user.id,  // Store user ID
                email: action.payload.user.email,
                isSuperUser: action.payload.user.isSuperUser,
            };
            state.role = action.payload.role;
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.role = null;
        },
    },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
