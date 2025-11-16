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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Scry = __importStar(require("scryfall-sdk"));
const JournalService_1 = __importDefault(require("./JournalService"));
class ScryfallService {
    constructor() { }
    /**
     * Récupère des cartes depuis l'API Scryfall selon une requête donnée
     * @param {string} fuzzyName - Requête de recherche (ex: "name:goblin", "set:khm type:creature")
     */
    getCards(fuzzyName) {
        return __awaiter(this, void 0, void 0, function* () {
            const journalService = new JournalService_1.default;
            try {
                const cardsByName = yield Scry.Cards.byName(fuzzyName, true);
                return cardsByName;
            }
            catch (error) {
                yield journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Récupération carte par Scryfall');
                throw error;
            }
        });
    }
    /**
     * Récupère des cartes depuis l'API Scryfall selon une requête donnée
     * @param {string} printsUrl - Url de l'Api pour illustrations
     */
    getIllustrationsCards(printsUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const journalService = new JournalService_1.default;
            try {
                const printsResponse = yield fetch(printsUrl);
                const printsResponseData = yield printsResponse.json();
                const formatIllustrationsCards = this.formatIllustrationsCards(printsResponseData);
                return formatIllustrationsCards;
            }
            catch (error) {
                yield journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Récupération illustration par Scryfall');
                throw error;
            }
        });
    }
    /**
     * Formatage des différentes données d'illustrations
     * @param {Record<'data', Array<Scry.Card>>} printsResponseData - Données d'illustrations
     */
    formatIllustrationsCards(printsResponseData) {
        return printsResponseData.data.map((d) => {
            if (d.card_faces && Array.isArray(d.card_faces) && d.card_faces.length > 0) {
                return d.card_faces.map((cf) => ({
                    imageUrlSmall: cf.image_uris.small,
                    imageUrlNormal: cf.image_uris.normal,
                    imageArt: cf.image_uris.art_crop
                }));
            }
            else {
                return {
                    imageUrlSmall: d.image_uris.small,
                    imageUrlNormal: d.image_uris.normal,
                    imageArt: d.image_uris.art_crop
                };
            }
        });
    }
}
exports.default = ScryfallService;
//# sourceMappingURL=ScryFallService.js.map