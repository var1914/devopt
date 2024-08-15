const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const { LRUCache } = require('lru-cache');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3001;
const CLAUDE_API_KEY = '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';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Setup caching
const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 15 // 15 minutes
});

// Mock dashboard data storage
let dashboardData = {
  productivity: 85,
  codeQuality: 90,
  projectStatus: 'On Track'
};

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    console.log('Received message:', message.toString());
    try {
      const parsedMessage = JSON.parse(message.toString());
      if (parsedMessage.type === 'codeAnalysis') {
        console.log('Starting code analysis');
        
        const { code, language } = parsedMessage.data;
        
        // Check cache for AI analysis
        const cacheKey = `${language}:${code}`;
        const cachedAIAnalysis = cache.get(cacheKey);
        let aiAnalysis;
        if (cachedAIAnalysis) {
          console.log('Using cached AI analysis');
          aiAnalysis = cachedAIAnalysis;
        } else {
          // Perform AI analysis if not in cache
          console.log('Performing new AI analysis');
          aiAnalysis = await analyzeCodeWithClaude(code, language, ws);
          if (aiAnalysis) {
            cache.set(cacheKey, aiAnalysis);
          }
        }
        
        if (aiAnalysis) {
          console.log('Sending analysis results:', { ai: aiAnalysis });
          ws.send(JSON.stringify({ 
            type: 'analysisResult', 
            data: { ai: aiAnalysis }
          }));
          updateDashboardData({ ai: aiAnalysis });
          broadcastDashboardUpdate();
        } else {
          console.log('Analysis failed');
          ws.send(JSON.stringify({ type: 'error', message: 'Analysis failed' }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Error processing message' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

async function analyzeCodeWithClaude(code, language, ws) {
  const prompt = `
As an expert ${language} developer, analyze the following ${language} code. Provide a comprehensive analysis covering:

1. Syntax Errors: Identify any syntax errors or potential runtime errors.
2. Code Improvements: Suggest ways to improve code efficiency, readability, or maintainability.
3. Security Issues: Highlight any security vulnerabilities or potential risks.
4. Best Practices: Recommend adherence to ${language}-specific best practices and design patterns.
5. Performance Optimizations: Identify areas where performance could be improved.
6. Code Smells: Point out any code smells or anti-patterns.

For each issue or suggestion:
- Clearly state the problem or improvement opportunity
- Provide a detailed explanation of why it's important
- Offer a code snippet demonstrating the improved or corrected version
- If applicable, mention any trade-offs or alternative approaches

Code to analyze:

${code}

Provide your analysis in the following JSON format:

{
  "syntaxErrors": [
    {"issue": "...", "explanation": "...", "suggestion": "...", "codeSnippet": "..."}
  ],
  "improvements": [
    {"issue": "...", "explanation": "...", "suggestion": "...", "codeSnippet": "..."}
  ],
  "security": [
    {"issue": "...", "explanation": "...", "suggestion": "...", "codeSnippet": "..."}
  ],
  "bestPractices": [
    {"issue": "...", "explanation": "...", "suggestion": "...", "codeSnippet": "..."}
  ],
  "performance": [
    {"issue": "...", "explanation": "...", "suggestion": "...", "codeSnippet": "..."}
  ],
  "codeSmells": [
    {"issue": "...", "explanation": "...", "suggestion": "...", "codeSnippet": "..."}
  ]
}

Ensure that each category has at least one item, even if it's a positive comment about the code. If there are no issues in a category, provide a compliment on that aspect of the code. Please respond ONLY with the JSON object, without any additional text before or after it.
`;

  try {
    console.log(`Sending request to Claude API for ${language} analysis...`);
    const response = await axios.post(CLAUDE_API_URL, {
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });

    console.log('Received response from Claude API');
    const content = response.data.content[0].text;
    console.log('Claude response:', content);

    // Try to parse the entire response as JSON
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse entire response as JSON:', parseError);
      
      // If that fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.error('Failed to extract and parse JSON from response:', extractError);
        }
      }
      
      // If all parsing attempts fail, return a structured error message
      return {
        error: 'Failed to parse Claude response',
        rawResponse: content
      };
    }
  } catch (error) {
    console.error('Claude API error:', error.response ? error.response.data : error.message);
    ws.send(JSON.stringify({ type: 'error', message: 'Error during AI analysis' }));
    return null;
  }
}

function updateDashboardData(analysis) {
  const totalIssues = Object.values(analysis.ai).reduce((sum, category) => sum + category.length, 0);
  
  dashboardData.codeQuality = Math.max(0, 100 - (totalIssues * 2));
  dashboardData.productivity = Math.floor(Math.random() * 20) + 80; // Random value between 80-99
  dashboardData.projectStatus = totalIssues > 5 ? 'Needs Improvement' : 'On Track';
}

function broadcastDashboardUpdate() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'dashboardUpdate', data: dashboardData }));
    }
  });
}

server.listen(PORT, () => {
  console.log(`Local server running on http://localhost:${PORT}`);
});