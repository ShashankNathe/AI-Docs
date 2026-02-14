import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

export default function ChatPanel({ documentId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/chat/${documentId}`);
                if (res.data.messages) {
                    setMessages(res.data.messages);
                }
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };
        fetchHistory();
    }, [documentId]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const question = input.trim();
        setInput('');

        // Optimistic update
        const tempId = Date.now();
        setMessages(prev => [...prev, { role: 'user', content: question, tempId }]);
        setLoading(true);

        try {
            // No need to pass chatHistory, backend fetches it
            const res = await api.post(`/chat/${documentId}`, { question });

            // Update messages with backend response (could replace tempId if we wanted strict sync, but append is fine for now)
            setMessages(prev => [
                ...prev.filter(m => m.tempId !== tempId), // Remove optimistic if we were doing strict sync, but actually we just want to ensure we don't duplicate if we re-fetched. Simple append is safer for UI flow.
                { role: 'user', content: question }, // Re-add user msg to be sure it matches DB state mentally, or just keep optimistic one. Let's keep optimistic and just append answer.
                { role: 'assistant', content: res.data.answer }
            ]);
            // Re-fetch to ensuring exact DB sync (optional, but good for consistency)
            // const history = await api.get(`/chat/${documentId}`);
            // setMessages(history.data.messages);

            // Simpler approach: Just append the answer, assuming the optimistic user msg is close enough
            // setMessages(prev => {
            //     const withoutOptimistic = prev.filter(m => m.tempId !== tempId);
            //     return [...withoutOptimistic, { role: 'user', content: question }, { role: 'assistant', content: res.data.answer }];
            // });

        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ ' + (err.response?.data?.message || 'Failed to get response. Please try again.'),
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--border-color)' }}>
                <Bot className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Document Chat</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <Bot className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ask anything about this document</p>
                        <div className="mt-4 space-y-2">
                            {['What is this document about?', 'Summarize the key points', 'What are the main conclusions?'].map((q) => (
                                <button key={q} onClick={() => { setInput(q); }}
                                    className="block mx-auto text-xs px-3 py-1.5 rounded-lg transition-colors bg-transparent border cursor-pointer"
                                    style={{ color: 'var(--accent-primary)', borderColor: 'var(--border-color)' }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(108,92,231,0.08)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                                style={{ background: 'rgba(108,92,231,0.15)' }}>
                                <Bot className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                            </div>
                        )}
                        <div className="max-w-[80%] rounded-xl px-4 py-3 text-sm"
                            style={{
                                background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-card)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                            }}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-invert prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                                style={{ background: 'rgba(168,85,247,0.15)' }}>
                                <User className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3 fade-in">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(108,92,231,0.15)' }}>
                            <Bot className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div className="rounded-xl px-4 py-3"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                            <Loader className="w-4 h-4 animate-spin" style={{ color: 'var(--accent-primary)' }} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="input-field flex-1"
                        placeholder="Ask about this document..."
                        disabled={loading}
                        style={{ fontSize: '13px' }}
                    />
                    <button type="submit" disabled={loading || !input.trim()}
                        className="btn-primary" style={{ padding: '10px 14px' }}>
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
