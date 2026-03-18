import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Calendar, ChevronRight, Copy, ExternalLink, Loader2, ArrowLeft, Search, Trash2, CalendarCheck, FileText } from 'lucide-react';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [groupedData, setGroupedData] = useState({});
    const [studentMap, setStudentMap] = useState({});
    
    const [selectedDate, setSelectedDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [totalStudents, setTotalStudents] = useState(0);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'tes1234') {
            setIsAuthenticated(true);
        } else {
            setLoginError('비밀번호가 일치하지 않습니다.');
        }
    };

    const fetchAllResults = async () => {
        try {
            if (!supabase) {
                throw new Error('Supabase client is not initialized. Please check environment variables.');
            }

            const [resultsRes, studentsRes] = await Promise.all([
                supabase.from('test_results').select('*').order('created_at', { ascending: false }),
                supabase.from('students').select('*')
            ]);

            if (resultsRes.error) throw resultsRes.error;

            const tempStudentMap = {};
            if (studentsRes.data) {
                studentsRes.data.forEach(s => {
                    tempStudentMap[s.id] = s;
                });
                setTotalStudents(studentsRes.data.length);
            }
            setStudentMap(tempStudentMap);

            // Group by Date (YYYY-MM-DD local time)
            const grouped = resultsRes.data.reduce((acc, curr) => {
                const d = new Date(curr.created_at);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

                const studentInfo = curr.student_id ? tempStudentMap[curr.student_id] : null;
                const name = studentInfo?.name || curr.user_name || 'Anonymous';
                const grade = studentInfo?.grade || '';
                
                if (!acc[dateStr]) acc[dateStr] = [];
                acc[dateStr].push({
                    ...curr,
                    student_name: name,
                    grade: grade
                });
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

    useEffect(() => {
        if (isAuthenticated) {
            setLoading(true);
            fetchAllResults();
        }
    }, [isAuthenticated]);

    const handleDeleteStudent = async (e, studentId, studentName) => {
        e.stopPropagation();
        if (!studentId) {
            alert('초기 버전에서 생성된 계정(ID 없음)이라 삭제할 수 없습니다.');
            return;
        }

        const confirmed = window.confirm(`[경고] '${studentName}' 학생을 정말 삭제하시겠습니까?\n\n학생 정보와 모든 시험 기록이 영구적으로 삭제되며 절대 복구할 수 없습니다.`);
        if (!confirmed) return;

        try {
            // Because test_results table has a foreign key to students, 
            // deleting from students will fail if it's not cascaded, OR it might cascade.
            // Let's delete test_results first to be safe if no CASCADE was set up.
            await supabase.from('test_results').delete().eq('student_id', studentId);
            const { error: deleteStudentError } = await supabase.from('students').delete().eq('id', studentId);
            
            if (deleteStudentError) throw deleteStudentError;
            
            alert('성공적으로 삭제되었습니다.');
            setLoading(true);
            fetchAllResults();
        } catch (err) {
            console.error('Delete error:', err);
            alert('삭제 중 오류가 발생했습니다: ' + err.message);
        }
    };

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

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    const getDayName = (dateStr) => {
        // Create dates using local midnight to avoid timezone shift issues
        const [year, month, day] = dateStr.split('-');
        const d = new Date(year, month - 1, day);
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        const isYesterday = d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();

        if (isToday) return '오늘';
        if (isYesterday) return '어제';
        
        return new Intl.DateTimeFormat('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        }).format(d);
    };

    // Filter by search query
    const rawDates = Object.keys(groupedData).sort((a,b) => b.localeCompare(a));
    const filteredGroups = rawDates.map(dateStr => {
        const matchingTests = groupedData[dateStr].filter(test => 
            test.student_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { dateStr, label: getDayName(dateStr), tests: matchingTests };
    }).filter(group => group.tests.length > 0);

    const activeGroup = filteredGroups.find(g => g.dateStr === selectedDate) || filteredGroups[0];
    const totalTestsCount = rawDates.reduce((sum, dateStr) => sum + groupedData[dateStr].length, 0);

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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Full-width Responsive Header */}
            <header className="bg-indigo-600 text-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {selectedDate && (
                            <button onClick={() => setSelectedDate(null)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors md:hidden">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <Users size={24} className="hidden md:block" />
                        <h1 className="font-bold text-lg">
                            선생님 대시보드
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main 2-Column Responsive Layout */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6">
                
                {/* LEFT PANEL: Master List (Dates/Stats) */}
                <div className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-4 ${selectedDate ? 'hidden md:flex' : 'flex'}`}>
                    
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
                    <div className="flex gap-3">
                        <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                            <span className="text-slate-400 text-xs font-medium mb-1">총 등록 학생</span>
                            <span className="text-xl font-bold text-slate-800">{totalStudents}명</span>
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                            <span className="text-slate-400 text-xs font-medium mb-1">총 시험 건수</span>
                            <span className="text-xl font-bold text-indigo-600">{totalTestsCount}건</span>
                        </div>
                    </div>

                    {/* Date List (Calendar mode) */}
                    <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                <Calendar size={16} />
                                날짜별 시험 기록
                            </h2>
                        </div>
                        <div className="p-2 overflow-y-auto space-y-1 max-h-[calc(100vh-280px)]">
                            {filteredGroups.length === 0 ? (
                                <p className="text-center text-slate-400 py-8 text-sm">기록이 없습니다.</p>
                            ) : (
                                filteredGroups.map(group => {
                                    const isActive = (selectedDate || filteredGroups[0]?.dateStr) === group.dateStr;
                                    return (
                                        <button
                                            key={group.dateStr}
                                            onClick={() => setSelectedDate(group.dateStr)}
                                            className={`w-full p-3 rounded-xl transition-all flex items-center justify-between text-left group
                                                ${isActive ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm' : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                                    ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                    {group.label === '오늘' ? '금' : group.label === '어제' ? '작' : group.dateStr.split('-')[2]}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-sm ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                        {group.label.includes('월') ? group.label : `${group.label} (${group.dateStr.replace('2026-','')})`}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`text-xs font-bold px-2 py-0.5 rounded-md
                                                    ${isActive ? 'bg-indigo-200/50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {group.tests.length}명
                                                </div>
                                                <ChevronRight size={16} className={`hidden md:block ${isActive ? 'text-indigo-400' : 'opacity-0'}`} />
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Detail Board for Selected Date */}
                <div className={`flex-1 flex flex-col gap-4 ${!selectedDate && filteredGroups.length > 0 ? 'hidden md:flex' : 'flex'}`}>
                    
                    {!activeGroup ? (
                        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-8">
                            <CalendarCheck size={48} className="text-slate-200 mb-4" />
                            <h2 className="text-xl font-bold text-slate-400">선택된 날짜가 없습니다</h2>
                            <p className="text-slate-400 mt-2 text-sm">왼쪽 목록에서 날짜를 선택해주세요.</p>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col animate-fade-in relative pb-10">
                            {/* Panel Header */}
                            <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                        <Calendar size={18} />
                                        <h2 className="text-lg font-bold">{activeGroup.label.includes('월') ? activeGroup.label : `${activeGroup.label} (${activeGroup.dateStr})`}</h2>
                                    </div>
                                    <p className="text-slate-500 text-sm">총 {activeGroup.tests.length}명의 학생이 이 날 시험을 완료했습니다.</p>
                                </div>
                            </div>

                            {/* Test Cards List */}
                            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                                {activeGroup.tests.map((test, index) => {
                                    const isPerfect = test.score === 100;
                                    
                                    return (
                                        <div key={test.id} className="relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                            
                                            {/* Score & Basic Info */}
                                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                                                
                                                {/* Left Profile Area */}
                                                <div className="flex items-center gap-4 sm:w-1/3 shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                                        {test.student_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                            {test.student_name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                                                            {test.grade && <span className="text-indigo-500">{test.grade}</span>}
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                {formatTime(test.created_at)} 제출
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Middle Test Details */}
                                                <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                                    <p className="text-xs text-indigo-500 font-bold mb-0.5"><FileText size={12} className="inline mr-1 -mt-0.5"/> {test.book_title}</p>
                                                    <p className="font-bold text-slate-700 text-sm">{test.unit_title}</p>
                                                    
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">
                                                            총 {test.total_questions}문항
                                                        </span>
                                                        {(test.incorrect_answers?.length > 0) && (
                                                            <span className="text-xs bg-red-50 border border-red-100 text-red-600 px-2 py-0.5 rounded font-medium">
                                                                오답 {test.incorrect_answers.length}개
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Score & Actions */}
                                                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-3 shrink-0 sm:w-24">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`text-3xl font-black ${isPerfect ? 'text-emerald-500' : 'text-indigo-600'} leading-none`}>
                                                            {test.score}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-bold tracking-wider mt-1">SCORE</span>
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={(e) => handleCopyLink(e, test.id)}
                                                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                                            title="공유 링크 복사"
                                                        >
                                                            {copiedId === test.id ? <Copy size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleViewReport(e, test.id)}
                                                            className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                                                            title="성적표 열기"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </button>
                                                        {test.student_id && (
                                                            <button 
                                                                onClick={(e) => handleDeleteStudent(e, test.student_id, test.student_name)}
                                                                className="p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors ml-1"
                                                                title="학생 및 시험 기록 전체 삭제"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
