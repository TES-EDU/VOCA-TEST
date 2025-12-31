import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CheckCircle, XCircle } from 'lucide-react';

const Test = () => {
    const { selectedUnit, saveTestResults } = useData();
    const navigate = useNavigate();
    const location = useLocation();

    // Track if this is a retry session
    const isRetry = !!location.state?.words;

    // Use words passed via state (retry mode) or default to unit words
    const [testWords, setTestWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [results, setResults] = useState([]); // { word, isCorrect, userAnswer }
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        // Prioritize retry words from location state
        if (location.state?.words && location.state.words.length > 0) {
            console.log('Starting retry test with words:', location.state.words);
            setTestWords(location.state.words);
        } else if (selectedUnit) {
            // Normal test: Shuffle words from unit
            const shuffled = [...selectedUnit.words].sort(() => Math.random() - 0.5);
            setTestWords(shuffled);
        } else {
            // No unit selected and no retry words -> go home
            navigate('/dashboard');
        }
    }, [selectedUnit, location.state, navigate]);

    if (testWords.length === 0) return null;

    const currentWord = testWords[currentIndex];
    const progress = ((currentIndex) / testWords.length) * 100;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const isCorrect = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
        const result = {
            ...currentWord,
            isCorrect,
            userAnswer: userInput,
            testType: 'spell' // Reuse spell type for retry
        };

        const newResults = [...results, result];
        setResults(newResults);
        setShowFeedback(true);

        // Auto advance after delay
        setTimeout(() => {
            if (currentIndex < testWords.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setUserInput('');
                setShowFeedback(false);
            } else {
                // Test finished
                if (!isRetry) {
                    // Only save main test results to context
                    saveTestResults('spell', newResults);
                }

                navigate('/result', {
                    state: {
                        // Pass results for immediate display
                        results: newResults,
                        totalWords: testWords.length,
                        isRetryResult: isRetry, // Flag to tell Result page this is a retry view
                        score: Math.round((newResults.filter(r => r.isCorrect).length / testWords.length) * 100)
                    }
                });
            }
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in max-w-md mx-auto">
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                    <span>{isRetry ? '오답 다시 풀기' : 'Spelling Test'}</span>
                    <span>{currentIndex + 1} / {testWords.length}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="bg-white w-full p-8 rounded-3xl shadow-lg border border-slate-100 text-center">
                    <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Meaning</span>
                    <h2 className="text-3xl font-bold text-slate-800 mt-4 mb-8">{currentWord.meaning}</h2>

                    {!showFeedback ? (
                        <form onSubmit={handleSubmit} className="w-full">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Type the English word"
                                className="w-full text-center text-xl p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all mb-4"
                                autoFocus
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-indigo-200"
                            >
                                Check Answer
                            </button>
                        </form>
                    ) : (
                        <div className={`animate-bounce-in p-6 rounded-xl ${results[results.length - 1]?.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {results[results.length - 1]?.isCorrect ? (
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle size={48} />
                                    <span className="font-bold text-lg">Correct!</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <XCircle size={48} />
                                    <span className="font-bold text-lg">Incorrect</span>
                                    <p className="text-slate-600">Answer: <span className="font-bold">{currentWord.word}</span></p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Test;
