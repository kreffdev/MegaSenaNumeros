/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*******************************************!*\
  !*** ./public/assets/js/selectNumbers.js ***!
  \*******************************************/


function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) { n[e] = r[e]; } return n; }
// Função principal de seleção de números
function initSelectNumbers() {
  // Função para registrar sequências no backend
  var registrarSequenciasBackend = function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var config, modalidadeAtual, sequenciasParaEnviar, ehMaisMilionaria, sequenciasItems, response, data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              btnRegistrar.disabled = true;
              btnRegistrar.textContent = '💾 Registrando...';
              _context.prev = 2;
              // Obter modalidade atual
              config = window.getConfigAtual ? window.getConfigAtual() : {
                modalidade: 'megasena'
              };
              modalidadeAtual = config.modalidade || 'megasena';
              console.log('registrarSequenciasBackend - modalidade:', modalidadeAtual);
              console.log('registrarSequenciasBackend - sequenciasConfirmadas:', sequenciasConfirmadas);

              // Preparar sequências incluindo trevos para +Milionária
              sequenciasParaEnviar = [];
              ehMaisMilionaria = modalidadeAtual === 'maismilionaria'; // Obter elementos do DOM para extrair dados extras
              sequenciasItems = document.querySelectorAll('.meus-numeros-preview .sequencia-item');
              console.log('Itens de sequência encontrados:', sequenciasItems.length);
              sequenciasItems.forEach(function (item, index) {
                var numerosSeq = sequenciasConfirmadas[index];
                if (!numerosSeq) return;
                var sequenciaData = {
                  numeros: numerosSeq
                };

                // Para +Milionária, adicionar trevos
                if (ehMaisMilionaria) {
                  var trevosStr = item.dataset.trevos;
                  console.log("Sequ\xEAncia " + index + ":", {
                    numerosSeq: numerosSeq,
                    trevosStr: trevosStr
                  });
                  if (trevosStr) {
                    try {
                      var trevos = JSON.parse(trevosStr).map(function (t) {
                        return parseInt(t);
                      });
                      sequenciaData.numeros = [].concat(_toConsumableArray(numerosSeq), _toConsumableArray(trevos));
                      console.log("N\xFAmeros completos com trevos:", sequenciaData.numeros);
                    } catch (e) {
                      console.error('Erro ao processar trevos:', e);
                    }
                  }
                }

                // Para Dia de Sorte, adicionar mês da sorte
                if (modalidadeAtual === 'diadesorte' && item.dataset.mesSorte) {
                  sequenciaData.mesDaSorte = item.dataset.mesSorte;
                  console.log("M\xEAs da Sorte adicionado:", sequenciaData.mesDaSorte);
                }

                // Para Timemania, adicionar time do coração
                if (modalidadeAtual === 'timemania' && item.dataset.timeCoracao) {
                  sequenciaData.timeCoracao = item.dataset.timeCoracao;
                  console.log("Time do Cora\xE7\xE3o adicionado:", sequenciaData.timeCoracao);
                }
                sequenciasParaEnviar.push(sequenciaData);
              });
              console.log('sequenciasParaEnviar:', sequenciasParaEnviar);
              if (!(sequenciasParaEnviar.length === 0)) {
                _context.next = 18;
                break;
              }
              alert('❌ Nenhuma sequência válida encontrada. Por favor, crie pelo menos uma sequência.');
              btnRegistrar.disabled = false;
              btnRegistrar.textContent = '💾 Registrar Sequências';
              return _context.abrupt("return");
            case 18:
              _context.next = 20;
              return fetch('/api/jogos/salvar-multiplas', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  sequencias: sequenciasParaEnviar,
                  modalidade: modalidadeAtual
                })
              });
            case 20:
              response = _context.sent;
              _context.next = 23;
              return response.json();
            case 23:
              data = _context.sent;
              if (data.sucesso) {
                alert("\u2713 " + data.mensagem);
                // Limpar sequências confirmadas
                sequenciasConfirmadas = [];
                // Limpar preview
                previewDiv.querySelectorAll('.sequencia-item').forEach(function (item) {
                  return item.remove();
                });
                atualizarContagem();
                btnRegistrar.style.display = 'none';
              } else {
                alert("\u2717 Erro: " + data.mensagem);
              }
              _context.next = 31;
              break;
            case 27:
              _context.prev = 27;
              _context.t0 = _context["catch"](2);
              console.error('Erro ao registrar sequências:', _context.t0);
              alert('Erro ao registrar sequências. Verifique o console.');
            case 31:
              _context.prev = 31;
              btnRegistrar.disabled = false;
              btnRegistrar.textContent = '💾 Registrar Sequências';
              return _context.finish(31);
            case 35:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[2, 27, 31, 35]]);
    }));
    return function registrarSequenciasBackend() {
      return _ref.apply(this, arguments);
    };
  }(); // Event listener para o botão registrar
  var container = document.querySelector('.numeros-criador ul');
  var escolhidosLista = document.querySelector('.escolhidos-lista');
  var previewDiv = document.querySelector('.meus-numeros-preview');
  var btnGerar = document.getElementById('btn-gerar-aleatorio');
  var btnRegistrar = document.getElementById('btn-registrar-sequencias');
  if (!container || !escolhidosLista || !previewDiv) return;

  // Garantir que os botões de número estejam habilitados ao iniciar
  container.querySelectorAll('button').forEach(function (b) {
    b.disabled = false;
    b.style.pointerEvents = 'auto';
  });

  // Ativar debug para verificação rápida no console
  var DEBUG_SELECT_NUMBERS = true;
  var sequenciasConfirmadas = []; // Armazena sequências confirmadas localmente
  var duplaSenaPrimeiraSerie = []; // Armazena primeira série de 6 números da Dupla Sena

  // Inicializar seleção de trevos (+Milionária)
  var trevosContainer = document.getElementById('trevos-container');
  if (trevosContainer) {
    var trevosBtns = trevosContainer.querySelectorAll('.trevo-btn');
    trevosBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var selectedTrevos = trevosContainer.querySelectorAll('.trevo-btn.selected');
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
          // Reabilitar todos os trevos quando desmarcar
          trevosBtns.forEach(function (b) {
            return b.disabled = false;
          });
        } else if (selectedTrevos.length < 2) {
          btn.classList.add('selected');
          // Se atingiu o limite de 2, desabilitar os não selecionados
          if (selectedTrevos.length + 1 >= 2) {
            trevosBtns.forEach(function (b) {
              if (!b.classList.contains('selected')) {
                b.disabled = true;
              }
            });
          }
        }
        updateEscolhidos();
        updateConfirmButton(); // Atualizar botão de confirmação quando trevos mudarem
      });
    });
  }

  // Função para obter o número máximo de seleções baseado na modalidade
  function getMaxSelections() {
    if (window.getConfigAtual) {
      return window.getConfigAtual().numerosObrigatorios;
    }
    return 6; // Fallback para Mega-Sena
  }

  // Função para gerar números aleatórios
  function gerarAleatorios() {
    var config = window.getConfigAtual ? window.getConfigAtual() : {
      rangeInicio: 1,
      rangeFim: 60
    };
    var MAX_SELECTIONS = getMaxSelections();
    var numeros = new Set();
    while (numeros.size < MAX_SELECTIONS) {
      numeros.add(Math.floor(Math.random() * (config.rangeFim - config.rangeInicio + 1)) + config.rangeInicio);
    }
    return Array.from(numeros).sort(function (a, b) {
      return a - b;
    });
  }

  // Função para selecionar números programaticamente
  function selecionarNumeros(numeros) {
    // Limpar seleção anterior
    container.querySelectorAll('button.selected').forEach(function (btn) {
      btn.classList.remove('selected');
    });

    // Selecionar os novos números
    container.querySelectorAll('button').forEach(function (btn) {
      if (numeros.includes(parseInt(btn.textContent))) {
        btn.classList.add('selected');
      }
      btn.disabled = false;
    });

    // Desabilitar botões não selecionados
    container.querySelectorAll('button').forEach(function (b) {
      if (!b.classList.contains('selected')) b.disabled = true;
    });
    updateEscolhidos();
  }

  // Função para atualizar a contagem de sequências
  function atualizarContagem() {
    var contagem = previewDiv.querySelectorAll('.sequencia-item').length;
    var contagemSpan = document.querySelector('.contagem-sequencias');
    if (contagemSpan) {
      contagemSpan.textContent = contagem;
    }

    // Mostrar botão registrar se houver sequências confirmadas
    if (btnRegistrar) {
      if (contagem > 0) {
        btnRegistrar.style.display = 'block';
      } else {
        btnRegistrar.style.display = 'none';
      }
    }
  }

  // Função para atualizar a lista de números escolhidos
  function updateEscolhidos() {
    var selectedButtons = container.querySelectorAll('button.selected');
    var selectedNumbers = Array.from(selectedButtons).map(function (btn) {
      return btn.textContent;
    }).sort(function (a, b) {
      return parseInt(a) - parseInt(b);
    });

    // Limpar completamente a lista
    escolhidosLista.innerHTML = '';

    // Verificar modalidade
    var config = window.getConfigAtual ? window.getConfigAtual() : {};
    var ehDuplaSena = config.doisSorteios === true;
    var ehDiaDeSorte = config.temMesDaSorte === true;
    if (ehDuplaSena) {
      // Se tem primeira série armazenada, mostrar ela primeiro
      if (duplaSenaPrimeiraSerie.length === 6) {
        // Mostrar primeira série
        duplaSenaPrimeiraSerie.forEach(function (numero) {
          var item = document.createElement('div');
          item.className = 'escolhido-numero';
          item.textContent = numero;
          item.style.opacity = '0.6'; // Levemente transparente para indicar que já foi salva
          escolhidosLista.appendChild(item);
        });

        // Separador entre os dois sorteios
        var separador = document.createElement('span');
        separador.className = 'separador-escolhidos';
        separador.textContent = '|';
        separador.style.color = '#8B5CF6';
        separador.style.fontSize = '2rem';
        separador.style.fontWeight = 'bold';
        separador.style.margin = '0 0.5rem';
        escolhidosLista.appendChild(separador);

        // Mostrar segunda série (seleção atual)
        selectedNumbers.forEach(function (numero) {
          var item = document.createElement('div');
          item.className = 'escolhido-numero';
          item.textContent = numero;
          var btn = Array.from(selectedButtons).find(function (b) {
            return b.textContent === numero;
          });
          if (btn) {
            item.addEventListener('click', function () {
              btn.click();
            });
          }
          escolhidosLista.appendChild(item);
        });
      } else {
        // Ainda na primeira série
        selectedNumbers.forEach(function (numero) {
          var item = document.createElement('div');
          item.className = 'escolhido-numero';
          item.textContent = numero;
          var btn = Array.from(selectedButtons).find(function (b) {
            return b.textContent === numero;
          });
          if (btn) {
            item.addEventListener('click', function () {
              btn.click();
            });
          }
          escolhidosLista.appendChild(item);
        });

        // Se completou 6 da primeira série, armazenar e desmarcar
        if (selectedNumbers.length === 6) {
          duplaSenaPrimeiraSerie = [].concat(_toConsumableArray(selectedNumbers));

          // Aguardar um pouco e então desmarcar para segunda série
          setTimeout(function () {
            container.querySelectorAll('button.selected').forEach(function (btn) {
              btn.classList.remove('selected');
              btn.disabled = false;
            });
            container.querySelectorAll('button').forEach(function (b) {
              b.disabled = false;
            });
            updateEscolhidos(); // Atualizar para mostrar o separador
          }, 500);

          // Não retornar aqui para permitir que o restante da função execute
        }
      }
    } else {
      // Outras modalidades: exibir normalmente em ordem crescente
      selectedNumbers.forEach(function (numero) {
        var item = document.createElement('div');
        item.className = 'escolhido-numero';
        item.textContent = numero;
        var btn = Array.from(selectedButtons).find(function (b) {
          return b.textContent === numero;
        });
        if (btn) {
          item.addEventListener('click', function () {
            btn.click();
          });
        }
        escolhidosLista.appendChild(item);
      });

      // Adicionar Mês da Sorte se for Dia de Sorte
      if (ehDiaDeSorte && selectedNumbers.length > 0) {
        var _mesSorteSelect = document.getElementById('mes-sorte');
        var mesSelecionado = _mesSorteSelect ? _mesSorteSelect.value : '';
        var mesTexto = _mesSorteSelect && mesSelecionado ? _mesSorteSelect.options[_mesSorteSelect.selectedIndex].text : '';
        if (mesTexto) {
          // Separador entre números e mês
          var _separador = document.createElement('span');
          _separador.className = 'separador-mes-sorte';
          _separador.textContent = '|';
          _separador.style.color = '#CB852B';
          _separador.style.fontSize = '2rem';
          _separador.style.fontWeight = 'bold';
          _separador.style.margin = '0 0.5rem';
          escolhidosLista.appendChild(_separador);

          // Mês da Sorte
          var mesSorteItem = document.createElement('div');
          mesSorteItem.className = 'escolhido-mes-sorte';
          mesSorteItem.textContent = "\uD83C\uDF1F " + mesTexto;
          mesSorteItem.style.color = '#CB852B';
          mesSorteItem.style.fontWeight = 'bold';
          mesSorteItem.style.fontSize = '1.1rem';
          mesSorteItem.style.display = 'flex';
          mesSorteItem.style.alignItems = 'center';
          mesSorteItem.style.padding = '0.5rem 1rem';
          mesSorteItem.style.background = 'rgba(203, 133, 43, 0.1)';
          mesSorteItem.style.borderRadius = '0.5rem';
          escolhidosLista.appendChild(mesSorteItem);
        }
      }

      // Adicionar Time do Coração se for Timemania
      var ehTimemania = config.temTimeCoracao === true;
      if (ehTimemania && selectedNumbers.length > 0) {
        var _timeCoracaoSelect = document.getElementById('time-coracao');
        var timeSelecionado = _timeCoracaoSelect ? _timeCoracaoSelect.value : '';
        var timeTexto = _timeCoracaoSelect && timeSelecionado ? _timeCoracaoSelect.options[_timeCoracaoSelect.selectedIndex].text : '';
        if (timeTexto) {
          // Separador entre números e time
          var _separador2 = document.createElement('span');
          _separador2.className = 'separador-time-coracao';
          _separador2.textContent = '|';
          _separador2.style.color = '#00FF48';
          _separador2.style.fontSize = '2rem';
          _separador2.style.fontWeight = 'bold';
          _separador2.style.margin = '0 0.5rem';
          escolhidosLista.appendChild(_separador2);

          // Time do Coração
          var timeCoracaoItem = document.createElement('div');
          timeCoracaoItem.className = 'escolhido-time-coracao';
          timeCoracaoItem.textContent = "\u26BD " + timeTexto;
          timeCoracaoItem.style.color = '#00FF48';
          timeCoracaoItem.style.fontWeight = 'bold';
          timeCoracaoItem.style.fontSize = '1.1rem';
          timeCoracaoItem.style.display = 'flex';
          timeCoracaoItem.style.alignItems = 'center';
          timeCoracaoItem.style.padding = '0.5rem 1rem';
          timeCoracaoItem.style.background = 'rgba(0, 255, 72, 0.1)';
          timeCoracaoItem.style.borderRadius = '0.5rem';
          escolhidosLista.appendChild(timeCoracaoItem);
        }
      }

      // Adicionar Trevos se for +Milionária
      var ehMaisMilionaria = config.temTrevos === true;
      if (ehMaisMilionaria && selectedNumbers.length > 0) {
        var _trevosContainer = document.getElementById('trevos-container');
        var trevosSelecionados = _trevosContainer ? Array.from(_trevosContainer.querySelectorAll('.trevo-btn.selected')).map(function (btn) {
          return btn.dataset.trevo;
        }) : [];
        if (trevosSelecionados.length > 0) {
          // Separador entre números e trevos
          var _separador3 = document.createElement('span');
          _separador3.className = 'separador-trevos';
          _separador3.textContent = '|';
          _separador3.style.color = '#16397F';
          _separador3.style.fontSize = '2rem';
          _separador3.style.fontWeight = 'bold';
          _separador3.style.margin = '0 0.5rem';
          escolhidosLista.appendChild(_separador3);

          // Trevos
          trevosSelecionados.forEach(function (trevo) {
            var trevoItem = document.createElement('div');
            trevoItem.className = 'escolhido-numero';
            trevoItem.textContent = trevo;
            escolhidosLista.appendChild(trevoItem);
          });
        }
      }
    }

    // Mostra botão de confirmação se houver números selecionados
    updateConfirmButton();

    // Esconde instruções quando começar a selecionar
    if (selectedButtons.length > 0 && window.esconderInstrucoes) {
      window.esconderInstrucoes();
    }
  }

  // Função para atualizar visibilidade do botão de confirmação
  function updateConfirmButton() {
    var selectedCount = container.querySelectorAll('button.selected').length;
    var config = window.getConfigAtual ? window.getConfigAtual() : {};
    var ehDuplaSena = config.doisSorteios === true;
    var ehMaisMilionaria = config.temTrevos === true;
    var MAX_SELECTIONS = getMaxSelections();
    var confirmBtn = document.getElementById('btn-confirmar-numeros');

    // Para Dupla Sena, só mostrar botão quando completar a segunda série
    if (ehDuplaSena) {
      if (duplaSenaPrimeiraSerie.length === 6 && selectedCount === 6 && !confirmBtn) {
        // Criar botão de confirmação
        confirmBtn = document.createElement('button');
        confirmBtn.id = 'btn-confirmar-numeros';
        confirmBtn.className = 'btn-confirmar';
        confirmBtn.textContent = 'Confirmar Sequência (2 Sorteios)';
        confirmBtn.addEventListener('click', confirmarSequencia);
        escolhidosLista.parentElement.appendChild(confirmBtn);

        // Scroll automático para o botão
        setTimeout(function () {
          confirmBtn.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else if ((duplaSenaPrimeiraSerie.length !== 6 || selectedCount !== 6) && confirmBtn) {
        // Remover botão se não completou
        confirmBtn.remove();
      }
    } else if (ehMaisMilionaria) {
      // Para +Milionária, verificar se tem números E trevos selecionados
      var _trevosContainer2 = document.getElementById('trevos-container');
      var trevosSelecionados = _trevosContainer2 ? _trevosContainer2.querySelectorAll('.trevo-btn.selected').length : 0;
      var podeConfirmar = selectedCount >= MAX_SELECTIONS && trevosSelecionados === 2;
      if (podeConfirmar && !confirmBtn) {
        // Criar botão de confirmação
        confirmBtn = document.createElement('button');
        confirmBtn.id = 'btn-confirmar-numeros';
        confirmBtn.className = 'btn-confirmar';
        confirmBtn.textContent = 'Confirmar Sequência';
        confirmBtn.addEventListener('click', confirmarSequencia);
        escolhidosLista.parentElement.appendChild(confirmBtn);

        // Scroll automático para o botão
        setTimeout(function () {
          confirmBtn.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else if (!podeConfirmar && confirmBtn) {
        // Remover botão se não completou números e trevos
        confirmBtn.remove();
      }
    } else {
      // Outras modalidades: comportamento normal
      if (selectedCount === MAX_SELECTIONS && !confirmBtn) {
        // Criar botão de confirmação
        confirmBtn = document.createElement('button');
        confirmBtn.id = 'btn-confirmar-numeros';
        confirmBtn.className = 'btn-confirmar';
        confirmBtn.textContent = 'Confirmar Sequência';
        confirmBtn.addEventListener('click', confirmarSequencia);
        escolhidosLista.parentElement.appendChild(confirmBtn);

        // Scroll automático para o botão
        setTimeout(function () {
          confirmBtn.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else if (selectedCount < MAX_SELECTIONS && confirmBtn) {
        // Remover botão se não tiver 6
        confirmBtn.remove();
      }
    }
  }

  // Função para confirmar e guardar a sequência
  function confirmarSequencia() {
    var config = window.getConfigAtual ? window.getConfigAtual() : {};
    var ehDuplaSena = config.doisSorteios === true;
    var ehMaisMilionaria = config.temTrevos === true;
    console.log('confirmarSequencia chamada', {
      config: config,
      ehMaisMilionaria: ehMaisMilionaria
    });
    var selectedNumbers = void 0;

    // Para Dupla Sena, combinar primeira série + segunda série
    if (ehDuplaSena && duplaSenaPrimeiraSerie.length === 6) {
      var segundaSerie = Array.from(container.querySelectorAll('button.selected')).map(function (btn) {
        return btn.textContent;
      }).sort(function (a, b) {
        return parseInt(a) - parseInt(b);
      });
      selectedNumbers = [].concat(_toConsumableArray(duplaSenaPrimeiraSerie), _toConsumableArray(segundaSerie));
    } else {
      selectedNumbers = Array.from(container.querySelectorAll('button.selected')).map(function (btn) {
        return btn.textContent;
      }).sort(function (a, b) {
        return parseInt(a) - parseInt(b);
      });
    }
    console.log('Números selecionados:', selectedNumbers);

    // Para +Milionária, verificar se tem trevos selecionados
    if (ehMaisMilionaria) {
      var _trevosContainer3 = document.getElementById('trevos-container');
      var trevosSelecionados = _trevosContainer3 ? Array.from(_trevosContainer3.querySelectorAll('.trevo-btn.selected')).map(function (btn) {
        return btn.dataset.trevo;
      }) : [];
      console.log('Trevos selecionados:', trevosSelecionados);
      console.log('Quantidade de trevos:', trevosSelecionados.length);

      // Removi a validação aqui porque ela impede a criação do preview
      // A validação será feita no backend
    }

    // Armazenar localmente
    sequenciasConfirmadas.push(selectedNumbers.map(function (n) {
      return parseInt(n);
    }));
    console.log('sequenciasConfirmadas após push:', sequenciasConfirmadas);

    // Referência para os elementos fixos (label e contagem)
    var labelContagem = previewDiv.querySelector('.label-contagem');

    // Criar elemento para exibir a sequência salva
    var sequenciaItem = document.createElement('div');
    sequenciaItem.className = 'sequencia-item';
    sequenciaItem.dataset.numeros = JSON.stringify(selectedNumbers.map(function (n) {
      return parseInt(n);
    }));

    // Criar display dos números
    var numerosDisplay = document.createElement('div');
    numerosDisplay.className = 'sequencia-numeros';
    var ehDiaDeSorte = config.temMesDaSorte === true;
    if (ehDuplaSena && selectedNumbers.length === 12) {
      // Primeiro grupo de 6 números
      for (var i = 0; i < 6; i++) {
        var numSpan = document.createElement('span');
        numSpan.className = 'numero-sequencia';
        numSpan.textContent = selectedNumbers[i];
        numerosDisplay.appendChild(numSpan);
      }

      // Separador entre os dois sorteios
      var separadorSorteios = document.createElement('span');
      separadorSorteios.className = 'separador-sorteios';
      separadorSorteios.textContent = '|';
      separadorSorteios.style.color = '#8B5CF6';
      separadorSorteios.style.fontSize = '2rem';
      separadorSorteios.style.fontWeight = 'bold';
      separadorSorteios.style.margin = '0 0.75rem';
      numerosDisplay.appendChild(separadorSorteios);

      // Segundo grupo de 6 números
      for (var _i = 6; _i < 12; _i++) {
        var _numSpan = document.createElement('span');
        _numSpan.className = 'numero-sequencia';
        _numSpan.textContent = selectedNumbers[_i];
        numerosDisplay.appendChild(_numSpan);
      }
    } else {
      // Outras modalidades: exibir normalmente
      selectedNumbers.forEach(function (num) {
        var numSpan = document.createElement('span');
        numSpan.className = 'numero-sequencia';
        numSpan.textContent = num;
        numerosDisplay.appendChild(numSpan);
      });

      // Adicionar Mês da Sorte se for Dia de Sorte
      if (ehDiaDeSorte) {
        var _mesSorteSelect2 = document.getElementById('mes-sorte');
        var mesSelecionado = _mesSorteSelect2 ? _mesSorteSelect2.value : '';
        var mesTexto = _mesSorteSelect2 && mesSelecionado ? _mesSorteSelect2.options[_mesSorteSelect2.selectedIndex].text : '';
        if (mesTexto) {
          // Separador entre números e mês
          var separadorMes = document.createElement('span');
          separadorMes.className = 'separador-mes-sorte';
          separadorMes.textContent = '|';
          separadorMes.style.color = '#CB852B';
          separadorMes.style.fontSize = '2rem';
          separadorMes.style.fontWeight = 'bold';
          separadorMes.style.margin = '0 0.75rem';
          numerosDisplay.appendChild(separadorMes);

          // Mês da Sorte
          var mesSorteSpan = document.createElement('span');
          mesSorteSpan.className = 'mes-sorte-preview';
          mesSorteSpan.textContent = "\uD83C\uDF1F " + mesTexto;
          mesSorteSpan.style.color = '#CB852B';
          mesSorteSpan.style.fontWeight = 'bold';
          mesSorteSpan.style.fontSize = '1rem';
          mesSorteSpan.style.padding = '0.5rem 1rem';
          mesSorteSpan.style.background = 'rgba(203, 133, 43, 0.15)';
          mesSorteSpan.style.borderRadius = '2rem';
          mesSorteSpan.style.whiteSpace = 'nowrap';
          numerosDisplay.appendChild(mesSorteSpan);

          // Armazenar o TEXTO do mês junto com a sequência (não o value)
          sequenciaItem.dataset.mesSorte = mesTexto;
        }
      }

      // Adicionar Time do Coração se for Timemania
      var ehTimemania = config.temTimeCoracao === true;
      if (ehTimemania) {
        var _timeCoracaoSelect2 = document.getElementById('time-coracao');
        var timeSelecionado = _timeCoracaoSelect2 ? _timeCoracaoSelect2.value : '';
        var timeTexto = _timeCoracaoSelect2 && timeSelecionado ? _timeCoracaoSelect2.options[_timeCoracaoSelect2.selectedIndex].text : '';
        if (timeTexto) {
          // Separador entre números e time
          var separadorTime = document.createElement('span');
          separadorTime.className = 'separador-time-coracao';
          separadorTime.textContent = '|';
          separadorTime.style.color = '#00FF48';
          separadorTime.style.fontSize = '2rem';
          separadorTime.style.fontWeight = 'bold';
          separadorTime.style.margin = '0 0.75rem';
          numerosDisplay.appendChild(separadorTime);

          // Time do Coração
          var timeCoracaoSpan = document.createElement('span');
          timeCoracaoSpan.className = 'time-coracao-preview';
          timeCoracaoSpan.textContent = "\u26BD " + timeTexto;
          timeCoracaoSpan.style.color = '#00FF48';
          timeCoracaoSpan.style.fontWeight = 'bold';
          timeCoracaoSpan.style.fontSize = '1rem';
          timeCoracaoSpan.style.padding = '0.5rem 1rem';
          timeCoracaoSpan.style.background = 'rgba(0, 255, 72, 0.15)';
          timeCoracaoSpan.style.borderRadius = '2rem';
          timeCoracaoSpan.style.whiteSpace = 'nowrap';
          numerosDisplay.appendChild(timeCoracaoSpan);

          // Armazenar o TEXTO do time junto com a sequência (não o value)
          sequenciaItem.dataset.timeCoracao = timeTexto;
        }
      }

      // Adicionar Trevos se for +Milionária
      var _ehMaisMilionaria = config.temTrevos === true;
      if (_ehMaisMilionaria) {
        var _trevosContainer4 = document.getElementById('trevos-container');
        var _trevosSelecionados = _trevosContainer4 ? Array.from(_trevosContainer4.querySelectorAll('.trevo-btn.selected')).map(function (btn) {
          return btn.dataset.trevo;
        }) : [];
        if (_trevosSelecionados.length > 0) {
          // Separador entre números e trevos
          var separadorTrevos = document.createElement('span');
          separadorTrevos.className = 'separador-trevos';
          separadorTrevos.textContent = '|';
          separadorTrevos.style.color = '#16397F';
          separadorTrevos.style.fontSize = '2rem';
          separadorTrevos.style.fontWeight = 'bold';
          separadorTrevos.style.margin = '0 0.75rem';
          numerosDisplay.appendChild(separadorTrevos);

          // Trevos
          _trevosSelecionados.forEach(function (trevo) {
            var trevoSpan = document.createElement('span');
            trevoSpan.className = 'numero-sequencia';
            trevoSpan.textContent = trevo;
            numerosDisplay.appendChild(trevoSpan);
          });

          // Armazenar os trevos junto com a sequência
          sequenciaItem.dataset.trevos = JSON.stringify(_trevosSelecionados);
        }
      }
    }

    // Botão para remover sequência
    var btnRemover = document.createElement('button');
    btnRemover.className = 'btn-remover-sequencia';
    btnRemover.textContent = '✕';
    btnRemover.addEventListener('click', function () {
      var numerosStr = sequenciaItem.dataset.numeros;
      var index = sequenciasConfirmadas.findIndex(function (seq) {
        return JSON.stringify(seq) === numerosStr;
      });
      if (index > -1) {
        sequenciasConfirmadas.splice(index, 1);
      }
      sequenciaItem.remove();
      atualizarContagem();
    });
    sequenciaItem.appendChild(numerosDisplay);
    sequenciaItem.appendChild(btnRemover);
    console.log('Inserindo sequenciaItem no DOM', {
      previewDiv: previewDiv,
      labelContagem: labelContagem,
      sequenciaItem: sequenciaItem
    });
    console.log('sequenciaItem.dataset.trevos antes de inserir:', sequenciaItem.dataset.trevos);

    // Inserir antes dos elementos fixos
    if (labelContagem) {
      previewDiv.insertBefore(sequenciaItem, labelContagem);
    } else {
      previewDiv.appendChild(sequenciaItem);
    }
    console.log('Elemento inserido! Verificando quantos .sequencia-item existem:', previewDiv.querySelectorAll('.sequencia-item').length);
    atualizarContagem();

    // Limpar seleção e reiniciar
    container.querySelectorAll('button.selected').forEach(function (btn) {
      btn.classList.remove('selected');
    });
    container.querySelectorAll('button').forEach(function (b) {
      return b.disabled = false;
    });

    // Limpar primeira série da Dupla Sena
    duplaSenaPrimeiraSerie = [];

    // Limpar trevos selecionados
    if (trevosContainer) {
      trevosContainer.querySelectorAll('.trevo-btn.selected').forEach(function (btn) {
        btn.classList.remove('selected');
      });
      trevosContainer.querySelectorAll('.trevo-btn').forEach(function (btn) {
        btn.disabled = false;
      });
    }

    // Limpar lista de escolhidos
    escolhidosLista.innerHTML = '';
    updateConfirmButton();
  }
  if (btnRegistrar) {
    btnRegistrar.addEventListener('click', registrarSequenciasBackend);
  }

  // Evento do botão gerar aleatório
  if (btnGerar) {
    btnGerar.addEventListener('click', function () {
      console.log('Botão aleatório clicado!');

      // Gerar números aleatórios baseado na modalidade
      var config = window.getConfigAtual ? window.getConfigAtual() : {
        rangeInicio: 1,
        rangeFim: 60,
        numerosObrigatorios: 6
      };
      var ehDuplaSena = config.doisSorteios === true;
      var qtdNumeros = parseInt(config.numerosObrigatorios) || 6;
      console.log('Config atual:', config);
      console.log('Quantidade de números a gerar:', qtdNumeros);
      console.log('Range:', config.rangeInicio, 'até', config.rangeFim);
      console.log('É Dupla Sena?', ehDuplaSena);
      if (ehDuplaSena) {
        // Para Dupla Sena: gerar 2 séries de 6 números independentes
        // Os números são únicos DENTRO de cada série, mas podem se repetir ENTRE séries
        // NÃO ordenar - manter ordem aleatória!

        // Função auxiliar para gerar uma série de 6 números únicos SEM ORDENAR
        var gerarSerieAleatoria = function gerarSerieAleatoria() {
          var serie = [];
          var tentativasMax = 100;
          var tentativas = 0;
          while (serie.length < 6 && tentativas < tentativasMax) {
            var numero = Math.floor(Math.random() * (config.rangeFim - config.rangeInicio + 1)) + config.rangeInicio;
            if (!serie.includes(numero)) {
              serie.push(numero); // NÃO ordenar aqui
            }
            tentativas++;
          }
          return serie; // Retornar sem ordenar
        };

        // Gerar primeira série (embaralhada)
        duplaSenaPrimeiraSerie = gerarSerieAleatoria();

        // Gerar segunda série (INDEPENDENTE da primeira - pode repetir números, também embaralhada)
        var numerosSegundaSerie = gerarSerieAleatoria();
        console.log('🎲 Dupla Sena - Série 1 (embaralhada):', duplaSenaPrimeiraSerie);
        console.log('🎲 Dupla Sena - Série 2 (embaralhada):', numerosSegundaSerie);
        console.log('📊 Números repetidos entre séries:', duplaSenaPrimeiraSerie.filter(function (n) {
          return numerosSegundaSerie.includes(n);
        }));

        // Selecionar apenas a segunda série no grid
        selecionarNumeros(numerosSegundaSerie);

        // updateEscolhidos irá mostrar ambas as séries com separador
        updateEscolhidos();
      } else {
        // Outras modalidades: comportamento normal
        var numeros = new Set();
        var tentativas = 0;
        var maxTentativas = qtdNumeros * 10;
        while (numeros.size < qtdNumeros && tentativas < maxTentativas) {
          var numero = Math.floor(Math.random() * (config.rangeFim - config.rangeInicio + 1)) + config.rangeInicio;
          numeros.add(numero);
          tentativas++;
        }
        var numerosAleatorios = Array.from(numeros).sort(function (a, b) {
          return a - b;
        });
        console.log('Números gerados:', numerosAleatorios.length, numerosAleatorios);
        console.log('Tentativas necessárias:', tentativas);

        // Selecionar os números no grid
        selecionarNumeros(numerosAleatorios);
      }

      // Se for +Milionária, gerar 2 trevos aleatórios
      if (config.temTrevos) {
        var _trevosContainer5 = document.getElementById('trevos-container');
        if (_trevosContainer5) {
          // Limpar seleção anterior de trevos
          _trevosContainer5.querySelectorAll('.trevo-btn.selected').forEach(function (btn) {
            btn.classList.remove('selected');
          });

          // Gerar 2 trevos aleatórios (de 1 a 6)
          var trevosAleatorios = new Set();
          while (trevosAleatorios.size < 2) {
            trevosAleatorios.add(Math.floor(Math.random() * 6) + 1);
          }

          // Selecionar os trevos
          _trevosContainer5.querySelectorAll('.trevo-btn').forEach(function (btn) {
            if (trevosAleatorios.has(parseInt(btn.dataset.trevo))) {
              btn.classList.add('selected');
            }
          });
          console.log('Trevos gerados:', Array.from(trevosAleatorios));
        }
      }

      // Atualizar escolhidos para incluir trevos
      updateEscolhidos();

      // Feedback visual
      btnGerar.textContent = '✓ Gerado!';
      setTimeout(function () {
        btnGerar.textContent = '🎲 Aleatório';
      }, 500);
    });
  }

  // Event listener para os botões de número
  container.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (DEBUG_SELECT_NUMBERS) console.log('selectNumbers: click event', {
      target: e.target,
      closestBtn: btn
    });
    if (!btn) return;
    // ignorar se estiver desabilitado
    if (btn.disabled) {
      if (DEBUG_SELECT_NUMBERS) {
        // inspeciona qual elemento está realmente recebendo o clique no centro do botão
        try {
          var r = btn.getBoundingClientRect();
          var center = {
            x: Math.round(r.left + r.width / 2),
            y: Math.round(r.top + r.height / 2)
          };
          var elAtPoint = document.elementFromPoint(center.x, center.y);
          console.log('selectNumbers: button appears disabled; elementFromPoint at center:', center, elAtPoint);
          // log pointer-events up the tree
          var cur = elAtPoint;
          var ancestors = [];
          while (cur) {
            ancestors.push({
              tag: cur.tagName,
              cls: cur.className,
              stylePointer: window.getComputedStyle(cur).pointerEvents
            });
            cur = cur.parentElement;
          }
          console.log('selectNumbers: ancestors pointer-events chain:', ancestors);
        } catch (err) {
          console.warn('selectNumbers: debug elementFromPoint failed', err);
        }
      }
      return;
    }
    var isSelected = btn.classList.contains('selected');
    if (isSelected) {
      btn.classList.remove('selected');
    } else {
      var selectedCount = container.querySelectorAll('button.selected').length;
      var _config = window.getConfigAtual ? window.getConfigAtual() : {};
      var _ehDuplaSena = _config.doisSorteios === true;

      // Para Dupla Sena, limitar a 6 na segunda série também
      var _maxParaEstaSelecao = getMaxSelections();
      if (_ehDuplaSena && duplaSenaPrimeiraSerie.length === 6) {
        _maxParaEstaSelecao = 6; // Limitar segunda série a 6
      }
      if (selectedCount >= _maxParaEstaSelecao) {
        // já atingiu o máximo, ignorar novo clique
        return;
      }
      btn.classList.add('selected');
    }

    // Atualiza estado dos demais botões
    var nowSelected = container.querySelectorAll('button.selected').length;
    var config = window.getConfigAtual ? window.getConfigAtual() : {};
    var ehDuplaSena = config.doisSorteios === true;
    var maxParaEstaSelecao = getMaxSelections();
    if (ehDuplaSena && duplaSenaPrimeiraSerie.length === 6) {
      maxParaEstaSelecao = 6; // Limitar segunda série a 6
    }
    if (nowSelected >= maxParaEstaSelecao) {
      container.querySelectorAll('button').forEach(function (b) {
        if (!b.classList.contains('selected')) b.disabled = true;
      });
    } else {
      container.querySelectorAll('button').forEach(function (b) {
        return b.disabled = false;
      });
    }

    // Atualiza a lista de números escolhidos
    if (DEBUG_SELECT_NUMBERS) console.log('selectNumbers: updated selection count', container.querySelectorAll('button.selected').length);
    updateEscolhidos();
  });

  // Event listener para mudança no select do mês da sorte
  var mesSorteSelect = document.getElementById('mes-sorte');
  if (mesSorteSelect) {
    mesSorteSelect.addEventListener('change', function () {
      updateEscolhidos(); // Atualiza a lista quando o mês mudar
    });
  }

  // Event listener para mudança no select do time do coração
  var timeCoracaoSelect = document.getElementById('time-coracao');
  if (timeCoracaoSelect) {
    timeCoracaoSelect.addEventListener('change', function () {
      updateEscolhidos(); // Atualiza a lista quando o time mudar
    });
  }
}

// Inicializa de forma segura quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSelectNumbers);
} else {
  initSelectNumbers();
}
// Disponibiliza a função globalmente para ser chamada quando desejar
window.initSelectNumbers = initSelectNumbers;
/******/ })()
;
//# sourceMappingURL=bundle.js.map