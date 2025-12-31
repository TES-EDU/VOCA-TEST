import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CheckCircle, XCircle } from 'lucide-react';

const Recall = () => {
    const { selectedUnit, updateProgress, saveTestResults } = useData();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [results, setResults] = useState([]); // Track all results

    const words = selectedUnit?.words || [];
    const currentWord = words[currentIndex];
    const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

    useEffect(() => {
        if (currentWord) {
            generateOptions();
        }
    }, [currentIndex, currentWord]);

    const generateOptions = () => {
        if (!currentWord) return;

        const correctMeaning = currentWord.meaning;
        const otherWords = words.filter(w => w.id !== currentWord.id);
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
        const wrongMeanings = shuffledOthers.slice(0, 2).map(w => w.meaning);
        const allOptions = [correctMeaning, ...wrongMeanings].sort(() => Math.random() - 0.5);

        setOptions(allOptions);
        setSelectedOption(null);
        setIsCorrect(null);
    };

    const handleOptionClick = (option) => {
        if (selectedOption) return;

        setSelectedOption(option);
        const correct = option === currentWord.meaning;
        setIsCorrect(correct);

        // Save result for this word
        const result = {
            ...currentWord,
            isCorrect: correct,
            userAnswer: option,
            testType: 'recall'
        };

        const newResults = [...results, result];
        setResults(newResults);

        setTimeout(() => {
            if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // Finished Recall, save results and go to Spelling
                saveTestResults('recall', newResults);
                updateProgress(selectedUnit.id, 'recall', true);
                navigate('/study/spelling');
            }
        }, 1000);
    };

    if (!currentWord) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                    <span>Recall Test</span>
                    <span>{currentIndex + 1} / {words.length}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col items-center justify-center mb-8">
                <h2 className="text-4xl font-bold text-slate-800 text-center mb-12">{currentWord.word}</h2>

                <div className="w-full space-y-3">
                    {options.map((option, index) => {
                        let buttonStyle = "bg-white border-slate-200 text-slate-700 hover:border-indigo-300";
                        if (selectedOption) {
                            if (option === currentWord.meaning) {
                                buttonStyle = "bg-green-50 border-green-500 text-green-700 font-bold";
                            } else if (option === selectedOption) {
                                buttonStyle = "bg-red-50 border-red-500 text-red-700";
                            } else {
                                buttonStyle = "bg-slate-50 border-slate-100 text-slate-400";
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(option)}
                                disabled={!!selectedOption}
                                className={`w-full p-4 rounded-xl border-2 text-lg transition-all ${buttonStyle} shadow-sm`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback */}
            <div className="h-12 flex items-center justify-center">
                {isCorrect === true && (
                    <div className="flex items-center gap-2 text-green-600 font-bold animate-bounce-in">
                        <CheckCircle size={24} />
                        <span>Correct!</span>
                    </div>
                )}
                {isCorrect === false && (
                    <div className="flex items-center gap-2 text-red-600 font-bold animate-bounce-in">
                        <XCircle size={24} />
                        <span>Try Again</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recall;
