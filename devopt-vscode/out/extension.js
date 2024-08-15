"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ws_1 = __importDefault(require("ws"));
let socket;
let analysisTimeout;
function activate(context) {
    console.log('DevGenius extension is now active!');
    // Initialize WebSocket connection
    initializeWebSocket();
    // Register the manual analysis command
    let disposable = vscode.commands.registerCommand('devgenius.analyzeCode', () => {
        analyzeCurrentDocument();
    });
    // Set up real-time analysis
    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            if (analysisTimeout) {
                clearTimeout(analysisTimeout);
            }
            analysisTimeout = setTimeout(() => analyzeCurrentDocument(), 1000); // 1 second delay
        }
    });
    context.subscriptions.push(disposable);
}
function initializeWebSocket() {
    socket = new ws_1.default('ws://localhost:3001');
    socket.on('open', () => console.log('Connected to DevGenius'));
    socket.on('message', handleAnalysisResult);
    socket.on('error', (error) => {
        vscode.window.showErrorMessage(`DevGenius connection error: ${error.message}`);
    });
    socket.on('close', () => {
        console.log('Disconnected from DevGenius. Attempting to reconnect...');
        setTimeout(initializeWebSocket, 5000); // Attempt to reconnect after 5 seconds
    });
}
function analyzeCurrentDocument() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const code = document.getText();
        const language = document.languageId;
        sendCodeForAnalysis(code, language);
    }
}
function sendCodeForAnalysis(code, language) {
    if (socket && socket.readyState === ws_1.default.OPEN) {
        socket.send(JSON.stringify({ type: 'codeAnalysis', data: { code, language } }));
    }
    else {
        console.log('WebSocket not ready. Attempting to reconnect...');
        initializeWebSocket();
    }
}
function handleAnalysisResult(message) {
    const result = JSON.parse(message.toString());
    if (result.type === 'analysisResult') {
        const analysis = result.data.ai;
        displayAnalysisResults(analysis);
    }
    else if (result.type === 'error') {
        vscode.window.showErrorMessage(`DevGenius analysis error: ${result.message}`);
    }
}
function displayAnalysisResults(analysis) {
    const panel = vscode.window.createWebviewPanel('devgeniusResults', 'DevGenius Analysis Results', vscode.ViewColumn.Beside, {});
    panel.webview.html = getWebviewContent(analysis);
}
function getWebviewContent(analysis) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DevGenius Analysis</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                h1 { color: #333; }
                h2 { color: #666; margin-top: 20px; }
                ul { padding-left: 20px; }
                li { margin-bottom: 10px; }
                pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>DevGenius Analysis Results</h1>
            ${Object.entries(analysis).map(([category, suggestions]) => `
                <h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                <ul>
                    ${suggestions.map(suggestion => `
                        <li>
                            <strong>${suggestion.issue}</strong>
                            <p>${suggestion.explanation}</p>
                            <p><strong>Suggestion:</strong> ${suggestion.suggestion}</p>
                            ${suggestion.codeSnippet ? `<pre><code>${suggestion.codeSnippet}</code></pre>` : ''}
                        </li>
                    `).join('')}
                </ul>
            `).join('')}
        </body>
        </html>
    `;
}
function deactivate() {
    if (socket) {
        socket.close();
    }
}
//# sourceMappingURL=extension.js.map