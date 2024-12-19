import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Access the environment variables from app.json
const supabaseUrl = Constants.expoConfig.extra.SUPABASE_URL;
const supabaseKey = Constants.expoConfig.extra.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase client initialized:', supabase);

