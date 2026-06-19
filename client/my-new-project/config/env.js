import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const API_BASE_URL = extra.API_BASE_URL ?? 'http://127.0.0.1:8000';
export const SUPABASE_URL = extra.SUPABASE_URL;
export const SUPABASE_KEY = extra.SUPABASE_KEY;
