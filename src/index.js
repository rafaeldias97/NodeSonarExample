const express = require('express');
const app = express();
const port = process.env.PORT || 8080

app.get('/', (req, res) => {
    return res.status(200).json({ nome: 'Rafael Dias' });
});

let server = app.listen(port, () => {
    console.log(`Aplicação rodando na porta ${port}`);
});

module.exports = server;
