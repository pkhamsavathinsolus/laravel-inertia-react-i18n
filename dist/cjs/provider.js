"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaravelReactI18nProvider = void 0;
const React = __importStar(require("react"));
const context_1 = require("./context");
const avoid_exceptions_1 = require("./utils/avoid-exceptions");
const has_php_translations_1 = require("./utils/has-php-translations");
const pluralization_1 = require("./pluralization");
const isServer = typeof window === 'undefined';
/**
 * The default options.
 */
const defaultOptions = {
    lang: !isServer && document.documentElement.lang ? document.documentElement.lang.replace('-', '_') : null,
    fallbackLang: 'en',
    resolve: (lang) => new Promise((resolve) => resolve({ default: {} }))
};
/**
 * Laravel React I18n Provider:
 */
function LaravelReactI18nProvider(_a) {
    var { awaitLangLoad = isServer, children } = _a, currentOptions = __rest(_a, ["awaitLangLoad", "children"]);
    const [options, setOptions] = React.useState(Object.assign(Object.assign({}, defaultOptions), currentOptions));
    const [loaded, setLoaded] = React.useState([]);
    const [activeMessages, setActiveMessages] = React.useState({});
    React.useEffect(() => {
        if (isServer) {
            loadLanguage(options.lang || options.fallbackLang);
        }
        else {
            loadLanguageAsync(options.lang || options.fallbackLang);
        }
    }, [options.lang]);
    /**
     * Checks if the language is loaded.
     */
    function isLoaded(lang) {
        lang !== null && lang !== void 0 ? lang : (lang = getActiveLanguage());
        return loaded.some((row) => row.lang.replace(/[-_]/g, '-') === lang.replace(/[-_]/g, '-'));
    }
    /**
     * Loads the language async.
     */
    function loadLanguage(lang, dashLangTry = false) {
        const loadedLang = loaded.find((row) => row.lang === lang);
        if (loadedLang) {
            setLanguage(loadedLang);
            return;
        }
        const { default: messages } = resolveLang(options.resolve, lang);
        applyLanguage(lang, messages, dashLangTry, loadLanguage);
    }
    /**
     * Set current language.
     */
    function setLang(lang) {
        setOptions(Object.assign(Object.assign({}, options), { lang }));
    }
    /**
     * Loads the language file.
     */
    function loadLanguageAsync(lang, dashLangTry = false) {
        const loadedLang = loaded.find((row) => row.lang === lang);
        if (loadedLang) {
            return Promise.resolve(setLanguage(loadedLang));
        }
        return resolveLangAsync(options.resolve, lang).then(({ default: messages }) => {
            applyLanguage(lang, messages, dashLangTry, loadLanguageAsync);
        });
    }
    /**
     * Applies the language data and saves it to the loaded storage.
     */
    function applyLanguage(lang, messages, dashLangTry = false, callable) {
        if (Object.keys(messages).length < 1) {
            if (/[-_]/g.test(lang) && !dashLangTry) {
                return callable(lang.replace(/[-_]/g, (char) => (char === '-' ? '_' : '-')), true);
            }
            if (lang !== options.fallbackLang) {
                return callable(options.fallbackLang);
            }
        }
        const data = { lang, messages };
        setLoaded([data]);
        return setLanguage(data);
    }
    /**
     * Get the translation for the given key.
     */
    function trans(key, replacements = {}) {
        return wTrans(key, replacements);
    }
    /**
     * Get the translation for the given key and watch for any changes.
     */
    function wTrans(key, replacements = {}) {
        key = key.replace(/\//g, '.');
        if (!activeMessages[key]) {
            activeMessages[key] = key;
        }
        return makeReplacements(activeMessages[key], replacements);
    }
    /**
     * Translates the given message based on a count.
     */
    function transChoice(key, number, replacements = {}) {
        return wTransChoice(key, number, replacements);
    }
    /**
     * Translates the given message based on a count and watch for changes.
     */
    function wTransChoice(key, number, replacements = {}) {
        const message = wTrans(key, replacements);
        replacements.count = number.toString();
        return makeReplacements((0, pluralization_1.choose)(message, number, options.lang), replacements);
    }
    /**
     * Returns the current active language.
     */
    function getActiveLanguage() {
        return options.lang || options.fallbackLang;
    }
    /**
     * Sets the language messages to the activeMessages.
     */
    function setLanguage({ lang, messages }) {
        if (!isServer) {
            // When setting the HTML lang attribute, hyphen must be use instead of underscore.
            document.documentElement.setAttribute('lang', lang.replace('_', '-'));
        }
        setOptions(Object.assign(Object.assign({}, options), { lang }));
        const am = {};
        for (const [key, value] of Object.entries(messages)) {
            am[key] = value;
        }
        for (const [key] of Object.entries(am)) {
            if (!messages[key]) {
                am[key] = null;
            }
        }
        setActiveMessages(Object.assign(Object.assign({}, activeMessages), am));
        return lang;
    }
    /**
     * It resolves the language file or data, from direct data, syncrone.
     */
    function resolveLang(callable, lang, data = {}) {
        if (!Object.keys(data).length) {
            data = (0, avoid_exceptions_1.avoidException)(callable, lang);
        }
        if ((0, has_php_translations_1.hasPhpTranslations)(isServer)) {
            return {
                default: Object.assign(Object.assign({}, data), (0, avoid_exceptions_1.avoidException)(callable, `php_${lang}`))
            };
        }
        return { default: data };
    }
    /**
     * It resolves the language file or data, from direct data, require or Promise.
     */
    function resolveLangAsync(callable, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = (0, avoid_exceptions_1.avoidException)(callable, lang);
            if (!(data instanceof Promise)) {
                return resolveLang(callable, lang, data);
            }
            if ((0, has_php_translations_1.hasPhpTranslations)(isServer)) {
                const phpLang = yield (0, avoid_exceptions_1.avoidExceptionOnPromise)(callable(`php_${lang}`));
                const jsonLang = yield (0, avoid_exceptions_1.avoidExceptionOnPromise)(data);
                return new Promise((resolve) => resolve({
                    default: Object.assign(Object.assign({}, phpLang), jsonLang)
                }));
            }
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                return resolve({
                    default: yield (0, avoid_exceptions_1.avoidExceptionOnPromise)(data)
                });
            }));
        });
    }
    /**
     * Make the place-holder replacements on a line.
     */
    function makeReplacements(message, replacements) {
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        Object.entries(replacements || []).forEach(([key, value]) => {
            value = value.toString();
            message = message
                .replace(`:${key}`, value)
                .replace(`:${key.toUpperCase()}`, value.toUpperCase())
                .replace(`:${capitalize(key)}`, capitalize(value));
        });
        return message;
    }
    if (awaitLangLoad && !isLoaded(options === null || options === void 0 ? void 0 : options.lang)) {
        return React.createElement(React.Fragment);
    }
    return React.createElement(context_1.Context.Provider, {
        value: {
            t: trans,
            tChoice: transChoice,
            getActiveLanguage,
            isLoaded,
            setLang
        }
    }, children);
}
exports.LaravelReactI18nProvider = LaravelReactI18nProvider;
