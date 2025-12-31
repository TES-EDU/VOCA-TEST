import React, { createContext, useState, useEffect, useContext } from 'react';
import vocabularyData from '../data/index';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [textbooks, setTextbooks] = useState([]);
    const [selectedTextbook, setSelectedTextbook] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [progress, setProgress] = useState({});
    const [studyStats, setStudyStats] = useState({});

    // Test results for current session
    const [testResults, setTestResults] = useState({
        recall: [],
        spell: []
    });

    useEffect(() => {
        setTextbooks(vocabularyData.textbooks);
    }, []);

    const login = (name) => {
        setUser({ name });
        localStorage.setItem('voca_user', JSON.stringify({ name }));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('voca_user');
        setSelectedTextbook(null);
        setSelectedUnit(null);
    };

    const updateProgress = (unitId, stage, value = true) => {
        setProgress(prev => {
            const newProgress = {
                ...prev,
                [unitId]: {
                    ...prev[unitId],
                    [stage]: value
                }
            };
            localStorage.setItem('voca_progress', JSON.stringify(newProgress));
            return newProgress;
        });
    };

    const updateStudyStats = (unitId) => {
        setStudyStats(prev => {
            const currentCount = prev[unitId]?.repetition || 0;
            const newStats = {
                ...prev,
                [unitId]: {
                    ...prev[unitId],
                    repetition: currentCount + 1
                }
            };
            localStorage.setItem('voca_stats', JSON.stringify(newStats));
            return newStats;
        });
    };

    // Save test results
    const saveTestResults = (type, results) => {
        setTestResults(prev => ({
            ...prev,
            [type]: results
        }));
    };

    // Clear test results (call when starting new test session)
    const clearTestResults = () => {
        setTestResults({ recall: [], spell: [] });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('voca_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const storedProgress = localStorage.getItem('voca_progress');
        if (storedProgress) {
            setProgress(JSON.parse(storedProgress));
        }

        const storedStats = localStorage.getItem('voca_stats');
        if (storedStats) {
            setStudyStats(JSON.parse(storedStats));
        }
    }, []);

    const value = {
        user,
        login,
        logout,
        textbooks,
        selectedTextbook,
        setSelectedTextbook,
        selectedUnit,
        setSelectedUnit,
        progress,
        updateProgress,
        studyStats,
        updateStudyStats,
        testResults,
        saveTestResults,
        clearTestResults,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
