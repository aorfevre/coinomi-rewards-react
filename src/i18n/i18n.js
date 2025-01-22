import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations';

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
});

// if we have a router param for language, use it
const language = new URLSearchParams(window.location.search).get('lang');
if (language) {
    i18n.changeLanguage(language);
}

export default i18n;
