import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, PlayCircle, Settings2 } from 'lucide-react';
import { playTTS } from '../utils/tts';

const Study = () => {
    const { selectedUnit, updateProgress } = useData();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isKoreanFirst, setIsKoreanFirst] = useState(false);

    if (!selectedUnit) {
        navigate('/dashboard');
        return null;
    }

    const words = selectedUnit.words;
    const currentWord = words[currentIndex];
    const progress = ((currentIndex + 1) / words.length) * 100;

    const handleNext = () => {
        if (isFlipped) {
            setIsFlipped(false);
            setTimeout(() => {
                if (currentIndex < words.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                }
            }, 300);
        } else {
            if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
            }
        }
    };

    const handlePrev = () => {
        if (isFlipped) {
            setIsFlipped(false);
            setTimeout(() => {
                if (currentIndex > 0) {
                    setCurrentIndex(prev => prev - 1);
                }
            }, 300);
        } else {
            if (currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
            }
        }
    };

    const toggleMode = () => {
        setIsKoreanFirst(!isKoreanFirst);
        setIsFlipped(false);
    };

    const frontContent = isKoreanFirst ? (
        <>
            <span className="text-sm text-indigo-500 font-semibold mb-4 uppercase tracking-wider">Meaning</span>
            <h2 className="text-4xl font-bold text-slate-800 text-center mb-8">{currentWord.meaning}</h2>
        </>
    ) : (
        <>
            <span className="text-sm text-indigo-500 font-semibold mb-4 uppercase tracking-wider">Word</span>
            <h2 className="text-4xl font-bold text-slate-800 text-center mb-8">{currentWord.word}</h2>
        </>
    );

    const backContent = isKoreanFirst ? (
        <>
            <span className="text-sm text-indigo-200 font-semibold mb-4 uppercase tracking-wider">Word</span>
            <h2 className="text-3xl font-bold text-center mb-6">{currentWord.word}</h2>
            <div className="bg-white/10 p-4 rounded-xl w-full">
                <p className="text-indigo-100 text-center italic">"{currentWord.example}"</p>
            </div>
        </>
    ) : (
        <>
            <span className="text-sm text-indigo-200 font-semibold mb-4 uppercase tracking-wider">Meaning</span>
            <h2 className="text-3xl font-bold text-center mb-6">{currentWord.meaning}</h2>
            <div className="bg-white/10 p-4 rounded-xl w-full">
                <p className="text-indigo-100 text-center italic">"{currentWord.example}"</p>
            </div>
        </>
    );

    return (
        <div className="flex flex-col h-[calc(100dvh-120px)] animate-fade-in">
            {/* Top Bar with Toggle */}
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="text-sm text-slate-500">
                    {currentIndex + 1} / {words.length}
                </div>
                <button
                    onClick={toggleMode}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                >
                    <Settings2 size={14} />
                    {isKoreanFirst ? '한글 → 영어' : 'English → Korean'}
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 shrink-0">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Flashcard Area - Flexible */}
            <div className="flex-1 flex flex-col justify-center perspective-1000 min-h-0 overflow-hidden">
                <div
                    className="relative w-full aspect-[4/5] max-h-[50vh] cursor-pointer group perspective-1000 mx-auto"
                    onClick={() => {
                        if (!isFlipped) {
                            playTTS(currentWord.word);
                        }
                        setIsFlipped(!isFlipped);
                    }}
                >
                    <div className={`relative w-full h-full duration-500 preserve-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front */}
                        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-6">
                            {frontContent}
                            <p className="text-slate-400 text-sm mt-auto">Tap to flip</p>
                        </div>

                        {/* Back */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 text-white">
                            {backContent}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls - Fixed at bottom with safe area */}
            <div className="flex items-center justify-between gap-4 pt-4 pb-6 shrink-0">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={`p-4 rounded-full transition-colors ${currentIndex === 0 ? 'text-slate-300' : 'bg-white text-slate-600 shadow-md hover:bg-slate-50'}`}
                >
                    <ChevronLeft size={24} />
                </button>

                {currentIndex === words.length - 1 ? (
                    <button
                        onClick={() => {
                            updateProgress(selectedUnit.id, 'flashcard', true);
                            navigate('/study/recall');
                        }}
                        className="p-4 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors animate-bounce-in"
                        title="Start Recall Test"
                    >
                        <PlayCircle size={24} />
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="p-4 rounded-full bg-white text-slate-600 shadow-md hover:bg-slate-50 transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Study;
