import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronLeft, Download, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const ReportCard = () => {
    const { user, selectedUnit } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const reportRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showCorrectList, setShowCorrectList] = useState(false);

    const { results, totalWords, recallResults, spellResults } = location.state || { results: [], totalWords: 0 };

    // Check if we have separated results
    const hasSeparatedResults = recallResults && spellResults;

    if (!selectedUnit) {
        navigate('/dashboard');
        return null;
    }

    const correctCount = results ? results.filter(r => r.isCorrect).length : 0;
    const wrongResults = results ? results.filter(r => !r.isCorrect) : [];
    const correctResults = results ? results.filter(r => r.isCorrect) : [];
    const actualScore = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0; // Total score calculation might need adjustment if totalWords logic changes
    const unitNumber = selectedUnit.title.match(/\d+/) ? selectedUnit.title.match(/\d+/)[0] : '1';

    // Separate counts
    const recallTotal = hasSeparatedResults ? recallResults.length : 0;
    const recallCorrect = hasSeparatedResults ? recallResults.filter(r => r.isCorrect).length : 0;
    const recallWrongList = hasSeparatedResults ? recallResults.filter(r => !r.isCorrect) : [];

    const spellTotal = hasSeparatedResults ? spellResults.length : 0;
    const spellCorrect = hasSeparatedResults ? spellResults.filter(r => r.isCorrect).length : 0;
    const spellWrongList = hasSeparatedResults ? spellResults.filter(r => !r.isCorrect) : [];

    // If we have separated results, totalWords passed might be just for one test or combined.
    // Let's recalculate true total words based on available results if separated.
    const trueTotalWords = hasSeparatedResults ? (recallTotal + spellTotal) : totalWords;
    const trueCorrectCount = hasSeparatedResults ? (recallCorrect + spellCorrect) : correctCount;
    const trueScore = trueTotalWords > 0 ? Math.round((trueCorrectCount / trueTotalWords) * 100) : 0;


    const handleDownloadImage = async () => {
        if (!reportRef.current) return;
        setIsDownloading(true);

        try {
            const filter = (node) => {
                if (node.tagName === 'BUTTON') return false;
                return true;
            };

            const dataUrl = await htmlToImage.toPng(reportRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                filter: filter,
                style: {
                    '--tw-bg-opacity': '1',
                    '--tw-text-opacity': '1'
                }
            });

            const link = document.createElement('a');
            link.download = `${user?.name || '학생'}_Unit${unitNumber}_성적표.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Image download failed:', error);
            alert('이미지 다운로드 실패: ' + error.message);
        }

        setIsDownloading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 h-14 flex items-center gap-4 shrink-0 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-slate-800 truncate">성적표 보기</h1>
            </header>

            <div className="p-4 flex-1 pb-20 animate-fade-in">
                {/* Report Card Content */}
                <div
                    ref={reportRef}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6"
                >
                    {/* Header with Logo */}
                    <div className="flex items-center justify-between mb-4">
                        <img src="/logo.png" alt="TES 영어학원" className="h-12" />
                        <div className="text-right">
                            <p className="text-xs text-slate-500">TES 영어학원</p>
                            <p className="text-sm text-slate-800 font-bold">{user?.name || '학생'} 학생</p>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-slate-800 mb-1">
                        {user?.name || '학생'}의 Unit {unitNumber} 테스트 성적표
                    </h2>
                    <p className="text-sm text-slate-500 mb-4">{selectedUnit.title}</p>

                    {/* Score Display */}
                    <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-indigo-600 font-medium">종합 정답률</span>
                            <span className="text-3xl font-bold text-indigo-600">{trueScore}%</span>
                        </div>
                        <p className="text-sm text-indigo-500 mt-1">
                            총 {trueTotalWords}문제 중 {trueCorrectCount}문제 정답
                        </p>
                    </div>

                    {/* Stats Table Header */}
                    <div className="bg-green-500 p-3 rounded-t-lg flex items-center gap-2 text-white">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">단어</span>
                        <span className="text-sm font-medium">{selectedUnit.title}</span>
                    </div>

                    {/* Stats Table Body */}
                    <div className="border border-slate-200 border-t-0 rounded-b-lg overflow-hidden mb-4">
                        <div className="p-4">
                            <h3 className="font-bold text-slate-800 mb-3 text-sm">테스트 세부 결과</h3>

                            <div className="border border-slate-200 rounded-lg overflow-hidden text-sm">
                                {/* Header Row */}
                                <div className="flex border-b border-slate-200 bg-slate-50">
                                    <div className="w-1/4 p-3 text-slate-600 font-bold text-center border-r border-slate-200">구분</div>
                                    <div className="w-1/4 p-3 text-slate-600 font-medium text-center border-r border-slate-200">문제</div>
                                    <div className="w-1/4 p-3 text-slate-600 font-medium text-center border-r border-slate-200">정답</div>
                                    <div className="w-1/4 p-3 text-slate-600 font-medium text-center">오답</div>
                                </div>

                                {hasSeparatedResults ? (
                                    <>
                                        {/* Recall Row */}
                                        <div className="flex border-b border-slate-200">
                                            <div className="w-1/4 p-3 bg-slate-50 text-slate-700 font-bold text-center border-r border-slate-200">Recall</div>
                                            <div className="w-1/4 p-3 text-center border-r border-slate-200">{recallTotal}</div>
                                            <div className="w-1/4 p-3 text-center text-green-600 font-bold border-r border-slate-200">{recallCorrect}</div>
                                            <div className="w-1/4 p-3 text-center text-red-600 font-bold">{recallWrongList.length}</div>
                                        </div>
                                        {/* Spell Row */}
                                        <div className="flex border-b border-slate-200">
                                            <div className="w-1/4 p-3 bg-slate-50 text-slate-700 font-bold text-center border-r border-slate-200">Spell</div>
                                            <div className="w-1/4 p-3 text-center border-r border-slate-200">{spellTotal}</div>
                                            <div className="w-1/4 p-3 text-center text-green-600 font-bold border-r border-slate-200">{spellCorrect}</div>
                                            <div className="w-1/4 p-3 text-center text-red-600 font-bold">{spellWrongList.length}</div>
                                        </div>
                                    </>
                                ) : (
                                    // Fallback for single test result
                                    <div className="flex border-b border-slate-200">
                                        <div className="w-1/4 p-3 bg-slate-50 text-slate-700 font-bold text-center border-r border-slate-200">합계</div>
                                        <div className="w-1/4 p-3 text-center border-r border-slate-200">{totalWords}</div>
                                        <div className="w-1/4 p-3 text-center text-green-600 font-bold border-r border-slate-200">{correctCount}</div>
                                        <div className="w-1/4 p-3 text-center text-red-600 font-bold">{wrongResults.length}</div>
                                    </div>
                                )}

                                {/* Total Row */}
                                <div className="flex bg-indigo-50">
                                    <div className="w-1/4 p-3 text-indigo-700 font-bold text-center border-r border-indigo-100">합계</div>
                                    <div className="w-1/4 p-3 text-center font-bold text-indigo-600 border-r border-indigo-100">{trueTotalWords}</div>
                                    <div className="w-1/4 p-3 text-center font-bold text-indigo-600 border-r border-indigo-100">{trueCorrectCount}</div>
                                    <div className="w-1/4 p-3 text-center font-bold text-red-600">{recallWrongList.length + spellWrongList.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wrong Answers List */}
                    {(recallWrongList.length > 0 || spellWrongList.length > 0) && (
                        <div className="mb-4">
                            <h3 className="font-bold text-slate-800 mb-3 text-sm">오답 목록</h3>

                            {/* Recall Wrong */}
                            {recallWrongList.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs font-bold text-slate-500 mb-2 px-1">Recall Test 오답</div>
                                    <div className="space-y-2">
                                        {recallWrongList.map((result, index) => (
                                            <div key={`r-${index}`} className="flex items-center gap-2 text-sm bg-red-50 p-2 rounded-lg">
                                                <X size={14} className="text-red-500 shrink-0" />
                                                <span className="font-bold text-slate-700 w-24 truncate">{result.word}</span>
                                                <div className="flex-1 text-xs">
                                                    <div className="text-slate-500">{result.meaning}</div>
                                                    <div className="text-red-400">오답: {result.userAnswer}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Spell Wrong */}
                            {spellWrongList.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-slate-500 mb-2 px-1">Spelling Test 오답</div>
                                    <div className="space-y-2">
                                        {spellWrongList.map((result, index) => (
                                            <div key={`s-${index}`} className="flex items-center gap-2 text-sm bg-red-50 p-2 rounded-lg">
                                                <X size={14} className="text-red-500 shrink-0" />
                                                <span className="text-slate-500 text-xs w-24 truncate">{result.meaning}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-red-600 line-through text-xs">{result.userAnswer || '(미입력)'}</span>
                                                        <span className="text-slate-400 text-xs">→</span>
                                                        <span className="text-green-600 font-bold">{result.word}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Correct Answers - Collapsible */}
                    {correctResults.length > 0 && (
                        <div>
                            <button
                                onClick={() => setShowCorrectList(!showCorrectList)}
                                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-2"
                            >
                                {showCorrectList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span className="font-medium">정답 목록 ({correctResults.length}개)</span>
                            </button>
                            {showCorrectList && (
                                <div className="flex flex-wrap gap-2">
                                    {correctResults.map((result, index) => (
                                        <div key={index} className="flex items-center gap-1 text-sm bg-green-50 px-2 py-1 rounded-lg">
                                            <Check size={12} className="text-green-500" />
                                            <span className="text-green-700">{result.word}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownloadImage}
                    disabled={isDownloading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-colors"
                >
                    <Download size={20} />
                    {isDownloading ? '다운로드 중...' : '이미지로 저장하기'}
                </button>
            </div>
        </div>
    );
};

export default ReportCard;
