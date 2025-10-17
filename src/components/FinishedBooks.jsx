import React from 'react';
import { motion } from 'framer-motion';
import BookCard from './BookCard';
import { useBooks } from '../contexts/BooksContext';
import './BookSections.css';

const FinishedBooks = ({ onAddBook }) => {
  const { getBooksByStatus, loading } = useBooks();
  
  if (loading) {
    return (
      <div className="book-section">
        <h2 className="section-title">
          <span className="section-icon">✅</span>
          Finalizados
        </h2>
        <div className="empty-section">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  const finishedBooks = getBooksByStatus('finished');

  return (
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
            <BookCard key={book.id} book={book} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default FinishedBooks;