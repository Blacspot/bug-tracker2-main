// Example frontend authentication implementation for your authSlice.ts

// 1. Login function - get JWT token
export const loginUser = async (email, password) => {
    const response = await fetch('https://bug-tracker2-main.onrender.com/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Store the token for future requests
    localStorage.setItem('token', data.token);
    
    return data;
};

// 2. Get user profile with authentication
export const getUserProfile = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch('https://bug-tracker2-main.onrender.com/users/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        throw new Error('Token expired, please login again');
    }

    if (!response.ok) {

// 3. Register user
export const registerUser = async (userData) => {
    const response = await fetch('https://bug-tracker2-main.onrender.com/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }

    return response.json();
};

// 4. Verify email
export const verifyEmail = async (email, code) => {
    const response = await fetch('https://bug-tracker2-main.onrender.com/users/verify-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code })
    });

    return response.json();
};
        throw new Error('Failed to fetch profile');
    }

    return response.json();
};