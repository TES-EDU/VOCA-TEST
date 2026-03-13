import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { UserCircle, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = '1234';

const Login = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useData();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('이름을 입력해주세요.');
            return;
        }

        if (password !== ADMIN_PASSWORD) {
            setError('비밀번호가 올바르지 않습니다.');
            return;
        }

        setIsLoading(true);

        try {
            let student = null;

            if (supabase) {
                // Try to find existing student in Supabase (same as speaking app)
                const { data: found } = await supabase
                    .from('students')
                    .select('*')
                    .eq('name', name.trim())
                    .order('created_at', { ascending: true })
                    .limit(1);

                if (found && found.length > 0) {
                    student = found[0];
                } else {
                    // Create new student (same as speaking app)
                    const { data: created, error: createErr } = await supabase
                        .from('students')
                        .insert([{ name: name.trim() }])
                        .select()
                        .single();

                    if (!createErr && created) {
                        student = created;
                    }
                }
            }

            // Fallback: if Supabase failed or not configured, use local data
            if (!student) {
                student = { name: name.trim() };
            }

            login(student);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            // Fallback to local
            login({ name: name.trim() });
            navigate('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-100 p-4 rounded-full">
                        <UserCircle size={48} className="text-indigo-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">TES VOCA</h1>
                <p className="text-slate-500 mb-6">학습을 시작하려면 정보를 입력하세요</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름 (Your Name)"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                    </div>

                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="관리자 비밀번호"
                            className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <><Loader2 size={20} className="animate-spin" /> 로그인 중...</>
                        ) : (
                            '시작하기'
                        )}
                    </button>
                </form>

                {/* Teacher Login Link */}
                <div className="mt-8 text-right">
                    <button 
                        onClick={() => navigate('/teacher')}
                        className="text-xs text-slate-400 hover:text-indigo-500 transition-colors font-medium flex items-center justify-end gap-1 w-full"
                    >
                        선생님 로그인 &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
