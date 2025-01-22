import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations/index.js';

// Define RTL languages
const RTL_LANGUAGES = ['ar', 'fa', 'he'];

console.log('Initializing i18n with resources:', resources);

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: {
        default: ['en'],
    },
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
    // Add direction configuration
    dir: () => {
        // Return 'rtl' for RTL languages, 'ltr' for others
        return RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr';
    },
    // Add these configurations
    supportedLngs: Object.keys(resources), // Dynamically set from available resources
    load: 'currentOnly', // This prevents i18next from trying to load 'pt' when 'pt-BR' is requested
    detection: {
        order: ['querystring', 'navigator'],
    },
    debug: true, // Enable debug mode to see more logs
});

// if we have a router param for language, use it
const language = new URLSearchParams(window.location.search).get('lang');
if (language) {
    console.log('Setting initial language from URL:', language);
    i18n.changeLanguage(language);
}

// Export helper function to check if current language is RTL
export const isRTL = () => RTL_LANGUAGES.includes(i18n.language);

export default i18n;
