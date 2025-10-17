import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc,
  query
} from 'firebase/firestore';

/**
 * Script para migrar usuários existentes para a coleção publicUsers
 * Este script deve ser executado uma vez para garantir que todos os usuários
 * existentes possam ser encontrados na função de pesquisa
 */
export async function migrateUsersToPublicCollection() {
  try {
    console.log('Iniciando migração de usuários para a coleção publicUsers...');
    
    // Obter todos os usuários da coleção privada
    const usersQuery = query(collection(db, 'users'));
    const querySnapshot = await getDocs(usersQuery);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    // Para cada usuário, criar ou atualizar o documento na coleção pública
    for (const userDoc of querySnapshot.docs) {
      try {
        const userData = userDoc.data();
        const userId = userDoc.id;
        
        // Verificar se o usuário já existe na coleção pública
        const publicUserRef = doc(db, 'publicUsers', userId);
        
        // Criar documento público com informações básicas para pesquisa
        await setDoc(publicUserRef, {
          uid: userId,
          username: userData.username,
          email: userData.email,
          hasBooks: false, // Será atualizado quando adicionarem livros
          createdAt: userData.createdAt || new Date().toISOString(),
          migratedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log(`Usuário migrado: ${userData.username} (${userId})`);
        migratedCount++;
      } catch (error) {
        console.error(`Erro ao migrar usuário ${userDoc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Migração concluída! ${migratedCount} usuários migrados com sucesso. ${errorCount} erros.`);
    
    return {
      success: true,
      migratedCount,
      errorCount,
      totalUsers: querySnapshot.size
    };
  } catch (error) {
    console.error('Erro durante a migração:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Função para verificar se um usuário existe na coleção pública
 * e criá-lo se não existir
 */
export async function ensurePublicUserExists(userId, userData) {
  try {
    const publicUserRef = doc(db, 'publicUsers', userId);
    
    // Criar documento público se não existir
    await setDoc(publicUserRef, {
      uid: userId,
      username: userData.username,
      email: userData.email,
      hasBooks: false,
      createdAt: userData.createdAt || new Date().toISOString()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Erro ao garantir existência do usuário público:', error);
    return false;
  }
}