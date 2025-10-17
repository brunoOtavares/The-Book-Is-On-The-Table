import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar';
import StarRating from './StarRating';
import { BookOpen, ChevronDown, ChevronUp, Calendar, Building, FileText, Trash2, Check, Star } from 'lucide-react';
import { useBooks } from '../contexts/BooksContext';
import './BookCard.css';

const BookCard = ({ book }) => {
  const { deleteBook, updateBookProgress, updateBookReview, updateBookRating } = useBooks();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPageInput, setCurrentPageInput] = useState(book.currentPage?.toString() || '0');
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [totalPagesInput, setTotalPagesInput] = useState(book.pageCount?.toString() || '0');
  const [settingsCurrentPageInput, setSettingsCurrentPageInput] = useState(book.currentPage?.toString() || '0');
  const [reviewInput, setReviewInput] = useState(book.review || '');
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);
  const [showReviewBox, setShowReviewBox] = useState(false);
  const [rating, setRating] = useState(book.rating || 0);

  // Update the input when the book data changes
  React.useEffect(() => {
    setCurrentPageInput(book.currentPage?.toString() || '0');
    setTotalPagesInput(book.pageCount?.toString() || '0');
    setSettingsCurrentPageInput(book.currentPage?.toString() || '0');
    setReviewInput(book.review || '');
    setRating(book.rating || 0);
  }, [book.currentPage, book.pageCount, book.review, book.rating]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    updateBookRating(book.id, newRating);
  };

  const handlePageUpdate = () => {
    const newPage = parseInt(currentPageInput) || 0;
    const totalPages = book.pageCount || 0;
    
    // Ensure the current page doesn't exceed total pages
    const validPage = Math.min(newPage, totalPages);
    
    updateBookProgress(book.id, validPage, totalPages);
    setCurrentPageInput(validPage.toString());
  };

  const handlePageInputChange = (e) => {
    setCurrentPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    handlePageUpdate();
  };

  const handlePageInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePageUpdate();
    }
  };

  const handleReviewUpdate = () => {
    updateBookReview(book.id, reviewInput);
  };

  const handleReviewInputChange = (e) => {
    setReviewInput(e.target.value);
  };

  const handleReviewInputBlur = () => {
    handleReviewUpdate();
  };

  const handlePageSettingsUpdate = () => {
    const newCurrentPage = parseInt(settingsCurrentPageInput) || 0;
    const newTotalPages = parseInt(totalPagesInput) || 0;
    
    // Ensure the current page doesn't exceed total pages
    const validPage = Math.min(newCurrentPage, newTotalPages);
    
    // If book is unread, start reading from page 0 or 1
    const startPage = book.status === 'unread' ? 0 : validPage;
    
    updateBookProgress(book.id, startPage, newTotalPages);
    setCurrentPageInput(startPage.toString());
    setSettingsCurrentPageInput(startPage.toString());
    setTotalPagesInput(newTotalPages.toString());
    setShowPageSettings(false);
  };

  const togglePageSettings = () => {
    setShowPageSettings(!showPageSettings);
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="book-card"
    >
      <div className="book-card-actions">
        <button
          className="book-card-delete-button"
          onClick={() => deleteBook(book.id)}
          title="Excluir livro"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {book.cover && !book.cover.includes('placeholder') ? (
        <img src={book.cover} alt={`Capa do livro ${book.title}`} className="book-card-cover" />
      ) : (
        <div className="book-card-emoji-cover">
          📚
        </div>
      )}
      <div className="book-card-content">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
        
        {(book.publishedDate || book.publisher) && (
          <div className="book-card-meta">
            {book.publishedDate && (
              <div className="book-card-meta-item">
                <Calendar size={12} className="book-card-meta-icon" />
                <span>{book.publishedDate}</span>
              </div>
            )}
            {book.publisher && (
              <div className="book-card-meta-item">
                <Building size={12} className="book-card-meta-icon" />
                <span>{book.publisher}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="book-card-progress-section">
          {book.status === 'finished' ? (
            <>
              <div className="book-card-progress-header">
                <span className="book-card-progress-text"><Star size={16} className="book-card-icon"/> Avaliação</span>
              </div>
              <div className="book-card-rating-container">
                <StarRating
                  rating={rating}
                  onRatingChange={handleRatingChange}
                  size={20}
                />
                <span className="book-card-rating-text">{rating > 0 ? `${rating}/5` : 'Avalie este livro'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="book-card-progress-header">
                  <span className="book-card-progress-text"><BookOpen size={16} className="book-card-icon"/> Progresso</span>
                  <span>{book.progress}%</span>
              </div>
              <ProgressBar progress={book.progress} />
            </>
          )}
          
          <div className="book-card-page-controls">
            {book.status === 'finished' ? (
              <div className="book-card-review-section">
                {!showReviewBox ? (
                  <button
                    className="review-toggle-button"
                    onClick={() => setShowReviewBox(true)}
                  >
                    📝 Resenha
                  </button>
                ) : (
                  <div className="book-card-review-input">
                    <label htmlFor={`review-${book.id}`} className="review-input-label">
                      Resenha:
                    </label>
                    <textarea
                      id={`review-${book.id}`}
                      value={reviewInput}
                      onChange={handleReviewInputChange}
                      onBlur={handleReviewInputBlur}
                      onFocus={() => setIsReviewExpanded(true)}
                      className={`review-input ${isReviewExpanded ? 'review-input-expanded' : ''}`}
                      placeholder="Escreva sua resenha sobre este livro..."
                      rows={isReviewExpanded ? "8" : "4"}
                    />
                    <div className="review-actions">
                      <button
                        className="review-close-button"
                        onClick={() => setShowReviewBox(false)}
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : book.status === 'unread' ? (
              <button
                onClick={togglePageSettings}
                className="start-reading-button"
                title="Iniciar leitura"
              >
                📖 Iniciar Leitura
              </button>
            ) : (
              <>
                {book.pageCount > 0 && (
                  <div className="book-card-page-input">
                    <label htmlFor={`page-${book.id}`} className="page-input-label">
                      Página atual:
                    </label>
                    <div className="page-input-container">
                      <input
                        id={`page-${book.id}`}
                        type="number"
                        value={currentPageInput}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputBlur}
                        onKeyPress={handlePageInputKeyPress}
                        className="page-input"
                        min="0"
                        max={book.pageCount}
                        placeholder="0"
                      />
                      <span className="page-total">/ {book.pageCount}</span>
                    </div>
                    <div className="page-progress-info">
                      <span className="page-current-display">Página atual: {book.currentPage || 0}</span>
                      <span className="page-percentage">({book.progress}%)</span>
                    </div>
                  </div>
                )}
                
                {book.status === 'reading' && (!book.pageCount || book.pageCount === 0) && (
            <button
              onClick={togglePageSettings}
              className="page-settings-button"
              title="Configurar páginas"
            >
              Configurar páginas
                </button>
                )}
              </>
            )}
          </div>
        
        {showPageSettings && (
          <div className="page-settings-modal">
            <div className="page-settings-content">
              <h4>{book.status === 'unread' ? 'Iniciar leitura' : 'Configurar progresso de leitura'}</h4>
              <div className="page-settings-input-group">
                <label htmlFor={`total-pages-${book.id}`}>
                  Total de páginas:
                </label>
                <input
                  id={`total-pages-${book.id}`}
                  type="number"
                  value={totalPagesInput}
                  onChange={(e) => setTotalPagesInput(e.target.value)}
                  className="page-settings-input"
                  min="1"
                  placeholder="Total de páginas"
                />
              </div>
              <div className="page-settings-input-group">
                <label htmlFor={`current-page-settings-${book.id}`}>
                  Página atual:
                </label>
                <input
                  id={`current-page-settings-${book.id}`}
                  type="number"
                  value={settingsCurrentPageInput}
                  onChange={(e) => setSettingsCurrentPageInput(e.target.value)}
                  className="page-settings-input"
                  min="0"
                  max={totalPagesInput}
                  placeholder="Página atual"
                />
              </div>
              <div className="page-settings-actions">
                <button
                  onClick={handlePageSettingsUpdate}
                  className="page-settings-save-button"
                >
                  Salvar
                </button>
                <button
                  onClick={togglePageSettings}
                  className="page-settings-cancel-button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
          
          {book.tags && book.tags.length > 0 && (
            <div className="book-card-tags">
              {book.tags.map((tag, index) => (
                <span key={index} className="book-card-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {book.description && (
            <div className="book-card-description-section">
              <button
                className="book-card-expand-button"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <FileText size={14} />
                <span>Sinopse</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="book-card-description-container"
                  >
                    <p className="book-card-description">
                      {book.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
