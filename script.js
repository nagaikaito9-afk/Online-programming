import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoTHIrURvePN07XFezsoPApiIjpKPOGnw",
  authDomain: "online-programming.firebaseapp.com",
  projectId: "online-programming",
  storageBucket: "online-programming.firebasestorage.app",
  messagingSenderId: "1039946769321",
  appId: "1:1039946769321:web:f3b8d24046745b57a51ab8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ==========================================
// 1. 多言語翻訳データ
// ==========================================
const translations = {
    'ja': {
        'app-title': 'プログラミング道場', 'login-prompt': '学習を記録するためにログインしましょう',
        'editor-title': '💻 エディタ', 'logout': 'ログアウト', 'lang-mode': 'モード:',
        'mode-block': 'ブロック', 'mode-python': 'Python', 'tutorial': 'チュートリアル',
        'import': 'ファイル読込', 'run': '▶ 実行', 'terminal': 'ターミナル',
        'msg-import-ok': 'ファイルを読み込みました。import {name} が使えます。'
    },
    'ja-kana': {
        'app-title': 'ぷろぐらみんぐ どうじょう', 'login-prompt': 'ろぐいん して はじめよう！',
        'editor-title': '💻 えでぃた', 'logout': 'おわる', 'lang-mode': 'もーど:',
        'mode-block': 'ぶろっく', 'mode-python': 'ぱいそん', 'tutorial': 'つかいかた',
        'import': 'ファイルをよむ', 'run': '▶ うごかす', 'terminal': 'けっか',
        'msg-import-ok': 'ファイルをよみこみました。'
    },
    'en': {
        'app-title': 'Code Dojo', 'login-prompt': 'Please log-in to save your progress',
        'editor-title': '💻 Editor', 'logout': 'Log-out', 'lang-mode': 'Mode:',
        'mode-block': 'Blocks', 'mode-python': 'Python', 'tutorial': 'Tutorial',
        'import': 'Import File', 'run': '▶ Run', 'terminal': 'Terminal',
        'msg-import-ok': 'File loaded. You can use import {name}.'
    }
    // es, fr も同様に定義可能（スペースの関係上省略、ja/enと同様に機能）
};

// ==========================================
// 2. チュートリアル・データ
// ==========================================
const tutorialData = {
    'block': {
        'ja': '<h3>ブロックの使い方</h3><p>左のパレットからブロックをドラッグして、右の広い場所に置いてつなげよう！「表示」カテゴリの「プリント」を使うと文字が出せるよ。</p>',
        'en': '<h3>How to use Blocks</h3><p>Drag blocks from the sidebar and snap them together. Use "Print" in the "Look" category to show text.</p>',
        'ja-kana': '<h3>ぶろっく の つかいかた</h3><p>ひだりから ぶろっく を もってきて つなげてね！「ひょうじ」の ぶろっく で もじが だせるよ。</p>'
    },
    'python': {
        'ja': '<h3>Pythonの基本</h3><p><b>print("文字")</b>: 画面に文字を出します。<br><b>if a == 1:</b>: 条件によって動きを変えます。<br><b>import math</b>: 数学の便利な機能を使えます。</p>',
        'en': '<h3>Python Basics</h3><p><b>print("text")</b>: Display text.<br><b>if a == 1:</b>: Conditional logic.<br><b>import math</b>: Use math library.</p>',
        'ja-kana': '<h3>ぱいそん の きほん</h3><p><b>print("もじ")</b>: もじを だします。<br><b>import random</b>: らんだむ な かずを つかえます。</p>'
    }
};

let currentLang = 'ja';
window.changeLang = function(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.getElementById('lang-selector').classList.add('hidden');
    if(workspace) Blockly.svgResize(workspace);
};

// ==========================================
// 3. ファイル・インポート機能
// ==========================================
const customModules = {};
document.getElementById('import-file-btn').addEventListener('click', () => document.getElementById('file-input').click());
document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const name = file.name.replace('.py', '');
        customModules[name] = e.target.result;
        // ターミナルに通知
        document.getElementById('output-area').textContent = `[System] ${name} Loaded.`;
    };
    reader.readAsText(file);
});

// ==========================================
// 4. 実行エンジン (Skulpt)
// ==========================================
function builtinRead(x) {
    if (customModules[x]) return customModules[x]; // 自作ファイルの読み込み
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

document.getElementById('run-btn').addEventListener('click', () => {
    const mode = document.getElementById('mode-select').value;
    const output = document.getElementById('output-area');
    output.textContent = "";

    let code = (mode === 'block') ? Blockly.Python.workspaceToCode(workspace) : document.getElementById('python-editor').value;

    Sk.configure({ output: (text) => { output.textContent += text; }, read: builtinRead });
    let myPromise = Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true));
    myPromise.catch(err => { output.textContent += err.toString(); });
});

// ==========================================
// 5. ログイン & UI制御
// ==========================================
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

loginBtn.addEventListener('click', () => signInWithPopup(auth, provider));
logoutBtn.addEventListener('click', () => signOut(auth));
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('user-name').textContent = user.displayName;
        initBlockly();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
    }
});

// Blockly & Tutorial Modals
let workspace = null;
function initBlockly() {
    if (!workspace) workspace = Blockly.inject('blockly-div', { toolbox: document.getElementById('toolbox') });
}

document.getElementById('lang-menu-btn').addEventListener('click', () => document.getElementById('lang-selector').classList.toggle('hidden'));
document.getElementById('tutorial-btn').addEventListener('click', () => {
    const mode = document.getElementById('mode-select').value;
    const text = tutorialData[mode][currentLang] || tutorialData[mode]['en'];
    document.getElementById('tutorial-text').innerHTML = text;
    document.getElementById('tutorial-modal').classList.remove('hidden');
});
document.getElementById('close-tutorial').addEventListener('click', () => document.getElementById('tutorial-modal').classList.add('hidden'));

// モード切り替え時にエディタをリサイズ
document.getElementById('mode-select').addEventListener('change', (e) => {
    const isBlock = e.target.value === 'block';
    document.getElementById('blockly-div').classList.toggle('hidden', !isBlock);
    document.getElementById('python-editor').classList.toggle('hidden', isBlock);
    if(isBlock && workspace) Blockly.svgResize(workspace);
});