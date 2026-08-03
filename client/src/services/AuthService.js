// Simulated delay for premium loading indicators
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthService = {
  /**
   * Simulates credentials verification.
   */
  async login(email, password) {
    await delay(1000);

    // Basic client validation checks
    if (!email.includes('@')) {
      throw new Error('Invalid email address format.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Default test credentials or allow any correct format for demo purposes
    // We will simulate returning a citizen user profile
    const name = email.split('@')[0];
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    return {
      token: 'mock-jwt-token-12345',
      user: {
        name: formattedName === 'Admin' ? 'Administrator' : `${formattedName} Shahzad`,
        email: email,
        role: formattedName === 'Admin' ? 'admin' : 'citizen',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
      }
    };
  },

  /**
   * Simulates register details dispatch.
   */
  async register(name, email, password) {
    await delay(1200);

    if (!name.trim()) {
      throw new Error('Full Name is required.');
    }
    if (!email.includes('@')) {
      throw new Error('Invalid email address format.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    return {
      success: true,
      user: {
        name: name,
        email: email,
        role: 'citizen',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
      }
    };
  },

  /**
   * Simulates authentication logout.
   */
  async logout() {
    await delay(400);
    return { success: true };
  }
};
