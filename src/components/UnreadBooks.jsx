import React from 'react';
import { motion } from 'framer-motion';
import BookCard from './BookCard';
import { useBooks } from '../contexts/BooksContext';
import './BookSections.css';

const UnreadBooks = ({ onAddBook }) => {
  const { getBooksByStatus, loading } = useBooks();
  
  if (loading) {
    return (
      <div className="book-section">
        <h2 className="section-title">
          <span className="section-icon">📚</span>
          Não Lidos
        </h2>
        <div className="empty-section">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  const unreadBooks = getBooksByStatus('unread');

  return (
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
            <BookCard key={book.id} book={book} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default UnreadBooks;