import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border-color)] bg-[var(--glass-bg)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 no-underline group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--accent-primary)] text-white shadow-md transition-transform group-hover:scale-105">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-[var(--text-primary)]">DocAnalyzer</span>
                </Link>

                {/* Right side */}
                {user && (
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-sm font-medium no-underline transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <div className="h-5 w-px bg-[var(--border-color)]" />
                        <span className="text-sm font-medium text-[var(--text-secondary)]">{user.name}</span>
                        <button onClick={logout} className="flex items-center gap-1.5 text-sm transition-colors cursor-pointer bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--error)]">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
