import { FileText, MessageSquare, HardDrive, PieChart } from 'lucide-react';

export default function AnalyticsDashboard({ stats }) {
    if (!stats) return null;

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const cards = [
        {
            label: 'Total Documents',
            value: stats.totalDocuments,
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            label: 'Total Chats',
            value: stats.totalMessages,
            icon: MessageSquare,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100'
        },
        {
            label: 'Storage Used',
            value: formatBytes(stats.storageUsed),
            icon: HardDrive,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100'
        },
        {
            label: 'File Types',
            value: Object.keys(stats.fileTypes).length > 0
                ? Object.entries(stats.fileTypes).map(([type, count]) => `${type.toUpperCase()} (${count})`).join(', ')
                : 'None',
            icon: PieChart,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            isText: true
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-in">
            {cards.map((card, idx) => (
                <div key={idx} className={`glass-card p-4 border ${card.border} hover:shadow-md transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                    </div>
                    <div className="mt-2">
                        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{card.label}</h3>
                        <p className={`text-2xl font-bold mt-1 text-[var(--text-primary)] ${card.isText ? 'text-sm mt-2' : ''}`}>
                            {card.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
