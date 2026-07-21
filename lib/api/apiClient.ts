import axios from 'axios';

const isServer = typeof window === 'undefined';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function postScoutCommand(payload: any) {
  try {
    const res = await apiClient.post('/api/data-scout', payload);
    return res.data;
  } catch (err) {
    console.error('[API Client Error]', err);
    return { error: 'Failed to connect to backend' };
  }
}

export async function fetchStatus() {
  try {
    const res = await apiClient.get('/api/data-scout');
    return res.data;
  } catch (err) {
    console.error('[Status Error]', err);
    return { player_rows: 0, supplementary_rows: 0 };
  }
}
