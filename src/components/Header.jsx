import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BookOpen, Home, LogOut, User, Library } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

export default function Header() {
  const { currentUser, userData, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  
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
          <h1>📚 The Book Is On The Table</h1>
        </div>
        
        <nav className="header-nav desktop-only">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Home size={18} />
            <span>Minha Biblioteca</span>
          </Link>
          <Link
            to="/discover"
            className={`nav-link ${location.pathname === '/discover' ? 'active' : ''}`}
          >
            <Search size={18} />
            <span>Descobrir Leitores</span>
          </Link>
        </nav>
        
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
                
                {/* Link para Minha Biblioteca no menu mobile */}
                <Link
                  to="/"
                  className="mobile-library-link"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Library size={16} />
                  <span>Minha Biblioteca</span>
                </Link>
                
                {/* Link para Descobrir Leitores no menu mobile */}
                <Link
                  to="/discover"
                  className="mobile-discover-link"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Search size={16} />
                  <span>Descobrir Leitores</span>
                </Link>
                
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
