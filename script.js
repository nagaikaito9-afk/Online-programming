// Firebase SDK (v9 モジュール版)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// ==========================================
// 1. Firebaseの設定 (あなたのプロジェクト情報)
// ==========================================
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

// DOM要素の取得
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userNameDisplay = document.getElementById('user-name');
const modeSelect = document.getElementById('mode-select');
const blocklyDiv = document.getElementById('blockly-div');
const pythonEditor = document.getElementById('python-editor');
const runBtn = document.getElementById('run-btn');
const outputArea = document.getElementById('output-area');

let workspace = null;

// ==========================================
// 2. Firebase 認証機能
// ==========================================
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch(error => {
        alert("ログインエラー: " + error.message);
        console.error(error);
    });
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        // ログイン状態
        loginScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        userNameDisplay.textContent = `${user.displayName} さん`;
        initBlockly(); // 画面が表示されてからBlocklyを起動
    } else {
        // ログアウト状態
        loginScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
    }
});

// ==========================================
// 3. Blockly (ブロックエディタ) の初期化
// ==========================================
function initBlockly() {
    if (!workspace) {
        workspace = Blockly.inject('blockly-div', {
            toolbox: document.getElementById('toolbox'),
            scrollbars: true,
            trashcan: true
        });
    }
}

// モード切り替え
modeSelect.addEventListener('change', (e) => {
    const mode = e.target.value;
    if (mode === 'block') {
        blocklyDiv.classList.remove('hidden');
        pythonEditor.classList.add('hidden');
        if (workspace) Blockly.svgResize(workspace);
    } else if (mode === 'python') {
        blocklyDiv.classList.add('hidden');
        pythonEditor.classList.remove('hidden');
    }
});

// ==========================================
// 4. プログラムの実行処理
// ==========================================

// Python実行時の出力を受け取る関数
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

runBtn.addEventListener('click', () => {
    const mode = modeSelect.value;
    outputArea.textContent = ""; // 出力エリアをリセット

    if (mode === 'block') {
        outputArea.textContent = "【ブロックモード】\n現在は組み立てたブロックの構成が保存されています。\nPythonモードに切り替えてコードを書いてみましょう！";
    } 
    else if (mode === 'python') {
        const pythonCode = pythonEditor.value;
        outputArea.textContent = "実行中...\n";

        // Skulptの設定
        Sk.pre = "output-area";
        Sk.configure({
            output: function(text) {
                outputArea.textContent += text; 
            },
            read: builtinRead
        });

        // Pythonコードの非同期実行
        let myPromise = Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, pythonCode, true);
        });

        myPromise.then(
            function(mod) {
                outputArea.textContent += "\n--- 実行完了 ---";
            },
            function(err) {
                outputArea.textContent = "【エラーが発生しました】\n" + err.toString();
            }
        );
    }
});