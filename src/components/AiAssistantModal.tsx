import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  CheckCircle2,
  Music,
  Plus,
  Flame,
  FileCheck,
} from 'lucide-react';
import { Habit, PianoSong } from '../types';
import { MessageItem, AgentAction, sendAgentMessage } from '../services/aiAgent';
import { soundService } from '../services/audio';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  songs: PianoSong[];
  selectedDate: string;
  onExecuteAction: (action: AgentAction) => void;
}

export function AiAssistantModal({
  isOpen,
  onClose,
  habits,
  songs,
  selectedDate,
  onExecuteAction,
}: AiAssistantModalProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: "Welcome to Maestroso AI Assistant! Type naturally to log your practice sessions, report tempos, or add new pieces to your repertoire.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputVal;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);
    soundService.playSlideClick();

    try {
      const response = await sendAgentMessage(textToSend, habits, songs, selectedDate);

      // Execute any returned actions
      if (response.actions && response.actions.length > 0) {
        for (const act of response.actions) {
          onExecuteAction(act);
        }
        soundService.playHabitComplete();
      }

      const assistantMsg: MessageItem = {
        id: `msg_${Date.now() + 1}`,
        sender: 'assistant',
        text: response.reply,
        actionsExecuted: response.actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'assistant',
          text: "I encountered an issue processing that. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const samplePrompts = [
    'Log 25 mins for Great Is Thy Faithfulness at 72 bpm',
    'Log 30 mins practice for Moonlight Sonata',
    'Add hymn "Be Thou My Vision" #210 in Eb',
    "Log 15 mins for Lord's Supper Communion theme",
    'Log 40 mins choir song practice with m. 12-40 at 96 bpm',
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="ai-assistant-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#100713]/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="w-full max-w-2xl majestic-card rounded-3xl shadow-2xl text-slate-100 flex flex-col h-[85vh] max-h-[700px] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#DE72B5]/20 flex items-center justify-between bg-[#1D0F22]/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B63E88] to-[#4A1037] border border-[#DE72B5]/40 flex items-center justify-center text-white font-black shadow-lg">
                <Sparkles className="w-5 h-5 text-[#FFBBE2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-serif uppercase tracking-wider">Maestroso AI Assistant</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#40234D] text-[#DE72B5] border border-[#DE72B5]/30 font-mono font-bold">
                    AI Powered
                  </span>
                </div>
                <p className="text-xs text-[#DDD8E2]">Type to log practice sessions, update tempos, or add repertoire</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="close-ai-assistant-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#2D1A36] hover:bg-[#40234D] text-[#B8A9C2] hover:text-white flex items-center justify-center transition-colors border border-[#4D2B5B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Stream Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-[#40234D] border border-[#DE72B5]/30 text-[#DE72B5] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#B63E88] to-[#8C2666] text-white font-medium rounded-br-none shadow-md border border-[#DE72B5]/40'
                      : 'bg-[#1D0F22]/90 border border-[#4D2B5B] text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Actions summary pill if actions were executed */}
                  {msg.actionsExecuted && msg.actionsExecuted.length > 0 && (
                    <div className="pt-2 border-t border-[#4D2B5B] space-y-1.5">
                      <div className="text-[11px] font-bold text-[#FFBBE2] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Executed Changes in App:
                      </div>
                      {msg.actionsExecuted.map((act, i) => (
                        <div
                          key={i}
                          className="text-[11px] bg-[#100713]/80 border border-[#DE72B5]/30 rounded-lg px-2.5 py-1.5 text-[#FFBBE2] flex items-center gap-1.5"
                        >
                          {act.type === 'LOG_PRACTICE' && <Music className="w-3 h-3 text-[#DE72B5] shrink-0" />}
                          {act.type === 'TOGGLE_HABIT' && <FileCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
                          {act.type === 'ADD_SONG' && <Plus className="w-3 h-3 text-[#FFBBE2] shrink-0" />}
                          {act.type === 'CREATE_HABIT' && <Flame className="w-3 h-3 text-amber-400 shrink-0" />}
                          <span>
                            {act.type === 'LOG_PRACTICE' &&
                              `Logged ${act.payload.durationMinutes}m for "${act.payload.songTitle}"`}
                            {act.type === 'TOGGLE_HABIT' &&
                              `Set "${act.payload.habitName}" to ${act.payload.completed ? 'Completed' : 'Incomplete'}`}
                            {act.type === 'ADD_SONG' && `Added piece "${act.payload.title}"`}
                            {act.type === 'CREATE_HABIT' && `Created "${act.payload.name}"`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] text-right ${
                      msg.sender === 'user' ? 'text-[#FFBBE2]/80' : 'text-[#B8A9C2]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-[#40234D] border border-[#DE72B5]/30 text-[#DE72B5] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-[#B8A9C2]">
                <div className="w-8 h-8 rounded-xl bg-[#40234D] border border-[#DE72B5]/30 text-[#DE72B5] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-[#1D0F22] border border-[#4D2B5B] rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE72B5] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE72B5] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE72B5] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-white font-medium">Maestroso is updating your practice logs...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="px-4 py-2 bg-[#1D0F22]/95 border-t border-[#DE72B5]/20 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
            <span className="text-[11px] font-semibold text-[#DDD8E2] shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#DE72B5]" />
              Quick:
            </span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 text-[11px] bg-[#2D1A36] hover:bg-[#40234D] border border-[#4D2B5B] text-[#DDD8E2] hover:text-white rounded-lg whitespace-nowrap transition-colors shrink-0 font-medium"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 sm:p-4 bg-[#1D0F22] border-t border-[#DE72B5]/20 flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1">
              <input
                id="ai-agent-text-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder='e.g. "Log 25 mins for Great Is Thy Faithfulness at 72 bpm"...'
                className="w-full bg-[#100713] border border-[#4D2B5B] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-[#8F7D99] focus:outline-none focus:border-[#DE72B5]"
              />
            </div>

            <button
              type="submit"
              id="ai-agent-send-btn"
              disabled={!inputVal.trim() || isLoading}
              className={`p-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0 ${
                inputVal.trim() && !isLoading
                  ? 'majestic-btn-primary shadow-lg'
                  : 'bg-[#2D1A36] text-[#8F7D99] cursor-not-allowed border border-[#4D2B5B]'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
