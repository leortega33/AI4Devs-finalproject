import '@testing-library/jest-dom/vitest';
import i18n from './i18n';

// Force a deterministic language for unit tests (Spanish is the app default).
i18n.changeLanguage('es');
