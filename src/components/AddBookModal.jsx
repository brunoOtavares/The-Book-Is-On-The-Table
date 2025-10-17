import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Book, Globe, Library, Music } from 'lucide-react';
import { useBooks } from '../contexts/BooksContext';
import { searchBooks, searchBooksByAuthor } from '../services/bookService';
import './AddBookModal.css';

const AddBookModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [cover, setCover] = useState('');
  const [description, setDescription] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [status, setStatus] = useState('unread'); // unread, reading, finished
  const [categories, setCategories] = useState('');
  const [isbn, setIsbn] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState('general'); // 'general' or 'author'
  const [languageFilter, setLanguageFilter] = useState('portuguese'); // 'portuguese' or 'all'
  const { addBook } = useBooks();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author) return;

    // Calculate progress based on current page and total pages
    const totalPages = pageCount ? parseInt(pageCount) : 0;
    const currentPg = currentPage ? parseInt(currentPage) : 0;
    const progress = totalPages > 0 ? Math.round((currentPg / totalPages) * 100) : 0;
    
    try {
      await addBook({
        title,
        author,
        cover: cover || `https://via.placeholder.com/150/CCCCCC/FFFFFF?text=${title.replace(/\s/g, '.')}`,
        description,
        publisher,
        publishedDate,
        pageCount: totalPages,
        currentPage: currentPg,
        status,
        tags: categories ? categories.split(',').map(cat => cat.trim()) : [],
        isbn,
        progress,
      });

      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      alert('Erro ao salvar o livro. Verifique sua conexão e as configurações do Firebase.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCover('');
    setDescription('');
    setPublisher('');
    setPublishedDate('');
    setPageCount('');
    setCurrentPage('');
    setStatus('unread');
    setCategories('');
    setIsbn('');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      let results;
      if (searchMode === 'author') {
        results = await searchBooksByAuthor(searchQuery);
      } else {
        results = await searchBooks(searchQuery);
      }
      
      // Filter results based on language preference
      if (languageFilter === 'portuguese') {
        results = results.filter(book => hasPortugueseIndicators(book));
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  /**
   * Helper function to check if a book has Portuguese indicators
   * @param {Object} book - Book object
   * @returns {boolean} - True if book appears to be in Portuguese
   */
  const hasPortugueseIndicators = (book) => {
    const portugueseKeywords = [
      'editora', 'companhia', 'records', 'martins', 'fontes', 'Ática', 'Saraiva',
      'moderna', 'ftd', 'scipione', 'cobogó', 'intrínseca', 'planet', 'rocco',
      'zahar', '34', 'leya', 'quadrante', 'biruta', 'perspectiva'
    ];
    
    const titleLower = book.title.toLowerCase();
    const authorLower = book.author.toLowerCase();
    const publisherLower = (book.publisher || '').toLowerCase();
    
    // Check for Portuguese keywords in title, author, or publisher
    for (const keyword of portugueseKeywords) {
      if (titleLower.includes(keyword) ||
          authorLower.includes(keyword) ||
          publisherLower.includes(keyword)) {
        return true;
      }
    }
    
    // Check for common Portuguese words in title
    const portugueseWords = ['o ', 'a ', 'os ', 'as ', 'de ', 'da ', 'do ', 'dos ', 'das ', 'em ', 'para ', 'com ', 'sem ', 'por ', 'como ', 'mais ', 'muito ', 'muita '];
    for (const word of portugueseWords) {
      if (titleLower.includes(word) && titleLower.length > word.length + 2) {
        return true;
      }
    }
    
    // Check for Portuguese/Brazilian names in author
    if (authorLower.includes('silva') || authorLower.includes('santos') ||
        authorLower.includes('souza') || authorLower.includes('costa') ||
        authorLower.includes('ferreira') || authorLower.includes('alves') ||
        authorLower.includes('pereira') || authorLower.includes('lima') ||
        authorLower.includes('gomes') || authorLower.includes('ribeiro')) {
      return true;
    }
    
    return false;
  };

  const selectBook = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setCover(book.cover);
    setDescription(book.description || '');
    setPublisher(book.publisher || '');
    setPublishedDate(book.publishedDate || '');
    setPageCount(book.pageCount ? book.pageCount.toString() : '');
    setCurrentPage('');
    setStatus('unread');
    setCategories(book.categories ? book.categories.join(', ') : '');
    setIsbn(book.isbn || '');
    setShowSearch(false);
    setSearchResults([]);
  };


  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim() && showSearch) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, showSearch, searchMode, languageFilter]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { ease: 'easeOut', duration: 0.3 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { ease: 'easeIn', duration: 0.2 } },
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'google': return <Globe size={16} />;
      case 'openlibrary': return <Library size={16} />;
      case 'itunes': return <Music size={16} />;
      case 'worldcat': return <Book size={16} />;
      default: return <Book size={16} />;
    }
  };

  const getSourceName = (source) => {
    switch (source) {
      case 'google': return 'Google Books';
      case 'openlibrary': return 'Open Library';
      case 'itunes': return 'Apple Books';
      case 'worldcat': return 'WorldCat';
      default: return 'Unknown';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            variants={modalVariants}
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Adicionar Novo Livro</h2>
              <button onClick={onClose} className="modal-close-button">
                <X size={24} />
              </button>
            </div>
            
            {!showSearch ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <button
                    type="button"
                    className="search-toggle-button"
                    onClick={() => setShowSearch(true)}
                  >
                    <Search size={16} />
                    Buscar livro online
                  </button>
                </div>
                
                <div className="form-group">
                  <label htmlFor="title" className="form-label">Título *</label>
                  <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="author" className="form-label">Autor *</label>
                  <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="cover" className="form-label">URL da Capa</label>
                  <input type="url" id="cover" value={cover} onChange={(e) => setCover(e.target.value)} className="form-input" placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label htmlFor="description" className="form-label">Descrição</label>
                  <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="form-textarea" rows="3" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="publisher" className="form-label">Editora</label>
                    <input type="text" id="publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="publishedDate" className="form-label">Data de Publicação</label>
                    <input type="text" id="publishedDate" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} className="form-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pageCount" className="form-label">Número de Páginas</label>
                    <input type="number" id="pageCount" value={pageCount} onChange={(e) => setPageCount(e.target.value)} className="form-input" min="0" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="currentPage" className="form-label">Página Atual</label>
                    <input type="number" id="currentPage" value={currentPage} onChange={(e) => setCurrentPage(e.target.value)} className="form-input" min="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                    <option value="unread">Não Lido</option>
                    <option value="reading">Lendo</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="isbn" className="form-label">ISBN</label>
                    <input type="text" id="isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="categories" className="form-label">Categorias (separadas por vírgula)</label>
                  <input type="text" id="categories" value={categories} onChange={(e) => setCategories(e.target.value)} className="form-input" placeholder="Ficção, Aventura, etc." />
                </div>
                <div className="form-actions">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cancel-button"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="submit-button"
                  >
                    Salvar
                  </motion.button>
                </div>
              </form>
            ) : (
              <div className="search-container">
                <div className="search-header">
                  <div className="search-mode-selector">
                    <span className="mode-label">Modo de busca:</span>
                    <div className="mode-buttons">
                      <button
                        type="button"
                        className={`mode-button ${searchMode === 'general' ? 'active' : ''}`}
                        onClick={() => {
                          setSearchMode('general');
                          setSearchResults([]);
                        }}
                      >
                        Geral
                      </button>
                      <button
                        type="button"
                        className={`mode-button ${searchMode === 'author' ? 'active' : ''}`}
                        onClick={() => {
                          setSearchMode('author');
                          setSearchResults([]);
                        }}
                      >
                        Por Autor
                      </button>
                    </div>
                  </div>
                  <div className="language-selector">
                    <span className="language-label">Idioma:</span>
                    <div className="language-buttons">
                      <button
                        type="button"
                        className={`language-button ${languageFilter === 'portuguese' ? 'active' : ''}`}
                        onClick={() => {
                          setLanguageFilter('portuguese');
                          setSearchResults([]);
                        }}
                      >
                        Portuguese
                      </button>
                      <button
                        type="button"
                        className={`language-button ${languageFilter === 'all' ? 'active' : ''}`}
                        onClick={() => {
                          setLanguageFilter('all');
                          setSearchResults([]);
                        }}
                      >
                        All Languages
                      </button>
                    </div>
                  </div>
                  <div className="search-input-group">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      placeholder={searchMode === 'author' ? "Buscar por nome do autor..." : "Buscar por título, autor ou ISBN..."}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="search-back-button"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                {isSearching ? (
                  <div className="search-loading">
                    <div className="spinner"></div>
                    <p>Buscando livros...</p>
                  </div>
                ) : (
                  <div className="search-results">
                    {searchResults.length > 0 ? (
                      searchResults.map((book) => (
                        <div key={book.id} className="search-result-item" onClick={() => selectBook(book)}>
                          {book.cover && !book.cover.includes('placeholder') ? (
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="search-result-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="search-result-emoji-cover"
                            style={{ display: book.cover && !book.cover.includes('placeholder') ? 'none' : 'flex' }}
                          >
                            📚
                          </div>
                          <div className="search-result-info">
                            <h3 className="search-result-title">{book.title}</h3>
                            <p className="search-result-author">{book.author}</p>
                            {book.publishedDate && <p className="search-result-date">{book.publishedDate}</p>}
                            {book.isbn && <p className="search-result-isbn">ISBN: {book.isbn}</p>}
                            <div className="search-result-source">
                              {getSourceIcon(book.source)}
                              <span>{getSourceName(book.source)}</span>
                            </div>
                            {book.categories && book.categories.length > 0 && (
                              <div className="search-result-categories">
                                {book.categories.slice(0, 3).map((category, index) => (
                                  <span key={index} className="category-tag">{category}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : searchQuery ? (
                      <div className="no-results">
                        <Book size={48} />
                        <p>Nenhum livro encontrado para "{searchQuery}"</p>
                        <p>Tente usar termos diferentes ou mais genéricos</p>
                      </div>
                    ) : (
                      <div className="search-placeholder">
                        <Book size={48} />
                        <p>{searchMode === 'author' ? 'Digite o nome do autor para buscar livros' : 'Digite título, autor ou ISBN para buscar livros'}</p>
                        <p>{languageFilter === 'portuguese' ? 'Mostrando resultados em português' : 'Mostrando resultados em todos os idiomas'}</p>
                        <p>Buscando em múltiplas fontes simultaneamente</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddBookModal;
