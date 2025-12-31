import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Book, ChevronRight, GraduationCap, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
    const { textbooks, setSelectedTextbook, setSelectedUnit, progress } = useData();
    const navigate = useNavigate();

    const handleUnitSelect = (textbook, unit) => {
        setSelectedTextbook(textbook);
        setSelectedUnit(unit);
        navigate('/study/list');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Select a Course</h2>
            </div>

            <div className="space-y-6">
                {textbooks.map((book) => (
                    <div key={book.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center gap-3">
                            <Book className="text-indigo-600" size={20} />
                            <h3 className="font-bold text-slate-800">{book.title}</h3>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {book.units.map((unit) => {
                                const unitProgress = progress[unit.id] || {};
                                const isCompleted = unitProgress.flashcard && unitProgress.recall && unitProgress.spelling;

                                return (
                                    <button
                                        key={unit.id}
                                        onClick={() => handleUnitSelect(book, unit)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg transition-colors ${isCompleted ? 'bg-green-100' : 'bg-slate-100 group-hover:bg-indigo-100'}`}>
                                                {isCompleted ? (
                                                    <CheckCircle2 size={18} className="text-green-600" />
                                                ) : (
                                                    <GraduationCap size={18} className="text-slate-500 group-hover:text-indigo-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-700 group-hover:text-indigo-700">{unit.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span>{unit.words.length} words</span>
                                                    {(unitProgress.flashcard || unitProgress.recall || unitProgress.spelling) && !isCompleted && (
                                                        <span className="text-indigo-500 font-semibold">• In Progress</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
