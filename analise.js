// ========================================
// PARTE 2: ANÁLISE DE PROJETOS
// ========================================

let projetoAtual = {
  nome: '',
  tipo: '', // 'web', 'electron', 'react-native', 'flutter'
  arquivos: {},
  estrutura: [],
  config: {}
};

let arquivosExtraidos = {};

// ── UPLOAD E EXTRAÇÃO ──
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processarArquivo(files[0]);
  }
});

function selecionarArquivo() {
  fileInput.click();
}

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    processarArquivo(e.target.files[0]);
  }
});

async function processarArquivo(file) {
  const status = document.getElementById('statusUpload');
  status.innerHTML = '<div class="spinner"></div> Processando arquivo...';

  try {
    const buffer = await file.arrayBuffer();
    const nomeArquivo = file.name.toLowerCase();

    if (nomeArquivo.endsWith('.zip')) {
      await extrairZip(buffer);
    } else if (nomeArquivo.endsWith('.tar') || nomeArquivo.endsWith('.tar.gz') || nomeArquivo.endsWith('.taz')) {
      await extrairTar(buffer);
    } else {
      throw new Error('Formato não suportado. Use ZIP, TAR ou TAZ');
    }

    status.innerHTML = '✅ Arquivo processado com sucesso!';
    analisarProjeto();
  } catch (erro) {
    status.innerHTML = `❌ Erro: ${erro.message}`;
    console.error(erro);
  }
}

async function extrairZip(buffer) {
  const zip = new JSZip();
  await zip.loadAsync(buffer);

  arquivosExtraidos = {};

  for (const [caminho, arquivo] of Object.entries(zip.files)) {
    if (!arquivo.dir) {
      try {
        const conteudo = await arquivo.async('string');
        arquivosExtraidos[caminho] = {
          conteudo: conteudo,
          tipo: detectarTipo(caminho)
        };
      } catch (e) {
        // Tentar como binário
        const binario = await arquivo.async('arraybuffer');
        arquivosExtraidos[caminho] = {
          conteudo: binario,
          tipo: 'binário'
        };
      }
    }
  }
}

async function extrairTar(buffer) {
  // Simular extração TAR (em produção, usar biblioteca apropriada)
  arquivosExtraidos = {
    'package.json': { conteudo: '{}', tipo: 'json' },
    'README.md': { conteudo: '# Projeto', tipo: 'markdown' }
  };
}

function detectarTipo(caminho) {
  const ext = caminho.split('.').pop().toLowerCase();
  const tipos = {
    'json': 'json',
    'js': 'javascript',
    'ts': 'typescript',
    'html': 'html',
    'css': 'css',
    'xml': 'xml',
    'gradle': 'gradle',
    'pro': 'proguard',
    'md': 'markdown',
    'yml': 'yaml',
    'yaml': 'yaml',
    'png': 'imagem',
    'jpg': 'imagem',
    'jpeg': 'imagem',
    'svg': 'imagem'
  };
  return tipos[ext] || 'desconhecido';
}

function analisarProjeto() {
  projetoAtual.arquivos = {};
  projetoAtual.estrutura = [];

  // Detectar tipo de projeto
  if (arquivosExtraidos['package.json']) {
    projetoAtual.tipo = 'web';
    if (arquivosExtraidos['electron.js'] || arquivosExtraidos['main.js']?.conteudo?.includes('electron')) {
      projetoAtual.tipo = 'electron';
    }
  }

  if (arquivosExtraidos['AndroidManifest.xml']) {
    projetoAtual.tipo = 'android';
  }

  if (arquivosExtraidos['pubspec.yaml']) {
    projetoAtual.tipo = 'flutter';
  }

  // Mapear arquivos encontrados
  for (const [caminho, arquivo] of Object.entries(arquivosExtraidos)) {
    const nomeArquivo = caminho.split('/').pop();
    projetoAtual.arquivos[nomeArquivo] = true;
    projetoAtual.estrutura.push(caminho);
  }

  exibirAnalise();
  exibirArvore();
  exibirGeradores();
}

function exibirAnalise() {
  const analise = document.getElementById('analise');
  const verificacoes = [
    { nome: 'package.json', desc: 'Dependências Node.js', obrigatorio: true },
    { nome: 'AndroidManifest.xml', desc: 'Configuração Android', obrigatorio: false },
    { nome: 'main.js', desc: 'Arquivo principal', obrigatorio: false },
    { nome: 'index.html', desc: 'Página inicial', obrigatorio: false },
    { nome: 'build.gradle', desc: 'Build Android', obrigatorio: false },
    { nome: '.github/workflows', desc: 'GitHub Actions', obrigatorio: false },
    { nome: 'electron.js', desc: 'Configuração Electron', obrigatorio: false }
  ];

  let html = '';
  let total = verificacoes.length;
  let encontrados = 0;

  verificacoes.forEach(item => {
    const existe = projetoAtual.arquivos[item.nome] ||
      projetoAtual.estrutura.some(e => e.includes(item.nome));

    if (existe) encontrados++;

    const classe = existe ? 'ok' : 'falta';
    const icone = existe ? '✅' : '❌';

    html += `
            <div class="item ${classe}">
                <div class="icone">${icone}</div>
                <div class="info">
                    <strong>${item.nome}</strong>
                    <small>${item.desc}</small>
                </div>
            </div>
        `;
  });

  analise.innerHTML = html;

  // Atualizar resumo
  const percentual = Math.round((encontrados / total) * 100);
  document.getElementById('resumo').innerHTML = `
        <strong>Tipo: ${projetoAtual.tipo.toUpperCase()}</strong>
        <p>Completude: ${percentual}%</p>
        <p>${encontrados} de ${total} arquivos</p>
    `;

  document.getElementById('progressoBarra').style.width = percentual + '%';
}

function exibirArvore() {
  const arvore = document.getElementById('arvore');
  const estrutura = construirArvore(projetoAtual.estrutura);
  arvore.innerHTML = `<pre>${estrutura}</pre>`;
}

function construirArvore(arquivos) {
  const raiz = {};

  arquivos.forEach(caminho => {
    const partes = caminho.split('/');
    let atual = raiz;

    partes.forEach((parte, idx) => {
      if (!atual[parte]) {
        atual[parte] = {};
      }
      atual = atual[parte];
    });
  });

  return renderizarArvore(raiz, '', true);
}

function renderizarArvore(obj, prefixo = '', ehRaiz = false) {
  const chaves = Object.keys(obj);
  let resultado = '';

  chaves.forEach((chave, idx) => {
    const ehUltimo = idx === chaves.length - 1;
    const simbolo = ehUltimo ? '└── ' : '├── ';
    const icone = Object.keys(obj[chave]).length > 0 ? '📁' : '📄';

    resultado += `${prefixo}${simbolo}${icone} ${chave}\n`;

    if (Object.keys(obj[chave]).length > 0) {
      const novoPrefix = prefixo + (ehUltimo ? '    ' : '│   ');
      resultado += renderizarArvore(obj[chave], novoPrefix);
    }
  });

  return resultado;
}

function exibirGeradores() {
  exibirGeradorAPK();
  exibirGeradorElectron();
  exibirGeradorGitHub();
}

function limparTudo() {
  fileInput.value = '';
  arquivosExtraidos = {};
  projetoAtual = {
    nome: '',
    tipo: '',
    arquivos: {},
    estrutura: [],
    config: {}
  };

  document.getElementById('statusUpload').innerHTML = '';
  document.getElementById('analise').innerHTML = '<p style="color: #cbd5e1;">Importe um projeto</p>';
  document.getElementById('arvore').innerHTML = '<p style="color: #cbd5e1;">Estrutura aparecerá aqui</p>';
  document.getElementById('gerador-apk').innerHTML = '';
  document.getElementById('gerador-electron').innerHTML = '';
  document.getElementById('gerador-github').innerHTML = '';
  document.getElementById('resumo').innerHTML = '<p style="color: #cbd5e1;">Nenhum projeto</p>';
  document.getElementById('progressoBarra').style.width = '0%';
}

function mudarAba(aba) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('ativo'));
  document.querySelectorAll('.tab-conteudo').forEach(tab => tab.classList.remove('ativo'));

  event.target.classList.add('ativo');
  document.getElementById(`aba-${aba}`).classList.add('ativo');
}
