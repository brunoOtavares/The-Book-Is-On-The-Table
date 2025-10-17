import { db } from '../firebase/config';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  setDoc
} from 'firebase/firestore';

// Get all books for a specific user
export const getBooksForUser = async (userId) => {
  const booksRef = collection(db, 'users', userId, 'books');
  const querySnapshot = await getDocs(booksRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Listen to real-time updates for user's books
export const listenToBooksForUser = (userId, callback) => {
  const booksRef = collection(db, 'users', userId, 'books');
  return onSnapshot(booksRef, (querySnapshot) => {
    const books = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(books);
  });
};

// Add a new book for a user
export const addBookForUser = async (userId, bookData) => {
  const booksRef = collection(db, 'users', userId, 'books');
  const bookWithUser = {
    ...bookData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Create a new document with a generated ID
  const docRef = await addDoc(booksRef, bookWithUser);
  
  // Update the user's public profile to indicate they have books
  try {
    const publicUserRef = doc(db, 'publicUsers', userId);
    await setDoc(publicUserRef, {
      hasBooks: true,
      lastBookAdded: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating public user profile:', error);
  }
  
  return {
    id: docRef.id,
    ...bookWithUser
  };
};

// Update a book
export const updateBookInFirebase = async (userId, bookId, bookData) => {
  const bookRef = doc(db, 'users', userId, 'books', bookId);
  const updatedBook = {
    ...bookData,
    updatedAt: new Date().toISOString()
  };
  await updateDoc(bookRef, updatedBook);
  return {
    id: bookId,
    ...updatedBook
  };
};

// Delete a book
export const deleteBookFromFirebase = async (userId, bookId) => {
  const bookRef = doc(db, 'users', userId, 'books', bookId);
  await deleteDoc(bookRef);
  
  // Check if user has any remaining books and update public profile
  try {
    const remainingBooks = await getBooksForUser(userId);
    const publicUserRef = doc(db, 'publicUsers', userId);
    await setDoc(publicUserRef, {
      hasBooks: remainingBooks.length > 0,
      lastBookAdded: remainingBooks.length > 0 ? new Date().toISOString() : null
    }, { merge: true });
  } catch (error) {
    console.error('Error updating public user profile after delete:', error);
  }
  
  return bookId;
};