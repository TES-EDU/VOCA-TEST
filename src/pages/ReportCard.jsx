import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronLeft, Download, X, Check, ChevronDown, ChevronUp, MapPin, AlertCircle } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

// Progress Roadmap Component - Separated for reuse
export const ProgressRoadmap = ({ currentLevel, currentUnit, isOpen, onToggle }) => {
    // Basic: 3 segments (0->1, 1->2, 2->3)
    // Intermediate: 3 segments (3->4, 4->5, 5->6)
    // Advanced: 2 segments (6->7, 7->8)
    const tiers = [
        { name: 'Basic', levels: [0, 1, 2, 3], color: 'emerald' },
        { name: 'Intermediate', levels: [3, 4, 5, 6], color: 'sky' },
        { name: 'Advanced', levels: [6, 7, 8], color: 'violet' }
    ];

    const getTierForLevel = (level) => {
        for (const tier of tiers) {
            const isLast = tier.levels.indexOf(level) === tier.levels.length - 1;
            if (tier.levels.includes(level) && !isLast) return tier;
        }
        for (const tier of tiers) {
            if (tier.levels.includes(level)) return tier;
        }
        return tiers[0];
    };

    const currentTier = getTierForLevel(currentLevel);
    const levelLabelsMap = {
        'Basic': 'Lv. 0, 1, 2',
        'Intermediate': 'Lv. 3, 4, 5',
        'Advanced': 'Lv. 6, 7'
    };

    return (
        <div className="mb-4 rounded-xl border border-slate-200 overflow-hidden">
            {/* Toggle Header */}
            <button
                onClick={onToggle}
                className="w-full bg-slate-50 p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-indigo-500" />
                    <span className="font-bold text-slate-700 text-sm">나의 진도표</span>
                    <span className="text-xs text-slate-500">
                        {currentTier.name} Lv.{currentLevel} / Unit {currentUnit}
                    </span>
                </div>
                {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="p-4 bg-white">
                    <div className="space-y-6">
                        {tiers.map((tier) => {
                            const colorStyles = {
                                emerald: { text: 'text-emerald-500', fill: 'fill-emerald-500', stroke: 'stroke-emerald-500', border: 'border-emerald-500' },
                                sky: { text: 'text-sky-500', fill: 'fill-sky-500', stroke: 'stroke-sky-500', border: 'border-sky-500' },
                                violet: { text: 'text-violet-500', fill: 'fill-violet-500', stroke: 'stroke-violet-500', border: 'border-violet-500' }
                            };
                            const colors = colorStyles[tier.color];
                            const isCurrentTier = tier.name === currentTier.name;
                            const levelLabels = levelLabelsMap[tier.name];

                            // SVG Configuration
                            const width = 1000;
                            const height = 80;
                            const paddingX = 40;
                            const availableWidth = width - (paddingX * 2);
                            const segmentCount = tier.levels.length - 1;
                            const segmentWidth = availableWidth / segmentCount;
                            const centerY = height / 2 + 10;

                            return (
                                <div key={tier.name} className="transition-all duration-300">
                                    {/* Tier Label */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-slate-600">{tier.name}</span>
                                        <span className="text-xs text-slate-400">{levelLabels}</span>
                                    </div>

                                    {/* SVG Progress Track */}
                                    <div className="w-full">
                                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block select-none">
                                            {/* Background Line */}
                                            <line
                                                x1={paddingX}
                                                y1={centerY}
                                                x2={width - paddingX}
                                                y2={centerY}
                                                stroke="#cbd5e1" // slate-300
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />

                                            {/* Segments and Ticks */}
                                            {tier.levels.map((level, i) => {
                                                const x = paddingX + (i * segmentWidth);
                                                const isLast = i === tier.levels.length - 1;
                                                const isCurrentLevel = level === currentLevel;

                                                // Determine styles based on state
                                                const isActiveNode = level <= currentLevel && isCurrentTier;
                                                const isCurrentNode = level === currentLevel && isCurrentTier;

                                                const dotColor = isActiveNode ? colors.fill : 'fill-white';
                                                const dotStroke = isActiveNode ? colors.stroke : 'stroke-slate-300';

                                                return (
                                                    <g key={level}>
                                                        {/* 30 Ticks following this node (if not last) */}
                                                        {!isLast && (
                                                            <g>
                                                                {[...Array(30)].map((_, t) => {
                                                                    const tickDist = segmentWidth / 31;
                                                                    const tx = x + (tickDist * (t + 1));
                                                                    const unitNum = t + 1;

                                                                    // Check if this is the current active tick marker
                                                                    const isCurrentTick = isCurrentLevel && unitNum === currentUnit && isCurrentTier;

                                                                    // Tick styling
                                                                    const tickRadius = isCurrentTick ? 5 : 1.5;
                                                                    const tickY = centerY;
                                                                    const tickColor = isCurrentTick ? colors.fill : 'fill-slate-300';

                                                                    return (
                                                                        <g key={t}>
                                                                            {/* Standard Tick */}
                                                                            <circle cx={tx} cy={tickY} r={tickRadius} className={tickColor} />

                                                                            {/* Active Unit Red Triangle Marker (Above Tick) */}
                                                                            {isCurrentTick && (
                                                                                <path
                                                                                    d={`M ${tx} ${tickY - 12} L ${tx - 6} ${tickY - 22} L ${tx + 6} ${tickY - 22} Z`}
                                                                                    fill="#ef4444"
                                                                                    className="animate-bounce origin-bottom"
                                                                                />
                                                                            )}
                                                                        </g>
                                                                    );
                                                                })}
                                                            </g>
                                                        )}

                                                        {/* Level Node (Large Circle) */}
                                                        <circle
                                                            cx={x}
                                                            cy={centerY}
                                                            r="12"
                                                            className={`${dotColor} ${dotStroke} transition-all duration-300`}
                                                            strokeWidth="3"
                                                        />

                                                        {/* Inner White Pulse for Current Node */}
                                                        {isCurrentNode && (
                                                            <circle cx={x} cy={centerY} r="4" className="fill-white animate-pulse" />
                                                        )}

                                                        {/* Level Text */}
                                                        <text
                                                            x={x}
                                                            y={centerY + 25}
                                                            textAnchor="middle"
                                                            className={`text-[20px] font-medium ${isActiveNode ? 'fill-slate-800 font-bold' : 'fill-slate-400'}`}
                                                            style={{ fontSize: '12px' }}
                                                        >
                                                            Lv.{level}
                                                        </text>

                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const ReportCard = () => {
    const { user, selectedUnit, selectedTextbook } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const reportRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showCorrectList, setShowCorrectList] = useState(false);
    const [showRoadmap, setShowRoadmap] = useState(true);
    const [showWrongList, setShowWrongList] = useState(true);

    const { results, totalWords, recallResults, spellResults } = location.state || { results: [], totalWords: 0 };
    const hasSeparatedResults = recallResults && spellResults;

    if (!selectedUnit) {
        navigate('/dashboard');
        return null;
    }

    const correctCount = results ? results.filter(r => r.isCorrect).length : 0;
    const wrongResults = results ? results.filter(r => !r.isCorrect) : [];
    const correctResults = results ? results.filter(r => r.isCorrect) : [];
    const unitNumber = selectedUnit.title.match(/\d+/) ? parseInt(selectedUnit.title.match(/\d+/)[0]) : 1;

    const levelMatch = selectedTextbook?.title?.match(/Lv\.?(\d+)/i) || selectedTextbook?.title?.match(/Level\s*(\d+)/i);
    const currentLevel = levelMatch ? parseInt(levelMatch[1]) : 3;

    const recallTotal = hasSeparatedResults ? recallResults.length : 0;
    const recallCorrect = hasSeparatedResults ? recallResults.filter(r => r.isCorrect).length : 0;
    const recallWrongList = hasSeparatedResults ? recallResults.filter(r => !r.isCorrect) : [];

    const spellTotal = hasSeparatedResults ? spellResults.length : 0;
    const spellCorrect = hasSeparatedResults ? spellResults.filter(r => r.isCorrect).length : 0;
    const spellWrongList = hasSeparatedResults ? spellResults.filter(r => !r.isCorrect) : [];

    const trueTotalWords = hasSeparatedResults ? (recallTotal + spellTotal) : totalWords;
    const trueCorrectCount = hasSeparatedResults ? (recallCorrect + spellCorrect) : correctCount;
    const trueScore = trueTotalWords > 0 ? Math.round((trueCorrectCount / trueTotalWords) * 100) : 0;
    const totalWrong = recallWrongList.length + spellWrongList.length;

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
                filter: filter
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
                <div ref={reportRef} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    {/* Header with Logo */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                        <img src="/logo.png" alt="TES 영어학원" className="h-10" />
                        <div className="text-right">
                            <p className="text-xs text-slate-400">TES 영어학원</p>
                            <p className="text-sm text-slate-700">Book Lv.{currentLevel}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-slate-800 mb-1">
                        {user?.name || '학생'}의 Unit {unitNumber} 테스트 성적표
                    </h2>
                    <p className="text-sm text-slate-400 mb-4">{selectedUnit.title}</p>

                    {/* Progress Roadmap (Collapsible) */}
                    <ProgressRoadmap
                        currentLevel={currentLevel}
                        currentUnit={unitNumber}
                        isOpen={showRoadmap}
                        onToggle={() => setShowRoadmap(!showRoadmap)}
                    />

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
                            <span className="text-sm font-medium">{selectedUnit.title}</span>
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
                                    <div className="w-1/4 p-2.5 text-center font-bold text-red-500">{totalWrong}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wrong Answers List - Collapsible */}
                    {totalWrong > 0 && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
                            <button
                                onClick={() => setShowWrongList(!showWrongList)}
                                className="w-full bg-slate-50 p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={14} className="text-red-500" />
                                    <span className="font-bold text-slate-700 text-sm">오답 목록</span>
                                    <span className="text-xs text-red-500">{totalWrong}개</span>
                                </div>
                                {showWrongList ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                            </button>

                            {showWrongList && (
                                <div className="p-4 bg-white space-y-3">
                                    {recallWrongList.length > 0 && (
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 mb-2">Recall</div>
                                            <div className="space-y-2">
                                                {recallWrongList.map((result, index) => (
                                                    <div key={`r-${index}`} className="flex items-center gap-3 text-sm bg-red-50 p-3 rounded-lg">
                                                        <X size={14} className="text-red-400 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-slate-700 truncate">{result.word}</div>
                                                            <div className="text-xs text-slate-400">{result.meaning}</div>
                                                        </div>
                                                        <div className="text-xs text-red-400 shrink-0">선택: {result.userAnswer}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {spellWrongList.length > 0 && (
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 mb-2">Spelling</div>
                                            <div className="space-y-2">
                                                {spellWrongList.map((result, index) => (
                                                    <div key={`s-${index}`} className="flex items-center gap-3 text-sm bg-red-50 p-3 rounded-lg">
                                                        <X size={14} className="text-red-400 shrink-0" />
                                                        <div className="flex-1 min-w-0 text-xs text-slate-500 truncate">{result.meaning}</div>
                                                        <div className="flex items-center gap-1 text-xs shrink-0">
                                                            <span className="text-red-400 line-through">{result.userAnswer || '∅'}</span>
                                                            <span className="text-slate-300">→</span>
                                                            <span className="text-emerald-600 font-bold">{result.word}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Correct Answers - Collapsible */}
                    {correctResults.length > 0 && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setShowCorrectList(!showCorrectList)}
                                className="w-full bg-slate-50 p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Check size={14} className="text-emerald-500" />
                                    <span className="font-bold text-slate-700 text-sm">정답 목록</span>
                                    <span className="text-xs text-emerald-500">{correctResults.length}개</span>
                                </div>
                                {showCorrectList ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                            </button>

                            {showCorrectList && (
                                <div className="p-4 bg-white">
                                    <div className="flex flex-wrap gap-2">
                                        {correctResults.map((result, index) => (
                                            <span key={index} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                                {result.word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownloadImage}
                    disabled={isDownloading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
                >
                    <Download size={20} />
                    {isDownloading ? '다운로드 중...' : '이미지로 저장하기'}
                </button>
            </div>
        </div>
    );
};

export default ReportCard;
