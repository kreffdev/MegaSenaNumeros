const LoginModel = require('../models/LoginModel');

exports.apiList = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: 'Não autenticado' });

    const userId = req.session.user.id;
    const user = await LoginModel.findById(userId).populate('jogosRecebidos.enviadoPor', 'username');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Agrupar jogosRecebidos por enviadoPor + dataEnvio
    const grouped = {};
    (user.jogosRecebidos || []).forEach(jr => {
      const key = `${jr.enviadoPor ? String(jr.enviadoPor._id) : 'unknown'}_${jr.dataEnvio ? new Date(jr.dataEnvio).getTime() : 0}`;
      if (!grouped[key]) {
        grouped[key] = {
          enviadoPor: jr.enviadoPor ? String(jr.enviadoPor._id) : null,
          enviadoPorUsername: jr.enviadoPor ? jr.enviadoPor.username : (jr.enviadoPorUsername || 'Usuário'),
          dataEnvio: jr.dataEnvio || new Date()
        };
      }
    });

    // Filtrar envios já marcados como lidos
    const readEnvios = (user.readEnvios || []).map(r => ({
      enviadoPor: String(r.enviadoPor),
      dataEnvioTs: r.dataEnvio ? new Date(r.dataEnvio).getTime() : null
    }));

    const payload = Object.values(grouped)
      .filter(n => {
        const dataTs = n.dataEnvio ? new Date(n.dataEnvio).getTime() : null;
        return !readEnvios.find(r => r.enviadoPor === String(n.enviadoPor) && r.dataEnvioTs === dataTs);
      })
      .sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio))
      .slice(0, 20)
      .map((n, idx) => ({
        id: `notif_${idx}`,
        enviadoPor: n.enviadoPor,
        sender: n.enviadoPorUsername,
        dataEnvio: n.dataEnvio
      }));

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
