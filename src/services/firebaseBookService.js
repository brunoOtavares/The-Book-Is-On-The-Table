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
  onSnapshot
} from 'firebase/firestore';

const BOOKS_COLLECTION = 'books';

// Get all books for a specific user
export const getBooksForUser = async (userId) => {
  const q = query(collection(db, BOOKS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Listen to real-time updates for user's books
export const listenToBooksForUser = (userId, callback) => {
  const q = query(collection(db, BOOKS_COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (querySnapshot) => {
    const books = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(books);
  });
};

// Add a new book for a user
export const addBookForUser = async (userId, bookData) => {
  const bookWithUser = {
    ...bookData,
    userId,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, BOOKS_COLLECTION), bookWithUser);
  return {
    id: docRef.id,
    ...bookWithUser
  };
};

// Update a book
export const updateBookInFirebase = async (bookId, bookData) => {
  const bookRef = doc(db, BOOKS_COLLECTION, bookId);
  await updateDoc(bookRef, bookData);
  return {
    id: bookId,
    ...bookData
  };
};

// Delete a book
export const deleteBookFromFirebase = async (bookId) => {
  const bookRef = doc(db, BOOKS_COLLECTION, bookId);
  await deleteDoc(bookRef);
  return bookId;
};