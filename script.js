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