const JogosSalvos = require('../models/JogosModel');

exports.index = async (req, res) => {

        res.render('index', {
            titulo: 'Jogos da mega sena'
        });

}