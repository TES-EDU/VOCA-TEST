import React from 'react';
import { useData } from '../context/DataContext';
import { User, Trophy, BookOpen, BarChart3 } from 'lucide-react';

const MyPage = () => {
    const { user, progress, textbooks } = useData();

    // Calculate stats
    const totalUnits = textbooks.reduce((acc, book) => acc + book.units.length, 0);
    const completedUnits = Object.values(progress).filter(p => p.flashcard && p.recall && p.spelling).length;
    const completionRate = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

    const totalWordsLearned = Object.keys(progress).reduce((acc, unitId) => {
        // Find unit to get word count
        let count = 0;
        textbooks.forEach(book => {
            const unit = book.units.find(u => u.id === unitId);
            if (unit && progress[unitId]?.spelling) {
                count = unit.words.length;
            }
        });
        return acc + count;
    }, 0);

    return (
        <div className="p-4 space-y-6 animate-fade-in pb-20">
            <h1 className="text-2xl font-bold text-slate-800">My Page</h1>

            {/* Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="bg-indigo-100 p-4 rounded-full">
                    <User size={32} className="text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                    <p className="text-slate-500 text-sm">Level 1 Student</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <Trophy size={18} className="text-yellow-500" />
                        <span className="text-xs font-bold uppercase">Completion</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{completionRate}%</p>
                    <p className="text-xs text-slate-400 mt-1">{completedUnits} / {totalUnits} Units</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <BookOpen size={18} className="text-blue-500" />
                        <span className="text-xs font-bold uppercase">Words</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{totalWordsLearned}</p>
                    <p className="text-xs text-slate-400 mt-1">Memorized</p>
                </div>
            </div>

            {/* Recent Activity (Mock for now, or derived from progress) */}
            <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} />
                    Learning Status
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                    {Object.entries(progress).map(([unitId, status]) => {
                        // Find unit title
                        let unitTitle = unitId;
                        textbooks.forEach(book => {
                            const unit = book.units.find(u => u.id === unitId);
                            if (unit) unitTitle = unit.title;
                        });

                        const steps = [
                            { key: 'flashcard', label: 'Card', done: status.flashcard },
                            { key: 'recall', label: 'Recall', done: status.recall },
                            { key: 'spelling', label: 'Spell', done: status.spelling },
                        ];

                        return (
                            <div key={unitId} className="p-4 flex items-center justify-between">
                                <span className="font-medium text-slate-700 text-sm truncate max-w-[120px]">{unitTitle}</span>
                                <div className="flex gap-2">
                                    {steps.map(step => (
                                        <div
                                            key={step.key}
                                            className={`px-2 py-1 rounded-md text-[10px] font-bold ${step.done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                                                }`}
                                        >
                                            {step.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {Object.keys(progress).length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            No learning history yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPage;
