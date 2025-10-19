//Importations
const express = require('express');
import { auth } from '../middleware/auth';
import deckCtrl from '../controllers/deck'

const router = express.Router();

//Routes User
router.get('/mine', auth, deckCtrl.getMine);
router.get('/getCardByName', deckCtrl.getDeckIllustration)
router.post('/add', deckCtrl.add);
router.delete('/delete', auth, deckCtrl.softDelete);
router.put('/update', auth, deckCtrl.update);
router.get('/all', deckCtrl.getAll);
router.get('/:id', deckCtrl.getUserDeck);

//Exportation
export default router;