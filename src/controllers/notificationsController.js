const JogosRecebidosModel = require('../models/JogosRecebidosModel');
const LoginModel = require('../models/LoginModel');
const mongoose = require('mongoose');

exports.apiList = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: 'Não autenticado' });

    const userId = req.session.user.id;
    const user = await LoginModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const since = user.ultimoAcessoNotificacoes || new Date(0);

    // Aggregate received games grouped by envio (enviadoPor + dataEnvio)
    const agg = await JogosRecebidosModel.aggregate([
      { $match: { recebidoEm: new mongoose.Types.ObjectId(userId) } },
      { $sort: { dataEnvio: -1 } },
      { $group: {
          _id: { enviadoPor: '$enviadoPor', dataEnvio: '$dataEnvio' },
          docId: { $first: '$_id' },
          enviadoPor: { $first: '$enviadoPor' },
          dataEnvio: { $first: '$dataEnvio' }
      } },
      { $lookup: { from: 'logins', localField: 'enviadoPor', foreignField: '_id', as: 'sender' } },
      { $unwind: { path: '$sender', preserveNullAndEmptyArrays: true } },
      { $project: { id: '$docId', enviadoPor: '$enviadoPor', sender: '$sender.username', dataEnvio: '$dataEnvio' } },
      { $limit: 20 }
    ]);

    // We'll compute unreadCount after filtering out envios the user already marked as read

    // filter out envios the user already marked as read (readEnvios)
    const readEnvios = (user.readEnvios || []).map(r => ({
      enviadoPor: String(r.enviadoPor),
      dataEnvioTs: r.dataEnvio ? new Date(r.dataEnvio).getTime() : null
    }));

    const payload = agg
      .filter(n => {
        const dataTs = n.dataEnvio ? new Date(n.dataEnvio).getTime() : null;
        return !readEnvios.find(r => r.enviadoPor === String(n.enviadoPor) && r.dataEnvioTs === dataTs);
      })
      .map(n => ({
        id: n.id,
        enviadoPor: n.enviadoPor ? String(n.enviadoPor) : null,
        sender: n.sender || 'Usuário',
        dataEnvio: n.dataEnvio || new Date()
      }));

    // unreadCount is what we will show (envios not yet marked by user)
    const unreadCount = payload.length;

    return res.json({ unreadCount, notifications: payload });
  } catch (e) {
    console.error('notifications.apiList error', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
};

exports.markRead = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: 'Não autenticado' });
    const userId = req.session.user.id;
    await LoginModel.findByIdAndUpdate(userId, { ultimoAcessoNotificacoes: new Date() });
    return res.json({ ok: true });
  } catch (e) {
    console.error('notifications.markRead error', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
};

// Mark a single envio (group) as read for the current user
exports.markReadSingle = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: 'Não autenticado' });
    const userId = req.session.user.id;
    const { enviadoPor, dataEnvio } = req.body;
    if (!enviadoPor || !dataEnvio) return res.status(400).json({ error: 'Dados insuficientes' });

    const dataDate = new Date(dataEnvio);

    // convert enviadoPor to ObjectId
    const enviadoObjId = new mongoose.Types.ObjectId(enviadoPor);

    // add to readEnvios if not present (use $addToSet so identical objects aren't duplicated)
    await LoginModel.updateOne(
      { _id: userId },
      { $addToSet: { readEnvios: { enviadoPor: enviadoObjId, dataEnvio: dataDate } } }
    );

    return res.json({ ok: true });
  } catch (e) {
    console.error('notifications.markReadSingle error', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
