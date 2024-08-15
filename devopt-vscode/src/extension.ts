import * as vscode from 'vscode';
import WebSocket from 'ws';

let socket: WebSocket | undefined;
let analysisTimeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
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
    socket = new WebSocket('ws://localhost:3001');
    socket.on('open', () => console.log('Connected to DevGenius'));
    socket.on('message', handleAnalysisResult);
    socket.on('error', (error: Error) => {
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

function sendCodeForAnalysis(code: string, language: string) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'codeAnalysis', data: { code, language } }));
    } else {
        console.log('WebSocket not ready. Attempting to reconnect...');
        initializeWebSocket();
    }
}

function handleAnalysisResult(message: WebSocket.Data) {
    const result = JSON.parse(message.toString());
    if (result.type === 'analysisResult') {
        const analysis = result.data.ai;
        displayAnalysisResults(analysis);
    } else if (result.type === 'error') {
        vscode.window.showErrorMessage(`DevGenius analysis error: ${result.message}`);
    }
}

function displayAnalysisResults(analysis: any) {
    const panel = vscode.window.createWebviewPanel(
        'devgeniusResults',
        'DevGenius Analysis Results',
        vscode.ViewColumn.Beside,
        {}
    );

    panel.webview.html = getWebviewContent(analysis);
}

function getWebviewContent(analysis: any) {
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
                    ${(suggestions as any[]).map(suggestion => `
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

export function deactivate() {
    if (socket) {
        socket.close();
    }
}