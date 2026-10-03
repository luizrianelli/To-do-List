(function(){
  const DIASSEMANA = ['DOM','SEG','TER','QUA','QUI','SEX','SAB'];
  const NOMESDIASSEMANA = {DOM:'Domingo',SEG:'Segunda-feira',TER:'Terça-feira',QUA:'Quarta-feira',QUI:'Quinta-feira',SEX:'Sexta-feira',SAB:'Sábado'};
  const ABREVIACAODIASSEMANA = {DOM:'Dom',SEG:'Seg',TER:'Ter',QUA:'Qua',QUI:'Qui',SEX:'Sex',SAB:'Sáb'};
  const INDICEDIASEMANAINGLES = {Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
  const ICONES = ['🗂️','📚','🎯','🏋️','🎨','🍽️','✈️','💰','🎮','🌱','🎵','🧾'];
  const PALETA = [
    {corFundo:'#e5edfb',corTexto:'#3f6fc9'}, {corFundo:'#efe7fb',corTexto:'#7a55c9'}, {corFundo:'#fdf3d6',corTexto:'#a8821f'},
    {corFundo:'#eef0ef',corTexto:'#6c7570'}, {corFundo:'#e2f6ea',corTexto:'#2f9a63'}, {corFundo:'#fde2e2',corTexto:'#c14d4d'},
    {corFundo:'#e2f0fb',corTexto:'#2f7fae'}, {corFundo:'#f5e2fb',corTexto:'#9a4dae'}
  ];
  const FUSOHORARIO = 'America/Sao_Paulo';
  const CHAVEARMAZENAMENTO = 'tarefasApp.dados';

  
  function completarZero(n){ return String(n).padStart(2,'0'); }

  function obterAgoraBrasilia(){
    const formatador = new Intl.DateTimeFormat('en-US', {
      timeZone: FUSOHORARIO, year:'numeric', month:'2-digit', day:'2-digit',
      weekday:'long', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
    });
    const partes = {};
    formatador.formatToParts(new Date()).forEach(p => { partes[p.type] = p.value; });
    return {
      ano: parseInt(partes.year, 10),
      mes: parseInt(partes.month, 10) - 1, 
      dia: parseInt(partes.day, 10),
      indiceDiaSemana: INDICEDIASEMANAINGLES[partes.weekday]
    };
  }

  function horarioBrasiliaTexto(){
    
    return new Date().toLocaleTimeString('pt-BR', {
      timeZone: FUSOHORARIO, hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  function paraISO(ano, mes, dia){ return ano + '-' + completarZero(mes+1) + '-' + completarZero(dia); }
  function analisarISO(iso){ const [a,m,d] = iso.split('-').map(Number); return { ano:a, mes:m-1, dia:d }; }
  function dataDeISO(iso){ const {ano,mes,dia} = analisarISO(iso); return new Date(ano, mes, dia, 12); }
  function diaSemanaDeISO(iso){ return DIASSEMANA[dataDeISO(iso).getDay()]; }
  function adicionarDiasISO(iso, quantidade){
    const dt = dataDeISO(iso);
    dt.setDate(dt.getDate() + quantidade);
    return paraISO(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  const agoraBR = obterAgoraBrasilia();
  const hojeISO = paraISO(agoraBR.ano, agoraBR.mes, agoraBR.dia);
  const hojeCodigo = DIASSEMANA[agoraBR.indiceDiaSemana];
  const amanhaISO = adicionarDiasISO(hojeISO, 1);

  function formatarDataLonga(iso){
    return dataDeISO(iso).toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });
  }
  function formatarDataCurta(iso){
    return dataDeISO(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
  }

  let proximoId = 100;
  let estado = {
    visualizacao: 'hoje',
    dataAtiva: hojeISO,
    anoCalendario: agoraBR.ano,
    mesCalendario: agoraBR.mes,
    buscaTexto: '',
    usuario: { nome:'Luiz Rianelli', email:'luizfrianellifv@gmail.com' },
    listas: [
      {chave:'trabalho', nome:'Trabalho', icone:'💼', corFundo:PALETA[0].corFundo, corTexto:PALETA[0].corTexto},
      {chave:'pessoal', nome:'Pessoal', icone:'👤', corFundo:PALETA[1].corFundo, corTexto:PALETA[1].corTexto},
      {chave:'compras', nome:'Compras', icone:'🛒', corFundo:PALETA[2].corFundo, corTexto:PALETA[2].corTexto}
    ],
    categoriasExtras: [
      {chave:'cliente', nome:'Cliente', icone:'🤝', corFundo:PALETA[3].corFundo, corTexto:PALETA[3].corTexto},
      {chave:'saude', nome:'Saúde', icone:'💊', corFundo:PALETA[4].corFundo, corTexto:PALETA[4].corTexto}
    ],
    tarefas: [
      {id:1, titulo:'Enviar orçamento para o cliente', horario:'14:30', categoria:'cliente', dias:[], data:hojeISO, prioridade:false, favorito:true, concluida:false},
      {id:2, titulo:'Estudar Java', horario:'17:00', categoria:'pessoal', dias:['SEG', 'TER', 'QUA', 'QUI','SEX'], prioridade:false, favorito:false, concluida:true},
      {id:3, titulo:'Aula de boxe', horario:'19:00', categoria:'pessoal', dias:['SEG','QUA','SEX'], prioridade:false, favorito:false, concluida:false}
    ]
  };

   function salvarDados(){
    try{
      const dados = {
        tarefas: estado.tarefas,
        listas: estado.listas,
        usuario: estado.usuario,
        proximoId: proximoId
      };
      localStorage.setItem(CHAVEARMAZENAMENTO, JSON.stringify(dados));
    }catch(erro){
      console.warn('Não foi possível salvar os dados localmente:', erro);
    }
  }

  function carregarDadosSalvos(){
    try{
      const bruto = localStorage.getItem(CHAVEARMAZENAMENTO);
      if(!bruto) return;
      const dados = JSON.parse(bruto);
      if(Array.isArray(dados.tarefas)) estado.tarefas = dados.tarefas;
      if(Array.isArray(dados.listas)) estado.listas = dados.listas;
      if(dados.usuario) estado.usuario = dados.usuario;
      if(typeof dados.proximoId === 'number') proximoId = dados.proximoId;
    }catch(erro){
      console.warn('Não foi possível carregar os dados salvos:', erro);
    }
  }

  function todasCategorias(){ return estado.listas.concat(estado.categoriasExtras); }
  function obterCategoria(chave){ return todasCategorias().find(c => c.chave === chave); }

  function tarefaValePara(tarefa, iso){ return tarefa.dias.length ? tarefa.dias.includes(diaSemanaDeISO(iso)) : tarefa.data === iso; }
  function tarefasDoDiaAtivo(){ return estado.tarefas.filter(t => tarefaValePara(t, estado.dataAtiva)); }

  function obterTarefasDaVisualizacao(){
    const busca = estado.buscaTexto.trim().toLowerCase();
    if(busca) return estado.tarefas.filter(t => t.titulo.toLowerCase().includes(busca));
    switch(estado.visualizacao){
      case 'hoje': return tarefasDoDiaAtivo();
      case 'favoritos': return estado.tarefas.filter(t => t.favorito);
      case 'concluidas': return tarefasDoDiaAtivo().filter(t => t.concluida);
      default:
        if(obterCategoria(estado.visualizacao)) return estado.tarefas.filter(t => t.categoria === estado.visualizacao);
        return [];
    }
  }

  function formatarMeta(tarefa){
    const partes = [];
    if(tarefa.dias.length){
      partes.push('Toda ' + tarefa.dias.map(d => ABREVIACAODIASSEMANA[d]).join('/'));
    } else if(tarefa.data === hojeISO){
      partes.push('Hoje');
    } else if(tarefa.data === amanhaISO){
      partes.push('Amanhã');
    } else {
      partes.push(formatarDataCurta(tarefa.data));
    }
    if(tarefa.horario) partes.push(tarefa.horario);
    const categoria = obterCategoria(tarefa.categoria);
    partes.push(categoria ? categoria.nome : tarefa.categoria);
    return partes.join(' • ');
  }

  function htmlDaTag(tarefa){
    if(tarefa.prioridade) return '<span class="tag priority">Prioridade alta</span>';
    const categoria = obterCategoria(tarefa.categoria);
    if(!categoria) return '';
    return '<span class="tag" style="background:' + categoria.corFundo + ';color:' + categoria.corTexto + '">' + categoria.nome + '</span>';
  }

  function renderizarLinha(tarefa){
    return '' +
      '<div class="task-row ' + (tarefa.concluida ? 'done' : '') + '">' +
        '<div class="checkbox ' + (tarefa.concluida ? 'checked' : '') + '" data-id="' + tarefa.id + '">' + (tarefa.concluida ? '✓' : '') + '</div>' +
        '<div class="task-body">' +
          '<div class="task-title">' + tarefa.titulo + '</div>' +
          '<div class="task-meta">' + (tarefa.concluida ? 'Concluído' : formatarMeta(tarefa)) + '</div>' +
        '</div>' +
        '<button type="button" class="star-btn ' + (tarefa.favorito ? 'on' : '') + '" data-favorito="' + tarefa.id + '">' + (tarefa.favorito ? '★' : '☆') + '</button>' +
        htmlDaTag(tarefa) +
        '<div class="more-wrap">' +
          '<button type="button" class="more" data-mais="' + tarefa.id + '">⋯</button>' +
          '<div class="more-menu" id="menuMais-' + tarefa.id + '">' +
            '<button type="button" class="danger" data-excluir="' + tarefa.id + '">🗑 Excluir tarefa</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderizarListasMenu(){
    const container = document.getElementById('containerListas');
    container.innerHTML = estado.listas.map(l =>
      '<div class="nav-item clickable" data-visualizacao="' + l.chave + '">' +
        '<div class="left"><span class="icon">' + l.icone + '</span><span>' + l.nome + '</span></div>' +
        '<span class="count" data-contagem-para="' + l.chave + '">0</span>' +
      '</div>'
    ).join('');
    container.querySelectorAll('.nav-item[data-visualizacao]').forEach(el => {
      el.addEventListener('click', () => definirVisualizacao(el.getAttribute('data-visualizacao')));
    });
  }

  function montarOpcoesCategoria(){
    const campo = document.getElementById('campoCategoria');
    const anterior = campo.value;
    campo.innerHTML = todasCategorias().map(c => '<option value="' + c.chave + '">' + c.nome + '</option>').join('');
    if(obterCategoria(anterior)) campo.value = anterior;
  }

  
  function montarCalendario(){
    const ano = estado.anoCalendario, mes = estado.mesCalendario;
    const primeiroDiaSemana = new Date(ano, mes, 1, 12).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const nomeMes = new Date(ano, mes, 1, 12).toLocaleDateString('pt-BR', { month:'long' });

    document.getElementById('tituloCalendario').textContent = nomeMes + ' ' + ano;

    let celulasHtml = '';
    for(let i = 0; i < primeiroDiaSemana; i++) celulasHtml += '<div></div>';
    for(let dia = 1; dia <= diasNoMes; dia++){
      const iso = paraISO(ano, mes, dia);
      const classes = ['day'];
      if(iso === hojeISO) classes.push('today');
      if(iso === estado.dataAtiva && iso !== hojeISO) classes.push('selected');
      celulasHtml += '<div class="' + classes.join(' ') + '" data-iso="' + iso + '">' + dia + '</div>';
    }

    const grade = document.getElementById('gradeCalendario');
    grade.innerHTML = '<span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>' + celulasHtml;

    grade.querySelectorAll('.day[data-iso]').forEach(celula => {
      celula.addEventListener('click', () => {
        const iso = celula.getAttribute('data-iso');
        estado.dataAtiva = iso;
        estado.visualizacao = 'hoje';
        renderizar();
        abrirModalTarefa();
      });
    });
  }

  function renderizar(){
    const busca = estado.buscaTexto.trim();
    const pesquisando = !!busca;
    const tarefas = obterTarefasDaVisualizacao().slice().sort((a,b) => (a.concluida === b.concluida) ? 0 : (a.concluida ? 1 : -1));
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const percentual = total ? Math.round((concluidas/total)*100) : 0;
    const ehHoje = estado.dataAtiva === hojeISO;
    const mostraProgresso = !pesquisando && (estado.visualizacao === 'hoje' || estado.visualizacao === 'concluidas');

    document.getElementById('cartaoProgresso').classList.toggle('hidden', !mostraProgresso);

    let titulo, textoData;
    if(pesquisando){
      titulo = 'Resultados da busca';
      textoData = total + ' tarefa' + (total!==1?'s':'') + ' encontrada' + (total!==1?'s':'') + ' para "' + busca + '"';
    } else if(estado.visualizacao === 'hoje'){
      titulo = ehHoje ? 'Hoje' : capitalizar(formatarDataLonga(estado.dataAtiva));
      textoData = ehHoje ? capitalizar(formatarDataLonga(hojeISO)) : ('Visualizando: ' + capitalizar(formatarDataLonga(estado.dataAtiva)));
    } else if(estado.visualizacao === 'concluidas'){
      titulo = 'Concluídas';
      textoData = ehHoje ? capitalizar(formatarDataLonga(hojeISO)) : ('Visualizando: ' + capitalizar(formatarDataLonga(estado.dataAtiva)));
    } else if(estado.visualizacao === 'favoritos'){
      titulo = 'Favoritos';
      textoData = 'Todas as tarefas favoritadas, qualquer dia';
    } else {
      const categoria = obterCategoria(estado.visualizacao);
      titulo = categoria ? categoria.nome : 'Lista';
      textoData = 'Todas as tarefas desta lista, qualquer dia';
    }
    document.getElementById('tituloDia').textContent = titulo;
    document.getElementById('rotuloData').textContent = textoData;

    if(mostraProgresso){
      document.getElementById('valorProgresso').textContent = percentual + '% concluído';
      document.getElementById('preenchimentoProgresso').style.width = percentual + '%';
      document.getElementById('notaProgresso').textContent = total
        ? (concluidas + ' de ' + total + ' tarefa' + (total>1?'s':'') + ' concluída' + (concluidas!==1?'s':'') + (concluidas ? ' — continue assim!' : ''))
        : 'Nenhuma tarefa para este dia.';
    }

    document.getElementById('contagemTarefas').textContent = total + ' tarefa' + (total!==1?'s':'');

    document.getElementById('contagemHoje').textContent = tarefasDoDiaAtivo().length;
    document.getElementById('contagemFavoritos').textContent = estado.tarefas.filter(t=>t.favorito).length;
    document.getElementById('contagemConcluidas').textContent = tarefasDoDiaAtivo().filter(t=>t.concluida).length;
    document.querySelectorAll('[data-contagem-para]').forEach(el => {
      const chave = el.getAttribute('data-contagem-para');
      el.textContent = estado.tarefas.filter(t => t.categoria === chave).length;
    });

    document.querySelectorAll('.nav-item[data-visualizacao]').forEach(el => {
      el.classList.toggle('active', !pesquisando && el.getAttribute('data-visualizacao') === estado.visualizacao);
    });
    document.querySelectorAll('.m-tab[data-visualizacao]').forEach(el => {
      el.classList.toggle('active', !pesquisando && el.getAttribute('data-visualizacao') === estado.visualizacao);
    });

    const listaEl = document.getElementById('listaTarefas');
    let mensagemVazia;
    if(pesquisando) mensagemVazia = 'Nenhuma tarefa encontrada para "' + busca + '".';
    else if(estado.visualizacao === 'hoje') mensagemVazia = 'Nenhuma tarefa marcada para ' + (ehHoje ? 'hoje' : formatarDataLonga(estado.dataAtiva).toLowerCase()) + '.';
    else if(estado.visualizacao === 'concluidas') mensagemVazia = 'Nenhuma tarefa concluída ' + (ehHoje ? 'hoje' : ('em ' + formatarDataLonga(estado.dataAtiva).toLowerCase())) + '.';
    else if(estado.visualizacao === 'favoritos') mensagemVazia = 'Você ainda não favoritou nenhuma tarefa.';
    else { const categoria = obterCategoria(estado.visualizacao); mensagemVazia = 'Nenhuma tarefa em ' + (categoria ? categoria.nome : 'lista') + '.'; }

    listaEl.innerHTML = total === 0 ? '<div class="empty-note">' + mensagemVazia + '</div>' : tarefas.map(renderizarLinha).join('');

    listaEl.querySelectorAll('.checkbox[data-id]').forEach(el => {
      el.addEventListener('click', () => alternarTarefa(Number(el.getAttribute('data-id'))));
    });
    listaEl.querySelectorAll('.star-btn[data-favorito]').forEach(el => {
      el.addEventListener('click', () => alternarFavorito(Number(el.getAttribute('data-favorito'))));
    });
    listaEl.querySelectorAll('.more[data-mais]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = document.getElementById('menuMais-' + el.getAttribute('data-mais'));
        document.querySelectorAll('.more-menu.open').forEach(m => { if(m !== menu) m.classList.remove('open'); });
        menu.classList.toggle('open');
      });
    });
    listaEl.querySelectorAll('[data-excluir]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        excluirTarefa(Number(el.getAttribute('data-excluir')));
      });
    });

    document.getElementById('nomeUsuarioExibido').textContent = estado.usuario.nome;
    document.getElementById('emailUsuarioExibido').textContent = estado.usuario.email;
    document.getElementById('iniciaisAvatar').textContent = iniciais(estado.usuario.nome);
    document.getElementById('nomeSaudacao').textContent = 'Bom dia, ' + (estado.usuario.nome.split(' ')[0] || estado.usuario.nome);

    montarCalendario();
  }

  function capitalizar(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function iniciais(nome){
    const partes = nome.trim().split(/\s+/);
    if(partes.length === 1) return partes[0].slice(0,2).toUpperCase();
    return (partes[0][0] + partes[partes.length-1][0]).toUpperCase();
  }

  function alternarTarefa(id){
    const tarefa = estado.tarefas.find(t => t.id === id);
    if(tarefa){ tarefa.concluida = !tarefa.concluida; salvarDados(); renderizar(); }
  }
  function alternarFavorito(id){
    const tarefa = estado.tarefas.find(t => t.id === id);
    if(tarefa){ tarefa.favorito = !tarefa.favorito; salvarDados(); renderizar(); }
  }

  function excluirTarefa(id){
    const tarefa = estado.tarefas.find(t => t.id === id);
    if(!tarefa) return;
    if(!confirm('Excluir a tarefa "' + tarefa.titulo + '"?')) return;
    estado.tarefas = estado.tarefas.filter(t => t.id !== id);
    salvarDados();
    renderizar();
  }

  function definirVisualizacao(visualizacao){
    estado.visualizacao = visualizacao;
    estado.buscaTexto = '';
    document.getElementById('campoBusca').value = '';
    renderizar();
  }

  document.querySelectorAll('.nav-item[data-visualizacao]').forEach(el => {
    el.addEventListener('click', () => definirVisualizacao(el.getAttribute('data-visualizacao')));
  });
  document.querySelectorAll('.m-tab[data-visualizacao]').forEach(el => {
    el.addEventListener('click', () => definirVisualizacao(el.getAttribute('data-visualizacao')));
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.more-menu.open').forEach(m => m.classList.remove('open'));
  });

  document.getElementById('campoBusca').addEventListener('input', (e) => {
    estado.buscaTexto = e.target.value;
    renderizar();
  });

  
  function atualizarRelogio(){
    document.getElementById('relogioBrasilia').textContent = '🕒 ' + horarioBrasiliaTexto();
  }
  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);


  const modalTarefa = document.getElementById('modalTarefa');
  const formularioTarefa = document.getElementById('formularioTarefa');
  const seletorDias = document.getElementById('seletorDias');

  function montarSeletorDias(){
    seletorDias.innerHTML = DIASSEMANA.map(d => '<div class="day-chip" data-dia="' + d + '">' + ABREVIACAODIASSEMANA[d] + '</div>').join('');
    seletorDias.querySelectorAll('.day-chip').forEach(chip => chip.addEventListener('click', () => chip.classList.toggle('on')));
  }

  function abrirModalTarefa(){
    formularioTarefa.reset();
    montarOpcoesCategoria();
    seletorDias.querySelectorAll('.day-chip').forEach(c => c.classList.remove('on'));
    const ehHoje = estado.dataAtiva === hojeISO;
    document.getElementById('dicaDataModal').textContent = 'Para: ' + (ehHoje ? 'Hoje, ' : '') + capitalizar(formatarDataLonga(estado.dataAtiva));
    modalTarefa.classList.add('open');
  }
  function fecharModalTarefa(){ modalTarefa.classList.remove('open'); }

  document.getElementById('botaoNovaTarefa').addEventListener('click', abrirModalTarefa);
  document.getElementById('botaoNovaTarefaFab').addEventListener('click', abrirModalTarefa);
  document.getElementById('botaoCancelarModal').addEventListener('click', fecharModalTarefa);
  modalTarefa.addEventListener('click', (e) => { if(e.target === modalTarefa) fecharModalTarefa(); });

  formularioTarefa.addEventListener('submit', (e) => {
    e.preventDefault();
    const titulo = document.getElementById('campoTitulo').value.trim();
    if(!titulo) return;
    const categoria = document.getElementById('campoCategoria').value;
    const horario = document.getElementById('campoHorario').value;
    const prioridade = document.getElementById('campoPrioridade').checked;
    const dias = Array.from(seletorDias.querySelectorAll('.day-chip.on')).map(c => c.getAttribute('data-dia'));

    estado.tarefas.push({
      id: proximoId++, titulo, horario, categoria, prioridade, favorito:false,
      dias, data: dias.length ? null : estado.dataAtiva, concluida:false
    });
    salvarDados();
    fecharModalTarefa();
    renderizar();
  });

 
  const modalLista = document.getElementById('modalLista');
  const formularioLista = document.getElementById('formularioLista');
  const seletorIcones = document.getElementById('seletorIcones');
  let iconeSelecionado = ICONES[0];

  function montarSeletorIcones(){
    seletorIcones.innerHTML = ICONES.map((ic,i) => '<div class="icon-chip ' + (i===0?'on':'') + '" data-icone="' + ic + '">' + ic + '</div>').join('');
    seletorIcones.querySelectorAll('.icon-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        seletorIcones.querySelectorAll('.icon-chip').forEach(c => c.classList.remove('on'));
        chip.classList.add('on');
        iconeSelecionado = chip.getAttribute('data-icone');
      });
    });
  }

  function gerarChave(texto){
    let base = texto.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    if(!base) base = 'lista';
    let chave = base, i = 2;
    while(obterCategoria(chave)){ chave = base + '-' + i; i++; }
    return chave;
  }

  document.getElementById('botaoNovaLista').addEventListener('click', () => {
    formularioLista.reset();
    iconeSelecionado = ICONES[0];
    montarSeletorIcones();
    modalLista.classList.add('open');
  });
  document.getElementById('botaoCancelarLista').addEventListener('click', () => modalLista.classList.remove('open'));
  modalLista.addEventListener('click', (e) => { if(e.target === modalLista) modalLista.classList.remove('open'); });

  formularioLista.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('campoNomeLista').value.trim();
    if(!nome) return;
    const chave = gerarChave(nome);
    const cor = PALETA[(estado.listas.length + estado.categoriasExtras.length) % PALETA.length];
    estado.listas.push({ chave, nome, icone:iconeSelecionado, corFundo:cor.corFundo, corTexto:cor.corTexto });
    salvarDados();
    renderizarListasMenu();
    modalLista.classList.remove('open');
    definirVisualizacao(chave);
  });

  
  const modalPerfil = document.getElementById('modalPerfil');
  const formularioPerfil = document.getElementById('formularioPerfil');

  document.getElementById('gatilhoPerfil').addEventListener('click', () => {
    document.getElementById('campoNomePerfil').value = estado.usuario.nome;
    document.getElementById('campoEmailPerfil').value = estado.usuario.email;
    modalPerfil.classList.add('open');
  });
  document.getElementById('botaoCancelarPerfil').addEventListener('click', () => modalPerfil.classList.remove('open'));
  modalPerfil.addEventListener('click', (e) => { if(e.target === modalPerfil) modalPerfil.classList.remove('open'); });

  formularioPerfil.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('campoNomePerfil').value.trim();
    const email = document.getElementById('campoEmailPerfil').value.trim();
    if(!nome || !email) return;
    estado.usuario = { nome, email };
    salvarDados();
    modalPerfil.classList.remove('open');
    renderizar();
  });

  carregarDadosSalvos();
  renderizarListasMenu();
  montarSeletorDias();
  montarOpcoesCategoria();
  renderizar();
})();
