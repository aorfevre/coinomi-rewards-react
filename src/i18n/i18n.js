import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations';

// Define RTL languages
const RTL_LANGUAGES = ['ar', 'fa', 'he'];

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
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
});

// if we have a router param for language, use it
const language = new URLSearchParams(window.location.search).get('lang');
if (language) {
    i18n.changeLanguage(language);
}

// Export helper function to check if current language is RTL
export const isRTL = () => RTL_LANGUAGES.includes(i18n.language);

export default i18n;
