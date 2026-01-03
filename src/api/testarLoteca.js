const axios = require('axios');

async function testarApiLoteca() {
  try {
    console.log('🔍 Testando API da Loteca...\n');
    
    const url = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/loteca';
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    console.log('✅ API respondeu com sucesso!\n');
    console.log('📊 Concurso:', response.data.numero);
    console.log('📅 Data Apuração:', response.data.dataApuracao);
    console.log('🎯 Próximo Concurso:', response.data.dataProximoConcurso);
    console.log('💰 Valor Estimado:', response.data.valorEstimadoProximoConcurso);
    
    console.log('\n🏆 JOGOS:');
    console.log('='.repeat(100));
    
    // Verificar estrutura dos jogos
    if (response.data.listaJogos) {
      console.log(`\n✓ Encontrados ${response.data.listaJogos.length} jogos na propriedade listaJogos:\n`);
      
      response.data.listaJogos.forEach((jogo, index) => {
        console.log(`Jogo ${index + 1}:`);
        console.log(`  Time Casa: ${jogo.timeCasa || jogo.nomeTimeCasa || 'N/A'}`);
        console.log(`  Time Visitante: ${jogo.timeVisitante || jogo.nomeTimeVisitante || 'N/A'}`);
        console.log(`  Resultado: ${jogo.resultado || jogo.coluna || 'N/A'}`);
        console.log(`  Data: ${jogo.dataHora || jogo.data || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('\n❌ Propriedade listaJogos não encontrada');
      console.log('\n📋 Estrutura do response.data:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testarApiLoteca();
