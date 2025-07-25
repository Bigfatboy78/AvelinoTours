// Import Supabase client from the CDN (must be available globally)
const SUPABASE_URL = 'https://ltuyotcnmytiffsznxvd.supabase.co'; // Replace with your actual URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dXlvdGNubXl0aWZmc3pueHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTIzMzksImV4cCI6MjA2OTAyODMzOX0.UD6SQlOnl8bMF8KoA5ke4IWIReKRjPH5mZR-vGGN_wA'; // Replace with your actual anon key
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchCities() {
  const { data, error } = await client.from('CitiesData').select('*');
  if (error) {
    console.error('Supabase fetch error (Cities):', error);
    return [];
  }
  console.log("CitiesData fetch successful.");
  return data;
}

export async function fetchStates() {
  const { data, error } = await client.from('StateData').select('*');
  if (error) {
    console.error('Supabase fetch error (States):', error);
    return [];
  }
  console.log("StateData fetch successful.");
  return data;
}

