import mongoose, { ObjectId }  from 'mongoose';

export interface Journals {
    _id: ObjectId
    idUser?: string
    body?: Record<string, any>
    action: string
    date: Date
}

const journalsSchema = new mongoose.Schema({
    idUser: String,
    body: Object,
    action: String,
    date: Date
});

const journals = mongoose.model('journals', journalsSchema);

export default journals;