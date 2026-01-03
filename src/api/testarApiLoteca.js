/**
 * Script de teste para a API da Loteca
 * Execute: node src/api/testarApiLoteca.js
 */

const ApiLoteca = require('./ApiLototeca');

async function testar() {
  console.log('=== TESTE DA API LOTECA ===\n');
  
  try {
    console.log('1. Testando busca do concurso atual...');
    const dados = await ApiLoteca.buscarConcursoAtual();
    
    console.log('\n📊 Dados recebidos:');
    console.log(`   Concurso: ${dados.concurso}`);
    console.log(`   Rodada: ${dados.rodada}`);
    console.log(`   Total de jogos: ${dados.jogos.length}\n`);
    
    console.log('⚽ Jogos:');
    dados.jogos.forEach(jogo => {
      console.log(`   ${jogo.numeroJogo}. ${jogo.timeCasa} × ${jogo.timeVisitante}`);
    });
    
    console.log('\n✓ Teste concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
  }
}

testar();
