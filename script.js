// =====================================================
// BOLETIM DIGITAL - 8º ANO
// Dados fictícios + integração com API do Professor
// =====================================================

// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 5,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Variavel de sessão para armazenar o PIN em memória
let pinSessao = "";

// Estado global dos dados do boletim
let dadosBoletim = [];
let modoEdicao = false;

// Média mínima de referência para "Bom desempenho"
const MEDIA_MINIMA = 6.0;

// Frequência fictícia (apenas demonstração nesta etapa)
const FREQUENCIA_DEMONSTRATIVA = 92;

// =====================================================
// 1) DADOS BRUTOS LOCAIS (fictícios/fallback)
// =====================================================
const dadosBrutosLocais = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

// =====================================================
// 2) FUNÇÕES DE NORMALIZAÇÃO E CÁLCULO
// =====================================================
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  if (typeof valor === "string") {
    valor = valor.trim().replace(",", ".");
  }
  const numero = Number(valor);
  if (isNaN(numero)) {
    return null;
  }
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }
  return null;
}

function calcularMedia(notas) {
  const notasValidas = notas.filter(function (n) {
    return n !== null;
  });
  if (notasValidas.length === 0) {
    return null;
  }
  let soma = 0;
  notasValidas.forEach(function (n) {
    soma += n;
  });
  return soma / notasValidas.length;
}

function somarFaltas(faltas) {
  if (Array.isArray(faltas)) {
    let total = 0;
    faltas.forEach(function (f) {
      total += Number(f) || 0;
    });
    return total;
  }
  return Number(faltas) || 0;
}

function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

function formatarNota(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

function normalizarDadosLocais() {
  return dadosBrutosLocais.map(function (item) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const f1 = item.faltas ? item.faltas[0] : 0;
    const f2 = item.faltas ? item.faltas[1] : 0;
    const f3 = item.faltas ? item.faltas[2] : 0;

    return {
      disciplina: item.disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      f1: f1,
      f2: f2,
      f3: f3
    };
  });
}

// =====================================================
// 3) AUTENTICAÇÃO E CONEXÃO COM A API
// =====================================================
document.getElementById("formAcesso").addEventListener("submit", function (e) {
  e.preventDefault();
  const inputPin = document.getElementById("campoPin");
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    return;
  }

  autenticarEAbrir(pinDigitado);
});

function autenticarEAbrir(pin) {
  const msgAcesso = document.getElementById("mensagemAcesso");
  msgAcesso.textContent = "Conectando...";

  fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pin
    })
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        throw new Error("Turma, chamada ou PIN inválidos.");
      }
      if (resposta.status === 429) {
        throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
      }
      if (!resposta.ok) {
        throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
      }
      return resposta.json();
    })
    .then(function (dadosRecebidos) {
      pinSessao = pin;
      document.getElementById("campoPin").value = "";
      msgAcesso.textContent = "";

      document.getElementById("secaoAcesso").classList.add("area-boletim-oculta");
      document.getElementById("areaBoletim").classList.remove("area-boletim-oculta");

      processarDadosIniciais(dadosRecebidos);
    })
    .catch(function (erro) {
      if (erro.message.includes("Failed to fetch")) {
        msgAcesso.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      } else {
        msgAcesso.textContent = erro.message;
      }
    });
}

function processarDadosIniciais(respostaApi) {
  if (respostaApi.dados && Array.isArray(respostaApi.dados.disciplinas) && respostaApi.dados.disciplinas.length > 0) {
    dadosBoletim = respostaApi.dados.disciplinas.map(function (d) {
      return {
        disciplina: d.disciplina,
        tri1: d.tri1 !== undefined ? d.tri1 : null,
        tri2: d.tri2 !== undefined ? d.tri2 : null,
        tri3: d.tri3 !== undefined ? d.tri3 : null,
        f1: d.f1 !== undefined ? d.f1 : (d.faltas ? d.faltas[0] : 0),
        f2: d.f2 !== undefined ? d.f2 : (d.faltas ? d.faltas[1] : 0),
        f3: d.f3 !== undefined ? d.f3 : (d.faltas ? d.faltas[2] : 0)
      };
    });
  } else {
    dadosBoletim = normalizarDadosLocais();
  }

  renderizarBoletim();
}

// =====================================================
// 4) RENDERIZAÇÃO DE TABELA E CARDS
// =====================================================
function renderizarBoletim() {
  const corpoTabela = document.getElementById("corpoTabela");
  corpoTabela.textContent = "";

  const disciplinasProcessadas = dadosBoletim.map(function (d) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);
    const media = calcularMedia([n1, n2, n3]);
    const totalFaltas = (Number(d.f1) || 0) + (Number(d.f2) || 0) + (Number(d.f3) || 0);
    const situacao = definirSituacao(media);

    return {
      disciplina: d.disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      f1: d.f1,
      f2: d.f2,
      f3: d.f3,
      media: media,
      faltas: totalFaltas,
      situacao: situacao
    };
  });

  disciplinasProcessadas.forEach(function (d, idx) {
    const linha = document.createElement("tr");

    if (!modoEdicao) {
      linha.innerHTML = `
        <td></td>
        <td>${d.tri1 === null ? '<span class="nota-ausente">—</span>' : formatarNota(d.tri1)}</td>
        <td>${d.tri2 === null ? '<span class="nota-ausente">—</span>' : formatarNota(d.tri2)}</td>
        <td>${d.tri3 === null ? '<span class="nota-ausente">—</span>' : formatarNota(d.tri3)}</td>
        <td><strong>${d.media === null ? '<span class="nota-ausente">Ainda não lançada</span>' : formatarNota(d.media)}</strong></td>
        <td>${d.faltas}</td>
        <td>${criarEtiquetaSituacao(d.situacao)}</td>
      `;
      linha.children[0].textContent = d.disciplina;
    } else {
      linha.innerHTML = `
        <td></td>
        <td><input type="text" class="campo-edicao-nota" data-idx="${idx}" data-campo="tri1" value="${d.tri1 !== null ? d.tri1 : ""}"></td>
        <td><input type="text" class="campo-edicao-nota" data-idx="${idx}" data-campo="tri2" value="${d.tri2 !== null ? d.tri2 : ""}"></td>
        <td><input type="text" class="campo-edicao-nota" data-idx="${idx}" data-campo="tri3" value="${d.tri3 !== null ? d.tri3 : ""}"></td>
        <td><strong>${d.media === null ? '<span class="nota-ausente">—</span>' : formatarNota(d.media)}</strong></td>
        <td>
          <input type="text" class="campo-edicao-falta" data-idx="${idx}" data-campo="f1" value="${d.f1 !== null && d.f1 !== undefined ? d.f1 : 0}" title="Faltas Tri 1">
          <input type="text" class="campo-edicao-falta" data-idx="${idx}" data-campo="f2" value="${d.f2 !== null && d.f2 !== undefined ? d.f2 : 0}" title="Faltas Tri 2">
          <input type="text" class="campo-edicao-falta" data-idx="${idx}" data-campo="f3" value="${d.f3 !== null && d.f3 !== undefined ? d.f3 : 0}" title="Faltas Tri 3">
        </td>
        <td>${criarEtiquetaSituacao(d.situacao)}</td>
      `;
      linha.children[0].textContent = d.disciplina;
    }

    corpoTabela.appendChild(linha);
  });

  renderizarCards(disciplinasProcessadas);
}

function criarEtiquetaSituacao(situacao) {
  if (situacao === "Bom desempenho") {
    return `<span class="etiqueta situacao-bom">${situacao}</span>`;
  }
  if (situacao === "Atenção") {
    return `<span class="etiqueta situacao-atencao">${situacao}</span>`;
  }
  return `<span class="etiqueta situacao-indisponivel">${situacao}</span>`;
}

function renderizarCards(disciplinasProcessadas) {
  const containerCards = document.getElementById("cardsResumo");
  containerCards.textContent = "";

  const mediasValidas = disciplinasProcessadas
    .map(function (d) { return d.media; })
    .filter(function (m) { return m !== null; });

  let mediaGeral = null;
  if (mediasValidas.length > 0) {
    let soma = 0;
    mediasValidas.forEach(function (m) { soma += m; });
    mediaGeral = soma / mediasValidas.length;
  }

  let totalFaltasGeral = 0;
  disciplinasProcessadas.forEach(function (d) {
    totalFaltasGeral += d.faltas;
  });

  const qtdBomDesempenho = disciplinasProcessadas.filter(function (d) {
    return d.situacao === "Bom desempenho";
  }).length;

  const qtdAtencao = disciplinasProcessadas.filter(function (d) {
    return d.situacao === "Atenção";
  }).length;

  const cards = [
    { titulo: "Média geral", valor: mediaGeral === null ? "—" : formatarNota(mediaGeral), extra: "Escala de 0 a 10" },
    { titulo: "Total de faltas", valor: totalFaltasGeral, extra: "Somatório de todos os trimestres" },
    { titulo: "Bom desempenho", valor: qtdBomDesempenho, extra: "disciplinas com média ≥ 6,0" },
    { titulo: "Precisam de atenção", valor: qtdAtencao, extra: "disciplinas com média < 6,0" },
    { titulo: "Frequência", valor: FREQUENCIA_DEMONSTRATIVA + "%", extra: "Frequência adequada" }
  ];

  cards.forEach(function (c) {
    const card = document.createElement("div");
    card.className = "card";

    const pTitulo = document.createElement("p");
    pTitulo.className = "card-titulo";
    pTitulo.textContent = c.titulo;

    const pValor = document.createElement("p");
    pValor.className = "card-valor";
    pValor.textContent = c.valor;

    const pExtra = document.createElement("p");
    pExtra.className = "card-extra";
    pExtra.textContent = c.extra;

    card.appendChild(pTitulo);
    card.appendChild(pValor);
    card.appendChild(pExtra);
    containerCards.appendChild(card);
  });
}

// =====================================================
// 5) EDIÇÃO E VALIDAÇÃO DE DADOS
// =====================================================
const btnAlternarEdicao = document.getElementById("btnAlternarEdicao");
const btnSalvar = document.getElementById("btnSalvar");
const mensagemStatus = document.getElementById("mensagemStatus");

btnAlternarEdicao.addEventListener("click", function () {
  modoEdicao = !modoEdicao;
  if (modoEdicao) {
    btnAlternarEdicao.textContent = "Cancelar edição";
    btnSalvar.classList.remove("area-boletim-oculta");
  } else {
    btnAlternarEdicao.textContent = "Alterar dados";
    btnSalvar.classList.add("area-boletim-oculta");
    mensagemStatus.textContent = "";
  }
  renderizarBoletim();
});

function validarNotaDigitada(str) {
  if (str === null || str === undefined) return { valida: true, valor: null };
  const limpo = str.toString().trim();
  if (limpo === "") return { valida: true, valor: null };

  const normalizado = limpo.replace(",", ".");
  const num = Number(normalizado);

  if (isNaN(num) || num < 0 || num > 10) {
    return { valida: false, valor: null };
  }
  return { valida: true, valor: num };
}

function validarFaltaDigitada(str) {
  if (str === null || str === undefined) return { valida: false, valor: null };
  const limpo = str.toString().trim();
  if (limpo === "") return { valida: false, valor: null };

  const num = Number(limpo);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { valida: false, valor: null };
  }
  return { valida: true, valor: num };
}

btnSalvar.addEventListener("click", function () {
  mensagemStatus.textContent = "";
  let possuiErros = false;

  const camposNota = document.querySelectorAll(".campo-edicao-nota");
  const camposFalta = document.querySelectorAll(".campo-edicao-falta");

  camposNota.forEach(function (input) { input.classList.remove("campo-invalido"); });
  camposFalta.forEach(function (input) { input.classList.remove("campo-invalido"); });

  const novosDados = JSON.parse(JSON.stringify(dadosBoletim));

  camposNota.forEach(function (input) {
    const idx = input.getAttribute("data-idx");
    const campo = input.getAttribute("data-campo");
    const res = validarNotaDigitada(input.value);

    if (!res.valida) {
      input.classList.add("campo-invalido");
      possuiErros = true;
    } else {
      novosDados[idx][campo] = res.valor;
    }
  });

  camposFalta.forEach(function (input) {
    const idx = input.getAttribute("data-idx");
    const campo = input.getAttribute("data-campo");
    const res = validarFaltaDigitada(input.value);

    if (!res.valida) {
      input.classList.add("campo-invalido");
      possuiErros = true;
    } else {
      novosDados[idx][campo] = res.valor;
    }
  });

  if (possuiErros) {
    mensagemStatus.textContent = "Verifique os campos destacados em vermelho (notas entre 0 e 10, faltas como números inteiros ≥ 0).";
    return;
  }

  salvarNaApi(novosDados);
});

function salvarNaApi(novosDados) {
  mensagemStatus.textContent = "Salvando...";

  const payload = {
    turma: CONFIG_ALUNO.turma,
    numero_chamada: CONFIG_ALUNO.numeroChamada,
    pin: pinSessao,
    dados: {
      disciplinas: novosDados
    }
  };

  fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(function (resposta) {
      if (!resposta.ok) {
        throw new Error("Falha ao salvar as alterações.");
      }
      return resposta.json();
    })
    .then(function () {
      dadosBoletim = novosDados;
      modoEdicao = false;
      btnAlternarEdicao.textContent = "Alterar dados";
      btnSalvar.classList.add("area-boletim-oculta");
      mensagemStatus.textContent = "Dados salvos com sucesso.";
      renderizarBoletim();
    })
    .catch(function (erro) {
      mensagemStatus.textContent = "Não foi possível salvar os dados. Tente novamente.";
    });
}
