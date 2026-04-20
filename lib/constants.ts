// Languages supported in KisaanSathi
export const LANGUAGES = [
  { code: 'hi', name: 'हिन्दी', nativeName: 'Hindi' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', nativeName: 'Punjabi' },
  { code: 'gu', name: 'ગુજરાતી', nativeName: 'Gujarati' },
  { code: 'mr', name: 'मराठी', nativeName: 'Marathi' },
  { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil' },
  { code: 'te', name: 'తెలుగు', nativeName: 'Telugu' },
  { code: 'kn', name: 'ಕನ್ನಡ', nativeName: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', nativeName: 'Malayalam' },
  { code: 'bn', name: 'বাংলা', nativeName: 'Bengali' },
  { code: 'or', name: 'ଓଡ଼ିଆ', nativeName: 'Odia' },
  { code: 'as', name: 'অসমীয়া', nativeName: 'Assamese' },
  { code: 'ur', name: 'اردو', nativeName: 'Urdu' },
  { code: 'ks', name: 'کشمیری', nativeName: 'Kashmiri' },
  { code: 'sa', name: 'संस्कृत', nativeName: 'Sanskrit' },
  { code: 'bh', name: 'भोजपुरी', nativeName: 'Bhojpuri' },
  { code: 'mai', name: 'मैथिली', nativeName: 'Maithili' },
  { code: 'kok', name: 'कोंकणी', nativeName: 'Konkani' },
  { code: 'mni', name: 'মণিপুরী', nativeName: 'Manipuri' },
  { code: 'sd', name: 'سندھی', nativeName: 'Sindhi' },
  { code: 'ne', name: 'नेपाली', nativeName: 'Nepali' },
  { code: 'si', name: 'සිංහල', nativeName: 'Sinhala' },
];

// Crops supported
export const CROPS = [
  'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Groundnut', 'Soybean',
  'Mustard', 'Safflower', 'Sunflower', 'Sorghum', 'Millet', 'Pulses', 'Gram',
  'Lentil', 'Pea', 'Barley', 'Rye', 'Oat', 'Potato', 'Onion', 'Tomato',
  'Cabbage', 'Carrot', 'Spinach', 'Chilli', 'Turmeric', 'Ginger', 'Garlic'
];

// Indian States and Union Territories
export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
];

// Districts per state (sample - would be expanded in production)
export const DISTRICTS: Record<string, string[]> = {
  'Punjab': ['Amritsar', 'Bathinda', 'Firozpur', 'Gurdaspur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'SBS Nagar', 'Taran Taran'],
  'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurgaon', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Mewat', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Azamgarh', 'Badaun', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Bansgaon', 'Barabanki', 'Bareilly', 'Basti', 'Bijnor', 'Budaun'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Beawar', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dhaulpur', 'Didwana-Kuchaman', 'Dungarpur', 'Ganganagar', 'Gangapurcity', 'Ganganpur', 'Hanumangarh', 'Jaipur'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Indore', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai', 'Nagpur', 'Nanded'],
};

// Weather icons mapping
export const WEATHER_ICONS: Record<string, string> = {
  'clear': '☀️',
  'clouds': '☁️',
  'rain': '🌧️',
  'drizzle': '🌦️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
  'smoke': '💨',
  'haze': '🌫️',
  'dust': '🌪️',
  'fog': '🌫️',
  'sand': '🌪️',
  'ash': '💨',
  'squall': '💨',
  'tornado': '🌪️',
};

// Scheme types
export const SCHEME_TYPES = [
  'Crop Insurance',
  'Subsidy',
  'Loan',
  'Training',
  'Equipment Support',
  'Organic Farming',
  'Water Management',
  'Market Access',
  'Export Support',
  'Infrastructure Development'
];

// Market price trends
export const TREND_TYPES = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable',
} as const;

// Mandi types
export const MANDI_TYPES = [
  'Government', 'Private', 'Cooperative', 'E-commerce'
];
