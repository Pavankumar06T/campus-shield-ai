import { auth } from './firebase';

//const API_BASE_URL = "https://campus-shield-ai-tctr.onrender.com/api"; // Matches backend port
const API_BASE_URL ="http://localhost:5000/api"

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const config = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API Request Failed");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};