import { Language } from '../types';
import { INITIAL_TRANSLATIONS, SUPPORTED_LANGUAGES } from '../data/translationsData';

export const TRANSLATIONS: Record<Language, Record<string, string>> = INITIAL_TRANSLATIONS;
export { SUPPORTED_LANGUAGES };
