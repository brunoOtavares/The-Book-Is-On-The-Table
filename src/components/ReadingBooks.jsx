import React from 'react';
import { motion } from 'framer-motion';
import BookCard from './BookCard';
import { useBooks } from '../contexts/BooksContext';
import './BookSections.css';

const ReadingBooks = ({ onAddBook }) => {
  const { getBooksByStatus, loading } = useBooks();
  
  if (loading) {
    return (
      <div className="book-section">
        <h2 className="section-title">
          <span className="section-icon">📖</span>
          Lendo
        </h2>
        <div className="empty-section">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  const readingBooks = getBooksByStatus('reading');

  return (
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
            <BookCard key={book.id} book={book} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ReadingBooks;