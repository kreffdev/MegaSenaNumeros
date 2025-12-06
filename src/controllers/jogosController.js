const JogosModel = require('../models/JogosModel');
const JogosRecebidosModel = require('../models/JogosRecebidosModel');
const JogosEnviadosModel = require('../models/JogosEnviadosModel');
const LoginModel = require('../models/LoginModel');

// Salvar uma única sequência
exports.salvarSequencia = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado para salvar sequências' 
            });
        }

        const { numeros } = req.body;

        // Validar entrada
        if (!Array.isArray(numeros) || numeros.length !== 6) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Deve conter exatamente 6 números' 
            });
        }

        // Validar que todos são números entre 1-60
        if (!numeros.every(n => Number.isInteger(n) && n >= 1 && n <= 60)) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Todos os números devem estar entre 1 e 60' 
            });
        }

        // Validar que são únicos
        if (new Set(numeros).size !== 6) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Todos os números devem ser únicos' 
            });
        }

        // Criar novo jogo
        const novoJogo = new JogosModel({
            numeros: numeros.sort((a, b) => a - b),
            criadoPor: req.session.user.id
        });

        await novoJogo.save();

        res.json({ 
            sucesso: true, 
            mensagem: 'Sequência salva com sucesso!',
            jogo: novoJogo
        });

    } catch (erro) {
        console.error('Erro ao salvar sequência:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao salvar sequência' 
        });
    }
};

// Salvar múltiplas sequências de uma vez
exports.salvarMultiplas = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado para salvar sequências' 
            });
        }

        const { sequencias } = req.body;

        // Validar entrada
        if (!Array.isArray(sequencias) || sequencias.length === 0) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Deve conter pelo menos 1 sequência' 
            });
        }

        const jogosParaSalvar = [];

        // Validar todas as sequências
        for (let seq of sequencias) {
            if (!Array.isArray(seq.numeros) || seq.numeros.length !== 6) {
                return res.status(400).json({ 
                    sucesso: false, 
                    mensagem: 'Cada sequência deve conter exatamente 6 números' 
                });
            }

            if (!seq.numeros.every(n => Number.isInteger(n) && n >= 1 && n <= 60)) {
                return res.status(400).json({ 
                    sucesso: false, 
                    mensagem: 'Todos os números devem estar entre 1 e 60' 
                });
            }

            if (new Set(seq.numeros).size !== 6) {
                return res.status(400).json({ 
                    sucesso: false, 
                    mensagem: 'Todos os números devem ser únicos em cada sequência' 
                });
            }

            jogosParaSalvar.push({
                numeros: seq.numeros.sort((a, b) => a - b),
                criadoPor: req.session.user.id
            });
        }

        // Salvar todos os jogos
        const jogosSalvos = await JogosModel.insertMany(jogosParaSalvar);

        res.json({ 
            sucesso: true, 
            mensagem: `${jogosSalvos.length} sequência(s) salva(s) com sucesso!`,
            jogos: jogosSalvos,
            quantidade: jogosSalvos.length
        });

    } catch (erro) {
        console.error('Erro ao salvar sequências:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao salvar sequências' 
        });
    }
};

// Recuperar todas as sequências do usuário logado
exports.obterMeuJogos = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado' 
            });
        }

        const jogos = await JogosModel.find({ criadoPor: req.session.user.id })
            .sort({ criadoEm: -1 });

        res.json({ 
            sucesso: true, 
            jogos: jogos,
            quantidade: jogos.length
        });

    } catch (erro) {
        console.error('Erro ao recuperar jogos:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao recuperar jogos' 
        });
    }
};

// Deletar uma sequência
exports.deletarSequencia = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado' 
            });
        }

        const { id } = req.params;

        // Verificar se o jogo pertence ao usuário
        const jogo = await JogosModel.findById(id);

        if (!jogo) {
            return res.status(404).json({ 
                sucesso: false, 
                mensagem: 'Sequência não encontrada' 
            });
        }

        if (jogo.criadoPor.toString() !== req.session.user.id.toString()) {
            return res.status(403).json({ 
                sucesso: false, 
                mensagem: 'Você não tem permissão para deletar esta sequência' 
            });
        }

        await JogosModel.findByIdAndDelete(id);

        res.json({ 
            sucesso: true, 
            mensagem: 'Sequência deletada com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao deletar sequência:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao deletar sequência' 
        });
    }
};

// Enviar sequências para outro usuário
exports.enviarJogos = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado' 
            });
        }

        const { nomeUsuario } = req.body;

        // Validar entrada
        if (!nomeUsuario || typeof nomeUsuario !== 'string') {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Nome de usuário inválido' 
            });
        }

        // Procurar o usuário destinatário
        const usuarioDestino = await LoginModel.findOne({ username: nomeUsuario });

        if (!usuarioDestino) {
            return res.status(404).json({ 
                sucesso: false, 
                mensagem: 'Usuário não encontrado' 
            });
        }

        // Não permitir enviar para si mesmo
        if (usuarioDestino._id.toString() === req.session.user.id.toString()) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Você não pode enviar jogos para si mesmo' 
            });
        }

        // Obter todos os jogos do usuário logado
        let meusjogos = await JogosModel.find({ criadoPor: req.session.user.id });

        // Remover possíveis duplicatas locais (mesma sequência numérica)
        const seen = new Set();
        meusjogos = meusjogos.filter(j => {
            const key = (j.numeros || []).slice().sort((a,b)=>a-b).join(',');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        if (meusjogos.length === 0) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Você não tem sequências para enviar' 
            });
        }

        // Buscar jogos já enviados deste usuário para o destinatário, para evitar duplicatas
        const jaEnviados = await JogosRecebidosModel.find({
            enviadoPor: req.session.user.id,
            recebidoEm: usuarioDestino._id
        }).select('numeros');

        // Criar um set de chaves para comparar (numeros ordenados em string)
        const chaveEnviadas = new Set(jaEnviados.map(j => (j.numeros || []).slice().sort((a,b)=>a-b).join(',')));

        // Filtrar apenas jogos que ainda não foram enviados para esse destinatário
        const jogosNaoEnviados = meusjogos.filter(jogo => {
            const chave = (jogo.numeros || []).slice().sort((a,b)=>a-b).join(',');
            return !chaveEnviadas.has(chave);
        });

        if (jogosNaoEnviados.length === 0) {
            return res.json({
                sucesso: true,
                mensagem: `Nenhuma sequência nova para enviar a ${nomeUsuario}.`
            });
        }

        // Criar registros de jogos recebidos apenas para os não enviados
        const jogosParaEnviar = jogosNaoEnviados.map(jogo => ({
            numeros: jogo.numeros.slice().sort((a,b)=>a-b),
            enviadoPor: req.session.user.id,
            recebidoEm: usuarioDestino._id,
            criadoEm: jogo.criadoEm
        }));

        const jogosEnviados = await JogosRecebidosModel.insertMany(jogosParaEnviar);

        // Registrar histórico de envios como um único lote (groupado por envio)
        try {
            const envioHistorico = new JogosEnviadosModel({
                sequencias: jogosEnviados.map(j => ({
                    numeros: j.numeros.slice().sort((a,b)=>a-b),
                    jogoRecebidoRef: j._id
                })),
                enviadoPor: req.session.user.id,
                recebidoEm: usuarioDestino._id,
                recebidoUsername: usuarioDestino.username,
                quantidade: jogosEnviados.length,
                dataEnvio: Date.now()
            });

            await envioHistorico.save();
        } catch (errEnv) {
            console.error('Erro ao registrar histórico de envios:', errEnv);
            // Não falhar a operação principal se o registro de histórico falhar
        }

        res.json({ 
            sucesso: true, 
            mensagem: `${jogosEnviados.length} sequência(s) enviada(s) com sucesso para ${nomeUsuario}!`,
            quantidade: jogosEnviados.length
        });

    } catch (erro) {
        console.error('Erro ao enviar sequências:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao enviar sequências' 
        });
    }
};

// Recuperar sequências recebidas
exports.obterJogosRecebidos = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado' 
            });
        }

        const jogosRecebidos = await JogosRecebidosModel.find({ recebidoEm: req.session.user.id })
            .populate('enviadoPor', 'username')
            .sort({ dataEnvio: -1 });

        res.json({ 
            sucesso: true, 
            jogos: jogosRecebidos,
            quantidade: jogosRecebidos.length
        });

    } catch (erro) {
        console.error('Erro ao recuperar jogos recebidos:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao recuperar jogos recebidos' 
        });
    }
};

// Deletar um jogo recebido
exports.deletarJogoRecebido = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado' 
            });
        }

        const { id } = req.params;

        // Verificar se o jogo recebido pertence ao usuário
        const jogo = await JogosRecebidosModel.findById(id);

        if (!jogo) {
            return res.status(404).json({ 
                sucesso: false, 
                mensagem: 'Jogo recebido não encontrado' 
            });
        }

        if (jogo.recebidoEm.toString() !== req.session.user.id.toString()) {
            return res.status(403).json({ 
                sucesso: false, 
                mensagem: 'Você não tem permissão para deletar este jogo' 
            });
        }

        await JogosRecebidosModel.findByIdAndDelete(id);

        res.json({ 
            sucesso: true, 
            mensagem: 'Jogo recebido deletado com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao deletar jogo recebido:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao deletar jogo recebido' 
        });
    }
}
