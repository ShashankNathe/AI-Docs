import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';
import { useUploadThing } from '../utils/uploadthing';

const FILE_ICONS = {
    pdf: <FileText className="w-8 h-8" style={{ color: '#ef4444' }} />,
    docx: <FileText className="w-8 h-8" style={{ color: '#3b82f6' }} />,
    text: <FileSpreadsheet className="w-8 h-8" style={{ color: '#10b981' }} />,
    image: <Image className="w-8 h-8" style={{ color: '#f59e0b' }} />,
};

export default function FileUpload({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success'|'error', message }

    const { startUpload } = useUploadThing("documentUploader", {
        onClientUploadComplete: async (res) => {
            setUploading(false);
            setUploadStatus({ type: 'success', message: 'Files uploaded to storage successfully!' });

            // Send metadata to backend
            for (const file of res) {
                try {
                    await api.post('/documents/upload', {
                        fileName: file.name,
                        fileUrl: file.url,
                        fileSize: file.size,
                        fileType: file.type, // Make sure backend handles this or derives it
                    });
                    setUploadStatus({ type: 'success', message: `"${file.name}" uploaded successfully!` });
                } catch (err) {
                    console.error("Backend processing failed", err);
                    setUploadStatus({
                        type: 'error',
                        message: `Failed to process "${file.name}" on server`,
                    });
                }
            }

            if (onUploadComplete) onUploadComplete();
        },
        onUploadError: (error) => {
            setUploading(false);
            setUploadStatus({ type: 'error', message: `Upload failed: ${error.message}` });
        },
        onUploadBegin: () => {
            setUploading(true);
            setUploadStatus(null);
        },
    });

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        startUpload(acceptedFiles);
    }, [startUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'text/csv': ['.csv'],
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/gif': ['.gif'],
            'image/webp': ['.webp'],
            'image/bmp': ['.bmp'],
        },
        maxSize: 16 * 1024 * 1024, // Matches UploadThing config (16MB for PDF)
        multiple: true,
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`glass-card cursor-pointer transition-all duration-300 border-2 border-dashed p-10 text-center ${isDragActive ? 'border-[var(--accent-primary)] bg-[rgba(79,70,229,0.05)]' : 'border-[var(--border-color)] bg-white'}`}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader className="w-10 h-10 animate-spin text-[var(--accent-primary)]" />
                        <p className="text-sm font-medium text-[var(--text-secondary)]">Uploading to cloud...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[rgba(79,70,229,0.1)] border border-[rgba(79,70,229,0.2)]">
                            <Upload className="w-6 h-6 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
                            </p>
                            <p className="text-xs mt-1 text-[var(--text-muted)]">
                                PDF, DOCX, TXT, Images — Max 16MB
                            </p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            {Object.values(FILE_ICONS).map((icon, i) => (
                                <div key={i} className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                    {icon}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Upload status message */}
            {uploadStatus && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm fade-in ${uploadStatus.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {uploadStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {uploadStatus.message}
                </div>
            )}
        </div>
    );
}

