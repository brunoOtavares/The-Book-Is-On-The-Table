import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../contexts/BooksContext';
import './Header.css';

export default function Header() {
  const { currentUser, userData, signOut } = useAuth();
  const { getStats } = useBooks();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const stats = getStats();
  const displayName = userData?.username || currentUser?.displayName || 'Usuário';

  async function handleSignOut() {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>📚 BibliRead</h1>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.reading}</span>
            <span className="stat-label">Lendo</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.finished}</span>
            <span className="stat-label">Concluídos</span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="user-menu">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{displayName}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar-large">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <p className="user-display-name">{displayName}</p>
                    <p className="user-email">{currentUser?.email}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="logout-button" onClick={handleSignOut}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
