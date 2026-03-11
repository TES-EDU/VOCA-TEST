import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Check, X, Loader2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { ProgressRoadmap } from './ReportCard';

const SharedReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWrongList, setShowWrongList] = useState(true);
    const [showCorrectList, setShowCorrectList] = useState(false);
    const [showRoadmap, setShowRoadmap] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                if (!supabase) {
                    throw new Error('성적표 데이터를 불러올 수 없습니다. (환경 변수 설정 필요)');
                }
                const { data, error } = await supabase
                    .from('test_results')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setReport(data);
            } catch (err) {
                console.error("Error fetching report:", err);
                setError("성적표를 찾을 수 없거나 삭제되었습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchReport();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">성적표를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-sm w-full">
                    <X size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800 mb-2">오류 발생</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                        TES VOCA 홈으로 가기
                    </button>
                </div>
            </div>
        );
    }

    // Extract data from report
    const recallTotal = report.recall_total || 0;
    const recallCorrect = report.recall_correct || 0;
    const recallWrongList = report.recall_wrong || [];
    const spellTotal = report.spell_total || 0;
    const spellCorrect = report.spell_correct || 0;
    const spellWrongList = report.spell_wrong || [];
    const hasSeparatedResults = recallTotal > 0 || spellTotal > 0;

    const trueTotalWords = hasSeparatedResults ? (recallTotal + spellTotal) : report.total_questions;
    const trueCorrectCount = hasSeparatedResults ? (recallCorrect + spellCorrect) : (report.correct_answers?.length || 0);
    const trueScore = report.score || (trueTotalWords > 0 ? Math.round((trueCorrectCount / trueTotalWords) * 100) : 0);
    const totalWrong = recallWrongList.length + spellWrongList.length;

    // Fallback wrong answers for old data format
    const fallbackWrong = report.incorrect_answers || [];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 h-14 flex items-center gap-4 shrink-0 sticky top-0 z-10">
                <div
                    className="flex items-center gap-2 font-bold text-indigo-600 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <BookOpen size={24} />
                    <span>TES VOCA</span>
                </div>
            </header>

            <div className="p-4 flex-1 pb-20 animate-fade-in max-w-lg mx-auto w-full">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    {/* Header with Logo */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                        <img src="/logo.png" alt="TES 영어학원" className="h-10" onError={(e) => { e.target.style.display = 'none' }} />
                        <div className="text-right">
                            <p className="text-xs text-slate-400">TES 영어학원</p>
                            <p className="text-sm text-slate-700">{report.book_title}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-slate-800 mb-1">
                        {report.user_name}의 테스트 성적표
                    </h2>
                    <p className="text-sm text-slate-400 mb-4">{report.unit_title}</p>

                    {/* Progress Roadmap */}
                    {(() => {
                        const levelMatch = report.book_title?.match(/Lv\.?(\d+)/i) || report.book_title?.match(/Level\s*(\d+)/i);
                        const currentLevel = levelMatch ? parseInt(levelMatch[1]) : 0;
                        const unitMatch = report.unit_title?.match(/(\d+)/);
                        const unitNumber = unitMatch ? parseInt(unitMatch[1]) : 1;
                        return (
                            <ProgressRoadmap
                                currentLevel={currentLevel}
                                currentUnit={unitNumber}
                                isOpen={showRoadmap}
                                onToggle={() => setShowRoadmap(!showRoadmap)}
                            />
                        );
                    })()}

                    {/* Score Display */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 mb-4 text-white relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="relative z-10">
                            <p className="text-indigo-100 text-sm font-medium mb-1">종합 정답률</p>
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-bold">{trueScore}</span>
                                <span className="text-2xl font-bold mb-1">%</span>
                            </div>
                            <p className="text-indigo-200 text-sm mt-2">
                                총 {trueTotalWords}문제 중 {trueCorrectCount}문제 정답
                            </p>
                        </div>
                    </div>

                    {/* Stats Table */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
                        <div className="bg-emerald-500 p-3 flex items-center gap-2 text-white">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">단어</span>
                            <span className="text-sm font-medium">{report.unit_title}</span>
                        </div>

                        <div className="p-4 bg-white">
                            <div className="rounded-lg border border-slate-100 overflow-hidden text-sm">
                                <div className="flex bg-slate-50 border-b border-slate-100">
                                    <div className="w-1/4 p-2.5 text-slate-500 font-bold text-center">구분</div>
                                    <div className="w-1/4 p-2.5 text-slate-500 font-medium text-center">문제</div>
                                    <div className="w-1/4 p-2.5 text-slate-500 font-medium text-center">정답</div>
                                    <div className="w-1/4 p-2.5 text-slate-500 font-medium text-center">오답</div>
                                </div>

                                {hasSeparatedResults && (
                                    <>
                                        <div className="flex border-b border-slate-50">
                                            <div className="w-1/4 p-2.5 bg-slate-50 text-slate-600 font-medium text-center">Recall</div>
                                            <div className="w-1/4 p-2.5 text-center text-slate-600">{recallTotal}</div>
                                            <div className="w-1/4 p-2.5 text-center text-emerald-600 font-bold">{recallCorrect}</div>
                                            <div className="w-1/4 p-2.5 text-center text-red-500 font-bold">{recallWrongList.length}</div>
                                        </div>
                                        <div className="flex border-b border-slate-50">
                                            <div className="w-1/4 p-2.5 bg-slate-50 text-slate-600 font-medium text-center">Spell</div>
                                            <div className="w-1/4 p-2.5 text-center text-slate-600">{spellTotal}</div>
                                            <div className="w-1/4 p-2.5 text-center text-emerald-600 font-bold">{spellCorrect}</div>
                                            <div className="w-1/4 p-2.5 text-center text-red-500 font-bold">{spellWrongList.length}</div>
                                        </div>
                                    </>
                                )}

                                <div className="flex bg-indigo-50">
                                    <div className="w-1/4 p-2.5 text-indigo-700 font-bold text-center">합계</div>
                                    <div className="w-1/4 p-2.5 text-center font-bold text-indigo-600">{trueTotalWords}</div>
                                    <div className="w-1/4 p-2.5 text-center font-bold text-emerald-600">{trueCorrectCount}</div>
                                    <div className="w-1/4 p-2.5 text-center font-bold text-red-500">{hasSeparatedResults ? totalWrong : fallbackWrong.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wrong Answers List - Collapsible */}
                    {(totalWrong > 0 || fallbackWrong.length > 0) && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
                            <button
                                onClick={() => setShowWrongList(!showWrongList)}
                                className="w-full bg-slate-50 p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={14} className="text-red-500" />
                                    <span className="font-bold text-slate-700 text-sm">오답 목록</span>
                                    <span className="text-xs text-red-500">{hasSeparatedResults ? totalWrong : fallbackWrong.length}개</span>
                                </div>
                                {showWrongList ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                            </button>

                            {showWrongList && (
                                <div className="p-4 bg-white space-y-3">
                                    {hasSeparatedResults ? (
                                        <>
                                            {recallWrongList.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 mb-2">Recall</div>
                                                    <div className="space-y-2">
                                                        {recallWrongList.map((item, index) => (
                                                            <div key={`r-${index}`} className="flex items-center gap-3 text-sm bg-red-50 p-3 rounded-lg">
                                                                <X size={14} className="text-red-400 shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-bold text-slate-700 truncate">{item.word}</div>
                                                                    <div className="text-xs text-slate-400">{item.meaning}</div>
                                                                </div>
                                                                <div className="text-xs text-red-400 shrink-0">선택: {item.userAnswer}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {spellWrongList.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 mb-2">Spelling</div>
                                                    <div className="space-y-2">
                                                        {spellWrongList.map((item, index) => (
                                                            <div key={`s-${index}`} className="flex items-center gap-3 text-sm bg-red-50 p-3 rounded-lg">
                                                                <X size={14} className="text-red-400 shrink-0" />
                                                                <div className="flex-1 min-w-0 text-xs text-slate-500 truncate">{item.meaning}</div>
                                                                <div className="flex items-center gap-1 text-xs shrink-0">
                                                                    <span className="text-red-400 line-through">{item.userAnswer || '∅'}</span>
                                                                    <span className="text-slate-300">→</span>
                                                                    <span className="text-emerald-600 font-bold">{item.word}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* Fallback for old data format */
                                        <div className="space-y-2">
                                            {fallbackWrong.map((item, index) => (
                                                <div key={index} className="flex items-center gap-3 text-sm bg-red-50 p-3 rounded-lg">
                                                    <X size={14} className="text-red-400 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-slate-700 truncate">{item.word}</div>
                                                        <div className="text-xs text-slate-400">{item.meaning}</div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs shrink-0">
                                                        <span className="text-red-400 line-through">{item.userAnswer || '∅'}</span>
                                                        <span className="text-slate-300">→</span>
                                                        <span className="text-emerald-600 font-bold">{item.word}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Correct Answers - Collapsible */}
                    {report.correct_answers && report.correct_answers.length > 0 && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setShowCorrectList(!showCorrectList)}
                                className="w-full bg-slate-50 p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Check size={14} className="text-emerald-500" />
                                    <span className="font-bold text-slate-700 text-sm">정답 목록</span>
                                    <span className="text-xs text-emerald-500">{report.correct_answers.length}개</span>
                                </div>
                                {showCorrectList ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                            </button>

                            {showCorrectList && (
                                <div className="p-4 bg-white">
                                    <div className="flex flex-wrap gap-2">
                                        {report.correct_answers.map((word, i) => (
                                            <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                                {word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SharedReport;
