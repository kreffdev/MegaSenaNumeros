/**
 * Teste da API de Loterias
 * Execute: node src/api/testarApiLoterias.js
 */

const ApiLoterias = require('./ApiLoterias');

async function testar() {
  console.log('=== TESTE DA API DE LOTERIAS ===\n');
  
  try {
    console.log('1. Testando Mega-Sena...');
    const megasena = await ApiLoterias.buscarModalidade('megasena');
    console.log(`   ✓ Concurso: ${megasena.numeroConcurso}`);
    console.log(`   ✓ Prêmio: R$ ${megasena.valorEstimadoProximoConcurso.toLocaleString('pt-BR')}`);
    console.log(`   ✓ Números: ${megasena.numerossorteados.join(', ')}`);
    
    console.log('\n2. Testando sincronização de todas...');
    const resultados = await ApiLoterias.sincronizarTodas();
    console.log(`   ✓ ${resultados.length} modalidades sincronizadas\n`);
    
    resultados.forEach(r => {
      console.log(`   📊 ${r.modalidade.toUpperCase()}: Concurso ${r.numeroConcurso}`);
    });
    
    console.log('\n✓ Teste concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
  }
}

testar();
