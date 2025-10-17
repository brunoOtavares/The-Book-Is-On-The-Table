import React, { useState } from 'react';
import { Search, User, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../contexts/UsersContext';
import './UserSearch.css';
import './DiscoverBooks.css';

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { searchUsersByUsername, searchResults, searching } = useUsers();

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsersByUsername(searchTerm);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Pesquisar automaticamente após 2 caracteres
    if (value.length >= 2) {
      searchUsersByUsername(value);
    } else if (value.length === 0) {
      searchUsersByUsername('');
    }
  };

  const selectUser = (user) => {
    navigate(`/user/${user.uid || user.id}`);
  };


  return (
    <div className="user-search-container">
      <div className="user-search-header">
        <form onSubmit={handleSearch} className="user-search-input-group">
          <Search size={18} className="user-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome de usuário..."
            value={searchTerm}
            onChange={handleInputChange}
            className="user-search-input"
          />
        </form>
      </div>

      <div className="user-search-results">
        {searching && (
          <div className="user-search-loading">
            <div className="user-search-loading-spinner"></div>
            <p>Buscando usuários...</p>
          </div>
        )}

        {!searching && searchTerm.length > 0 && searchResults.length === 0 && (
          <div className="user-search-empty">
            <p>Nenhum usuário encontrado para "{searchTerm}"</p>
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <div className="user-search-results">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="user-search-result-item"
                onClick={() => selectUser(user)}
              >
                <div className="user-search-result-info">
                  <div className="user-search-result-name">{user.username}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searching && searchTerm.length === 0 && (
          <div className="user-search-empty">
            <Search size={48} />
            <p>Digite o nome de um usuário para encontrar pessoas com interesses similares</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;