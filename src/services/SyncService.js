const cron = require('node-cron');
const ApiLoterias = require('../api/ApiLoterias');
const ApiLoteca = require('../api/ApiLototeca');

class SyncService {
  constructor() {
    this.tarefas = [];
  }

  /**
   * Inicia sincronização automática de todas as loterias
   */
  iniciar() {
    console.log('🚀 Serviço de sincronização de loterias iniciado');

    // Sincronizar imediatamente ao iniciar
    this.sincronizarAgora();

    // Agendar para rodar 3x por dia: 8h, 14h e 20h
    const tarefa1 = cron.schedule('0 8,14,20 * * *', async () => {
      console.log(`⏰ Sincronização programada - ${new Date().toLocaleString()}`);
      await this.sincronizarAgora();
    });

    this.tarefas.push(tarefa1);

    // Backup a cada 6 horas
    const tarefa2 = cron.schedule('0 */6 * * *', async () => {
      console.log(`⏰ Sincronização de backup - ${new Date().toLocaleString()}`);
      await this.sincronizarAgora();
    });

    this.tarefas.push(tarefa2);

    console.log('✓ Agendamento configurado: 8h, 14h e 20h + backup a cada 6h');
  }

  /**
   * Executa sincronização imediata
   */
  async sincronizarAgora() {
    try {
      console.log('🔄 Sincronizando todas as loterias...');
      
      // Sincronizar modalidades padrão
      const resultadosLoterias = await ApiLoterias.sincronizarTodas();
      
      // Sincronizar Loteca
      const resultadoLoteca = await ApiLoteca.sincronizar();
      
      console.log(`✓ Sincronização completa: ${resultadosLoterias.length} modalidades + Loteca`);
      
      return {
        loterias: resultadosLoterias,
        loteca: resultadoLoteca
      };
    } catch (error) {
      console.error('❌ Erro na sincronização:', error.message);
      return null;
    }
  }

  /**
   * Para todos os serviços de sincronização
   */
  parar() {
    this.tarefas.forEach(tarefa => tarefa.stop());
    console.log('⏸️ Serviços de sincronização parados');
  }
}

module.exports = new SyncService();
