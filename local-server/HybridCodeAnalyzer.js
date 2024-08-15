const OpenAI = require('openai');
const { Parser } = require('tree-sitter');
const Python = require('tree-sitter-python');
const JavaScript = require('tree-sitter-javascript');
const { CodeBERT } = require('@huggingface/inference');
const { GPT2LMHeadModel, GPT2Tokenizer } = require('@xenova/transformers');

class HybridCodeAnalyzer {
  constructor(openAIApiKey) {
    this.openai = new OpenAI({ apiKey: openAIApiKey });
    this.parser = new Parser();
    this.codeBERT = new CodeBERT({ model: 'microsoft/codebert-base' });
    this.gpt2 = null;
    this.gpt2Tokenizer = null;
    this.initializeModels();
  }

  async initializeModels() {
    this.gpt2 = await GPT2LMHeadModel.from_pretrained('gpt2');
    this.gpt2Tokenizer = await GPT2Tokenizer.from_pretrained('gpt2');
    console.log('Local models initialized successfully');
  }

  setLanguage(language) {
    switch (language.toLowerCase()) {
      case 'python':
        this.parser.setLanguage(Python);
        break;
      case 'javascript':
        this.parser.setLanguage(JavaScript);
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  async analyzeCode(code, language) {
    try {
      // First, try to use the OpenAI API
      return await this.analyzeWithOpenAI(code, language);
    } catch (error) {
      console.error('OpenAI API error:', error);
      console.log('Falling back to local models');
      return await this.analyzeWithLocalModels(code, language);
    }
  }

  async analyzeWithOpenAI(code, language) {
    const prompt = `
As an expert ${language} developer, analyze the following ${language} code. Provide a comprehensive analysis covering:

1. Syntax Errors: Identify any syntax errors or potential runtime errors.
2. Code Improvements: Suggest ways to improve code efficiency, readability, or maintainability.
3. Security Issues: Highlight any security vulnerabilities or potential risks.
4. Best Practices: Recommend adherence to ${language}-specific best practices and design patterns.

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
  ]
}

Ensure that each category has at least one item, even if it's a positive comment about the code.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.2,
    });
    return JSON.parse(response.choices[0].message.content);
  }

  async analyzeWithLocalModels(code, language) {
    this.setLanguage(language);
    const segments = this.parseCode(code);
    const analysisPromises = segments.map(segment => this.analyzeCodeSegment(segment));
    const analysisResults = await Promise.all(analysisPromises);

    return {
      syntaxErrors: this.extractIssues(analysisResults, 'syntax'),
      improvements: this.extractIssues(analysisResults, 'improvement'),
      security: this.extractIssues(analysisResults, 'security'),
      bestPractices: this.extractIssues(analysisResults, 'best practice')
    };
  }

  parseCode(code) {
    const tree = this.parser.parse(code);
    return this.traverseTree(tree.rootNode);
  }

  traverseTree(node, segments = []) {
    if (node.type === 'function_definition' || node.type === 'class_definition') {
      segments.push(node.text);
    }
    for (let child of node.children) {
      this.traverseTree(child, segments);
    }
    return segments;
  }

  async analyzeCodeSegment(segment) {
    const codeBertAnalysis = await this.codeBERT.generate(segment);
    const gpt2Input = await this.gpt2Tokenizer.encode(codeBertAnalysis);
    const gpt2Output = await this.gpt2.generate(gpt2Input);
    const explanation = await this.gpt2Tokenizer.decode(gpt2Output[0]);
    return { segment, codeBertAnalysis, explanation };
  }

  extractIssues(analysisResults, category) {
    return analysisResults
      .filter(result => result.codeBertAnalysis.toLowerCase().includes(category))
      .map(result => ({
        issue: result.codeBertAnalysis,
        explanation: result.explanation,
        suggestion: `Consider reviewing this ${category} issue`,
        codeSnippet: result.segment
      }));
  }
}

module.exports = HybridCodeAnalyzer;