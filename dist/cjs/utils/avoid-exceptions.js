"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avoidExceptionOnPromise = exports.avoidException = void 0;
const avoidException = (callback, param, defaults = {}) => {
    try {
        return callback(param);
    }
    catch (_a) {
        return defaults;
    }
};
exports.avoidException = avoidException;
const avoidExceptionOnPromise = (promise, defaults = {}) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return (yield promise).default || defaults;
    }
    catch (e) {
        return defaults;
    }
});
exports.avoidExceptionOnPromise = avoidExceptionOnPromise;
