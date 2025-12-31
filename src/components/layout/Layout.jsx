import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { LogOut, BookOpen, User } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useData();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-indigo-600 text-lg cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <BookOpen size={24} />
                        <span>VOCA Master</span>
                    </div>

                    {user && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/mypage')}
                                className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                                <User size={18} />
                                <span className="font-semibold hidden sm:inline">{user.name}</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-md mx-auto w-full p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
