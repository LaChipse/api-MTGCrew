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
Object.defineProperty(exports, "__esModule", { value: true });
const Scry = __importStar(require("scryfall-sdk"));
class ScryfallService {
    constructor() { }
    /**
     * Récupère des cartes depuis l'API Scryfall selon une requête donnée
     * @param {string} fuzzyName - Requête de recherche (ex: "name:goblin", "set:khm type:creature")
     */
    getCards(fuzzyName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cardsByName = yield Scry.Cards.byName(fuzzyName, true);
                return cardsByName;
            }
            catch (error) {
                console.error('Erreur dans getCards:', error);
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
            try {
                const printsResponse = yield fetch(printsUrl);
                const printsResponseData = yield printsResponse.json();
                const formatIllustrationsCards = this.formatIllustrationsCards(printsResponseData);
                return formatIllustrationsCards;
            }
            catch (error) {
                console.error('Erreur dans getIllustrationsCards:', error);
                throw error;
            }
        });
    }
    formatIllustrationsCards(printsResponseData) {
        return printsResponseData.data.map((d) => {
            if (d.card_faces && Array.isArray(d.card_faces) && d.card_faces.length > 0) {
                return d.card_faces.map((cf) => ({
                    imageUrlSmall: cf.image_uris.small,
                    imageUrlNormal: cf.image_uris.normal,
                }));
            }
            else {
                return {
                    imageUrlSmall: d.image_uris.small,
                    imageUrlNormal: d.image_uris.normal
                };
            }
        });
    }
}
exports.default = ScryfallService;
//# sourceMappingURL=ScryFallService.js.map