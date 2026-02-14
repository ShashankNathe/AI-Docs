import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import ReactMarkdown from 'react-markdown';
import {
    ArrowLeft, FileText, Tag, Lightbulb, Users, BookOpen,
    ChevronDown, ChevronUp, MessageSquare, X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatPanel from '../components/ChatPanel';
import api from '../services/api';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function DocumentView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showFullText, setShowFullText] = useState(false);

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                setDoc(res.data.document);
            } catch (err) {
                console.error('Failed to fetch document:', err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <Navbar />
                <div className="flex justify-center py-32">
                    <div className="spinner" style={{ width: '32px', height: '32px' }} />
                </div>
            </div>
        );
    }

    if (!doc) return null;

    const isPdf = doc.fileType === 'pdf';
    const isImage = doc.fileType === 'image';

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]">
            <Navbar />

            <main className="flex-1 flex flex-col min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 flex-none">
                    <button onClick={() => navigate('/')} className="btn-ghost" style={{ padding: '8px 12px' }}>
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{doc.fileName}</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {doc.documentType && `${doc.documentType} · `}
                            {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <button onClick={() => setShowChat(!showChat)}
                        className={showChat ? 'btn-primary' : 'btn-ghost'}
                        style={{ padding: '10px 16px' }}>
                        {showChat ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        {showChat ? 'Close Chat' : 'Chat'}
                    </button>
                </div>

                <div className="flex-1 flex gap-6 min-h-0">
                    {/* Left: Document content */}
                    <div className={`flex-1 min-w-0 flex flex-col gap-6 overflow-y-auto pr-2 pb-2 ${showChat ? 'w-1/2' : 'w-full'}`}
                        style={{ transition: 'width 0.3s ease' }}>

                        {/* AI Summary */}
                        {doc.summary && (
                            <div className="glass-card p-6 fade-in flex-none">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lightbulb className="w-5 h-5 text-[var(--accent-primary)]" />
                                    <h2 className="text-base font-semibold text-[var(--text-primary)]">AI Summary</h2>
                                </div>
                                <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                    <ReactMarkdown>{doc.summary}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {/* Topics & Entities */}
                        {(doc.topics?.length > 0 || doc.entities?.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-in flex-none" style={{ animationDelay: '100ms' }}>
                                {doc.topics?.length > 0 && (
                                    <div className="glass-card p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Tag className="w-4 h-4 text-[var(--accent-secondary)]" />
                                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Topics</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {doc.topics.map((t, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-purple-50 text-purple-600 border border-purple-200">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {doc.entities?.length > 0 && (
                                    <div className="glass-card p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="w-4 h-4 text-emerald-500" />
                                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Key Entities</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {doc.entities.map((e, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                    {e}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Key Insights */}
                        {doc.keyInsights?.length > 0 && (
                            <div className="glass-card p-6 fade-in flex-none" style={{ animationDelay: '200ms' }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-base font-semibold text-[var(--text-primary)]">Key Insights</h2>
                                </div>
                                <ul className="space-y-2">
                                    {doc.keyInsights.map((insight, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 bg-amber-50 text-amber-600">
                                                {i + 1}
                                            </span>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Document Preview */}
                        {isPdf && (
                            <div className="glass-card overflow-hidden fade-in flex-none" style={{ animationDelay: '300ms', height: '600px' }}>
                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                    <Viewer fileUrl={doc.fileUrl} plugins={[defaultLayoutPluginInstance]} />
                                </Worker>
                            </div>
                        )}

                        {isImage && (
                            <div className="glass-card p-4 fade-in flex-none" style={{ animationDelay: '300ms' }}>
                                <img src={doc.fileUrl} alt={doc.fileName} className="max-w-full rounded-lg mx-auto" />
                            </div>
                        )}

                        {/* Extracted Text */}
                        {doc.extractedText && (
                            <div className="glass-card p-6 fade-in flex-none" style={{ animationDelay: '400ms' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-[var(--text-muted)]" />
                                        <h2 className="text-base font-semibold text-[var(--text-primary)]">Extracted Text</h2>
                                    </div>
                                    <button onClick={() => setShowFullText(!showFullText)}
                                        className="flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer text-[var(--accent-primary)] hover:underline">
                                        {showFullText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        {showFullText ? 'Collapse' : 'Expand'}
                                    </button>
                                </div>
                                <pre className="text-sm whitespace-pre-wrap font-mono overflow-hidden text-[var(--text-secondary)]"
                                    style={{
                                        maxHeight: showFullText ? 'none' : '200px',
                                        transition: 'max-height 0.3s ease',
                                    }}>
                                    {doc.extractedText}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Right: Chat Panel */}
                    {showChat && (
                        <div className="w-[400px] flex-shrink-0 glass-card fade-in overflow-hidden flex flex-col bg-white border border-[var(--border-color)]">
                            <ChatPanel documentId={doc._id} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
