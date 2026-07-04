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

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userNameDisplay = document.getElementById('user-name');
const loginErrorMsg = document.getElementById('login-error-msg'); // エラー表示用
const modeSelect = document.getElementById('mode-select');
const blocklyDiv = document.getElementById('blockly-div');
const pythonEditor = document.getElementById('python-editor');
const runBtn = document.getElementById('run-btn');
const outputArea = document.getElementById('output-area');

let workspace = null;

// Firebase 認証 (アラートを廃止)
loginBtn.addEventListener('click', () => {
    loginErrorMsg.textContent = ""; // エラーを一旦クリア
    signInWithPopup(auth, provider).catch(error => {
        // alertを使わず、画面上のテキストとしてエラーを表示
        loginErrorMsg.textContent = "ログインがキャンセルされたか、エラーが発生しました。";
        console.error(error);
    });
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        userNameDisplay.textContent = `${user.displayName} さん`;
        initBlockly(); 
    } else {
        loginScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
    }
});

// Blockly 初期化
function initBlockly() {
    if (!workspace) {
        workspace = Blockly.inject('blockly-div', {
            toolbox: document.getElementById('toolbox'),
            scrollbars: true,
            trashcan: true
        });
    }
}

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

// 実行処理
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

runBtn.addEventListener('click', () => {
    const mode = modeSelect.value;
    outputArea.textContent = ""; // 出力エリアを完全にリセット

    if (mode === 'block') {
        // 将来的にブロックの実行処理を入れる場合はここ
        outputArea.textContent = "ブロックモードは現在構築中です。";
    } 
    else if (mode === 'python') {
        const pythonCode = pythonEditor.value;

        Sk.pre = "output-area";
        Sk.configure({
            output: function(text) {
                // print文の出力のみを純粋に追加
                outputArea.textContent += text; 
            },
            read: builtinRead
        });

        let myPromise = Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, pythonCode, true);
        });

        myPromise.then(
            function(mod) {
                // 成功時の「実行完了」などの余計なメッセージは一切出さない
            },
            function(err) {
                // エラー時もalertは使わず、純粋にエラー内容のみを出力エリアに表示
                outputArea.textContent += err.toString();
            }
        );
    }
});