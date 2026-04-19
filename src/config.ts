// Centralized API Configuration
// This file automatically toggles between local and production URLs

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// For production images/uploads
export const UPLOAD_URL = `${API_BASE_URL}/uploads/`;
