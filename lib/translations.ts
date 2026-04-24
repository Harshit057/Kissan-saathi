// Multi-language translations for KisaanSathi
// Language codes: en, hi, pa, gu, mr, ta, te, kn, ml, bn, or, as, ur, ks, sa, bh, mai, kok, mni, sd, ne, si

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export const translations: Translations = {
  en: {
    // Auth page
    'auth.welcome_title': 'KisaanSathi',
    'auth.welcome_subtitle': 'Your farm, your future',
    'auth.welcome_description': 'Connect with farmers, discover fresh produce, and build a sustainable agricultural community',
    'auth.login_btn': 'Login to Account',
    'auth.signup_btn': 'Create New Account',
    'auth.language_select': 'Select or change language below',
    'auth.language_title': 'Select Your Language',
    'auth.language_subtitle': 'Choose from 22 Indian languages',
    'auth.how_continue': 'How would you like to continue?',
    'auth.create_account': 'Create New Account',
    'auth.create_account_desc': 'Sign up with phone and password',
    'auth.existing_account': 'Use Existing Account',
    'auth.existing_account_desc': 'Already have an account? Login here',
    'auth.login_title': 'Login to Your Account',
    'auth.signup_title': 'Create Your Account',
    'auth.phone_label': 'Phone Number',
    'auth.phone_placeholder': '98765 43210',
    'auth.phone_hint': '10-digit Indian mobile number',
    'auth.password_label': 'Password',
    'auth.password_placeholder': '••••••••',
    'auth.password_hint': 'Minimum 6 characters',
    'auth.password_secure': 'Minimum 6 characters, keep it secure',
    'auth.name_label': 'Full Name',
    'auth.name_placeholder': 'Your full name',
    'auth.who_are_you': 'Who are you?',
    'auth.farmer': 'I\'m a Farmer',
    'auth.farmer_desc': 'Grow, sell, and learn farming techniques',
    'auth.consumer': 'I\'m a Consumer',
    'auth.consumer_desc': 'Buy fresh produce directly from farmers',
    'auth.create_profile': 'Create Your Profile',
    'auth.language_preference': 'Language',
    'auth.phone_info': 'Phone',
    'auth.role_info': 'Role',
    'auth.continue': 'Continue',
    'auth.back': 'Back',
    'auth.back_welcome': 'Back to Welcome',
    'auth.diff_phone': 'Use Different Phone Number',
    'auth.login': 'Login',
    'auth.create': 'Create Account',
    'auth.creating': 'Creating Account...',
    'auth.logging_in': 'Logging in...',
    'auth.verifying': 'Verifying...',
    'auth.invalid_phone': 'Please enter a valid 10-digit Indian phone number',
    'auth.invalid_name': 'Please enter your name',
    'auth.invalid_password': 'Password must be at least 6 characters',
    'auth.login_failed': 'Login failed. Please try again.',
    'auth.register_failed': 'Registration failed. Please try again.',
    'auth.verify_error': 'Unable to verify phone number',
  },
  hi: {
    // Auth page - Hindi
    'auth.welcome_title': 'किसान साथी',
    'auth.welcome_subtitle': 'आपका खेत, आपका भविष्य',
    'auth.welcome_description': 'किसानों से जुड़ें, ताज़ी उपज खोजें और एक टिकाऊ कृषि समुदाय बनाएं',
    'auth.login_btn': 'खाते में लॉगिन करें',
    'auth.signup_btn': 'नया खाता बनाएं',
    'auth.language_select': 'नीचे भाषा का चयन करें या बदलें',
    'auth.language_title': 'अपनी भाषा चुनें',
    'auth.language_subtitle': '22 भारतीय भाषाओं में से चुनें',
    'auth.how_continue': 'आप कैसे आगे बढ़ना चाहेंगे?',
    'auth.create_account': 'नया खाता बनाएं',
    'auth.create_account_desc': 'फोन और पासवर्ड के साथ साइन अप करें',
    'auth.existing_account': 'मौजूदा खाते का उपयोग करें',
    'auth.existing_account_desc': 'पहले से खाता है? यहाँ लॉगिन करें',
    'auth.login_title': 'अपने खाते में लॉगिन करें',
    'auth.signup_title': 'अपना खाता बनाएं',
    'auth.phone_label': 'फोन नंबर',
    'auth.phone_placeholder': '98765 43210',
    'auth.phone_hint': '10 अंकों का भारतीय मोबाइल नंबर',
    'auth.password_label': 'पासवर्ड',
    'auth.password_placeholder': '••••••••',
    'auth.password_hint': 'कम से कम 6 वर्ण',
    'auth.password_secure': 'कम से कम 6 वर्ण, इसे सुरक्षित रखें',
    'auth.name_label': 'पूरा नाम',
    'auth.name_placeholder': 'आपका पूरा नाम',
    'auth.who_are_you': 'आप कौन हैं?',
    'auth.farmer': 'मैं एक किसान हूँ',
    'auth.farmer_desc': 'खेती करें, बेचें और कृषि तकनीकें सीखें',
    'auth.consumer': 'मैं एक उपभोक्ता हूँ',
    'auth.consumer_desc': 'सीधे किसानों से ताज़ी उपज खरीदें',
    'auth.create_profile': 'अपनी प्रोफ़ाइल बनाएं',
    'auth.language_preference': 'भाषा',
    'auth.phone_info': 'फोन',
    'auth.role_info': 'भूमिका',
    'auth.continue': 'जारी रखें',
    'auth.back': 'पीछे',
    'auth.back_welcome': 'स्वागत पर लौटें',
    'auth.diff_phone': 'अलग फोन नंबर का उपयोग करें',
    'auth.login': 'लॉगिन',
    'auth.create': 'खाता बनाएं',
    'auth.creating': 'खाता बनाया जा रहा है...',
    'auth.logging_in': 'लॉगिन किया जा रहा है...',
    'auth.verifying': 'सत्यापन किया जा रहा है...',
    'auth.invalid_phone': 'कृपया एक मान्य 10-अंकीय भारतीय फोन नंबर दर्ज करें',
    'auth.invalid_name': 'कृपया अपना नाम दर्ज करें',
    'auth.invalid_password': 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए',
    'auth.login_failed': 'लॉगिन विफल। कृपया पुनः प्रयास करें।',
    'auth.register_failed': 'पंजीकरण विफल। कृपया पुनः प्रयास करें।',
    'auth.verify_error': 'फोन नंबर सत्यापित करने में असमर्थ',
  },
  pa: {
    // Punjabi
    'auth.welcome_title': 'ਕਿਸਾਨ ਸਾਥੀ',
    'auth.welcome_subtitle': 'ਤੁਹਾਡਾ ਖੇਤ, ਤੁਹਾਡਾ ਭਵਿਖ',
    'auth.welcome_description': 'ਕਿਸਾਨਾਂ ਨਾਲ ਜੁੜੋ, ਤਾਜ਼ੀ ਕਿਸਮ ਖੋਜੋ ਅਤੇ ਇੱਕ ਟਿਕਾਊ ਕਿਤਾਬੀ ਸਮੁੱਚਾ ਬਣਾਓ',
    'auth.login_btn': 'ਖਾਤੇ ਵਿੱਚ ਲਾਗਇਨ ਕਰੋ',
    'auth.signup_btn': 'ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ',
    'auth.language_select': 'ਹੇਠ ਭਾਸ਼ਾ ਚੁਣੋ ਜਾਂ ਬਦਲੋ',
    'auth.language_title': 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
    'auth.language_subtitle': '22 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿਚੋਂ ਚੁਣੋ',
    'auth.how_continue': 'ਤੁਸੀਂ ਕਿਵੇਂ ਅੱਗੇ ਵਧਣਾ ਚਾਹੁੰਦੇ ਹੋ?',
    'auth.create_account': 'ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ',
    'auth.create_account_desc': 'ਫੋਨ ਅਤੇ ਪਾਸਵਰਡ ਨਾਲ ਸਾਇਨ ਅਪ ਕਰੋ',
    'auth.existing_account': 'ਮੌਜੂਦਾ ਖਾਤਾ ਵਰਤੋ',
    'auth.existing_account_desc': 'ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ? ਇੱਥੇ ਲਾਗਇਨ ਕਰੋ',
    'auth.phone_label': 'ਫੋਨ ਨੰਬਰ',
    'auth.phone_placeholder': '98765 43210',
    'auth.phone_hint': '10 ਅੰਕਾਂ ਦਾ ਭਾਰਤੀ ਮੋਬਾਈਲ ਨੰਬਰ',
    'auth.password_label': 'ਪਾਸਵਰਡ',
    'auth.password_placeholder': '••••••••',
    'auth.password_hint': 'ਘੱਟੋ ਘੱਟ 6 ਅੱਖਰ',
    'auth.continue': 'ਜਾਰੀ ਰੱਖੋ',
    'auth.back': 'ਪਿੱਛੇ',
    'auth.login': 'ਲਾਗਇਨ',
    'auth.create': 'ਖਾਤਾ ਬਣਾਓ',
  },
  gu: {
    // Gujarati
    'auth.welcome_title': 'કિસાન સાથી',
    'auth.welcome_subtitle': 'તમારું ખેતર, તમારો ભવિષ્ય',
    'auth.welcome_description': 'ખેડૂતો સાથે જોડાઓ, તાજુ ઉપજ શોધો અને એક ટકાઉ કૃષિ સમુદાય બનાવો',
    'auth.login_btn': 'ખાતાને સાઇન ઇન કરો',
    'auth.signup_btn': 'નવો ખાતો બનાવો',
  },
  mr: {
    // Marathi
    'auth.welcome_title': 'किसान साथी',
    'auth.welcome_subtitle': 'तुमचे शेत, तुमचे भविष्य',
    'auth.welcome_description': 'शेतकऱ्यांशी जोडा, ताज्या उपज शोधा आणि शाश्वत कृषि समुदाय तयार करा',
    'auth.login_btn': 'खात्यात साइन इन करा',
    'auth.signup_btn': 'नवीन खाते तयार करा',
  },
  ta: {
    // Tamil
    'auth.welcome_title': 'கிசான் சாதி',
    'auth.welcome_subtitle': 'உங்கள் சொத்து, உங்கள் எதிர்காலம்',
    'auth.welcome_description': 'விவசாயிகளுடன் இணைந்து, பதப்படுத்தப்பட்ட தயாரிப்புகளைக் கண்டுபிடி மற்றும் நிலையான வேளாண்மை சமூகத்தை உருவாக்கவும்',
    'auth.login_btn': 'கணக்கில் உள்நுழையவும்',
    'auth.signup_btn': 'புதிய கணக்கை உருவாக்கவும்',
  },
  te: {
    // Telugu
    'auth.welcome_title': 'కిసాన్ సాతీ',
    'auth.welcome_subtitle': 'మీ పొలం, మీ భవిష్యత్',
    'auth.welcome_description': 'రైతులతో కనెక్ట్ చేయండి, తాజా ఉత్పత్తిని కనుగొనండి మరియు సుస్థిర వ్యవసాయ సమాజాన్ని నిర్మించండి',
    'auth.login_btn': 'ఖాతాకు సైన్ ఇన్ చేయండి',
    'auth.signup_btn': 'నిన్న ఖాతాను సృష్టించండి',
  },
  kn: {
    // Kannada
    'auth.welcome_title': 'ಕಿಸಾನ್ ಸಾಥಿ',
    'auth.welcome_subtitle': 'ನಿಮ್ಮ ಜಾಗ, ನಿಮ್ಮ ಭವಿಷ್ಯತ್',
    'auth.welcome_description': 'ರೈತರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ, ತಾಜಾ ಉತ್ಪನ್ನವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ ಮತ್ತು ಸುಸ್ಥಿರ ಕೃಷಿ ಸಮುದಾಯವನ್ನು ನಿರ್ಮಿಸಿ',
    'auth.login_btn': 'ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
    'auth.signup_btn': 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ',
  },
  ml: {
    // Malayalam
    'auth.welcome_title': 'കിസാൻ സാതി',
    'auth.welcome_subtitle': 'നിങ്ങളുടെ കൃഷി, നിങ്ങളുടെ ഭാവിഷ്യ്യം',
    'auth.welcome_description': 'കർഷകരുമായി ബന്ധപ്പെടുക, സാധുതയുള്ള ഉൽപന്നങ്ങൾ കണ്ടെത്തുക, സുസ്ഥിരമായ കൃഷിസമൂഹം നിർമിക്കുക',
    'auth.login_btn': 'അക്കൗണ്ടിലേക്ക് സൈൻ ഇന്',
    'auth.signup_btn': 'പുതിയ അക്കൗണ്ട് സൃഷ്ടിക്കുക',
  },
  bn: {
    // Bengali
    'auth.welcome_title': 'কিসান সাথি',
    'auth.welcome_subtitle': 'আপনার খামার, আপনার ভবিষ্যত',
    'auth.welcome_description': 'কৃষকদের সাথে সংযোগ স্থাপন করুন, তাজা পণ্য আবিষ্কার করুন এবং টেকসই কৃষি সম্প্রদায় গড়ুন',
    'auth.login_btn': 'অ্যাকাউন্টে সাইন ইন করুন',
    'auth.signup_btn': 'নতুন অ্যাকাউন্ট তৈরি করুন',
  },
};

/**
 * Get translated text for the given language and key
 * Falls back to English if translation not found
 */
export function getTranslation(languageCode: string, key: string): string {
  // Try to get translation in the requested language
  if (translations[languageCode]?.[key]) {
    return translations[languageCode][key];
  }

  // Fallback to English
  if (translations.en?.[key]) {
    return translations.en[key];
  }

  // If nothing found, return the key itself
  return key;
}

/**
 * Hook to get all translations for a language
 */
export function useTranslations(languageCode: string = 'en') {
  return (key: string, fallback?: string): string => {
    return translations[languageCode]?.[key] || translations.en?.[key] || fallback || key;
  };
}
