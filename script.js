// =====================================================
// BOLETIM DIGITAL - 8º ANO
// Dados fictícios + lógica de notas, faltas e situação
// =====================================================

// -----------------------------------------------------
// CONCEITOS RÁPIDOS (só pra entender o código):
// - Variável: uma "caixinha" que guarda um valor. Ex: let media = 8;
// - Array: uma lista de valores. Ex: [1, 2, 3]
// - Objeto: um conjunto de informações com nomes. Ex: { nome: "Ana", nota: 9 }
// - Função: um bloco de código que faz uma tarefa e pode ser reutilizado.
// - if: serve para tomar decisões ("se isso, faça aquilo").
// - forEach: percorre cada item de um array, um por um.
// - DOM: é o HTML visto pelo JavaScript, permitindo alterar a página.
// -----------------------------------------------------

// =====================================================
// 1) DADOS BRUTOS (fictícios) — NÃO ALTERAR NESTA ETAPA
// =====================================================
const dadosBrutos = [
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

// Média mínima de referência para "Bom desempenho"
const MEDIA_MINIMA = 6.0;

// Frequência fictícia (apenas demonstração nesta etapa)
// IMPORTANTE: este valor NÃO é calculado a partir das faltas.
// No futuro, a frequência será tratada de outra forma.
const FREQUENCIA_DEMONSTRATIVA = 92;

// =====================================================
// 2) FUNÇÃO: normalizarNota(valor)
// Converte qualquer formato de nota para a escala 0–10.
// Regras:
//  - vazio / null / undefined -> null (nota não lançada)
//  - entre 0 e 10 -> mantém
//  - maior que 10 e até 100 -> divide por 10
//  - aceita ponto ou vírgula decimal
//  - fora das regras -> null (inválida, não entra na média)
// =====================================================
function normalizarNota(valor) {
  // Verifica ausência de nota
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for string, troca vírgula por ponto e remove espaços
  if (typeof valor === "string") {
    valor = valor.trim().replace(",", ".");
  }

  // Converte para número
  const numero = Number(valor);

  // Se não for um número válido, retorna null
  if (isNaN(numero)) {
    return null;
  }

  // Regra: entre 0 e 10 permanece igual
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // Regra: maior que 10 e até 100 -> divide por 10
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras: inválida
  return null;
}

// =====================================================
// 3) FUNÇÃO: calcularMedia(notas)
// Recebe um array de notas já normalizadas (ou null)
// e calcula a média SOMENTE com as notas disponíveis.
// Nota ausente NUNCA vira zero.
// =====================================================
function calcularMedia(notas) {
  // Filtra apenas as notas válidas (não nulas)
  const notasValidas = notas.filter(function (n) {
    return n !== null;
  });

  // Se não houver nenhuma nota válida, retorna null
  if (notasValidas.length === 0) {
    return null;
  }

  // Soma todas as notas válidas
  let soma = 0;
  notasValidas.forEach(function (n) {
    soma += n;
  });

  // Média = soma / quantidade de notas válidas
  return soma / notasValidas.length;
}

// =====================================================
// 4) FUNÇÃO: somarFaltas(faltas)
// Soma os valores inteiros do array de faltas.
// =====================================================
function somarFaltas(faltas) {
  let total = 0;
  faltas.forEach(function (f) {
    total += Number(f) || 0;
  });
  return total;
}

// =====================================================
// 5) FUNÇÃO: definirSituacao(media)
// Regras:
//  - sem média -> "Nota ainda não disponível"
//  - média >= 6.0 -> "Bom desempenho"
//  - média < 6.0 -> "Atenção"
// =====================================================
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

// =====================================================
// 6) FUNÇÃO: formatarNota(nota)
// Mostra a nota com uma casa decimal ou "—" se ausente.
// =====================================================
function formatarNota(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

// =====================================================
// 7) PROCESSAMENTO DOS DADOS
// Percorre os dados brutos e monta um novo array
// com notas normalizadas, média, faltas e situação.
// =====================================================
const disciplinasProcessadas = dadosBrutos.map(function (item) {
  // Normaliza cada trimestre
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

  // Calcula a média usando apenas as notas disponíveis
  const media = calcularMedia([n1, n2, n3]);

  // Soma as faltas
  const totalFaltas = somarFaltas(item.faltas);

  // Define a situação
  const situacao = definirSituacao(media);

  return {
    disciplina: item.disciplina,
    tri1: n1,
    tri2: n2,
    tri3: n3,
    media: media,
    faltas: totalFaltas,
    situacao: situacao
  };
});

// =====================================================
// 8) PREENCHER A TABELA NO HTML
// Usa o DOM para criar as linhas dinamicamente.
// =====================================================
const corpoTabela = document.getElementById("corpoTabela");

disciplinasProcessadas.forEach(function (d) {
  // Cria uma linha <tr>
  const linha = document.createElement("tr");

  // Monta o HTML interno da linha
  linha.innerHTML = `
    <td>${d.disciplina}</td>
    <td>${d.tri1 === null ? '<span class="nota-ausente">—</span>' : formatarNota(d.tri1)}</td>
    <td>${d.tri2 === null ? '<span class="nota-ausente">—</span>' : formatarNota(d.tri2)}</td>
    <td>${d.tri3 === null ? '<span class="nota-ausente">—</span>' : formatarNota(d.tri3)}</td>
    <td><strong>${d.media === null ? '<span class="nota-ausente">Ainda não lançada</span>' : formatarNota(d.media)}</strong></td>
    <td>${d.faltas}</td>
    <td>${criarEtiquetaSituacao(d.situacao)}</td>
  `;

  corpoTabela.appendChild(linha);
});

// Função que devolve a etiqueta colorida conforme a situação
function criarEtiquetaSituacao(situacao) {
  if (situacao === "Bom desempenho") {
    return `<span class="etiqueta situacao-bom">${situacao}</span>`;
  }
  if (situacao === "Atenção") {
    return `<span class="etiqueta situacao-atencao">${situacao}</span>`;
  }
  return `<span class="etiqueta situacao-indisponivel">${situacao}</span>`;
}

// =====================================================
// 9) CALCULAR E PREENCHER OS CARDS DE RESUMO
// =====================================================

// --- Média geral: média das médias disponíveis ---
const mediasValidas = disciplinasProcessadas
  .map(function (d) { return d.media; })
  .filter(function (m) { return m !== null; });

let mediaGeral = null;
if (mediasValidas.length > 0) {
  let soma = 0;
  mediasValidas.forEach(function (m) { soma += m; });
  mediaGeral = soma / mediasValidas.length;
}

// --- Total de faltas: soma das faltas de todas as disciplinas ---
let totalFaltasGeral = 0;
disciplinasProcessadas.forEach(function (d) {
  totalFaltasGeral += d.faltas;
});

// --- Disciplinas com bom desempenho ---
const qtdBomDesempenho = disciplinasProcessadas.filter(function (d) {
  return d.situacao === "Bom desempenho";
}).length;

// --- Disciplinas que precisam de atenção ---
const qtdAtencao = disciplinasProcessadas.filter(function (d) {
  return d.situacao === "Atenção";
}).length;

// --- Monta os cards no HTML ---
const containerCards = document.getElementById("cardsResumo");

const cards = [
  {
    titulo: "Média geral",
    valor: mediaGeral === null ? "—" : formatarNota(mediaGeral),
    extra: "Escala de 0 a 10"
  },
  {
    titulo: "Total de faltas",
    valor: totalFaltasGeral,
    extra: "Somatório de todos os trimestres"
  },
  {
    titulo: "Bom desempenho",
    valor: qtdBomDesempenho,
    extra: "disciplinas com média ≥ 6,0"
  },
  {
    titulo: "Precisam de atenção",
    valor: qtdAtencao,
    extra: "disciplinas com média < 6,0"
  },
  {
    titulo: "Frequência",
    valor: FREQUENCIA_DEMONSTRATIVA + "%",
    extra: "Frequência adequada"
  }
];

cards.forEach(function (c) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <p class="card-titulo">${c.titulo}</p>
    <p class="card-valor">${c.valor}</p>
    <p class="card-extra">${c.extra}</p>
  `;
  containerCards.appendChild(card);
});

// =====================================================
// FIM DO SCRIPT
// =====================================================