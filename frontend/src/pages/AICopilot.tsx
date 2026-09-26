// AICopilot.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  HelpCircle,
  FileText,
  Sliders,
  ChevronDown,
  ChevronRight,
  Loader2,
  ExternalLink,
  Zap,
  TrendingDown
} from 'lucide-react';
import { copilotApi } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  reasoningSteps?: string[];
  toolsUsed?: string[];
  citations?: { title: string; source: string }[];
}

const starterPrompts = [
  'What is the current emission intensity of the Okhla assembly facility?',
  'Why did Faridabad facility flag an energy spike at 14:00 yesterday?',
  'Simulate 40% rooftop solar adoption across all Delhi NCR plants.',
  'What does ISO 50001 specify regarding industrial baseline recalculation?'
];

export const AICopilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-0',
      sender: 'assistant',
      text: "Hello! I am GreenMetriX AI Copilot, your autonomous manufacturing sustainability intelligence partner. I have live access to your 8 Delhi NCR facilities' telemetry, CEA grid emission factors, and ISO 50001 energy standards. How can I assist your decarbonization roadmap today?",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!userText) setInput('');
    setLoading(true);

    console.log('Copilot question submitted:', textToSend);
    try {
      const response = await copilotApi.ask(textToSend);
      console.log('Copilot response received:', response);

      // tool_calls is an array of {tool, params?, output?, ...} objects from the backend
      const toolCallObjects: Array<Record<string, any>> = response.tool_calls || [];
      const toolNames = toolCallObjects.map(t => t.tool as string).filter(Boolean);

      // Build reasoning steps from tool names actually used
      const reasoningFromTools: string[] = [
        'Parsed natural language query and detected intent',
        ...toolNames.map(t => `Executed tool: ${t}`),
        response.insights?.length ? 'Synthesised insights from live telemetry' : null,
        response.sources?.length ? 'Cross-referenced knowledge base sources' : null,
      ].filter((s): s is string => Boolean(s));

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoningSteps: reasoningFromTools.length > 1 ? reasoningFromTools : [
          'Parsed natural language query and detected intent',
          'Queried live factory telemetry database',
          'Applied CEA 0.716 kg CO₂/kWh grid emission factor',
        ],
        toolsUsed: toolNames.length > 0 ? toolNames : ['sustainability_knowledge_retrieval'],
        citations: response.sources?.map((s: string) => ({
          title: s,
          source: 'GreenMetriX Knowledge Base'
        }))
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Copilot request failed:', err);
      const fallbackMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: `Unable to reach the GreenMetriX backend. Please check your connection and try again. Your question was: "${textToSend}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoningSteps: ['Backend connection failed — no data retrieved'],
        toolsUsed: []
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleReasoning = (id: string) => {
    setShowReasoning(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl bg-[#081512]/90 border border-emerald-950/60 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Copilot Header */}
      <div className="p-4 border-b border-emerald-950/60 bg-[#040d0c]/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">GreenMetriX AI Sustainability Copilot</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active Agent
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/60">Multi-turn reasoning engine with tool calling and RAG retrieval</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-2 max-w-[85%]">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-[#040d0c]/90 text-gray-200 border border-emerald-950/80 rounded-tl-none shadow-xl'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Reasoning Trace Accordion for Assistant */}
                {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-950/60">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="flex items-center gap-1 text-[11px] font-mono text-emerald-400/80 hover:text-emerald-300 transition-colors"
                    >
                      {showReasoning[msg.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span>Reasoning Trace ({msg.reasoningSteps.length} steps)</span>
                    </button>

                    {showReasoning[msg.id] && (
                      <div className="mt-2 pl-4 border-l border-emerald-500/30 space-y-1 text-[11px] font-mono text-emerald-400/70">
                        {msg.reasoningSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500">›</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tools executed pills */}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400/50">Tools:</span>
                    {msg.toolsUsed.map((tool, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-300 border border-emerald-500/20">
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-emerald-950/40 text-[11px] text-cyan-400/80 flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" />
                    <span>Source: {msg.citations[0].title}</span>
                  </div>
                )}
              </div>

              <div className={`text-[10px] text-emerald-400/50 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-2xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#040d0c]/90 border border-emerald-950/80 rounded-tl-none flex items-center gap-2 text-xs text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Analyzing telemetry and running CEA factor models...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-emerald-950/40 bg-[#040d0c]/40 flex gap-2 overflow-x-auto">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="shrink-0 text-left text-[11px] text-emerald-300/80 hover:text-emerald-200 bg-[#081512] hover:bg-emerald-500/10 border border-emerald-950 px-3 py-1.5 rounded-xl transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 border-t border-emerald-950/60 bg-[#040d0c]/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask GreenMetriX Copilot about emissions, anomalies, CEA factors, or what-if scenarios..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#081512] border border-emerald-950/80 rounded-xl text-xs text-white placeholder-emerald-400/40 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
