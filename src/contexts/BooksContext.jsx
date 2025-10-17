import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const BooksContext = createContext();

export function useBooks() {
  return useContext(BooksContext);
}

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Carregar livros do Firestore quando o usuário mudar
  useEffect(() => {
    if (!currentUser) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Referência à coleção de livros do usuário
    const booksRef = collection(db, 'users', currentUser.uid, 'books');
    
    // Configurar listener em tempo real
    const unsubscribe = onSnapshot(booksRef, (snapshot) => {
      const booksData = [];
      snapshot.forEach((doc) => {
        booksData.push({ id: doc.id, ...doc.data() });
      });
      setBooks(booksData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar livros:', error);
      setBooks([]);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Função para adicionar um livro
  async function addBook(bookData) {
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    try {
      const booksRef = collection(db, 'users', currentUser.uid, 'books');
      const newBookRef = doc(booksRef);
      
      const bookWithMetadata = {
        ...bookData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newBookRef, bookWithMetadata);
      return newBookRef.id;
    } catch (error) {
      console.error('Erro ao adicionar livro:', error);
      throw error; // Propagar o erro para que possa ser tratado pela UI
    }
  }

  // Função para atualizar um livro
  async function updateBook(bookId, updatedData) {
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    try {
      const bookRef = doc(db, 'users', currentUser.uid, 'books', bookId);
      const bookWithMetadata = {
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(bookRef, bookWithMetadata);
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      throw error; // Propagar o erro para que possa ser tratado pela UI
    }
  }

  // Função para atualizar o progresso de leitura de um livro
  async function updateBookProgress(bookId, currentPage, totalPages) {
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    try {
      const bookRef = doc(db, 'users', currentUser.uid, 'books', bookId);
      
      // Obter o status atual do livro
      const currentBook = books.find(book => book.id === bookId);
      const currentStatus = currentBook ? currentBook.status : 'unread';
      
      // Calcular o progresso em percentagem
      const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
      
      // Determinar o status do livro
      let status = currentStatus;
      
      // Se o livro estava não lido, mudar para lendo
      if (currentStatus === 'unread') {
        status = 'reading';
      } else {
        // Para livros já em andamento ou finalizados, manter a lógica original
        if (progress >= 100) status = 'finished';
        else if (progress > 0) status = 'reading';
        else status = 'unread';
      }
      
      const bookWithMetadata = {
        currentPage,
        pageCount: totalPages,
        progress,
        status,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(bookRef, bookWithMetadata);
    } catch (error) {
      console.error('Erro ao atualizar progresso do livro:', error);
      throw error;
    }
  }

  // Função para atualizar a resenha de um livro
  async function updateBookReview(bookId, review) {
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    try {
      const bookRef = doc(db, 'users', currentUser.uid, 'books', bookId);
      
      const bookWithMetadata = {
        review,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(bookRef, bookWithMetadata);
    } catch (error) {
      console.error('Erro ao atualizar resenha do livro:', error);
      throw error;
    }
  }

  // Função para atualizar a avaliação em estrelas de um livro
  async function updateBookRating(bookId, rating) {
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    try {
      const bookRef = doc(db, 'users', currentUser.uid, 'books', bookId);
      
      const bookWithMetadata = {
        rating,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(bookRef, bookWithMetadata);
    } catch (error) {
      console.error('Erro ao atualizar avaliação do livro:', error);
      throw error;
    }
  }

  // Função para excluir um livro
  async function deleteBook(bookId) {
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    try {
      const bookRef = doc(db, 'users', currentUser.uid, 'books', bookId);
      await deleteDoc(bookRef);
    } catch (error) {
      console.error('Erro ao excluir livro:', error);
      throw error; // Propagar o erro para que possa ser tratado pela UI
    }
  }

  // Função para obter livros por status
  function getBooksByStatus(status) {
    return books.filter(book => book.status === status);
  }

  // Função para obter estatísticas
  function getStats() {
    const total = books.length;
    const unread = books.filter(book => book.status === 'unread').length;
    const reading = books.filter(book => book.status === 'reading').length;
    const finished = books.filter(book => book.status === 'finished').length;
    
    return { total, unread, reading, finished };
  }

  const value = {
    books,
    loading,
    addBook,
    updateBook,
    updateBookProgress,
    updateBookReview,
    updateBookRating,
    deleteBook,
    getBooksByStatus,
    getStats
  };

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  );
}
