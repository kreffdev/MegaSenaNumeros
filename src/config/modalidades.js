// Configurações de todas as modalidades de loteria
const modalidadesConfig = {
    megasena: {
        nome: 'Mega-Sena',
        min: 6,
        max: 15,
        rangeInicio: 1,
        rangeFim: 60,
        numerosObrigatorios: 6
    },
    lotofacil: {
        nome: 'Lotofácil',
        min: 15,
        max: 20,
        rangeInicio: 1,
        rangeFim: 25,
        numerosObrigatorios: 15
    },
    quina: {
        nome: 'Quina',
        min: 5,
        max: 15,
        rangeInicio: 1,
        rangeFim: 80,
        numerosObrigatorios: 5
    },
    lotomania: {
        nome: 'Lotomania',
        min: 50,
        max: 50,
        rangeInicio: 0,
        rangeFim: 99,
        numerosObrigatorios: 50
    },
    duplasena: {
        nome: 'Dupla Sena',
        min: 6,
        max: 15,
        rangeInicio: 1,
        rangeFim: 50,
        numerosObrigatorios: 6,
        doisSorteios: true
    },
    diadesorte: {
        nome: 'Dia de Sorte',
        min: 7,
        max: 15,
        rangeInicio: 1,
        rangeFim: 31,
        numerosObrigatorios: 7,
        temMesDaSorte: true
    },
    timemania: {
        nome: 'Timemania',
        min: 10,
        max: 10,
        rangeInicio: 1,
        rangeFim: 80,
        numerosObrigatorios: 10,
        temTimeCoracao: true
    },
    maismilionaria: {
        nome: '+Milionária',
        min: 8,
        max: 14,
        rangeInicio: 1,
        rangeFim: 50,
        numerosObrigatorios: 6,
        temTrevos: true,
        trevosMin: 2,
        trevosMax: 2,
        trevosRangeInicio: 1,
        trevosRangeFim: 6
    },
    supersete: {
        nome: 'Super Sete',
        min: 7,
        max: 7,
        rangeInicio: 0,
        rangeFim: 9,
        numerosObrigatorios: 7,
        colunas: true
    },
    loteca: {
        nome: 'Loteca',
        min: 14,
        max: 14,
        rangeInicio: 1,
        rangeFim: 3,
        numerosObrigatorios: 14,
        palpites: true
    }
};

// Validar números baseado na modalidade
function validarNumerosPorModalidade(numeros, modalidade = 'megasena') {
    const config = modalidadesConfig[modalidade];
    
    if (!config) {
        return { valido: false, mensagem: `Modalidade "${modalidade}" não encontrada` };
    }
    
    if (!Array.isArray(numeros)) {
        return { valido: false, mensagem: 'Os números devem ser um array' };
    }
    
    // Validar quantidade
    if (numeros.length < config.min || numeros.length > config.max) {
        return { 
            valido: false, 
            mensagem: `${config.nome} requer entre ${config.min} e ${config.max} números` 
        };
    }
    
    // Validar range
    if (!numeros.every(n => Number.isInteger(n) && n >= config.rangeInicio && n <= config.rangeFim)) {
        return { 
            valido: false, 
            mensagem: `Todos os números devem estar entre ${config.rangeInicio} e ${config.rangeFim}` 
        };
    }
    
    // Para +Milionária, validar números principais e trevos separadamente
    if (modalidade === 'maismilionaria') {
        // Deve ter entre 6-12 números principais + 2 trevos = 8-14 total
        if (numeros.length < 8 || numeros.length > 14) {
            return {
                valido: false,
                mensagem: '+Milionária requer 6 a 12 números principais + 2 trevos (8 a 14 total)'
            };
        }
        
        // Os 2 últimos números são os trevos
        const numerosPrincipais = numeros.slice(0, -2);
        const trevos = numeros.slice(-2);
        
        // Validar números principais (6-12 números entre 1-50)
        if (numerosPrincipais.length < 6 || numerosPrincipais.length > 12) {
            return {
                valido: false,
                mensagem: '+Milionária requer entre 6 e 12 números principais'
            };
        }
        
        if (!numerosPrincipais.every(n => Number.isInteger(n) && n >= 1 && n <= 50)) {
            return {
                valido: false,
                mensagem: 'Números principais devem estar entre 1 e 50'
            };
        }
        
        if (new Set(numerosPrincipais).size !== numerosPrincipais.length) {
            return {
                valido: false,
                mensagem: 'Os números principais devem ser únicos'
            };
        }
        
        // Validar trevos (exatamente 2 números entre 1-6)
        if (trevos.length !== 2) {
            return {
                valido: false,
                mensagem: '+Milionária requer exatamente 2 trevos'
            };
        }
        
        if (!trevos.every(n => Number.isInteger(n) && n >= 1 && n <= 6)) {
            return {
                valido: false,
                mensagem: 'Trevos devem estar entre 1 e 6'
            };
        }
        
        if (new Set(trevos).size !== 2) {
            return {
                valido: false,
                mensagem: 'Os 2 trevos devem ser diferentes'
            };
        }
        
        return { valido: true };
    }
    
    // Para Dupla Sena, permitir repetição (2 séries de 6)
    if (modalidade === 'duplasena') {
        if (numeros.length !== 12) {
            return {
                valido: false,
                mensagem: 'Dupla Sena requer exatamente 12 números (duas séries de 6)'
            };
        }
        // Não validar unicidade global, apenas dentro de cada série de 6
        const serie1 = numeros.slice(0, 6);
        const serie2 = numeros.slice(6, 12);
        if (new Set(serie1).size !== 6 || new Set(serie2).size !== 6) {
            return {
                valido: false,
                mensagem: 'Cada série da Dupla Sena deve ter 6 números únicos'
            };
        }
    } else if (modalidade !== 'supersete' && modalidade !== 'loteca' && modalidade !== 'maismilionaria') {
        // Para outras modalidades (exceto Super Sete e Loteca), validar unicidade
        if (new Set(numeros).size !== numeros.length) {
            return { 
                valido: false, 
                mensagem: 'Todos os números devem ser únicos' 
            };
        }
    }
    
    return { valido: true };
}

module.exports = {
    modalidadesConfig,
    validarNumerosPorModalidade
};
