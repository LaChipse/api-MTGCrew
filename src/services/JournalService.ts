import journals from "../models/journal";

export default class JournalService {
    constructor() {}

    /**
     * Ajout au journal
     * @param {Record<string, any>} body - Data
     * @param {string} action - Action
     * @param {string} idUser - Identifiant User
     */
    public async addToJournal(body: Record<string, any>, action: string, idUser?: string) {
        await journals.create({
            idUser,
            body,
            action,
            date: new Date()
        });
    }
}