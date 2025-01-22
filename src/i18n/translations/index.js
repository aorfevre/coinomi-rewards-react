import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ar } from './ar';
import { hi } from './hi';
import { pt_BR } from './pt_BR';
import { ru } from './ru';
import { ja } from './ja';
import { de } from './de';
import { ko } from './ko';
import { tr } from './tr';
import { it } from './it';
import { pl } from './pl';
import { fa } from './fa';
import { id } from './id';
import { nl } from './nl';
import { uk } from './uk';
import { ro } from './ro';
import { el } from './el';
import { cs } from './cs';
import { hu } from './hu';
import { zh_CN } from './zh_CN';
import { zh_TW } from './zh_TW';
import { hr } from './hr';
import { ka } from './ka';
import { is } from './is';
import { ms } from './ms';
import { pt_PT } from './pt_PT';
import { sl } from './sl';

export const resources = {
    en: { translation: en }, // English (Global)
    es: { translation: es }, // Spanish
    fr: { translation: fr }, // French
    ar: { translation: ar }, // Arabic
    hi: { translation: hi }, // Hindi
    'pt-BR': { translation: pt_BR }, // Portuguese (Brazil)
    ru: { translation: ru }, // Russian
    ja: { translation: ja }, // Japanese
    de: { translation: de }, // German
    ko: { translation: ko }, // Korean
    tr: { translation: tr }, // Turkish
    it: { translation: it }, // Italian
    pl: { translation: pl }, // Polish
    fa: { translation: fa }, // Persian
    id: { translation: id }, // Indonesian
    nl: { translation: nl }, // Dutch
    uk: { translation: uk }, // Ukrainian
    ro: { translation: ro }, // Romanian
    el: { translation: el }, // Greek
    cs: { translation: cs }, // Czech
    hu: { translation: hu }, // Hungarian
    'zh-CN': { translation: zh_CN }, // Chinese Simplified
    'zh-TW': { translation: zh_TW }, // Chinese Traditional
    hr: { translation: hr }, // Croatian
    ka: { translation: ka }, // Georgian
    is: { translation: is }, // Icelandic
    ms: { translation: ms }, // Malaysian
    'pt-PT': { translation: pt_PT }, // Portuguese (Portugal)
    sl: { translation: sl }, // Slovenian
};

// Language names in their native form with flags
export const languageNames = {
    en: '🇬🇧 English',
    es: '🇪🇸 Español',
    fr: '🇫🇷 Français',
    ar: '🇸🇦 العربية',
    hi: '🇮🇳 हिन्दी',
    'pt-BR': '🇧🇷 Português (Brasil)',
    ru: '🇷🇺 Русский',
    ja: '🇯🇵 日本語',
    de: '🇩🇪 Deutsch',
    ko: '🇰🇷 한국어',
    tr: '🇹🇷 Türkçe',
    it: '🇮🇹 Italiano',
    pl: '🇵🇱 Polski',
    fa: '🇮🇷 فارسی',
    id: '🇮🇩 Bahasa Indonesia',
    nl: '🇳🇱 Nederlands',
    uk: '🇺🇦 Українська',
    ro: '🇷🇴 Română',
    el: '🇬🇷 Ελληνικά',
    cs: '🇨🇿 Čeština',
    hu: '🇭🇺 Magyar',
    'zh-CN': '🇨🇳 简体中文',
    'zh-TW': '🇹🇼 繁體中文',
    hr: '🇭🇷 Hrvatski',
    ka: '🇬🇪 ქართული',
    is: '🇮🇸 Íslenska',
    ms: '🇲🇾 Bahasa Melayu',
    'pt-PT': '🇵🇹 Português',
    sl: '🇸🇮 Slovenščina',
};

// Export RTL languages list
export const rtlLanguages = ['ar', 'fa', 'he'];
