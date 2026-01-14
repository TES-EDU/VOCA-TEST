import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { UserCircle, Lock } from 'lucide-react';

const ADMIN_PASSWORD = '1234';

const Login = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useData();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
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

        login(name);
        navigate('/dashboard');
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200"
                    >
                        시작하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
