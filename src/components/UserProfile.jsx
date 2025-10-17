import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Star, Calendar, ArrowLeft } from 'lucide-react';
import { useUsers } from '../contexts/UsersContext';
import BookCard from './BookCard';
import './UserProfile.css';
import './BookSections.css';

const UserProfile = ({ userId }) => {
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

  if (loading) {
    return (
      <div className="user-profile-loading">
        <p>Carregando perfil do usuário...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-error">
        <p>Usuário não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <div className="user-profile-info">
          <div className="user-profile-avatar">
            <User size={48} />
          </div>
          <div className="user-profile-details">
            <h1>{user.username}</h1>
            <p>Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        {stats && (
          <div className="user-profile-stats">
            <div className="stat-item">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Livros</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.reading}</div>
              <div className="stat-label">Lendo</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.finished}</div>
              <div className="stat-label">Finalizados</div>
            </div>
            {stats.avgRating > 0 && (
              <div className="stat-item">
                <div className="stat-number">{stats.avgRating}</div>
                <div className="stat-label">
                  <Star size={14} />
                  Média
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
          <motion.div
            layout
            className="book-grid"
          >
            {unreadBooks.map((book) => (
              <BookCard key={book.id} book={book} isReadOnly={true} />
            ))}
          </motion.div>
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
          <motion.div
            layout
            className="book-grid"
          >
            {readingBooks.map((book) => (
              <BookCard key={book.id} book={book} isReadOnly={true} />
            ))}
          </motion.div>
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
          <motion.div
            layout
            className="book-grid"
          >
            {finishedBooks.map((book) => (
              <BookCard key={book.id} book={book} isReadOnly={true} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;