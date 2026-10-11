import en from '../i18n/en.json';
import tr from '../i18n/tr.json';

const DICTIONARIES = { en, tr };

const STORAGE_KEY = 'language';
const FALLBACK = 'en';

function detect() {
  let stored = null;

  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }

  if (stored && DICTIONARIES[stored]) {
    return stored;
  }

  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  return DICTIONARIES[browser] ? browser : FALLBACK;
}

const current = detect();

export function getLanguage() {
  return current;
}

export function setLanguage(language) {
  if (!DICTIONARIES[language]) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    return;
  }

  window.location.reload();
}

export function t(key, vars) {
  const dictionary = DICTIONARIES[current];
  let text = (dictionary && dictionary[key]) || DICTIONARIES[FALLBACK][key] || key;

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }

  return text;
}
