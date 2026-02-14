import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image, FileSpreadsheet, Clock, CheckCircle, AlertCircle, Trash2, RefreshCw, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import api from '../services/api';

const TYPE_ICONS = {
    pdf: <FileText className="w-5 h-5" style={{ color: '#ef4444' }} />,
    docx: <FileText className="w-5 h-5" style={{ color: '#3b82f6' }} />,
    text: <FileSpreadsheet className="w-5 h-5" style={{ color: '#10b981' }} />,
    image: <Image className="w-5 h-5" style={{ color: '#f59e0b' }} />,
};

const STATUS_CONFIG = {
    processing: { icon: <Clock className="w-3.5 h-3.5" />, label: 'Processing', class: 'status-processing' },
    ready: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Ready', class: 'status-ready' },
    error: { icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Error', class: 'status-error' },
};

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

export default function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);

    const fetchDocuments = async () => {
        try {
            const [docsRes, statsRes] = await Promise.all([
                api.get('/documents'),
                api.get('/analytics')
            ]);
            setDocuments(docsRes.data.documents);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        // Poll for status updates (processing docs)
        const interval = setInterval(fetchDocuments, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (e, docId) => {
        e.stopPropagation();
        if (!confirm('Delete this document?')) return;
        try {
            await api.delete(`/documents/${docId}`);
            setDocuments(prev => prev.filter(d => d._id !== docId));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Analytics Section */}
                <AnalyticsDashboard stats={stats} />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Your Documents</h1>
                        <p className="text-sm mt-1 text-[var(--text-secondary)]">
                            Upload, analyze, and chat with your documents
                        </p>
                    </div>
                    <button onClick={fetchDocuments} className="btn-ghost flex items-center gap-2 bg-white shadow-sm hover:shadow border border-[var(--border-color)]">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {/* Upload Section */}
                <div className="mb-10">
                    <FileUpload onUploadComplete={fetchDocuments} />
                </div>

                {/* Documents Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="spinner" style={{ width: '32px', height: '32px' }} />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-20 glass-card bg-white">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-lg font-medium text-[var(--text-secondary)]">No documents yet</p>
                        <p className="text-sm mt-1 text-[var(--text-muted)]">Upload your first document to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {documents.map((doc, i) => {
                            const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.processing;
                            return (
                                <div
                                    key={doc._id}
                                    onClick={() => doc.status === 'ready' && navigate(`/document/${doc._id}`)}
                                    className="glass-card p-5 transition-all duration-200 fade-in group bg-white hover:border-[var(--accent-primary)] cursor-pointer"
                                    style={{
                                        animationDelay: `${i * 60}ms`,
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                            {TYPE_ICONS[doc.fileType] || <FileText className="w-5 h-5 text-[var(--text-muted)]" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-sm truncate mb-1 text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors" title={doc.fileName}>
                                        {doc.fileName}
                                    </h3>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {formatSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                                    </p>

                                    {doc.documentType && (
                                        <p className="text-xs mt-3 px-2 py-1 rounded-md inline-block bg-indigo-50 text-[var(--accent-primary)] font-medium">
                                            {doc.documentType}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border-color)]">
                                        {doc.status === 'ready' && (
                                            <button className="flex items-center gap-1.5 text-xs transition-colors bg-transparent border-none cursor-pointer text-[var(--accent-primary)] font-medium hover:underline">
                                                <Eye className="w-3.5 h-3.5" /> View Analysis
                                            </button>
                                        )}
                                        <button onClick={(e) => handleDelete(e, doc._id)}
                                            className="flex items-center gap-1.5 text-xs ml-auto transition-colors bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--error)]">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
