// Firebase SDK のインポート (v9 モジュール版)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// TODO: Firebaseコンソールでプロジェクトを作成し、以下の設定を自分のものに置き換えてください
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM要素の取得
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const modeSelect = document.getElementById('mode-select');
const blocklyDiv = document.getElementById('blockly-div');
const pythonEditor = document.getElementById('python-editor');
const runBtn = document.getElementById('run-btn');
const outputArea = document.getElementById('output-area');

// 1. Firebase 認証処理
// ログインボタンのクリックイベント
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch((error) => {
        console.error("ログインエラー:", error);
        alert("ログインに失敗しました。");
    });
});

// ログアウトボタンのクリックイベント
logoutBtn.addEventListener('click', () => {
    signOut(auth).catch((error) => console.error("ログアウトエラー:", error));
});

// ログイン状態の監視
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ログイン成功時
        loginScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initBlockly(); // 画面が表示されてからBlocklyを初期化する
    } else {
        // ログアウト時
        loginScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
    }
});

// 2. Blockly (ブロックエディタ) の設定
let workspace = null;
function initBlockly() {
    if (!workspace) {
        workspace = Blockly.inject('blockly-div', {
            toolbox: document.getElementById('toolbox'),
            scrollbars: true,
            trashcan: true
        });
    }
}

// 3. エディタモードの切り替え処理
modeSelect.addEventListener('change', (e) => {
    const mode = e.target.value;
    if (mode === 'block') {
        blocklyDiv.classList.remove('hidden');
        pythonEditor.classList.add('hidden');
    } else if (mode === 'python') {
        blocklyDiv.classList.add('hidden');
        pythonEditor.classList.remove('hidden');
    }
});

// 4. コード実行ボタンの処理 (モックアップ)
runBtn.addEventListener('click', () => {
    const mode = modeSelect.value;
    outputArea.textContent = "実行中...\n";

    if (mode === 'block') {
        // 注: 実際にブロックの論理を実行するには Blockly.JavaScript.workspaceToCode などを利用します
        outputArea.textContent += "ブロックプログラミングの実行結果がここに表示されます。";
    } else {
        const pythonCode = pythonEditor.value;
        // 注: ブラウザ上でPythonを実行するには Brython や Pyodide などの導入が必要です
        outputArea.textContent += `以下のPythonコードの実行を試みました:\n\n${pythonCode}\n\n(※実際のPython実行にはバックエンドAPIかPyodide等のライブラリが必要です)`;
    }
});