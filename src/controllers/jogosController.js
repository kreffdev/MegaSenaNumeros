const LoginModel = require('../models/LoginModel');
const { validarNumerosPorModalidade } = require('../config/modalidades');

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

        const { numeros, modalidade = 'megasena', mesDaSorte, timeCoracao } = req.body;

        // Validar com base na modalidade
        const validacao = validarNumerosPorModalidade(numeros, modalidade);
        if (!validacao.valido) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: validacao.mensagem 
            });
        }

        // Salvar como subdocumento no usuário
        const usuario = await LoginModel.findById(req.session.user.id);
        if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });

        usuario.jogos = usuario.jogos || [];
        const jogoData = { 
            numeros: numeros, 
            modalidade: modalidade,
            criadoEm: Date.now() 
        };
        
        // Adicionar campos extras se presentes
        if (mesDaSorte) jogoData.mesDaSorte = mesDaSorte;
        if (timeCoracao) jogoData.timeCoracao = timeCoracao;
        
        usuario.jogos.push(jogoData);
        await usuario.save();

        const saved = usuario.jogos[usuario.jogos.length - 1];
        res.json({ sucesso: true, mensagem: 'Sequência salva com sucesso!', jogo: saved });

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

        const { sequencias, modalidade = 'megasena' } = req.body;

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
            const numerosSeq = seq.numeros || seq;
            
            const validacao = validarNumerosPorModalidade(numerosSeq, modalidade);
            if (!validacao.valido) {
                return res.status(400).json({ 
                    sucesso: false, 
                    mensagem: validacao.mensagem 
                });
            }

            const jogoData = {
                numeros: numerosSeq,
                modalidade: modalidade
            };
            
            // Adicionar campos extras se presentes
            if (seq.mesDaSorte) jogoData.mesDaSorte = seq.mesDaSorte;
            if (seq.timeCoracao) jogoData.timeCoracao = seq.timeCoracao;
            
            jogosParaSalvar.push(jogoData);
        }

        // Salvar como subdocumentos no usuário
        const usuario = await LoginModel.findById(req.session.user.id);
        if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });

        usuario.jogos = usuario.jogos || [];
        for (const j of jogosParaSalvar) {
            usuario.jogos.push({ 
                ...j,
                criadoEm: Date.now() 
            });
        }
        await usuario.save();

        const saved = usuario.jogos.slice(-jogosParaSalvar.length);
        res.json({ sucesso: true, mensagem: `${saved.length} sequência(s) salva(s) com sucesso!`, jogos: saved, quantidade: saved.length });

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

        const usuario = await LoginModel.findById(req.session.user.id).lean();
        
        // Filtrar apenas jogos NÃO marcados como feitos
        const jogosNaoMarcados = (usuario && usuario.jogos) ? usuario.jogos.filter(j => j.apostaMarcada !== true) : [];
        const jogos = jogosNaoMarcados.slice().sort((a,b) => new Date(b.criadoEm) - new Date(a.criadoEm));

        res.json({ sucesso: true, jogos: jogos, quantidade: jogos.length });

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

        // Usar $pull para remover subdocumento pelo _id
        const result = await LoginModel.findByIdAndUpdate(
            req.session.user.id,
            { $pull: { jogos: { _id: id } } },
            { new: true }
        );

        if (!result) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });

        res.json({ sucesso: true, mensagem: 'Sequência deletada com sucesso!' });

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

        // Obter todos os jogos do usuário logado (embedded)
        const remetente = await LoginModel.findById(req.session.user.id);
        if (!remetente) return res.status(404).json({ sucesso: false, mensagem: 'Usuário remetente não encontrado' });

        let meusjogos = (remetente.jogos || []).slice();

        // Remover duplicatas locais
        const seen = new Set();
        meusjogos = meusjogos.filter(j => {
            const key = (j.numeros || []).slice().sort((a,b)=>a-b).join(',');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        if (meusjogos.length === 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'Você não tem sequências para enviar' });
        }

        // Buscar jogos já recebidos pelo destinatário para evitar duplicatas
        const destino = await LoginModel.findById(usuarioDestino._id);
        if (!destino) return res.status(404).json({ sucesso: false, mensagem: 'Usuário destino não encontrado' });

        const jaEnviadasSet = new Set((destino.jogosRecebidos || []).map(j => (j.numeros || []).slice().sort((a,b)=>a-b).join(',')));

        const jogosNaoEnviados = meusjogos.filter(jogo => {
            const chave = (jogo.numeros || []).slice().sort((a,b)=>a-b).join(',');
            return !jaEnviadasSet.has(chave);
        });

        if (jogosNaoEnviados.length === 0) {
            return res.json({ sucesso: true, mensagem: `Nenhuma sequência nova para enviar a ${nomeUsuario}.` });
        }

        // Inserir nos jogosRecebidos do destinatário
        destino.jogosRecebidos = destino.jogosRecebidos || [];
        const jogosParaInserir = jogosNaoEnviados.map(j => ({ numeros: j.numeros.slice().sort((a,b)=>a-b), enviadoPor: remetente._id, enviadoPorUsername: remetente.username, dataEnvio: j.criadoEm || Date.now() }));
        
        for (const jj of jogosParaInserir) destino.jogosRecebidos.push(jj);
        await destino.save();

        // Registrar histórico no remetente (jogosEnviados)
        remetente.jogosEnviados = remetente.jogosEnviados || [];
        const sequencias = jogosParaInserir.map(j => ({ numeros: j.numeros }));
        remetente.jogosEnviados.push({ sequencias, recebidoEm: destino._id, recebidoUsername: destino.username, quantidade: sequencias.length, dataEnvio: Date.now() });
        await remetente.save();

        res.json({ sucesso: true, mensagem: `${jogosParaInserir.length} sequência(s) enviada(s) com sucesso para ${nomeUsuario}!`, quantidade: jogosParaInserir.length });

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

        // Ler do documento de usuário (embedded)
        const usuario = await LoginModel.findById(req.session.user.id).populate('jogosRecebidos.enviadoPor', 'username').lean();
        
        // Filtrar apenas jogos NÃO marcados como feitos
        const jogosNaoMarcados = (usuario && usuario.jogosRecebidos) ? usuario.jogosRecebidos.filter(j => j.apostaMarcada !== true) : [];
        const jogosRecebidos = jogosNaoMarcados.slice().sort((a,b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
        
        res.json({ sucesso: true, jogos: jogosRecebidos, quantidade: jogosRecebidos.length });

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

        // Usar $pull para remover subdocumento pelo _id
        const result = await LoginModel.findByIdAndUpdate(
            req.session.user.id,
            { $pull: { jogosRecebidos: { _id: id } } },
            { new: true }
        );

        if (!result) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });

        res.json({ sucesso: true, mensagem: 'Jogo recebido deletado com sucesso!' });

    } catch (erro) {
        console.error('Erro ao deletar jogo recebido:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao deletar jogo recebido' 
        });
    }
}

// Deletar todas as sequências do usuário
exports.deletarTodasSequencias = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado' 
            });
        }

        const resultado = await LoginModel.findByIdAndUpdate(
            req.session.user.id,
            { jogos: [] },
            { new: true }
        );

        if (!resultado) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });

        res.json({ sucesso: true, mensagem: 'Todas as sequências foram deletadas com sucesso!' });

    } catch (erro) {
        console.error('Erro ao deletar todas as sequências:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao deletar sequências' 
        });
    }
};

// Deletar todos os jogos recebidos do usuário
exports.deletarTodosRecebidos = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado' 
            });
        }

        const resultado = await LoginModel.findByIdAndUpdate(
            req.session.user.id,
            { jogosRecebidos: [] },
            { new: true }
        );

        if (!resultado) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });

        res.json({ sucesso: true, mensagem: 'Todos os jogos recebidos foram deletados com sucesso!' });

    } catch (erro) {
        console.error('Erro ao deletar todos os recebidos:', erro);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao deletar jogos recebidos' 
        });
    }
};

// Marcar aposta como feita (permanente) - para jogos recebidos
exports.marcarAposta = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado' 
            });
        }

        const jogoId = req.params.id;
        console.log('🎯 Marcando aposta recebida - jogoId:', jogoId);
        
        const usuario = await LoginModel.findById(req.session.user.id).populate('jogosRecebidos.enviadoPor', 'username');
        
        if (!usuario) {
            return res.status(404).json({ 
                sucesso: false, 
                mensagem: 'Usuário não encontrado' 
            });
        }

        // Buscar o jogo usando find
        const jogo = usuario.jogosRecebidos.find(j => j._id.toString() === jogoId.toString());
        
        if (!jogo) {
            console.log('❌ Jogo recebido não encontrado com ID:', jogoId);
            return res.status(404).json({ 
                sucesso: false, 
                mensagem: 'Jogo não encontrado' 
            });
        }

        console.log('✅ Jogo recebido encontrado, movendo para jogosRealizados');

        // Criar entrada em jogosRealizados
        usuario.jogosRealizados = usuario.jogosRealizados || [];
        usuario.jogosRealizados.push({
            numeros: jogo.numeros,
            modalidade: jogo.modalidade || 'megasena',
            mesDaSorte: jogo.mesDaSorte,
            timeCoracao: jogo.timeCoracao,
            origem: 'recebido',
            enviadoPor: jogo.enviadoPor ? jogo.enviadoPor._id : null,
            enviadoPorUsername: jogo.enviadoPorUsername || (jogo.enviadoPor ? jogo.enviadoPor.username : null),
            dataAposta: new Date(),
            dataCriacao: jogo.dataEnvio,
            originalId: jogo._id
        });

        // Remover de jogosRecebidos
        usuario.jogosRecebidos = usuario.jogosRecebidos.filter(j => j._id.toString() !== jogoId.toString());
        
        await usuario.save();

        console.log('💾 Aposta movida para jogosRealizados com sucesso');

        res.json({ 
            sucesso: true, 
            mensagem: 'Aposta marcada com sucesso!' 
        });
    } catch (e) {
        console.error('❌ Erro ao marcar aposta:', e);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao marcar aposta' 
        });
    }
};

// Marcar aposta como feita (permanente) - para jogos próprios
exports.marcarApostaPropria = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Você precisa estar logado' 
            });
        }

        const jogoId = req.params.id;
        console.log('🎯 Marcando aposta própria - jogoId:', jogoId);
        
        const usuario = await LoginModel.findById(req.session.user.id);
        
        if (!usuario) {
            return res.status(404).json({ 
                sucesso: false, 
                mensagem: 'Usuário não encontrado' 
            });
        }

        // Buscar o jogo usando find
        const jogo = usuario.jogos.find(j => j._id.toString() === jogoId.toString());
        
        if (!jogo) {
            console.log('❌ Jogo próprio não encontrado com ID:', jogoId);
            return res.status(404).json({ 
                sucesso: false, 
                mensagem: 'Jogo não encontrado' 
            });
        }

        console.log('✅ Jogo próprio encontrado, movendo para jogosRealizados');

        // Criar entrada em jogosRealizados
        usuario.jogosRealizados = usuario.jogosRealizados || [];
        usuario.jogosRealizados.push({
            numeros: jogo.numeros,
            modalidade: jogo.modalidade || 'megasena',
            mesDaSorte: jogo.mesDaSorte,
            timeCoracao: jogo.timeCoracao,
            origem: 'proprio',
            dataAposta: new Date(),
            dataCriacao: jogo.criadoEm,
            originalId: jogo._id
        });

        // Remover de jogos
        usuario.jogos = usuario.jogos.filter(j => j._id.toString() !== jogoId.toString());
        
        await usuario.save();

        console.log('💾 Aposta própria movida para jogosRealizados com sucesso');

        res.json({ 
            sucesso: true, 
            mensagem: 'Aposta marcada com sucesso!' 
        });
    } catch (e) {
        console.error('❌ Erro ao marcar aposta própria:', e);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao marcar aposta' 
        });
    }
};
