import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para verificar se o username já existe
  async function checkUsernameExists(username) {
    if (!username || username.length < 3) return false;
    
    try {
      // Verificar na coleção de usernames
      const usernameRef = doc(db, 'usernames', username);
      const usernameDoc = await getDoc(usernameRef);
      
      console.log('Verificando username:', username, 'Existe:', usernameDoc.exists());
      return usernameDoc.exists();
    } catch (error) {
      console.error('Erro ao verificar username:', error);
      return false; // Em caso de erro, permite continuar (pode ser ajustado)
    }
  }

  async function signUp(email, password, username) {
    try {
      // Verificar se o username já existe
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        throw new Error('Este nome de usuário já está em uso. Por favor, escolha outro.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar o perfil do usuário com o nome de usuário
      await updateProfile(userCredential.user, {
        displayName: username
      });

      // Salvar informações adicionais no Firestore
      try {
        // Criar documento do usuário
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username,
          email,
          createdAt: new Date().toISOString()
        });
        
        // Criar documento de username para garantir unicidade
        await setDoc(doc(db, 'usernames', username), {
          uid: userCredential.user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (firestoreError) {
        console.error('Erro ao salvar dados no Firestore:', firestoreError);
        // Continuar mesmo se não conseguir salvar no Firestore
      }

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async function signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Buscar dados adicionais do usuário no Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (firestoreError) {
        console.error('Erro ao buscar dados do usuário no Firestore:', firestoreError);
        // Continuar mesmo se não conseguir buscar do Firestore
      }

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Buscar dados adicionais do usuário no Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          // Definir dados básicos do usuário mesmo que não consiga buscar do Firestore
          setUserData({
            username: user.displayName || 'Usuário',
            email: user.email
          });
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    signUp,
    signIn,
    signOut,
    checkUsernameExists,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}