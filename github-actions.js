// ========================================
// PARTE 4: GERADOR DE GITHUB ACTIONS
// ========================================

function gerarWorkflowAPK() {
  const workflow = `name: Build APK

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'adopt'

    - name: Setup Android SDK
      uses: android-actions/setup-android@v2

    - name: Build APK
      run: |
        ./gradlew assembleRelease

    - name: Sign APK
      uses: r0adkll/sign-android-release@v1
      with:
        releaseDirectory: app/build/outputs/apk/release
        signingKeyBase64: \${{ secrets.SIGNING_KEY }}
        alias: \${{ secrets.ALIAS }}
        keyStorePassword: \${{ secrets.KEY_STORE_PASSWORD }}
        keyPassword: \${{ secrets.KEY_PASSWORD }}

    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release.apk
        path: app/build/outputs/apk/release/app-release-signed.apk

    - name: Create Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: v\${{ github.run_number }}
        release_name: Release v\${{ github.run_number }}
        draft: false
        prerelease: false`;

  exibirCodigoGerado('build-apk.yml', workflow);
}

function gerarWorkflowElectron() {
  const workflow = `name: Build Electron

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build React
      run: npm run react-build

    - name: Build Electron
      run: npm run build

    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: electron-builds-\${{ matrix.os }}
        path: dist/

    - name: Create Release
      if: startsWith(github.ref, 'refs/tags/')
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: \${{ github.ref }}
        release_name: Release \${{ github.ref }}
        draft: false
        prerelease: false`;

  exibirCodigoGerado('build-electron.yml', workflow);
}
