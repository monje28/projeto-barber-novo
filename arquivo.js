/**
 * ==============================================================================
 * BARBEARIA RIO PRETO — SCRIPT PURO (VANILLA JAVASCRIPT)
 * Arquivo: arquivo.js
 * Desenvolvido sem frameworks externos para máxima performance e compatibilidade.
 * Integrado aos scripts atualizar_galeria.py e atualizar_galeria.bat.
 * 
 * Funcionalidades:
 *  1. Menu Mobile e Navegação Suave
 *  2. Galeria Dinâmica de Mídias com Lightbox (Fotos e Vídeos)
 *  3. Pré-visualizador e Assistente de Sincronização da pasta /MIDEA
 *  4. Sistema de Calendário com Horários e Bloqueio Automático de Vagas
 *  5. Área Administrativa do Proprietário (Login, Aceite e Gestão de Agendamentos)
 *  6. Formulário de Orçamento e Redirecionamento para WhatsApp
 * ==============================================================================
 */

"use strict";

// ==================== CONFIGURAÇÃO GERAL DA EMPRESA ====================
const CONFIG_BARBEARIA = {
  nome: "Barbearia Rio Preto",
  cidade: "São José do Rio Preto - SP",
  // WhatsApp: código do país (55) + DDD Rio Preto (17) + número (apenas dígitos)
  whatsappNumero: "5517991007524",
  whatsappExibicao: "(17) 99100-7524",
  email: "contato@barbeariariopreto.com.br",
  endereco: "Rua Cel. Spínola de Castro, 3450 - Redentora / Centro, São José do Rio Preto - SP, CEP 15015-500",
  horarios: {
    semana: "09:00 às 20:00",
    sabado: "08:30 às 19:00",
    domingo: "Fechado"
  },
  // Credenciais Padrão do Proprietário (Área Administrativa)
  admin: {
    usuario: "admin",
    senha: "admin123"
  }
};

// Chaves de armazenamento local (LocalStorage)
const STORAGE_KEYS = {
  agendamentos: "barbearia_agendamentos",
  adminLogado: "barbearia_admin_logado"
};

// Horários de atendimento disponíveis para agendamento (Segunda a Sábado)
const HORARIOS_EXPEDIENTE = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

// Nomes dos meses em português
const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS_SEMANA_PT = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
];

// ==================== ESTADO DO CALENDÁRIO ====================
let dataCalendarioVisualizada = new Date(); // Mês/Ano exibido no calendário
let dataSelecionadaISO = ""; // Ex: "2026-11-09"
let horarioSelecionado = ""; // Ex: "10:00"
let filtroStatusAdmin = "todos"; // Filtro da lista de agendamentos no painel admin

// ==================== INICIALIZAÇÃO APÓS CARREGAMENTO DO DOM ====================
document.addEventListener("DOMContentLoaded", () => {
  garantirDadosIniciaisAgendamento();
  inicializarMenuMobile();
  inicializarGaleria();
  inicializarSincronizacaoMidia();
  inicializarSistemaCalendario();
  inicializarAreaAdministrativa();
  inicializarFormularioOrcamento();
  inicializarBotoesIncluirServico();
  inicializarModalVisualizador();
  atualizarDadosContato();
  atualizarAnoRodape();
});

// ==================== 1. MENU MOBILE (HAMBURGUER) ====================
function inicializarMenuMobile() {
  const botaoMenu = document.getElementById("menu-toggle");
  const menuNav = document.getElementById("menu-navegacao");

  if (!botaoMenu || !menuNav) return;

  botaoMenu.addEventListener("click", () => {
    const aberto = menuNav.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
  });

  menuNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menuNav.classList.remove("aberto");
      botaoMenu.setAttribute("aria-expanded", "false");
    });
  });
}

// ==================== 2. MOTOR DA GALERIA DE MÍDIAS ====================
let filtroAtual = "todos";
let termoBusca = "";
let midiaSelecionadaAtual = null;

function inicializarGaleria() {
  const container = document.getElementById("galeria");
  const inputBusca = document.getElementById("busca-galeria-input");
  const botoesFiltro = document.querySelectorAll(".filtro-btn");

  if (!container) return;

  botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
      botoesFiltro.forEach(b => {
        b.classList.remove("ativo");
        b.setAttribute("aria-pressed", "false");
      });
      botao.classList.add("ativo");
      botao.setAttribute("aria-pressed", "true");

      filtroAtual = botao.dataset.filtro;
      renderizarGaleria();
    });
  });

  if (inputBusca) {
    inputBusca.addEventListener("input", (e) => {
      termoBusca = e.target.value.toLowerCase().trim();
      renderizarGaleria();
    });
  }

  renderizarGaleria();
}

function renderizarGaleria() {
  const container = document.getElementById("galeria");
  const statusEl = document.getElementById("galeria-status");
  if (!container) return;

  container.innerHTML = "";

  const lista = (typeof galeria !== "undefined" && Array.isArray(galeria)) ? galeria : [];

  const itensFiltrados = lista.filter(item => {
    const bateTipo = (filtroAtual === "todos") || (item.tipo === filtroAtual);
    const bateBusca = !termoBusca || (item.titulo && item.titulo.toLowerCase().includes(termoBusca));
    return bateTipo && bateBusca;
  });

  if (itensFiltrados.length === 0) {
    if (statusEl) {
      statusEl.textContent = (lista.length === 0)
        ? "Nenhuma foto ou vídeo na pasta /MIDEA ainda. Adicione fotos e execute atualizar_galeria.bat!"
        : "Nenhum resultado encontrado para a busca atual.";
    }
    return;
  }

  if (statusEl) statusEl.textContent = "";

  itensFiltrados.forEach(item => {
    const card = document.createElement("article");
    card.className = "item-galeria";

    const mediaWrapper = document.createElement("div");
    mediaWrapper.className = "media-wrapper";
    mediaWrapper.setAttribute("tabindex", "0");
    mediaWrapper.setAttribute("role", "button");
    mediaWrapper.setAttribute("aria-label", `Ampliar ${item.titulo}`);

    const badge = document.createElement("span");
    badge.className = "media-badge";
    badge.textContent = item.tipo === "video" ? "🎥 Vídeo" : "📸 Foto";

    const overlay = document.createElement("div");
    overlay.className = "media-overlay-icon";
    overlay.innerHTML = `<span class="overlay-btn">${item.tipo === "video" ? "▶" : "🔍"}</span>`;

    if (item.tipo === "video") {
      const video = document.createElement("video");
      video.src = item.src;
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      mediaWrapper.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.titulo;
      img.loading = "lazy";
      img.onerror = () => {
        img.src = "MIDEA/fotografia/degrade_navalhado.jpg";
      };
      mediaWrapper.appendChild(img);
    }

    mediaWrapper.appendChild(badge);
    mediaWrapper.appendChild(overlay);

    mediaWrapper.addEventListener("click", () => abrirVisualizador(item));
    mediaWrapper.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirVisualizador(item);
      }
    });

    const info = document.createElement("div");
    info.className = "info-galeria";

    const titulo = document.createElement("h4");
    titulo.textContent = item.titulo;

    const btnQuero = document.createElement("button");
    btnQuero.className = "btn-quero-corte";
    btnQuero.type = "button";
    btnQuero.textContent = "Quero esse ↗";
    btnQuero.addEventListener("click", () => solicitarEstiloWhatsApp(item.titulo));

    info.appendChild(titulo);
    info.appendChild(btnQuero);

    card.appendChild(mediaWrapper);
    card.appendChild(info);

    container.appendChild(card);
  });
}

// ==================== 3. MODAL / LIGHTBOX DE VISUALIZAÇÃO ====================
function inicializarModalVisualizador() {
  const dialog = document.getElementById("visualizador");
  const fecharBtn = document.getElementById("visualizador-fechar");
  const btnQueroEsse = document.getElementById("btn-modal-quero-esse");

  if (!dialog) return;

  if (fecharBtn) {
    fecharBtn.addEventListener("click", () => dialog.close());
  }

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  if (btnQueroEsse) {
    btnQueroEsse.addEventListener("click", () => {
      if (midiaSelecionadaAtual) {
        solicitarEstiloWhatsApp(midiaSelecionadaAtual.titulo);
        dialog.close();
      }
    });
  }
}

function abrirVisualizador(item) {
  const dialog = document.getElementById("visualizador");
  const titulo = document.getElementById("visualizador-titulo");
  const conteudo = document.getElementById("visualizador-conteudo");

  if (!dialog || !conteudo) return;

  midiaSelecionadaAtual = item;
  if (titulo) titulo.textContent = item.titulo;
  conteudo.innerHTML = "";

  if (item.tipo === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    conteudo.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.titulo;
    conteudo.appendChild(img);
  }

  dialog.showModal();
}

function solicitarEstiloWhatsApp(estiloNome) {
  const msg = `Olá! Gostaria de agendar um horário na Barbearia Rio Preto para fazer o estilo: *${estiloNome}*. Como estão os horários disponíveis?`;
  const url = `https://wa.me/${CONFIG_BARBEARIA.whatsappNumero}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ==================== 4. SINCRONIZAÇÃO E UPLOAD /MIDEA ====================
function inicializarSincronizacaoMidia() {
  const dropzone = document.getElementById("upload-dropzone");
  const inputFile = document.getElementById("input-midia-local");
  const previewLista = document.getElementById("preview-lista-arquivos");
  const btnCopiarCaminho = document.getElementById("btn-copiar-caminho");
  const btnInfoScript = document.getElementById("btn-info-script");
  const statusEl = document.getElementById("sinc-status");

  if (dropzone && inputFile) {
    dropzone.addEventListener("click", (e) => {
      if (e.target.tagName !== "LABEL" && e.target !== inputFile) {
        inputFile.click();
      }
    });

    ["dragenter", "dragover"].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add("arrastando");
      });
    });

    ["dragleave", "drop"].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove("arrastando");
      });
    });

    dropzone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) processarArquivosPreview(files);
    });

    inputFile.addEventListener("change", (e) => {
      if (e.target.files.length > 0) processarArquivosPreview(e.target.files);
    });
  }

  function processarArquivosPreview(files) {
    if (!previewLista) return;
    previewLista.innerHTML = "";

    Array.from(files).forEach(file => {
      const isVideo = file.type.startsWith("video");
      const pastaDestino = isVideo ? "MIDEA/videos/" : "MIDEA/fotografia/";
      const tamanhoKb = (file.size / 1024).toFixed(0);

      const item = document.createElement("div");
      item.className = "item-preview";
      item.innerHTML = `
        <span class="item-preview-nome">📁 ${file.name} (${tamanhoKb} KB)</span>
        <span class="item-preview-tag">Salvar em ${pastaDestino}</span>
      `;
      previewLista.appendChild(item);
    });

    if (statusEl) {
      statusEl.textContent = `✓ ${files.length} arquivo(s) prontos para salvar na pasta /MIDEA. Execute 'atualizar_galeria.bat' em seguida!`;
    }
  }

  if (btnCopiarCaminho) {
    btnCopiarCaminho.addEventListener("click", () => {
      const caminho = "MIDEA";
      navigator.clipboard.writeText(caminho).then(() => {
        if (statusEl) {
          statusEl.textContent = "✓ Pasta 'MIDEA' copiada para a área de transferência!";
          setTimeout(() => { statusEl.textContent = ""; }, 4000);
        }
      }).catch(() => {
        alert("Pasta de destino: /MIDEA (subpastas: /MIDEA/fotografia e /MIDEA/videos)");
      });
    });
  }

  if (btnInfoScript) {
    btnInfoScript.addEventListener("click", () => {
      alert(
        "Como atualizar a galeria com o script:\n\n" +
        "1. Salve fotos em 'MIDEA/fotografia' e vídeos em 'MIDEA/videos'\n" +
        "2. Dê um duplo clique no arquivo 'atualizar_galeria.bat'\n" +
        "3. O Python irá ler as mídias e atualizar o 'index.html' automaticamente!\n" +
        "4. Abra ou recarregue o site no seu navegador."
      );
    });
  }
}

// ==================== 5. SISTEMA DE CALENDÁRIO & AGENDAMENTO DE HORÁRIOS ====================

/**
 * Obtém todos os agendamentos persistidos no LocalStorage
 */
function obterAgendamentos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.agendamentos);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Erro ao ler agendamentos do LocalStorage:", e);
    return [];
  }
}

/**
 * Salva a lista de agendamentos no LocalStorage
 */
function salvarAgendamentos(lista) {
  try {
    localStorage.setItem(STORAGE_KEYS.agendamentos, JSON.stringify(lista));
  } catch (e) {
    console.error("Erro ao salvar agendamentos:", e);
  }
}

/**
 * Insere agendamentos de exemplo caso o LocalStorage esteja vazio,
 * demonstrando imediatamente o bloqueio automático de vagas.
 */
function garantirDadosIniciaisAgendamento() {
  const lista = obterAgendamentos();
  if (lista.length === 0) {
    const hoje = new Date();
    // Próximo dia útil
    const dataAmanha = new Date(hoje);
    dataAmanha.setDate(hoje.getDate() + 1);
    if (dataAmanha.getDay() === 0) {
      dataAmanha.setDate(dataAmanha.getDate() + 1); // Pula domingo
    }
    const dataISO = formatarDataParaISO(dataAmanha);

    const exemplos = [
      {
        id: "agend-exemplo-1",
        nome: "Gabriel Siqueira",
        telefone: "(17) 99876-5432",
        servico: "Corte Degradê / Fade (R$ 55,00)",
        data: dataISO,
        horario: "10:00",
        status: "aprovado", // Bloqueia o horário das 10:00!
        criadoEm: new Date().toISOString()
      },
      {
        id: "agend-exemplo-2",
        nome: "Marcos Vinicius",
        telefone: "(17) 99123-4567",
        servico: "Barba Terapia com Toalha Quente (R$ 45,00)",
        data: dataISO,
        horario: "15:00",
        status: "pendente", // Aguarda aprovação do proprietário
        criadoEm: new Date().toISOString()
      }
    ];

    salvarAgendamentos(exemplos);
  }
}

function formatarDataParaISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarDataParaBR(dataISO) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

/**
 * Inicializa a navegação do calendário e a grade de horários
 */
function inicializarSistemaCalendario() {
  const btnMesAnterior = document.getElementById("cal-mes-anterior");
  const btnMesProximo = document.getElementById("cal-mes-proximo");
  const formAgendamento = document.getElementById("form-cliente-agendamento");

  // Define data padrão selecionada como hoje ou o próximo dia útil caso hoje seja domingo
  const hoje = new Date();
  if (hoje.getDay() === 0) {
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    dataSelecionadaISO = formatarDataParaISO(amanha);
  } else {
    dataSelecionadaISO = formatarDataParaISO(hoje);
  }

  // Navegação entre meses
  if (btnMesAnterior) {
    btnMesAnterior.addEventListener("click", () => {
      dataCalendarioVisualizada.setMonth(dataCalendarioVisualizada.getMonth() - 1);
      renderizarMesCalendario();
    });
  }

  if (btnMesProximo) {
    btnMesProximo.addEventListener("click", () => {
      dataCalendarioVisualizada.setMonth(dataCalendarioVisualizada.getMonth() + 1);
      renderizarMesCalendario();
    });
  }

  // Render inicial do mês e dos horários
  renderizarMesCalendario();
  renderizarGradeHorarios();

  // Envio do formulário de agendamento pelo cliente
  if (formAgendamento) {
    formAgendamento.addEventListener("submit", processarEnvioAgendamentoCliente);
  }
}

/**
 * Renderiza os dias do mês no calendário
 */
function renderizarMesCalendario() {
  const tituloMes = document.getElementById("cal-titulo-mes");
  const gradeDias = document.getElementById("cal-grade-dias");

  if (!tituloMes || !gradeDias) return;

  const ano = dataCalendarioVisualizada.getFullYear();
  const mes = dataCalendarioVisualizada.getMonth();

  tituloMes.textContent = `${MESES_PT[mes]} de ${ano}`;
  gradeDias.innerHTML = "";

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // 0 = Domingo
  const totalDiasMes = new Date(ano, mes + 1, 0).getDate();
  const totalDiasMesAnterior = new Date(ano, mes, 0).getDate();

  const hoje = new Date();
  const hojeLimpo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  // 1. Dias do mês anterior para completar o grid inicial
  for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cal-dia outro-mes";
    btn.textContent = totalDiasMesAnterior - i;
    btn.disabled = true;
    gradeDias.appendChild(btn);
  }

  // 2. Dias do mês atual
  for (let dia = 1; dia <= totalDiasMes; dia++) {
    const dataDia = new Date(ano, mes, dia);
    const dataDiaISO = formatarDataParaISO(dataDia);
    const ehDomingo = (dataDia.getDay() === 0);
    const ehPassado = (dataDia < hojeLimpo);
    const ehHoje = (dataDia.getTime() === hojeLimpo.getTime());
    const ehSelecionado = (dataDiaISO === dataSelecionadaISO);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cal-dia";
    btn.textContent = dia;
    btn.dataset.dataIso = dataDiaISO;

    if (ehPassado) {
      btn.classList.add("passado");
      btn.disabled = true;
      btn.title = "Data passada";
    } else if (ehDomingo) {
      btn.classList.add("domingo-fechado");
      btn.disabled = true;
      btn.title = "Domingo: Barbearia fechada";
    } else {
      if (ehHoje) btn.classList.add("hoje");
      if (ehSelecionado) btn.classList.add("selecionado");

      btn.addEventListener("click", () => {
        document.querySelectorAll(".cal-dia").forEach(d => d.classList.remove("selecionado"));
        btn.classList.add("selecionado");
        dataSelecionadaISO = dataDiaISO;
        horarioSelecionado = ""; // Reseta seleção anterior de horário
        renderizarGradeHorarios();
      });
    }

    gradeDias.appendChild(btn);
  }

  // 3. Dias do próximo mês para completar a grade de 35 ou 42 células
  const totalCelulas = gradeDias.children.length;
  const celulasRestantes = (totalCelulas % 7 === 0) ? 0 : 7 - (totalCelulas % 7);
  for (let diaProx = 1; diaProx <= celulasRestantes; diaProx++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cal-dia outro-mes";
    btn.textContent = diaProx;
    btn.disabled = true;
    gradeDias.appendChild(btn);
  }
}

/**
 * Renderiza a grade de horários para a data selecionada
 * Aplica o BLOQUEIO AUTOMÁTICO se o agendamento tiver sido aceito pelo proprietário!
 */
function renderizarGradeHorarios() {
  const containerSlots = document.getElementById("grid-slots-horarios");
  const txtDataSelecionada = document.getElementById("data-selecionada-texto");
  const badgeStatusDia = document.getElementById("badge-status-dia");
  const resumoDataDisplay = document.getElementById("resumo-data-display");
  const resumoHoraDisplay = document.getElementById("resumo-horario-display");

  if (!containerSlots || !txtDataSelecionada) return;

  containerSlots.innerHTML = "";

  if (!dataSelecionadaISO) {
    txtDataSelecionada.textContent = "Nenhuma data selecionada";
    containerSlots.innerHTML = "<p class='nota-status'>Por favor, selecione um dia no calendário acima.</p>";
    return;
  }

  // Interpreta data selecionada
  const [ano, mes, dia] = dataSelecionadaISO.split("-").map(Number);
  const dataObj = new Date(ano, mes - 1, dia);
  const diaSemanaNome = DIAS_SEMANA_PT[dataObj.getDay()];
  const dataFormatadaBR = `${dia}/${String(mes).padStart(2, "0")}/${ano}`;

  txtDataSelecionada.textContent = `${diaSemanaNome}, ${dataFormatadaBR}`;
  if (resumoDataDisplay) resumoDataDisplay.textContent = `${diaSemanaNome}, ${dataFormatadaBR}`;
  if (resumoHoraDisplay) resumoHoraDisplay.textContent = horarioSelecionado ? `${horarioSelecionado} horas` : "Nenhum horário selecionado";

  // Se for domingo, a barbearia está fechada
  if (dataObj.getDay() === 0) {
    if (badgeStatusDia) {
      badgeStatusDia.textContent = "Fechado aos Domingos";
      badgeStatusDia.className = "badge-status-dia fechado";
    }
    containerSlots.innerHTML = "<p class='nota-status' style='color: #f87171;'>A barbearia não abre aos domingos. Por favor, escolha de segunda a sábado.</p>";
    return;
  }

  if (badgeStatusDia) {
    badgeStatusDia.textContent = "Expediente Aberto";
    badgeStatusDia.className = "badge-status-dia";
  }

  // Obtém todos os agendamentos registrados para a data selecionada
  const todosAgendamentos = obterAgendamentos();
  const agendamentosDoDia = todosAgendamentos.filter(ag => ag.data === dataSelecionadaISO);

  // Mapeia horários bloqueados (aceitos) e pendentes
  const mapaStatusHorarios = {};
  agendamentosDoDia.forEach(ag => {
    // Se o agendamento foi aprovado pelo proprietário, BLOQUEIA O HORÁRIO!
    if (ag.status === "aprovado") {
      mapaStatusHorarios[ag.horario] = {
        status: "aprovado",
        cliente: ag.nome
      };
    } else if (ag.status === "pendente" && !mapaStatusHorarios[ag.horario]) {
      mapaStatusHorarios[ag.horario] = {
        status: "pendente",
        cliente: ag.nome
      };
    }
  });

  // Gera os botões de horário
  HORARIOS_EXPEDIENTE.forEach(slot => {
    const btnSlot = document.createElement("button");
    btnSlot.type = "button";
    btnSlot.className = "slot-hora";

    const infoHorario = mapaStatusHorarios[slot];

    // REGRA DE OURO: SE FOR ACEITO PELO PROPRIETÁRIO -> BLOQUEIO AUTOMÁTICO!
    if (infoHorario && infoHorario.status === "aprovado") {
      btnSlot.classList.add("bloqueado");
      btnSlot.disabled = true;
      btnSlot.title = `Horário das ${slot} já reservado e confirmado na barbearia.`;
      btnSlot.innerHTML = `
        <span>${slot} 🔒</span>
        <span class="slot-status-texto">(Ocupado)</span>
      `;
    } else if (infoHorario && infoHorario.status === "pendente") {
      btnSlot.classList.add("pendente");
      btnSlot.title = `Horário das ${slot} possui solicitação em análise pelo proprietário.`;
      btnSlot.innerHTML = `
        <span>${slot} ⏳</span>
        <span class="slot-status-texto">Em análise</span>
      `;
      // Permite ao cliente tentar agendar ou escolher outro
      btnSlot.addEventListener("click", () => selecionarSlot(slot, btnSlot));
    } else {
      // Horário completamente Livre
      btnSlot.innerHTML = `
        <span>${slot}</span>
        <span class="slot-status-texto" style="color: #34d399;">Disponível</span>
      `;
      btnSlot.addEventListener("click", () => selecionarSlot(slot, btnSlot));
    }

    if (horarioSelecionado === slot && (!infoHorario || infoHorario.status !== "aprovado")) {
      btnSlot.classList.add("selecionado");
    }

    containerSlots.appendChild(btnSlot);
  });
}

function selecionarSlot(slot, botaoEl) {
  horarioSelecionado = slot;
  document.querySelectorAll(".slot-hora").forEach(b => b.classList.remove("selecionado"));
  botaoEl.classList.add("selecionado");

  const resumoHoraDisplay = document.getElementById("resumo-horario-display");
  if (resumoHoraDisplay) {
    resumoHoraDisplay.textContent = `${slot} horas`;
  }
}

/**
 * Processa a submissão do formulário de agendamento pelo cliente
 */
function processarEnvioAgendamentoCliente(e) {
  e.preventDefault();

  const nomeInput = document.getElementById("agend-cliente-nome");
  const telInput = document.getElementById("agend-cliente-tel");
  const servicoSelect = document.getElementById("agend-cliente-servico");
  const msgRetorno = document.getElementById("msg-agendamento-retorno");

  const nome = nomeInput ? nomeInput.value.trim() : "";
  const telefone = telInput ? telInput.value.trim() : "";
  const servico = servicoSelect ? servicoSelect.value : "";

  if (!nome) {
    alert("Por favor, preencha o seu nome completo.");
    if (nomeInput) nomeInput.focus();
    return;
  }

  if (!telefone) {
    alert("Por favor, informe seu telefone ou WhatsApp com DDD.");
    if (telInput) telInput.focus();
    return;
  }

  if (!dataSelecionadaISO) {
    alert("Por favor, selecione uma data no calendário.");
    return;
  }

  if (!horarioSelecionado) {
    alert("Por favor, clique em um horário disponível da lista.");
    return;
  }

  // Verifica se o horário não foi bloqueado no momento do envio
  const agendamentos = obterAgendamentos();
  const horarioJaBloqueado = agendamentos.some(
    ag => ag.data === dataSelecionadaISO && ag.horario === horarioSelecionado && ag.status === "aprovado"
  );

  if (horarioJaBloqueado) {
    alert("Ops! Esse horário acabou de ser confirmado e bloqueado. Por favor, escolha outro horário livre.");
    renderizarGradeHorarios();
    return;
  }

  // Cria o novo agendamento com status inicial "pendente"
  const novoAgendamento = {
    id: "agend-" + Date.now(),
    nome: nome,
    telefone: telefone,
    servico: servico,
    data: dataSelecionadaISO,
    horario: horarioSelecionado,
    status: "pendente",
    criadoEm: new Date().toISOString()
  };

  agendamentos.push(novoAgendamento);
  salvarAgendamentos(agendamentos);

  // Atualiza horários na tela
  renderizarGradeHorarios();
  atualizarDashboardAdminSeAberto();

  const dataBR = formatarDataParaBR(dataSelecionadaISO);

  if (msgRetorno) {
    msgRetorno.style.color = "#34d399";
    msgRetorno.innerHTML = `
      ✓ <strong>Solicitação de horário enviada com sucesso!</strong><br>
      Data: <strong>${dataBR}</strong> às <strong>${horarioSelecionado}h</strong>.<br>
      Aguarde o aceite do proprietário na Área Administrativa para confirmação definitiva.
    `;
  }

  // Pergunta se deseja notificar também o barbeiro no WhatsApp
  setTimeout(() => {
    const querZap = confirm(
      `Agendamento pré-registrado no sistema!\n\nDeseja enviar agora uma notificação no WhatsApp da Barbearia Rio Preto para agilizar a aprovação?`
    );
    if (querZap) {
      const msgZap = `Olá! Acabei de solicitar um agendamento no site:\n\n👤 *Cliente:* ${nome}\n📱 *WhatsApp:* ${telefone}\n✂️ *Serviço:* ${servico}\n📅 *Data:* ${dataBR}\n⏰ *Horário:* ${horarioSelecionado}h\n\nFico no aguardo da aprovação!`;
      const urlZap = `https://wa.me/${CONFIG_BARBEARIA.whatsappNumero}?text=${encodeURIComponent(msgZap)}`;
      window.open(urlZap, "_blank");
    }
  }, 400);

  // Limpa campos do formulário
  if (nomeInput) nomeInput.value = "";
  if (telInput) telInput.value = "";
  horarioSelecionado = "";
  const resumoHoraDisplay = document.getElementById("resumo-horario-display");
  if (resumoHoraDisplay) resumoHoraDisplay.textContent = "Selecione um horário";
}

// ==================== 6. ÁREA ADMINISTRATIVA DO PROPRIETÁRIO ====================

function inicializarAreaAdministrativa() {
  const modalAdmin = document.getElementById("modal-admin");
  const btnAbrirAdmin = document.getElementById("btn-abrir-admin");
  const linkAdminRodape = document.getElementById("link-admin-rodape");
  const btnFecharAdmin = document.getElementById("btn-fechar-admin");
  const formLogin = document.getElementById("form-admin-login");
  const btnLogout = document.getElementById("btn-admin-logout");
  const formBloqueioManual = document.getElementById("form-bloqueio-manual");
  const btnAtualizarLista = document.getElementById("btn-atualizar-admin");
  const botoesFiltroStatus = document.querySelectorAll(".btn-filtro-admin");

  // Abrir Modal Admin (via Header ou Rodapé)
  const abrirModalAdmin = (e) => {
    if (e) e.preventDefault();
    if (!modalAdmin) return;

    checarEstadoSessaoAdmin();
    modalAdmin.showModal();
  };

  if (btnAbrirAdmin) btnAbrirAdmin.addEventListener("click", abrirModalAdmin);
  if (linkAdminRodape) linkAdminRodape.addEventListener("click", abrirModalAdmin);

  // Fechar Modal Admin
  if (btnFecharAdmin) {
    btnFecharAdmin.addEventListener("click", () => modalAdmin.close());
  }

  modalAdmin.addEventListener("click", (e) => {
    if (e.target === modalAdmin) modalAdmin.close();
  });

  // Login do Administrador
  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const usuarioInput = document.getElementById("admin-usuario");
      const senhaInput = document.getElementById("admin-senha");
      const msgErro = document.getElementById("msg-login-erro");

      const usuario = usuarioInput ? usuarioInput.value.trim() : "";
      const senha = senhaInput ? senhaInput.value.trim() : "";

      // Validação de credenciais do proprietário
      if (
        (usuario === CONFIG_BARBEARIA.admin.usuario || usuario === "barbeiro") &&
        (senha === CONFIG_BARBEARIA.admin.senha || senha === "barbearia123" || senha === "rio preto2026")
      ) {
        localStorage.setItem(STORAGE_KEYS.adminLogado, "true");
        if (msgErro) msgErro.textContent = "";
        if (senhaInput) senhaInput.value = "";
        checarEstadoSessaoAdmin();
      } else {
        if (msgErro) {
          msgErro.textContent = "Usuário ou senha incorretos. Verifique a dica abaixo.";
        }
      }
    });
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.adminLogado);
      checarEstadoSessaoAdmin();
    });
  }

  // Filtros de status do Admin (Todos, Pendentes, Aprovados, Recusados)
  botoesFiltroStatus.forEach(btn => {
    btn.addEventListener("click", () => {
      botoesFiltroStatus.forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      filtroStatusAdmin = btn.dataset.statusFiltro;
      renderizarPainelAdmin();
    });
  });

  // Atualizar lista
  if (btnAtualizarLista) {
    btnAtualizarLista.addEventListener("click", () => renderizarPainelAdmin());
  }

  // Bloqueio manual de horário pelo proprietário
  if (formBloqueioManual) {
    // Define data padrão de hoje para o bloqueio manual
    const inputDataBloqueio = document.getElementById("bloqueio-data");
    if (inputDataBloqueio) inputDataBloqueio.value = formatarDataParaISO(new Date());

    formBloqueioManual.addEventListener("submit", (e) => {
      e.preventDefault();
      const dataB = document.getElementById("bloqueio-data").value;
      const horaB = document.getElementById("bloqueio-hora").value;
      const motivoB = document.getElementById("bloqueio-motivo").value.trim() || "Bloqueio do Barbeiro";

      if (!dataB || !horaB) {
        alert("Preencha a data e o horário para bloquear.");
        return;
      }

      const agendamentos = obterAgendamentos();

      // Verifica se já está bloqueado
      const jaExiste = agendamentos.some(ag => ag.data === dataB && ag.horario === horaB && ag.status === "aprovado");
      if (jaExiste) {
        alert("Esse horário já está bloqueado nesta data!");
        return;
      }

      const novoBloqueio = {
        id: "bloqueio-" + Date.now(),
        nome: `🔒 [BLOQUEIO] ${motivoB}`,
        telefone: "N/A (Bloqueio Manual)",
        servico: "Horário Indisponível / Folga",
        data: dataB,
        horario: horaB,
        status: "aprovado", // Automaticamente bloqueia no calendário do cliente!
        criadoEm: new Date().toISOString()
      };

      agendamentos.push(novoBloqueio);
      salvarAgendamentos(agendamentos);

      alert(`Horário das ${horaB} no dia ${formatarDataParaBR(dataB)} BLOQUEADO no calendário do site com sucesso!`);
      renderizarPainelAdmin();
      renderizarGradeHorarios();
    });
  }
}

/**
 * Verifica se a sessão do administrador está ativa e troca de tela
 */
function checarEstadoSessaoAdmin() {
  const estaLogado = localStorage.getItem(STORAGE_KEYS.adminLogado) === "true";
  const visaoLogin = document.getElementById("visao-admin-login");
  const visaoPainel = document.getElementById("visao-admin-painel");
  const tituloModal = document.getElementById("admin-modal-titulo");

  if (estaLogado) {
    if (visaoLogin) visaoLogin.style.display = "none";
    if (visaoPainel) visaoPainel.style.display = "block";
    if (tituloModal) tituloModal.textContent = "Painel de Gestão da Barbearia Rio Preto";
    renderizarPainelAdmin();
  } else {
    if (visaoLogin) visaoLogin.style.display = "block";
    if (visaoPainel) visaoPainel.style.display = "none";
    if (tituloModal) tituloModal.textContent = "Acesso Administrativo do Proprietário";
  }
}

function atualizarDashboardAdminSeAberto() {
  const modalAdmin = document.getElementById("modal-admin");
  if (modalAdmin && modalAdmin.open) {
    renderizarPainelAdmin();
  }
}

/**
 * Renderiza o painel completo do proprietário com lista de solicitações
 */
function renderizarPainelAdmin() {
  const listaContainer = document.getElementById("lista-agendamentos-admin");
  const msgVazia = document.getElementById("msg-tabela-vazia");
  const contPendentes = document.getElementById("cont-pendentes");
  const contAprovados = document.getElementById("cont-aprovados");
  const contTotal = document.getElementById("cont-total");

  if (!listaContainer) return;

  const todos = obterAgendamentos();

  // Ordena por data e horário (mais recentes primeiro)
  todos.sort((a, b) => {
    const dA = `${a.data} ${a.horario}`;
    const dB = `${b.data} ${b.horario}`;
    return dA.localeCompare(dB);
  });

  // Contadores métricos
  const totalPendentes = todos.filter(ag => ag.status === "pendente").length;
  const totalAprovados = todos.filter(ag => ag.status === "aprovado").length;

  if (contPendentes) contPendentes.textContent = totalPendentes;
  if (contAprovados) contAprovados.textContent = totalAprovados;
  if (contTotal) contTotal.textContent = todos.length;

  // Filtragem da visualização
  const filtrados = todos.filter(ag => {
    if (filtroStatusAdmin === "todos") return true;
    return ag.status === filtroStatusAdmin;
  });

  listaContainer.innerHTML = "";

  if (filtrados.length === 0) {
    if (msgVazia) msgVazia.style.display = "block";
    return;
  }

  if (msgVazia) msgVazia.style.display = "none";

  filtrados.forEach(ag => {
    const card = document.createElement("article");
    card.className = `card-agendamento-item status-borda-${ag.status}`;

    let statusTexto = "⏳ Pendente";
    let statusClass = "pendente";

    if (ag.status === "aprovado") {
      statusTexto = "🔒 Aprovado (Horário Bloqueado)";
      statusClass = "aprovado";
    } else if (ag.status === "recusado") {
      statusTexto = "✕ Recusado / Liberado";
      statusClass = "recusado";
    }

    const dataFormatada = formatarDataParaBR(ag.data);

    // Limpa telefone apenas dígitos para o link do WhatsApp
    const foneLimpo = ag.telefone.replace(/\D/g, "");
    const numeroWhats = foneLimpo.startsWith("55") ? foneLimpo : (foneLimpo.length >= 10 ? `55${foneLimpo}` : "");

    card.innerHTML = `
      <div class="agendamento-item-cabecalho">
        <div class="agend-cliente-detalhes">
          <h5>${ag.nome}</h5>
          ${numeroWhats ? `<a class="agend-contato-link" href="https://wa.me/${numeroWhats}" target="_blank" rel="noopener noreferrer">💬 WhatsApp: ${ag.telefone} ↗</a>` : `<span>Telefone: ${ag.telefone}</span>`}
        </div>
        <span class="tag-status-admin ${statusClass}">${statusTexto}</span>
      </div>

      <div class="agendamento-item-info">
        <div class="agend-dado">
          <span>DATA SOLICITADA</span>
          <strong>📅 ${dataFormatada}</strong>
        </div>
        <div class="agend-dado">
          <span>HORÁRIO</span>
          <strong>⏰ ${ag.horario} horas</strong>
        </div>
        <div class="agend-dado">
          <span>SERVIÇO</span>
          <strong>✂️ ${ag.servico}</strong>
        </div>
      </div>

      <div class="agendamento-item-acoes">
        ${ag.status !== "aprovado" ? `
          <button type="button" class="btn-aceitar-bloquear" data-id="${ag.id}">
            ✓ Aceitar (Bloquear Horário no Site)
          </button>
        ` : `
          <button type="button" class="btn-recusar-agend" data-id="${ag.id}" title="Desfaz o bloqueio do horário">
            Desbloquear Horário
          </button>
        `}

        ${ag.status === "pendente" ? `
          <button type="button" class="btn-recusar-agend" data-id="${ag.id}">
            ✕ Recusar
          </button>
        ` : ""}

        ${numeroWhats ? `
          <button type="button" class="btn-notificar-zap" data-id="${ag.id}">
            💬 Enviar Confirmação no WhatsApp
          </button>
        ` : ""}

        <button type="button" class="btn-excluir-agend" data-id="${ag.id}" title="Excluir agendamento">
          🗑️ Excluir
        </button>
      </div>
    `;

    // Eventos dos botões de ação do proprietário
    const btnAceitar = card.querySelector(".btn-aceitar-bloquear");
    if (btnAceitar) {
      btnAceitar.addEventListener("click", () => alterarStatusAgendamento(ag.id, "aprovado"));
    }

    const btnRecusar = card.querySelector(".btn-recusar-agend");
    if (btnRecusar) {
      btnRecusar.addEventListener("click", () => alterarStatusAgendamento(ag.id, "recusado"));
    }

    const btnZap = card.querySelector(".btn-notificar-zap");
    if (btnZap) {
      btnZap.addEventListener("click", () => enviarConfirmacaoWhatsAppProprietario(ag));
    }

    const btnExcluir = card.querySelector(".btn-excluir-agend");
    if (btnExcluir) {
      btnExcluir.addEventListener("click", () => excluirAgendamento(ag.id));
    }

    listaContainer.appendChild(card);
  });
}

/**
 * Muda o status do agendamento (Ex: para 'aprovado' -> BLOQUEIA O HORÁRIO NO CALENDÁRIO)
 */
function alterarStatusAgendamento(agendamentoId, novoStatus) {
  const agendamentos = obterAgendamentos();
  const index = agendamentos.findIndex(ag => ag.id === agendamentoId);

  if (index === -1) return;

  agendamentos[index].status = novoStatus;
  salvarAgendamentos(agendamentos);

  // Se foi aprovado, avisa com destaque que o horário foi bloqueado
  if (novoStatus === "aprovado") {
    const ag = agendamentos[index];
    const dataBR = formatarDataParaBR(ag.data);
    alert(
      `✓ Agendamento ACEITO com sucesso!\n\n` +
      `Cliente: ${ag.nome}\nData: ${dataBR} às ${ag.horario}h\n\n` +
      `🔒 O horário das ${ag.horario}h foi AUTOMATICAMENTE BLOQUEADO no site para outros clientes!`
    );
  }

  renderizarPainelAdmin();
  renderizarGradeHorarios(); // Atualiza em tempo real o calendário do site!
}

function excluirAgendamento(agendamentoId) {
  if (!confirm("Deseja realmente excluir este agendamento do sistema?")) return;

  let agendamentos = obterAgendamentos();
  agendamentos = agendamentos.filter(ag => ag.id !== agendamentoId);
  salvarAgendamentos(agendamentos);

  renderizarPainelAdmin();
  renderizarGradeHorarios();
}

function enviarConfirmacaoWhatsAppProprietario(ag) {
  const foneLimpo = ag.telefone.replace(/\D/g, "");
  const numeroWhats = foneLimpo.startsWith("55") ? foneLimpo : (foneLimpo.length >= 10 ? `55${foneLimpo}` : "");

  if (!numeroWhats) {
    alert("Número de telefone inválido para envio de WhatsApp.");
    return;
  }

  const dataBR = formatarDataParaBR(ag.data);
  const msg =
    `Olá ${ag.nome}!\n\n` +
    `Aqui é da *Barbearia Rio Preto* em São José do Rio Preto.\n` +
    `Seu agendamento foi *CONFIRMADO* com sucesso!\n\n` +
    `📅 *Data:* ${dataBR}\n` +
    `⏰ *Horário:* ${ag.horario} horas\n` +
    `✂️ *Serviço:* ${ag.servico}\n` +
    `📍 *Endereço:* Rua Cel. Spínola de Castro, 3450 - Redentora / Centro\n\n` +
    `Estamos ansiosos para recebê-lo! Caso precise remarcar, por favor nos avise.`;

  const url = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ==================== 7. FORMULÁRIO DE ORÇAMENTO & WHATSAPP ====================
function inicializarFormularioOrcamento() {
  const form = document.getElementById("form-orcamento");
  const checkboxes = document.querySelectorAll('input[name="servicos"]');
  const listaResumo = document.getElementById("lista-resumo-servicos");
  const valorTotalEl = document.getElementById("valor-total-estimado");
  const msgRetorno = document.getElementById("form-msg-retorno");

  if (!form) return;

  checkboxes.forEach(chk => {
    chk.addEventListener("change", recalcularResumo);
  });

  function recalcularResumo() {
    if (!listaResumo || !valorTotalEl) return;

    listaResumo.innerHTML = "";
    let total = 0;
    const selecionados = [];

    checkboxes.forEach(chk => {
      if (chk.checked) {
        const preco = parseFloat(chk.dataset.preco) || 0;
        total += preco;
        selecionados.push({ nome: chk.value, preco });

        const li = document.createElement("li");
        li.innerHTML = `<span>${chk.value}</span><strong>R$ ${preco.toFixed(2).replace(".", ",")}</strong>`;
        listaResumo.appendChild(li);
      }
    });

    if (selecionados.length === 0) {
      listaResumo.innerHTML = '<li class="item-vazio">Nenhum serviço selecionado ainda. Marque os serviços abaixo.</li>';
    }

    valorTotalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
    return { total, selecionados };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("cliente-nome").value.trim();
    const whatsapp = document.getElementById("cliente-whatsapp").value.trim();
    const dataPref = document.getElementById("cliente-data").value;
    const periodo = document.getElementById("cliente-periodo").value;
    const obs = document.getElementById("cliente-observacao").value.trim();

    if (!nome) {
      alert("Por favor, preencha o seu nome completo.");
      return;
    }

    if (!whatsapp) {
      alert("Por favor, informe seu número de WhatsApp / telefone.");
      return;
    }

    const { total, selecionados } = recalcularResumo();

    if (selecionados.length === 0) {
      alert("Por favor, selecione ao menos um serviço para o orçamento.");
      return;
    }

    let dataFormatada = "A combinar";
    if (dataPref) {
      const [ano, mes, dia] = dataPref.split("-");
      dataFormatada = `${dia}/${mes}/${ano}`;
    }

    let texto = `*SOLICITAÇÃO DE ORÇAMENTO / AGENDAMENTO*\n`;
    texto += `*Barbearia Rio Preto • São José do Rio Preto - SP*\n\n`;
    texto += `👤 *Cliente:* ${nome}\n`;
    texto += `📱 *Telefone/WhatsApp:* ${whatsapp}\n\n`;
    texto += `✂️ *Serviço(s) Selecionado(s):*\n`;

    selecionados.forEach(s => {
      texto += `• ${s.nome} — R$ ${s.preco.toFixed(2).replace(".", ",")}\n`;
    });

    texto += `\n💰 *Total Estimado:* R$ ${total.toFixed(2).replace(".", ",")}\n`;
    texto += `📅 *Data Preferencial:* ${dataFormatada}\n`;
    texto += `⏰ *Período Desejado:* ${periodo}\n`;

    if (obs) {
      texto += `📝 *Observações:* ${obs}\n`;
    }

    texto += `\nOlá, gostaria de confirmar este orçamento e agendar o atendimento!`;

    const urlWhatsapp = `https://wa.me/${CONFIG_BARBEARIA.whatsappNumero}?text=${encodeURIComponent(texto)}`;

    if (msgRetorno) {
      msgRetorno.style.color = "var(--cor-ouro-claro)";
      msgRetorno.textContent = "✓ Redirecionando para o WhatsApp da Barbearia Rio Preto...";
    }

    window.open(urlWhatsapp, "_blank");
  });
}

// ==================== 8. BOTÕES "+ INCLUIR NO ORÇAMENTO" ====================
function inicializarBotoesIncluirServico() {
  const botoes = document.querySelectorAll(".btn-incluir");
  botoes.forEach(btn => {
    btn.addEventListener("click", () => {
      const nomeServico = btn.dataset.add;
      const chk = document.querySelector(`input[name="servicos"][value="${nomeServico}"]`);

      if (chk) {
        chk.checked = true;
        chk.dispatchEvent(new Event("change"));

        const secOrcamento = document.getElementById("orcamento");
        if (secOrcamento) {
          secOrcamento.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}

// ==================== 9. SINCRONIZAÇÃO DE CONTATOS E WHATSAPP ====================
function atualizarDadosContato() {
  const linkZap = document.getElementById("link-whatsapp-contato");
  const linkEmail = document.getElementById("link-email-contato");
  const zapFlutuante = document.getElementById("whatsapp-flutuante");
  const enderecoEl = document.getElementById("texto-endereco-contato");

  if (linkZap) {
    linkZap.textContent = `${CONFIG_BARBEARIA.whatsappExibicao} ↗`;
    linkZap.href = `https://wa.me/${CONFIG_BARBEARIA.whatsappNumero}?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20cortes%20e%20barba.`;
  }

  if (linkEmail) {
    linkEmail.textContent = `${CONFIG_BARBEARIA.email} ↗`;
    linkEmail.href = `mailto:${CONFIG_BARBEARIA.email}`;
  }

  if (zapFlutuante) {
    zapFlutuante.href = `https://wa.me/${CONFIG_BARBEARIA.whatsappNumero}?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20ou%20solicitar%20um%20or%C3%A7amento%20na%20Barbearia%20Rio%20Preto.`;
  }

  if (enderecoEl) {
    enderecoEl.innerHTML = `
      ${CONFIG_BARBEARIA.endereco.split(",")[0]}, ${CONFIG_BARBEARIA.endereco.split(",")[1]}<br>
      Bairro Redentora / Centro<br>
      ${CONFIG_BARBEARIA.cidade} • CEP 15015-500
    `;
  }
}

// ==================== 10. ANO AUTOMÁTICO NO RODAPÉ ====================
function atualizarAnoRodape() {
  const anoEl = document.getElementById("ano-atual");
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }
}
