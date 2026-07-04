import { API_URL } from './config.js';

function getToken() {
  return localStorage.getItem('sd_token');
}

export function setToken(token) {
  localStorage.setItem('sd_token', token);
}

export function clearToken() {
  localStorage.removeItem('sd_token');
}

export function isLoggedIn() {
  return !!getToken();
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Only set Content-Type for JSON if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }

  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

export async function login(username, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

export async function register(username, password, displayName) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, displayName }),
  });
  setToken(data.token);
  return data;
}

export async function getMe() {
  return apiFetch('/users/me');
}

export async function getRival() {
  return apiFetch('/users/rival');
}

// Note: register sends displayName (camelCase) to match backend

export async function getActivities(period) {
  const query = period ? `?period=${period}` : '';
  return apiFetch(`/activities${query}`);
}

export async function createActivity(formData) {
  return apiFetch('/activities', {
    method: 'POST',
    body: formData,
  });
}

export async function approveActivity(id) {
  return apiFetch(`/activities/${id}/approve`, { method: 'POST' });
}

export async function rejectActivity(id) {
  return apiFetch(`/activities/${id}/reject`, { method: 'POST' });
}

export async function getScores(period) {
  const query = period ? `?period=${period}` : '';
  return apiFetch(`/users/scores${query}`);
}
