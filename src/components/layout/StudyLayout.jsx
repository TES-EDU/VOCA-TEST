import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { List, Layers, Brain, PenTool, ChevronLeft } from 'lucide-react';

const StudyLayout = () => {
    const { selectedUnit } = useData();
    const navigate = useNavigate();
    const location = useLocation();

    if (!selectedUnit) {
        navigate('/dashboard');
        return null;
    }

    const tabs = [
        { id: 'list', label: '전체', icon: List, path: '/study/list' },
        { id: 'flashcard', label: '암기', icon: Layers, path: '/study/flashcard' },
        { id: 'recall', label: '리콜', icon: Brain, path: '/study/recall' },
        { id: 'spelling', label: '스펠', icon: PenTool, path: '/study/spelling' },
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 h-14 flex items-center gap-4 shrink-0">
                <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-800">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-slate-800 truncate">{selectedUnit.title}</h1>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-20">
                <Outlet />
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 max-w-2xl mx-auto w-full">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default StudyLayout;
