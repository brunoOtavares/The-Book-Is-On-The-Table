import { 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  query as firestoreQuery,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Função para migrar usuários existentes para a coleção pública
export async function migrateUsersToPublic() {
  try {
    console.log('Iniciando migração de usuários para a coleção pública...');
    
    // Buscar todos os usuários da coleção privada
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    console.log(`Encontrados ${querySnapshot.size} usuários para migrar`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    // Para cada usuário, criar um documento na coleção pública
    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Verificar se o usuário já existe na coleção pública
      const publicUserRef = doc(db, 'publicUsers', userId);
      const publicUserDoc = await getDoc(publicUserRef);
      
      if (publicUserDoc.exists()) {
        console.log(`Usuário ${userData.username} já existe na coleção pública`);
        skippedCount++;
        continue;
      }
      
      // Criar documento na coleção pública
      await setDoc(doc(db, 'publicUsers', userId), {
        uid: userId,
        username: userData.username,
        createdAt: userData.createdAt || new Date().toISOString()
      });
      
      console.log(`Usuário ${userData.username} migrado com sucesso`);
      migratedCount++;
    }
    
    console.log(`Migração concluída: ${migratedCount} usuários migrados, ${skippedCount} usuários já existiam`);
    return { success: true, migratedCount, skippedCount };
  } catch (error) {
    console.error('Erro durante a migração:', error);
    return { success: false, error: error.message };
  }
}

// Função para criar um perfil público para um usuário específico
export async function createPublicProfile(userId, username) {
  try {
    await setDoc(doc(db, 'publicUsers', userId), {
      uid: userId,
      username,
      createdAt: new Date().toISOString()
    });
    console.log(`Perfil público criado para ${username}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar perfil público:', error);
    return { success: false, error: error.message };
  }
}