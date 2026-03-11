/**
 * assets.js — Asset API service
 * Production practice: Keep API calls in a service layer, not in components.
 * Components should not know HOW data is fetched, only WHAT they need.
 */
import apiClient from './apiClient';

const ENDPOINT = '/assets';

export const assetsService = {
  getAll: () => apiClient.get(ENDPOINT),
  getById: (id) => apiClient.get(`${ENDPOINT}/${id}`),
  create: (data) => apiClient.post(ENDPOINT, data),
  update: (id, data) => apiClient.put(`${ENDPOINT}/${id}`, data),
  remove: (id) => apiClient.delete(`${ENDPOINT}/${id}`),
};
