// ============================================
// AUTHENTICATION MODULE
// ============================================

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

/**
 * Save authentication token to localStorage
 */
export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get authentication token from localStorage
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove authentication token (logout)
 */
export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return !!getToken();
}

/**
 * Save user data to localStorage
 */
export function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
export function getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get current user from API
 */
export async function getCurrentUser() {
    const token = getToken();
    if (!token) {
        return null;
    }

    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            saveUser(user);
            return user;
        } else {
            // Token is invalid
            removeToken();
            return null;
        }
    } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
    }
}

/**
 * Logout user and redirect to login page
 */
export function logout() {
    removeToken();
    window.location.href = '/login.html';
}

/**
 * Check authentication and redirect to login if not authenticated
 */
export async function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }

    // Verify token is still valid
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '/login.html';
        return false;
    }

    return true;
}

/**
 * Change user password
 */
export async function changePassword(currentPassword, newPassword) {
    const token = getToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
    }

    return await response.json();
}

/**
 * Add authorization header to fetch options
 */
export function withAuth(options = {}) {
    const token = getToken();

    return {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    };
}
