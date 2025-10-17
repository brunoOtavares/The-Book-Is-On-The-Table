import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BooksProvider } from './contexts/BooksContext';
import { UsersProvider } from './contexts/UsersContext';
import Header from './components/Header';
import UnreadBooks from './components/UnreadBooks';
import ReadingBooks from './components/ReadingBooks';
import FinishedBooks from './components/FinishedBooks';
import AddBookModal from './components/AddBookModal';
import DiscoverBooks from './components/DiscoverBooks';
import UserPage from './components/UserPage';
import Login from './components/Login';
import Register from './components/Register';
import AdminMigrate from './components/AdminMigrate';
import './App.css';

// Componente de carregamento
function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Carregando...</p>
    </div>
  );
}

// Componente para proteger rotas
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Componente para redirecionar usuários logados
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (currentUser) {
    return <Navigate to="/" />;
  }
  
  return children;
}

// Componente principal do aplicativo
function AppContent() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { currentUser, userData } = useAuth();

  return (
    <UsersProvider>
      <div className="app">
        {currentUser && <Header />}
        
        <main className="main-content">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            <Route path="/discover" element={
              <ProtectedRoute>
                <DiscoverBooks />
              </ProtectedRoute>
            } />
            
            <Route path="/user/:userId" element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-migrate" element={
              <ProtectedRoute>
                <AdminMigrate />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={
              <ProtectedRoute>
                <div className="books-container">
                  <UnreadBooks />
                  <ReadingBooks />
                  <FinishedBooks />
                </div>
                
                {/* Botão flutuante de adicionar livro */}
                <button
                  className="fab-add-book"
                  onClick={() => setShowAddModal(true)}
                  title="Adicionar novo livro"
                >
                  +
                </button>
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        <AddBookModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      </div>
    </UsersProvider>
  );
}

// Componente App com providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <BooksProvider>
          <AppContent />
        </BooksProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;