import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const UsersContext = createContext();

export function useUsers() {
  return useContext(UsersContext);
}

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { currentUser } = useAuth();

  // Função para buscar usuários pelo nome de usuário
  async function searchUsersByUsername(username) {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('username', '>=', username),
        where('username', '<=', username + '\uf8ff'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        // Não incluir o próprio usuário nos resultados
        if (doc.id !== currentUser?.uid) {
          results.push({ id: doc.id, ...doc.data() });
        }
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  // Função para obter dados de um usuário específico
  async function getUserById(userId) {
    if (!userId) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  // Função para obter livros de um usuário específico
  async function getUserBooks(userId) {
    if (!userId) return [];
    
    try {
      const booksRef = collection(db, 'users', userId, 'books');
      const querySnapshot = await getDocs(booksRef);
      const books = [];
      
      querySnapshot.forEach((doc) => {
        books.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar por data de atualização (mais recentes primeiro)
      return books.sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0);
        const dateB = new Date(b.updatedAt || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Erro ao obter livros do usuário:', error);
      return [];
    }
  }

  // Função para obter estatísticas de um usuário
  async function getUserStats(userId) {
    const books = await getUserBooks(userId);
    
    const total = books.length;
    const unread = books.filter(book => book.status === 'unread').length;
    const reading = books.filter(book => book.status === 'reading').length;
    const finished = books.filter(book => book.status === 'finished').length;
    
    // Calcular média de avaliação
    const ratedBooks = books.filter(book => book.rating && book.rating > 0);
    const avgRating = ratedBooks.length > 0 
      ? ratedBooks.reduce((sum, book) => sum + book.rating, 0) / ratedBooks.length 
      : 0;
    
    return { 
      total, 
      unread, 
      reading, 
      finished, 
      avgRating: avgRating.toFixed(1),
      ratedBooks: ratedBooks.length
    };
  }

  const value = {
    users,
    loading,
    searchResults,
    searching,
    searchUsersByUsername,
    getUserById,
    getUserBooks,
    getUserStats
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
}