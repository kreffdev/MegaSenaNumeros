require('dotenv').config();
const mongoose = require('mongoose');
const LoginModel = require('../src/models/LoginModel');
const JogosModel = require('../src/models/JogosModel');
const JogosRecebidosModel = require('../src/models/JogosRecebidosModel');

const MONGO = process.env.MONGO_URI || process.env.CONNECTIONSTRING;
if (!MONGO) {
  console.error('Defina a variável de ambiente MONGO_URI ou CONNECTIONSTRING antes de executar o script');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO, {
      // opções mínimas
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('Conectado ao MongoDB');

    // Usuários de teste
    const senderUsername = 'test_sender_auto';
    const receiverUsername = 'test_receiver_auto';

    // Limpar usuários antigos com os mesmos nomes
    await LoginModel.deleteMany({ username: { $in: [senderUsername, receiverUsername] } });

    // Criar usuários
    const sender = await LoginModel.create({ username: senderUsername, password: 'pass' });
    const receiver = await LoginModel.create({ username: receiverUsername, password: 'pass' });
    console.log('Usuários de teste criados:', sender.username, receiver.username);

    // Função auxiliar para criar jogos
    const criarJogos = async (ownerId, arrays) => {
      const docs = arrays.map(nums => ({ numeros: nums.slice().sort((a,b)=>a-b), criadoPor: ownerId }));
      return await JogosModel.insertMany(docs);
    };

    // 1) criar 3 jogos iniciais
    const iniciais = [
      [1,2,3,4,5,6],
      [7,8,9,10,11,12],
      [13,14,15,16,17,18]
    ];
    await criarJogos(sender._id, iniciais);
    console.log('3 jogos iniciais criados para sender');

    // Função que simula a lógica de enviar (mesma do controller)
    const enviarJogosSim = async (senderId, receiverId) => {
      const meusjogos = await JogosModel.find({ criadoPor: senderId });
      const jaEnviados = await JogosRecebidosModel.find({ enviadoPor: senderId, recebidoEm: receiverId }).select('numeros');
      const chaveEnviadas = new Set(jaEnviados.map(j => (j.numeros || []).slice().sort((a,b)=>a-b).join(',')));
      const jogosNaoEnviados = meusjogos.filter(jogo => {
        const chave = (jogo.numeros || []).slice().sort((a,b)=>a-b).join(',');
        return !chaveEnviadas.has(chave);
      });
      if (jogosNaoEnviados.length === 0) return { inserted: 0 };
      const jogosParaEnviar = jogosNaoEnviados.map(jogo => ({
        numeros: jogo.numeros.slice().sort((a,b)=>a-b),
        enviadoPor: senderId,
        recebidoEm: receiverId,
        criadoEm: jogo.criadoEm
      }));
      const enviados = await JogosRecebidosModel.insertMany(jogosParaEnviar);
      return { inserted: enviados.length };
    };

    // 2) enviar pela primeira vez -> deve inserir 3
    const first = await enviarJogosSim(sender._id, receiver._id);
    console.log('Primeiro envio - insertados:', first.inserted);

    // 3) criar mais 3 jogos novos
    const novos = [
      [19,20,21,22,23,24],
      [25,26,27,28,29,30],
      [31,32,33,34,35,36]
    ];
    await criarJogos(sender._id, novos);
    console.log('3 jogos novos criados para sender');

    // 4) enviar novamente -> deve inserir apenas os 3 novos
    const second = await enviarJogosSim(sender._id, receiver._id);
    console.log('Segundo envio - insertados:', second.inserted);

    // 5) enviar mais uma vez sem criar novos -> deve inserir 0
    const third = await enviarJogosSim(sender._id, receiver._id);
    console.log('Terceiro envio (sem novos) - insertados:', third.inserted);

    // Verificar total de recebidos
    const totalRecebidos = await JogosRecebidosModel.countDocuments({ enviadoPor: sender._id, recebidoEm: receiver._id });
    console.log('Total de jogos recebidos (deveria ser 6):', totalRecebidos);

    // Cleanup opcional: remover dados de teste (comentado por segurança)
    // await JogosRecebidosModel.deleteMany({ enviadoPor: sender._id, recebidoEm: receiver._id });
    // await JogosModel.deleteMany({ criadoPor: sender._id });
    // await LoginModel.deleteMany({ _id: { $in: [sender._id, receiver._id] } });

    await mongoose.disconnect();
    console.log('Teste concluído e desconectado');
    process.exit(0);
  } catch (err) {
    console.error('Erro no script de teste:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
