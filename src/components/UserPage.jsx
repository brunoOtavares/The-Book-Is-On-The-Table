import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useUsers } from '../contexts/UsersContext';
import BookCard from './BookCard';
import './BookSections.css';
import './UserPage.css';

const UserPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getUserById, getUserBooks, getUserStats } = useUsers();
  
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Buscar dados do usuário
        const userData = await getUserById(userId);
        if (!userData) {
          setLoading(false);
          return;
        }
        
        setUser(userData);
        
        // Buscar livros do usuário
        const userBooks = await getUserBooks(userId);
        setBooks(userBooks);
        
        // Buscar estatísticas
        const userStats = await getUserStats(userId);
        setStats(userStats);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, getUserById, getUserBooks, getUserStats]);

  // Filtrar livros por status
  const unreadBooks = books.filter(book => book.status === 'unread');
  const readingBooks = books.filter(book => book.status === 'reading');
  const finishedBooks = books.filter(book => book.status === 'finished');

  const handleBackToDiscover = () => {
    navigate('/discover');
  };

  if (loading) {
    return (
      <div className="user-page-loading">
        <p>Carregando perfil do usuário...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-page-error">
        <p>Usuário não encontrado.</p>
        <button onClick={handleBackToDiscover} className="back-button">
          <ArrowLeft size={18} />
          Voltar para busca
        </button>
      </div>
    );
  }

  return (
    <div className="user-page-container">
      <div className="user-page-header">
        <div className="user-page-info">
          <div className="user-page-avatar">
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-page-details">
            <h1>{user.username}</h1>
            <p>Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <button onClick={handleBackToDiscover} className="back-button">
          <ArrowLeft size={18} />
          Voltar para busca
        </button>
      </div>

      <div className="books-container">
        {/* Seção de livros não lidos */}
        <div className="book-section">
          <h2 className="section-title">
            <span className="section-icon">📚</span>
            Não Lidos
            <span className="book-count">{unreadBooks.length}</span>
          </h2>
          
          {unreadBooks.length === 0 ? (
            <div className="empty-section">
              <p>Nenhum livro não lido.</p>
            </div>
          ) : (
            <div className="book-grid">
              {unreadBooks.map((book) => (
                <BookCard key={book.id} book={book} isReadOnly={true} />
              ))}
            </div>
          )}
        </div>

        {/* Seção de livros sendo lidos */}
        <div className="book-section">
          <h2 className="section-title">
            <span className="section-icon">📖</span>
            Lendo
            <span className="book-count">{readingBooks.length}</span>
          </h2>
          
          {readingBooks.length === 0 ? (
            <div className="empty-section">
              <p>Nenhum livro sendo lido no momento.</p>
            </div>
          ) : (
            <div className="book-grid">
              {readingBooks.map((book) => (
                <BookCard key={book.id} book={book} isReadOnly={true} />
              ))}
            </div>
          )}
        </div>

        {/* Seção de livros finalizados */}
        <div className="book-section">
          <h2 className="section-title">
            <span className="section-icon">✅</span>
            Finalizados
            <span className="book-count">{finishedBooks.length}</span>
          </h2>
          
          {finishedBooks.length === 0 ? (
            <div className="empty-section">
              <p>Nenhum livro finalizado ainda.</p>
            </div>
          ) : (
            <div className="book-grid">
              {finishedBooks.map((book) => (
                <BookCard key={book.id} book={book} isReadOnly={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;