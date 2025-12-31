import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, RotateCw, PlayCircle, Settings2 } from 'lucide-react';
import { playTTS } from '../utils/tts';

const Study = () => {
    const { selectedUnit, updateProgress } = useData();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isKoreanFirst, setIsKoreanFirst] = useState(false); // Toggle state

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

    // Determine what to show on Front and Back based on mode
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
        <div className="flex flex-col h-full animate-fade-in">
            {/* Top Bar with Toggle */}
            <div className="flex justify-between items-center mb-4">
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
            <div className="mb-6">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Flashcard Area */}
            <div className="flex-1 flex flex-col justify-center perspective-1000 mb-8">
                <div
                    className="relative w-full aspect-[4/5] max-h-[400px] cursor-pointer group perspective-1000"
                    onClick={() => {
                        if (!isFlipped) {
                            // Play sound only when flipping to reveal (or always if preferred)
                            // Assuming we want to hear the English word.
                            // If isKoreanFirst is true, Front is Meaning, Back is Word. So flipping reveals Word -> Play Sound.
                            // If isKoreanFirst is false, Front is Word, Back is Meaning. So flipping reveals Meaning.
                            // User request: "When card is flipped, sound should play".
                            // Usually we want to hear the English word.

                            // Let's play the English word regardless of side, or only when English is visible?
                            // "암기에서도 카드를 뒤집으면 소리가 나면 좋겠다" -> Likely implies hearing the pronunciation.
                            playTTS(currentWord.word);
                        }
                        setIsFlipped(!isFlipped);
                    }}
                >
                    <div className={`relative w-full h-full duration-500 preserve-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front */}
                        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-8">
                            {frontContent}
                            <p className="text-slate-400 text-sm mt-auto">Tap to flip</p>
                        </div>

                        {/* Back */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-white">
                            {backContent}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
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
