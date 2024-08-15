import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, AlertTriangle, Check } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import debounce from 'lodash/debounce';

interface Suggestion {
  suggestion: string;
  explanation: string;
  codeSnippet?: string;
}

interface AIAnalysis {
  syntaxErrors: Suggestion[];
  improvements: Suggestion[];
  security: Suggestion[];
  bestPractices: Suggestion[];
}

interface AICompanionProps {
  codeInput: string;
}

const LANGUAGES = [
  'Python', 'JavaScript', 'Java', 'C++', 'Ruby', 'Go', 'Rust', 'PHP', 'C#', 'Swift'
];

const AICompanion: React.FC<AICompanionProps> = ({ codeInput }) => {
  const [language, setLanguage] = useState<string>('Python');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { lastMessage, sendMessage, connectionStatus } = useWebSocket('ws://localhost:3001');

  useEffect(() => {
    if (lastMessage) {
      console.log('Processing received message:', lastMessage);
      if (lastMessage.type === 'analysisResult' || lastMessage.type === 'partialAnalysisResult') {
        setAiAnalysis(prevAnalysis => ({
          ...prevAnalysis,
          ...lastMessage.data.ai
        }));
        setIsAnalyzing(lastMessage.type === 'partialAnalysisResult');
      } else if (lastMessage.type === 'error') {
        setError(lastMessage.message);
        setIsAnalyzing(false);
      } else if (lastMessage.type === 'heartbeat') {
        console.log('Received heartbeat');
      }
    }
  }, [lastMessage]);

  const debouncedAnalyzeCode = useCallback(
    debounce(() => {
      setIsAnalyzing(true);
      setError(null);
      console.log('Sending code for analysis');
      sendMessage({ type: 'codeAnalysis', data: { code: codeInput, language } });
    }, 1000),
    [codeInput, language, sendMessage]
  );

  useEffect(() => {
    if (connectionStatus === 'Connected' && codeInput) {
      debouncedAnalyzeCode();
    }
    return () => {
      debouncedAnalyzeCode.cancel();
    };
  }, [codeInput, language, debouncedAnalyzeCode, connectionStatus]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  const renderSuggestions = (category: string, suggestions: Suggestion[]) => (
    <div className="mb-4">
      <h4 className="font-bold mb-2">{category}</h4>
      {suggestions.length === 0 ? (
        <p className="text-green-600"><Check className="inline mr-2" />No issues found</p>
      ) : (
        <ul className="list-disc pl-5">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="mb-2">
              <p className="font-semibold">{suggestion.suggestion}</p>
              <p className="text-sm">{suggestion.explanation}</p>
              {suggestion.codeSnippet && (
                <pre className="bg-gray-100 p-2 mt-2 rounded">
                  <code>{suggestion.codeSnippet}</code>
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle><Brain className="inline mr-2" />AI Code Companion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <p>Connection status: {connectionStatus}</p>
        {isAnalyzing && <p>Please wait, analyzing your {language} code...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {aiAnalysis && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">AI Analysis:</h3>
            {renderSuggestions('Syntax Errors', aiAnalysis.syntaxErrors)}
            {renderSuggestions('Improvements', aiAnalysis.improvements)}
            {renderSuggestions('Security', aiAnalysis.security)}
            {renderSuggestions('Best Practices', aiAnalysis.bestPractices)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICompanion;