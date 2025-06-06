import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useSmartAI, AIResponse } from '../../lib/ai/smartai';
import { Professional } from '../../types/talent/Professional';
import { Button } from 'react-bootstrap';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  provider?: string;
  responseTime?: number;
}

interface AIChatProps {
  professionals: Professional[];
  className?: string;
}

const AIChat: React.FC<AIChatProps> = ({ professionals, className = '' }) => {
  const { theme } = useTheme();
  const { generateResponse } = useSmartAI();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Foco no input quando o chat abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Mensagem de boas-vindas
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `Olá! 👋 Sou seu assistente de IA para análise de talentos HITSS.\n\nTenho acesso a ${professionals.length} profissionais cadastrados e posso ajudar com:\n\n• Análises por tecnologia e skills\n• Distribuição por senioridade\n• Disponibilidade para projetos\n• Filtros específicos\n• Insights sobre o time\n\nO que você gostaria de saber?`,
        isUser: false,
        timestamp: new Date(),
        provider: 'system'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, professionals.length, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response: AIResponse = await generateResponse(inputValue, professionals);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: response.timestamp,
        provider: response.provider,
        responseTime: response.responseTime
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Erro ao processar sua pergunta. Tente novamente.');
      console.error('Erro no chat IA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Sugestões rápidas
  const quickSuggestions = [
    'Quantos profissionais temos?',
    'Desenvolvedores React disponíveis',
    'Distribuição por senioridade',
    'Profissionais de cloud computing'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'groq': return '⚡';
      case 'together': return '🔥';
      case 'llama-free': return '🆓';
      case 'offline': return '💾';
      default: return '🤖';
    }
  };

  const getProviderName = (provider?: string) => {
    switch (provider) {
      case 'groq': return 'Groq Ultra';
      case 'together': return 'Together Premium';
      case 'llama-free': return 'Llama Free';
      case 'offline': return 'Offline';
      default: return 'IA';
    }
  };

  return (
    <>
      {/* Botão flutuante para abrir chat */}
      <motion.div
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            rounded-full w-14 h-14 shadow-lg transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-500' 
              : 'bg-indigo-500 hover:bg-indigo-600 border-indigo-400'
            }
          `}
          variant="primary"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? '✕' : '🤖'}
          </motion.div>
        </Button>
      </motion.div>

      {/* Painel do chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400, y: 100 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400, y: 100 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className={`
              fixed bottom-6 right-20 z-40 w-96 h-[600px] 
              ${theme === 'dark' 
                ? 'bg-gray-900 border-gray-700 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
              }
              border rounded-xl shadow-2xl flex flex-col overflow-hidden
            `}
          >
            {/* Header */}
            <div className={`
              p-4 border-b flex justify-between items-center
              ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}
            `}>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold">Assistente IA</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {professionals.length} profissionais conectados
                  </p>
                </div>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearChat}
                className="text-xs"
              >
                Limpar
              </Button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap
                      ${message.isUser
                        ? `${theme === 'dark' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-indigo-500 text-white'
                          } rounded-br-none`
                        : `${theme === 'dark' 
                            ? 'bg-gray-700 text-gray-100' 
                            : 'bg-gray-100 text-gray-900'
                          } rounded-bl-none`
                      }
                    `}
                  >
                    {message.text}
                    
                    {/* Info da resposta da IA */}
                    {!message.isUser && message.provider && (
                      <div className={`
                        text-xs mt-2 pt-2 border-t flex items-center justify-between
                        ${theme === 'dark' ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-500'}
                      `}>
                        <span className="flex items-center gap-1">
                          {getProviderIcon(message.provider)}
                          {getProviderName(message.provider)}
                        </span>
                        {message.responseTime && (
                          <span>{message.responseTime}ms</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className={`
                    p-3 rounded-lg rounded-bl-none
                    ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
                  `}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Erro */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="p-3 rounded-lg rounded-bl-none bg-red-100 text-red-700 text-sm">
                    {error}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Sugestões rápidas */}
            {messages.length <= 1 && (
              <div className={`
                px-4 py-2 border-t
                ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
              `}>
                <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Perguntas sugeridas:
                </p>
                <div className="flex flex-wrap gap-1">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`
                        text-xs px-2 py-1 rounded border transition-colors
                        ${theme === 'dark' 
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                          : 'border-gray-300 hover:bg-gray-100 text-gray-600'
                        }
                      `}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className={`
              p-4 border-t
              ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            `}>
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className={`
                    flex-1 px-3 py-2 rounded border text-sm
                    ${theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-indigo-500
                  `}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  variant="primary"
                  size="sm"
                >
                  📤
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat; 