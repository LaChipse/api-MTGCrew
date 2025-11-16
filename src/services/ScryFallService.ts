import * as Scry from "scryfall-sdk";
import JournalService from "./JournalService";

export default class ScryfallService {
    constructor() {}

    /**
     * Récupère des cartes depuis l'API Scryfall selon une requête donnée
     * @param {string} fuzzyName - Requête de recherche (ex: "name:goblin", "set:khm type:creature")
     */
    public async getCards(fuzzyName: string) {
        const journalService = new JournalService
        
        try {
            const cardsByName = await Scry.Cards.byName(fuzzyName, true);
            return cardsByName
        } catch (error) {
            await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Récupération carte par Scryfall')
            throw error;
        }
    }

    /**
     * Récupère des cartes depuis l'API Scryfall selon une requête donnée
     * @param {string} printsUrl - Url de l'Api pour illustrations
     */
    public async getIllustrationsCards(printsUrl: string) {
        const journalService = new JournalService
        
        try {
            const printsResponse = await fetch(printsUrl);
            const printsResponseData = await printsResponse.json() as Record<'data', Array<Scry.Card>>;

            const formatIllustrationsCards = this.formatIllustrationsCards( printsResponseData )
            return formatIllustrationsCards
        } catch (error) {
            await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Récupération illustration par Scryfall')
            throw error;
        }
    }

    /**
     * Formatage des différentes données d'illustrations
     * @param {Record<'data', Array<Scry.Card>>} printsResponseData - Données d'illustrations
     */
    private formatIllustrationsCards(printsResponseData: Record<'data', Array<Scry.Card>>) {
        return printsResponseData.data.map((d) => {
            if (d.card_faces && Array.isArray(d.card_faces) && d.card_faces.length > 0) {
                return d.card_faces.map((cf) => (
                    {
                        imageUrlSmall: cf.image_uris.small,
                        imageUrlNormal: cf.image_uris.normal,
                        imageArt: cf.image_uris.art_crop
                    }
                ))
            } else {
                return {
                    imageUrlSmall: d.image_uris.small,
                    imageUrlNormal: d.image_uris.normal,
                    imageArt: d.image_uris.art_crop
                }
            }
        })
    }
}