import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Check, X, Loader2 } from 'lucide-react';

const SharedReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
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

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center">
            {/* Header / App Logo */}
            <div
                className="flex items-center gap-2 font-bold text-indigo-600 text-xl cursor-pointer mb-8"
                onClick={() => navigate('/')}
            >
                <BookOpen size={28} />
                <span>TES VOCA</span>
            </div>

            <div className="w-full max-w-md animate-fade-in pb-8">
                {/* Score Card */}
                <div className="bg-indigo-600 text-white rounded-3xl p-10 text-center shadow-xl shadow-indigo-200 mb-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-indigo-100 font-semibold mb-2">
                            {report.book_title} - {report.unit_title}
                        </h2>
                        <div className="text-xl font-medium mb-6">
                            <span className="bg-white/20 px-4 py-1.5 rounded-full inline-block">
                                {report.user_name} 님의 성적
                            </span>
                        </div>
                        <div className="text-8xl font-bold mb-4">{report.score}</div>
                        <p className="text-indigo-200 text-lg">
                            총 {report.total_questions}문제 중 {report.correct_answers?.length || 0}개 정답
                        </p>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>

                {/* Incorrect Answers List */}
                {report.incorrect_answers && report.incorrect_answers.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-bold text-slate-800 mb-4 text-lg px-2">오답 확인 ({report.incorrect_answers.length}개)</h3>
                        <div className="space-y-3">
                            {report.incorrect_answers.map((item, index) => (
                                <div key={index} className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-lg mb-1">{item.word}</p>
                                            <p className="text-sm text-slate-500 mb-3">{item.meaning}</p>
                                            <div className="p-3 bg-red-50 rounded-lg">
                                                <p className="text-sm mb-1">
                                                    <span className="text-red-500 font-medium">제출한 답: </span>
                                                    <span className="text-red-600 line-through">{item.userAnswer}</span>
                                                </p>
                                                <p className="text-sm">
                                                    <span className="text-green-600 font-medium">정답: </span>
                                                    <span className="text-green-700 font-bold">{item.word}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Correct Answers Summary */}
                {report.correct_answers && report.correct_answers.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
                        <h3 className="font-bold text-slate-800 mb-3 text-lg flex items-center gap-2">
                            <Check className="text-green-500" size={20} />
                            맞춘 단어 ({report.correct_answers.length}개)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {report.correct_answers.map((word, i) => (
                                <span key={i} className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium border border-slate-200">
                                    {word}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Call To Action */}
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold shadow-lg shadow-slate-200 flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                >
                    나도 TES VOCA 시작하기
                </button>
            </div>
        </div>
    );
};

export default SharedReport;
