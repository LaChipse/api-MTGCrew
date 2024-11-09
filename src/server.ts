import app from './api';

const PORT = 9000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});