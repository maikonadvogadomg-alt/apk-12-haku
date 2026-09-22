// ========================================
// PARTE 3: GERADOR DE ARQUIVOS APK E ELECTRON
// ========================================

function exibirGeradorAPK() {
  const gerador = document.getElementById('gerador-apk');
  const faltam = [];

  if (!projetoAtual.arquivos['AndroidManifest.xml']) faltam.push('AndroidManifest.xml');
  if (!projetoAtual.arquivos['build.gradle']) faltam.push('build.gradle');
  if (!projetoAtual.arquivos['proguard-rules.pro']) faltam.push('proguard-rules.pro');

  let html = '';

  if (faltam.length === 0) {
    html = `
            <div class="item ok">
                <div class="icone">✅</div>
                <div class="info">
                    <strong>Projeto APK Completo!</strong>
                    <small>Todos os arquivos necessários estão presentes</small>
                </div>
            </div>
        `;
  } else {
    html = '<p style="color: #cbd5e1; margin-bottom: 15px;">Arquivos faltantes para APK:</p>';
    faltam.forEach(arquivo => {
      html += `
                <button class="btn-sucesso" onclick="gerarArquivoAPK('${arquivo}')">
                    🔧 Gerar ${arquivo}
                </button>
            `;
    });
  }

  gerador.innerHTML = html;
}

function exibirGeradorElectron() {
  const gerador = document.getElementById('gerador-electron');
  const faltam = [];

  if (!projetoAtual.arquivos['main.js']) faltam.push('main.js');
  if (!projetoAtual.arquivos['preload.js']) faltam.push('preload.js');
  if (!projetoAtual.arquivos['package.json']) faltam.push('package.json');

  let html = '';

  if (faltam.length === 0) {
    html = `
            <div class="item ok">
                <div class="icone">✅</div>
                <div class="info">
                    <strong>Projeto Electron Completo!</strong>
                    <small>Todos os arquivos necessários estão presentes</small>
                </div>
            </div>
        `;
  } else {
    html = '<p style="color: #cbd5e1; margin-bottom: 15px;">Arquivos faltantes para Electron:</p>';
    faltam.forEach(arquivo => {
      html += `
                <button class="btn-sucesso" onclick="gerarArquivoElectron('${arquivo}')">
                    🔧 Gerar ${arquivo}
                </button>
            `;
    });
  }

  gerador.innerHTML = html;
}

function exibirGeradorGitHub() {
  const gerador = document.getElementById('gerador-github');
  const faltam = [];

  if (!projetoAtual.estrutura.some(e => e.includes('.github/workflows'))) {
    faltam.push('Workflows GitHub Actions');
  }

  let html = '';

  if (faltam.length === 0) {
    html = `
            <div class="item ok">
                <div class="icone">✅</div>
                <div class="info">
                    <strong>GitHub Actions Configurado!</strong>
                    <small>Workflows já existem no projeto</small>
                </div>
            </div>
        `;
  } else {
    html = '<p style="color: #cbd5e1; margin-bottom: 15px;">Configurar CI/CD:</p>';
    html += `
            <button class="btn-sucesso" onclick="gerarWorkflowAPK()">
                📱 Workflow APK
            </button>
            <button class="btn-sucesso" onclick="gerarWorkflowElectron()">
                🖥️ Workflow Electron
            </button>
        `;
  }

  gerador.innerHTML = html;
}

function gerarArquivoAPK(tipo) {
  let codigo = '';

  if (tipo === 'AndroidManifest.xml') {
    codigo = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.seu.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:theme="@style/AppTheme.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
  } else if (tipo === 'build.gradle') {
    codigo = `apply plugin: 'com.android.application'

android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"

    defaultConfig {
        applicationId "com.seu.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }

    signingConfigs {
        release {
            storeFile file("keystore.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}`;
  } else if (tipo === 'proguard-rules.pro') {
    codigo = `# ProGuard configuration

-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Manter classes principais
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# Manter métodos nativos
-keepclasseswithmembernames class * {
    native <methods>;
}`;
  }

  exibirCodigoGerado(tipo, codigo);
}

function gerarArquivoElectron(tipo) {
  let codigo = '';

  if (tipo === 'main.js') {
    codigo = `const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        }
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : \`file://\${path.join(__dirname, '../build/index.html')}\`;

    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});`;
  } else if (tipo === 'preload.js') {
    codigo = `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        on: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        },
        invoke: (channel, data) => {
            return ipcRenderer.invoke(channel, data);
        }
    }
});`;
  } else if (tipo === 'package.json') {
    codigo = `{
  "name": "seu-app",
  "version": "1.0.0",
  "description": "Aplicativo Electron",
  "main": "public/electron.js",
  "homepage": "./",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "electron-is-dev": "^2.0.0"
  },
  "devDependencies": {
    "electron": "^latest",
    "electron-builder": "^latest"
  },
  "scripts": {
    "react-start": "react-scripts start",
    "react-build": "react-scripts build",
    "electron-start": "electron .",
    "start": "concurrently \\"npm run react-start\\" \\"wait-on http://localhost:3000 && npm run electron-start\\"",
    "build": "npm run react-build && electron-builder"
  },
  "build": {
    "appId": "com.seu.app",
    "files": [
      "build/**/*",
      "node_modules/**/*"
    ],
    "directories": {
      "buildResources": "public"
    }
  }
}`;
  }

  exibirCodigoGerado(tipo, codigo);
}

function exibirCodigoGerado(nome, codigo) {
  document.getElementById('secaoCodigoGerado').style.display = 'block';
  document.getElementById('preCodigoGerado').textContent = codigo;
  document.getElementById('preCodigoGerado').dataset.nome = nome;
}

function copiarCodigo() {
  const codigo = document.getElementById('preCodigoGerado').textContent;
  navigator.clipboard.writeText(codigo).then(() => {
    alert('✅ Código copiado para a área de transferência!');
  });
}

function baixarCodigo() {
  const codigo = document.getElementById('preCodigoGerado').textContent;
  const nome = document.getElementById('preCodigoGerado').dataset.nome;

  const blob = new Blob([codigo], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nome;
  link.click();
}
