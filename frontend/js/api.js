// API Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : '';

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('admin_token');
}

// Helper function to set auth token
function setAuthToken(token) {
  localStorage.setItem('admin_token', token);
}

// Helper function to remove auth token
function removeAuthToken() {
  localStorage.removeItem('admin_token');
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'حدث خطأ في الطلب');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication API
const AuthAPI = {
  async login(password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
    
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  async verify() {
    try {
      return await apiRequest('/api/auth/verify');
    } catch (error) {
      removeAuthToken();
      return { success: false };
    }
  },

  logout() {
    removeAuthToken();
  }
};

// Trainers API
const TrainersAPI = {
  async getAll() {
    return await apiRequest('/api/trainers');
  },

  async create(trainer) {
    return await apiRequest('/api/trainers', {
      method: 'POST',
      body: JSON.stringify(trainer)
    });
  },

  async update(id, trainer) {
    return await apiRequest(`/api/trainers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trainer)
    });
  },

  async delete(id) {
    return await apiRequest(`/api/trainers/${id}`, {
      method: 'DELETE'
    });
  }
};

// Lottery API
const LotteryAPI = {
  async getAll() {
    return await apiRequest('/api/lottery');
  },

  async create(lotteryData) {
    return await apiRequest('/api/lottery', {
      method: 'POST',
      body: JSON.stringify(lotteryData)
    });
  },

  async delete(id) {
    return await apiRequest(`/api/lottery/${id}`, {
      method: 'DELETE'
    });
  }
};

// Status Message Helper
function showMessage(message, type = 'success') {
  const statusMessage = document.getElementById('statusMessage');
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type} show`;

  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 4000);
}
