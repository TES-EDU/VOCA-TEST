import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Home, Check, FileText, X, RotateCcw } from 'lucide-react';

const Result = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedUnit, updateProgress, updateStudyStats, testResults } = useData();

    // Check if we are viewing the result of a retry test
    const isRetryResult = location.state?.isRetryResult;

    // Check if we have separated results in context (only relevant for main test view)
    const hasContextResults = !isRetryResult && testResults && (testResults.recall.length > 0 || testResults.spell.length > 0);

    // Determine which results to display
    const currentResults = isRetryResult
        ? (location.state?.results || [])
        : (hasContextResults ? [...testResults.recall, ...testResults.spell] : (location.state?.results || []));

    const totalWords = isRetryResult
        ? (location.state?.totalWords || 0)
        : (hasContextResults
            ? ((testResults.recall.length || 0) + (testResults.spell.length || 0) > 0 ? (testResults.recall.length || 0) : location.state?.totalWords)
            : (location.state?.totalWords || 0));

    // Calculate score for display
    const score = isRetryResult
        ? (location.state?.score || 0)
        : (currentResults.length > 0
            ? Math.round((currentResults.filter(r => r.isCorrect).length / currentResults.length) * 100)
            : 0);

    // Identify wrong answers for display
    let recallWrong = [];
    let spellWrong = [];
    let simpleWrong = [];

    if (isRetryResult) {
        // Retry results are typically simple spelling results
        simpleWrong = currentResults.filter(r => !r.isCorrect);
    } else if (hasContextResults) {
        recallWrong = testResults.recall.filter(r => !r.isCorrect);
        spellWrong = testResults.spell.filter(r => !r.isCorrect);
    } else {
        simpleWrong = currentResults.filter(r => !r.isCorrect);
    }

    // Calculate words for retry button (deduplicated)
    const allWrongForRetry = isRetryResult
        ? simpleWrong
        : [...recallWrong, ...spellWrong, ...simpleWrong];

    const uniqueWrongMap = new Map();
    allWrongForRetry.forEach(item => {
        if (item.id && !uniqueWrongMap.has(item.id)) {
            uniqueWrongMap.set(item.id, item);
        }
    });
    const retryWords = Array.from(uniqueWrongMap.values());

    useEffect(() => {
        // Only update stats for main test, not retry
        if (!isRetryResult && selectedUnit && currentResults.length > 0) {
            updateProgress(selectedUnit.id, 'spelling', true);
            updateStudyStats(selectedUnit.id);
        }
    }, []);

    const handleHome = () => {
        navigate('/dashboard');
    };

    const handleReportCard = () => {
        navigate('/report-card', {
            state: {
                results: currentResults,
                totalWords,
                score,
                // Only pass separated results if we are in main test view
                recallResults: !isRetryResult ? testResults.recall : null,
                spellResults: !isRetryResult ? testResults.spell : null
            }
        });
    };

    const handleRetryWrong = () => {
        if (retryWords.length > 0) {
            const cleanWords = retryWords.map(w => ({
                id: w.id,
                word: w.word,
                meaning: w.meaning,
                example: w.example
            }));
            navigate('/test', { state: { words: cleanWords } });
        }
    };

    return (
        <div className="animate-fade-in pb-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                    <span className="text-xl">VOCA Master</span>
                </div>
            </header>

            {/* Score Card (Blue) */}
            <div className="bg-indigo-600 text-white rounded-3xl p-10 text-center shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-indigo-100 font-semibold uppercase tracking-wider mb-4 text-sm">
                        {isRetryResult ? 'RETRY COMPLETE' : 'TEST COMPLETE'}
                    </h2>
                    <div className="text-8xl font-bold mb-4">{score}</div>
                    <p className="text-indigo-200 text-lg">
                        총 {currentResults.length}문제 중 {currentResults.filter(r => r.isCorrect).length}개 정답
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {retryWords.length > 0 ? (
                    <button
                        onClick={handleRetryWrong}
                        className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={20} />
                        {isRetryResult ? '틀린 문제 다시 풀기' : '오답 다시 풀기'}
                    </button>
                ) : (
                    isRetryResult && (
                        <div className="bg-green-100 text-green-700 p-4 rounded-2xl font-bold flex items-center justify-center">
                            모두 맞췄습니다!
                        </div>
                    )
                )}

                <button
                    onClick={handleHome}
                    className={`bg-white hover:bg-slate-50 text-slate-700 p-4 rounded-2xl font-bold shadow-sm border border-slate-100 flex items-center justify-center gap-2 ${retryWords.length === 0 && !isRetryResult ? 'col-span-2' : ''}`}
                >
                    <Home size={20} />
                    Home
                </button>
            </div>

            {/* Separate Failed Lists (Main Test) */}
            {hasContextResults && !isRetryResult && (
                <div className="space-y-6 mb-8">
                    {/* Recall Failures */}
                    {recallWrong.length > 0 && (
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 text-lg border-l-4 border-indigo-500 pl-3">Recall 오답 ({recallWrong.length}개)</h3>
                            <div className="space-y-3">
                                {recallWrong.map((result, index) => (
                                    <div key={index} className="bg-white p-4 rounded-xl border border-red-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-800">{result.word}</p>
                                            <p className="text-sm text-slate-500">{result.meaning}</p>
                                            <p className="text-xs text-red-500 mt-1">
                                                선택: <span className="line-through">{result.userAnswer}</span>
                                            </p>
                                        </div>
                                        <X size={20} className="text-red-500 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Spell Failures */}
                    {spellWrong.length > 0 && (
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 text-lg border-l-4 border-indigo-500 pl-3">Spelling 오답 ({spellWrong.length}개)</h3>
                            <div className="space-y-3">
                                {spellWrong.map((result, index) => (
                                    <div key={index} className="bg-white p-4 rounded-xl border border-red-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">{result.meaning}</p>
                                            <p className="text-xs text-red-500">
                                                입력: <span className="line-through font-medium">{result.userAnswer}</span>
                                            </p>
                                            <p className="text-sm text-green-600 font-bold mt-1">
                                                정답: {result.word}
                                            </p>
                                        </div>
                                        <X size={20} className="text-red-500 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Simple Failed List (Retry or Fallback) */}
            {(isRetryResult || (!hasContextResults && simpleWrong.length > 0)) && simpleWrong.length > 0 && (
                <>
                    <h3 className="font-bold text-slate-800 mb-4 text-lg">오답 확인 ({simpleWrong.length}개)</h3>
                    <div className="space-y-3 mb-8">
                        {simpleWrong.map((result, index) => (
                            <div key={index} className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-lg">{result.word}</p>
                                        <p className="text-sm text-slate-500 mb-2">{result.meaning}</p>
                                        <div className="mt-2 p-3 bg-red-50 rounded-lg">
                                            <p className="text-sm">
                                                <span className="text-red-500 font-medium">내 답: </span>
                                                <span className="text-red-600 line-through">{result.userAnswer}</span>
                                            </p>
                                            <p className="text-sm">
                                                <span className="text-green-600 font-medium">정답: </span>
                                                <span className="text-green-700 font-bold">{result.word}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ml-3 bg-red-100 text-red-600">
                                        <X size={24} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Correct Summary */}
            {currentResults.filter(r => r.isCorrect).length > 0 && (
                <div className="bg-green-50 p-4 rounded-2xl border border-green-200 mb-8">
                    <div className="flex items-center gap-2 text-green-700">
                        <Check size={20} />
                        <span className="font-bold">{currentResults.filter(r => r.isCorrect).length}개 정답</span>
                    </div>
                </div>
            )}

            {/* Report Card Button - Bottom */}
            {/* Hide Report Card button on retry screen to avoid confusion, or keep it if desired? User asked for retry functionality primarily. */}
            {!isRetryResult && (
                <button
                    onClick={handleReportCard}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-800 p-4 rounded-2xl font-bold shadow-lg shadow-yellow-200 flex items-center justify-center gap-2 transition-colors text-lg"
                >
                    <FileText size={24} />
                    성적표 보기
                </button>
            )}

            {/* If retry result, maybe show "Return to Full Result"? For now 'Home' is available */}
        </div>
    );
};

export default Result;
