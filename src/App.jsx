import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Layout from './components/layout/Layout';
import StudyLayout from './components/layout/StudyLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
import Study from './pages/Study';
import WholeStudy from './pages/WholeStudy';
import Recall from './pages/Recall';
import Test from './pages/Test';
import Result from './pages/Result';
import ReportCard from './pages/ReportCard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useData();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result"
          element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-card"
          element={
            <ProtectedRoute>
              <ReportCard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Study Routes with Bottom Navigation */}
      <Route element={<StudyLayout />}>
        <Route
          path="/study/list"
          element={
            <ProtectedRoute>
              <WholeStudy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study/flashcard"
          element={
            <ProtectedRoute>
              <Study />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study/recall"
          element={
            <ProtectedRoute>
              <Recall />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study/spelling"
          element={
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect old routes */}
      <Route path="/study" element={<Navigate to="/study/flashcard" replace />} />
      <Route path="/test" element={<Navigate to="/study/spelling" replace />} />

    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
