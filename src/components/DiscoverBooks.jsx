import React, { useState, useEffect } from 'react';
import UserSearch from './UserSearch';
import UserProfile from './UserProfile';
import { ArrowLeft } from 'lucide-react';
import './BookSections.css';
import './DiscoverBooks.css';

export default function DiscoverBooks() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleBackToSearch = () => {
    setSelectedUser(null);
  };

  return (
    <div className="discover-books-container">
      {selectedUser ? (
        <div>
          <div className="back-button-container">
            <button className="back-button" onClick={handleBackToSearch}>
              <ArrowLeft size={18} />
              Voltar para busca
            </button>
          </div>
          <UserProfile userId={selectedUser.uid} />
        </div>
      ) : (
        <div className="search-container">
          <div className="section-header">
            <h2>Descobrir Leitores</h2>
            <p>Encontre outros leitores e veja o que estão lendo</p>
          </div>
          <UserSearch onSelectUser={handleSelectUser} />
        </div>
      )}
    </div>
  );
}