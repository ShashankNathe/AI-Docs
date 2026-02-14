import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-secondary)]">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 bg-[var(--accent-primary)] blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 bg-[var(--accent-secondary)] blur-[100px]" />
            </div>

            <div className="w-full max-w-md fade-in relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">DocAnalyzer</h1>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">AI-powered document intelligence</p>
                </div>

                {/* Form card */}
                <div className="glass-card p-8 bg-white shadow-xl">
                    <h2 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">Welcome back</h2>

                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg text-sm bg-red-50 border border-red-200 text-red-600">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Email</label>
                            <div className="relative">
                                {/* <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /> */}
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10" placeholder="you@example.com" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Password</label>
                            <div className="relative">
                                {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /> */}
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10" placeholder="••••••••" required />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full justify-center mt-6 py-3">
                            {loading ? <div className="spinner" /> : <LogIn className="w-4 h-4" />}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-sm text-center mt-6 text-[var(--text-secondary)]">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium hover:underline text-[var(--accent-primary)]">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
