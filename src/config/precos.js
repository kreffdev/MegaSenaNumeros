// Preços das apostas por modalidade (valores aproximados em R$)
const precosModalidades = {
    megasena: {
        nome: 'Mega-Sena',
        logo: '/assets/img/logos/logo-mega.png',
        precoMinimo: 6.00
    },
    lotofacil: {
        nome: 'Lotofácil',
        logo: '/assets/img/logos/logo-lotofacil.png',
        precoMinimo: 3.50
    },
    quina: {
        nome: 'Quina',
        logo: '/assets/img/logos/logo-quina.png',
        precoMinimo: 3.00
    },
    lotomania: {
        nome: 'Lotomania',
        logo: '/assets/img/logos/logo-lotomania.png',
        precoMinimo: 3.00
    },
    duplasena: {
        nome: 'Dupla Sena',
        logo: '/assets/img/logos/logo-duplasena.png',
        precoMinimo: 3.00
    },
    diadesorte: {
        nome: 'Dia de Sorte',
        logo: '/assets/img/logos/logo-diadasorte.png',
        precoMinimo: 2.50
    },
    timemania: {
        nome: 'Timemania',
        logo: '/assets/img/logos/logo-timemania.png',
        precoMinimo: 3.50
    },
    maismilionaria: {
        nome: '+Milionária',
        logo: '/assets/img/logos/logo-maismilionaria.png',
        precoMinimo: 6.00
    },
    supersete: {
        nome: 'Super Sete',
        logo: '/assets/img/logos/logo-supersete.png',
        precoMinimo: 3.00
    },
    loteca: {
        nome: 'Loteca',
        logo: '/assets/img/logos/logo-lototeca.png',
        precoMinimo: 4.00
    }
};

// Função para obter informações de preço e modalidade
function getInfoModalidade(modalidade = 'megasena') {
    return precosModalidades[modalidade] || precosModalidades.megasena;
}

module.exports = {
    precosModalidades,
    getInfoModalidade
};
