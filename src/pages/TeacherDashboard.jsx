import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Calendar, ChevronRight, Copy, ExternalLink, Loader2, ArrowLeft, Search } from 'lucide-react';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [groupedData, setGroupedData] = useState({});
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple hardcoded password for now. Can be moved to env vars later.
        if (password === 'tes1234') {
            setIsAuthenticated(true);
        } else {
            setLoginError('비밀번호가 일치하지 않습니다.');
        }
    };

    useEffect(() => {
        const fetchAllResults = async () => {
            try {
                if (!supabase) {
                    throw new Error('Supabase client is not initialized. Please check environment variables.');
                }

                // Fetch all test results, ordered by most recent first
                const { data, error } = await supabase
                    .from('test_results')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Group by student name
                const grouped = data.reduce((acc, curr) => {
                    const name = curr.user_name || 'Anonymous';
                    if (!acc[name]) acc[name] = [];
                    acc[name].push(curr);
                    return acc;
                }, {});

                setGroupedData(grouped);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || '데이터를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            setLoading(true);
            fetchAllResults();
        }
    }, [isAuthenticated]);

    const students = Object.keys(groupedData).sort();
    const filteredStudents = students.filter(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopyLink = (e, id) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/shared-report/${id}`;
        navigator.clipboard.writeText(shareUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleViewReport = (e, id) => {
        e.stopPropagation();
        window.open(`/shared-report/${id}`, '_blank');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-sm">
                    <div className="flex justify-center mb-6">
                        <Users size={48} className="text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">선생님 로그인</h1>
                    <p className="text-slate-500 text-center mb-8 text-sm">대시보드에 접근하려면 비밀번호를 입력하세요.</p>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setLoginError('');
                                }}
                                placeholder="비밀번호"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                autoFocus
                            />
                            {loginError && <p className="text-red-500 text-xs mt-2 ml-1">{loginError}</p>}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all"
                        >
                            입장하기
                        </button>
                    </form>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full mt-4 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors py-2"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">데이터를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md w-full text-center">
                    <p className="font-bold mb-2">오류가 발생했습니다</p>
                    <p className="text-sm">{error}</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-4 px-4 py-2 bg-white text-slate-800 rounded-lg shadow-sm text-sm font-medium"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative">
            {/* Header */}
            <header className="bg-indigo-600 text-white shadow-sm px-4 h-16 flex items-center justify-between shrink-0 sticky top-0 z-10 rounded-b-2xl mb-4">
                <div className="flex items-center gap-3">
                    {selectedStudent ? (
                        <button onClick={() => setSelectedStudent(null)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    ) : (
                        <Users size={24} />
                    )}
                    <h1 className="font-bold text-lg">
                        {selectedStudent ? `${selectedStudent} 학생 성적` : '선생님 대시보드'}
                    </h1>
                </div>
            </header>

            <main className="flex-1 p-4 overflow-y-auto">
                {!selectedStudent ? (
                    // Student List View
                    <div className="animate-fade-in space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="학생 이름 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* Stats Summary */}
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                                <span className="text-slate-400 text-xs font-medium mb-1">총 학생 수</span>
                                <span className="text-2xl font-bold text-slate-800">{students.length}명</span>
                            </div>
                            <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                                <span className="text-slate-400 text-xs font-medium mb-1">총 시험 건수</span>
                                <span className="text-2xl font-bold text-indigo-600">
                                    {Object.values(groupedData).flat().length}건
                                </span>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-2 pb-8">
                            <h2 className="text-sm font-bold text-slate-500 mb-3 px-1 border-b border-slate-200 pb-2">학생 목록 ({filteredStudents.length})</h2>
                            {filteredStudents.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">검색 결과가 없습니다.</p>
                            ) : (
                                filteredStudents.map(studentName => {
                                    const studentTests = groupedData[studentName];
                                    const latestTest = studentTests[0]; // ordered by desc
                                    
                                    return (
                                        <button
                                            key={studentName}
                                            onClick={() => setSelectedStudent(studentName)}
                                            className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                    {studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{studentName}</h3>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        최근: {formatDate(latestTest.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                                        총 {studentTests.length}건
                                                    </div>
                                                </div>
                                                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500" />
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    // Detail Detail View (Timeline)
                    <div className="animate-fade-in relative pb-10">
                        {/* Student Header */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-6 flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-indigo-200 shadow-lg">
                                {selectedStudent.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{selectedStudent}</h2>
                                <p className="text-sm text-slate-500">총 {groupedData[selectedStudent].length}번의 시험 응시</p>
                            </div>
                        </div>

                        {/* Test Timeline */}
                        <div className="pl-4 border-l-2 border-indigo-100 space-y-6 relative ml-4">
                            {groupedData[selectedStudent].map((test, index) => {
                                const hasSubScores = test.recall_total > 0 || test.spell_total > 0;
                                const isPerfect = test.score === 100;
                                
                                return (
                                    <div key={test.id} className="relative">
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[21px] w-4 h-4 rounded-full border-4 border-white ${isPerfect ? 'bg-emerald-500' : 'bg-indigo-400'} shadow-sm`} />
                                        
                                        {/* Content Card */}
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            {/* Card Header */}
                                            <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center justify-between">
                                                <div className="flex border items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-600">
                                                        {formatDate(test.created_at)}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                                                    #{groupedData[selectedStudent].length - index}
                                                </div>
                                            </div>
                                            
                                            {/* Card Body */}
                                            <div className="p-4 flex gap-4">
                                                <div className="flex-1">
                                                    <p className="text-xs text-indigo-500 font-bold mb-1">{test.book_title}</p>
                                                    <h3 className="font-bold text-slate-800 leading-tight mb-2">
                                                        {test.unit_title}
                                                    </h3>
                                                    <div className="flex gap-2 text-xs">
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
                                                            총 {test.total_questions}문항
                                                        </span>
                                                        {hasSubScores && (
                                                            <span className="bg-red-50 text-red-600 px-2 py-1 rounded font-medium">
                                                                오답 {(test.recall_wrong?.length || 0) + (test.spell_wrong?.length || 0)}개
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Score Badge */}
                                                <div className="flex flex-col items-center justify-center shrink-0">
                                                    <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 ${isPerfect ? 'border-emerald-100 text-emerald-600' : 'border-indigo-50 text-indigo-600'} mb-1`}>
                                                        <span className="text-lg font-bold leading-none">{test.score}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-bold">SCORE</span>
                                                </div>
                                            </div>

                                            {/* Card Actions (Bottom bar) */}
                                            <div className="flex border-t border-slate-100 bg-slate-50/50">
                                                <button 
                                                    onClick={(e) => handleViewReport(e, test.id)}
                                                    className="flex-1 py-3 px-2 flex items-center justify-center gap-2 text-sm text-slate-600 font-medium hover:text-indigo-600 hover:bg-indigo-50 transition-colors border-r border-slate-100"
                                                >
                                                    <ExternalLink size={16} />
                                                    성적표 보기
                                                </button>
                                                <button 
                                                    onClick={(e) => handleCopyLink(e, test.id)}
                                                    className="flex-1 py-3 px-2 flex items-center justify-center gap-2 text-sm text-indigo-600 font-bold hover:bg-slate-100 transition-colors"
                                                >
                                                    {copiedId === test.id ? (
                                                        <span className="text-emerald-600 flex items-center gap-1">복사됨!</span>
                                                    ) : (
                                                        <><Copy size={16} /> 링크 복사</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;
