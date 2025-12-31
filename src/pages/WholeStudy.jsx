import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { playTTS } from '../utils/tts';

const WholeStudy = () => {
    const { selectedUnit } = useData();
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const playSound = (text, e) => {
        e.stopPropagation();
        playTTS(text);
    };

    return (
        <div className="space-y-3 animate-fade-in">
            {selectedUnit.words.map((word) => (
                <div
                    key={word.id}
                    onClick={() => toggleExpand(word.id)}
                    className={`bg-white rounded-xl border transition-all cursor-pointer overflow-hidden ${expandedId === word.id ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-slate-200 shadow-sm hover:border-indigo-300'
                        }`}
                >
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => playSound(word.word, e)}
                                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                            >
                                <Volume2 size={18} />
                            </button>
                            <span className="text-lg font-bold text-slate-800">{word.word}</span>
                        </div>
                        {expandedId === word.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>

                    {expandedId === word.id && (
                        <div className="px-4 pb-4 pt-0 bg-indigo-50/30 border-t border-slate-100">
                            <div className="mt-3 space-y-2">
                                <p className="text-lg font-bold text-indigo-700">{word.meaning}</p>
                                <p className="text-sm text-slate-600 italic">"{word.example}"</p>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default WholeStudy;
