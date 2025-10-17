const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const GOOGLE_BOOKS_API_KEY = 'AIzaSyB8O60X4lA4gacVUZtgbzhaYQLVnwqr6EU';
const OPEN_LIBRARY_API = 'https://openlibrary.org';
const ITUNES_API = 'https://itunes.apple.com/search';
const WORLD_CAT_API = 'https://www.worldcat.org/webservices/catalog/search/worldcat/opensearch';
const GOODREADS_API = 'https://www.goodreads.com/search/index.xml';

/**
 * Search for books using the Google Books API with improved precision
 * @param {string} query - Search query (title, author, ISBN, etc.)
 * @returns {Promise<Array>} - Array of book objects
 */
export const searchGoogleBooks = async (query) => {
  try {
    if (!query.trim()) return [];
    
    // Improve search precision with specific operators
    let searchQuery = query;
    
    // If it looks like an ISBN, search specifically for ISBN
    if (/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(query)) {
      searchQuery = `isbn:${query}`;
    }
    
    const response = await fetch(`${GOOGLE_BOOKS_API}?q=${encodeURIComponent(searchQuery)}&maxResults=20&printType=books&orderBy=relevance&langRestrict=pt&key=${GOOGLE_BOOKS_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch books from Google Books API');
    }
    
    const data = await response.json();
    
    if (!data.items) return [];
    
    return data.items.map(item => {
      const volumeInfo = item.volumeInfo;
      return {
        id: `google-${item.id}`,
        title: volumeInfo.title || 'Unknown Title',
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
        cover: volumeInfo.imageLinks?.thumbnail || 
               volumeInfo.imageLinks?.smallThumbnail || 
               `https://via.placeholder.com/150x220/4A5568/FFFFFF?text=${volumeInfo.title?.substring(0, 15).replace(/\s/g, '+') || 'No+Title'}`,
        description: volumeInfo.description || 'No description available',
        publisher: volumeInfo.publisher || 'Unknown Publisher',
        publishedDate: volumeInfo.publishedDate || 'Unknown Date',
        pageCount: volumeInfo.pageCount || 0,
        categories: volumeInfo.categories || [],
        isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || '',
        source: 'Google Books',
        relevanceScore: calculateRelevanceScore(volumeInfo, query)
      };
    });
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return [];
  }
};

/**
 * Search for books using the Open Library API with improved precision
 * @param {string} query - Search query (title, author, ISBN, etc.)
 * @returns {Promise<Array>} - Array of book objects
 */
export const searchOpenLibrary = async (query) => {
  try {
    if (!query.trim()) return [];
    
    // Improve search with specific fields for Open Library
    let searchQuery = query;
    
    // Check if it's an ISBN
    if (/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(query)) {
      searchQuery = `isbn:${query}`;
    }
    
    // Search for books with language preference for Portuguese
    const searchResponse = await fetch(`${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(searchQuery)}&limit=20&language=por&fields=key,title,author_name,cover_i,first_publish_year,publisher,subject,isbn,edition_key`);
    
    if (!searchResponse.ok) {
      throw new Error('Failed to fetch books from Open Library API');
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.docs || searchData.docs.length === 0) return [];
    
    // Get detailed information for each book
    const books = await Promise.all(
      searchData.docs.slice(0, 10).map(async (doc) => {
        try {
          // Get edition details to get more information
          const editionKey = doc.key.startsWith('/works/') 
            ? doc.key 
            : doc.edition_key?.[0] || doc.key;
          
          const detailResponse = await fetch(`${OPEN_LIBRARY_API}${editionKey}.json`);
          let detailData = {};
          
          if (detailResponse.ok) {
            detailData = await detailResponse.json();
          }
          
          return {
            id: `openlibrary-${doc.key.replace('/', '')}`,
            title: doc.title || 'Unknown Title',
            author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
            cover: doc.cover_i
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
              : `https://via.placeholder.com/150x220/4A5568/FFFFFF?text=${doc.title?.substring(0, 15).replace(/\s/g, '+') || 'No+Title'}`,
            description: detailData.description 
              ? (typeof detailData.description === 'string' ? detailData.description : detailData.description.value)
              : 'No description available',
            publisher: detailData.publishers ? detailData.publishers[0] : 'Unknown Publisher',
            publishedDate: doc.first_publish_year || detailData.publish_date || 'Unknown Date',
            pageCount: detailData.number_of_pages || 0,
            categories: doc.subject ? doc.subject.slice(0, 5) : [],
            isbn: doc.isbn?.[0] || '',
            source: 'Open Library',
            relevanceScore: calculateRelevanceScore(doc, query)
          };
        } catch (error) {
          console.error('Error fetching Open Library book details:', error);
          return null;
        }
      })
    );
    
    return books.filter(book => book !== null);
  } catch (error) {
    console.error('Error searching Open Library:', error);
    return [];
  }
};

/**
 * Search for books (audiobooks and ebooks) using the iTunes API with improved precision
 * @param {string} query - Search query (title, author, etc.)
 * @returns {Promise<Array>} - Array of book objects
 */
export const searchItunesBooks = async (query) => {
  try {
    if (!query.trim()) return [];
    
    // Search for books with country code for Brazil and improved attributes
    const response = await fetch(`${ITUNES_API}?term=${encodeURIComponent(query)}&entity=ebook&limit=20&country=br&attribute=allArtistTerm`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch books from iTunes API');
    }
    
    const data = await response.json();
    
    if (!data.results) return [];
    
    return data.results.map(item => {
      return {
        id: `itunes-${item.trackId}`,
        title: item.trackName || 'Unknown Title',
        author: item.artistName || 'Unknown Author',
        cover: item.artworkUrl100?.replace('100x100', '300x300') || 
               item.artworkUrl60?.replace('60x60', '300x300') || 
               `https://via.placeholder.com/150x220/4A5568/FFFFFF?text=${item.trackName?.substring(0, 15).replace(/\s/g, '+') || 'No+Title'}`,
        description: item.description || 'No description available',
        publisher: 'Unknown Publisher',
        publishedDate: item.releaseDate ? new Date(item.releaseDate).getFullYear().toString() : 'Unknown Date',
        pageCount: 0,
        categories: item.genres ? item.genres.slice(0, 3) : [],
        isbn: '',
        source: 'iTunes',
        relevanceScore: calculateRelevanceScore(item, query)
      };
    });
  } catch (error) {
    console.error('Error searching iTunes Books:', error);
    return [];
  }
};

/**
 * Search for books using the WorldCat API (requires API key for production)
 * @param {string} query - Search query (title, author, ISBN, etc.)
 * @returns {Promise<Array>} - Array of book objects
 */
export const searchWorldCat = async (query) => {
  try {
    if (!query.trim()) return [];
    
    // WorldCat OpenSearch (limited without API key)
    const searchQuery = `srwt=${encodeURIComponent(query)}&format=json&count=20`;
    const response = await fetch(`${WORLD_CAT_API}?${searchQuery}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch books from WorldCat API');
    }
    
    const data = await response.json();
    
    if (!data || !data.entries || !data.entries.entry) return [];
    
    return data.entries.entry.map((item, index) => {
      const title = item.title ? item.title.$t : 'Unknown Title';
      const author = item.author ? (Array.isArray(item.author) ? item.author.map(a => a.name.$t).join(', ') : item.author.name.$t) : 'Unknown Author';
      
      return {
        id: `worldcat-${index}`,
        title,
        author,
        cover: `https://via.placeholder.com/150x220/4A5568/FFFFFF?text=${title.substring(0, 15).replace(/\s/g, '+')}`,
        description: item.summary ? item.summary.$t : 'No description available',
        publisher: item.publisher ? (Array.isArray(item.publisher) ? item.publisher[0].name.$t : item.publisher.name.$t) : 'Unknown Publisher',
        publishedDate: item.published ? item.published.$t : 'Unknown Date',
        pageCount: 0,
        categories: [],
        isbn: '',
        source: 'WorldCat',
        relevanceScore: calculateRelevanceScore(item, query)
      };
    });
  } catch (error) {
    console.error('Error searching WorldCat:', error);
    return [];
  }
};

/**
 * Calculate relevance score for search results
 * @param {Object} book - Book object
 * @param {string} query - Search query
 * @returns {number} - Relevance score
 */
const calculateRelevanceScore = (book, query) => {
  const queryLower = query.toLowerCase();
  const title = (book.title || '').toLowerCase();
  const author = (book.author || '').toLowerCase();
  
  let score = 0;
  
  // Exact title match
  if (title === queryLower) {
    score += 100;
  }
  // Title contains query
  else if (title.includes(queryLower)) {
    score += 50;
  }
  
  // Exact author match
  if (author === queryLower) {
    score += 80;
  }
  // Author contains query
  else if (author.includes(queryLower)) {
    score += 40;
  }
  
  // Check for Portuguese indicators
  if (hasPortugueseIndicators({ title, author, publisher: (book.publisher || '').toLowerCase() })) {
    score += 20;
  }
  
  return score;
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
  const publisherLower = book.publisher || '';
  
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

/**
 * Search for books using all available APIs simultaneously
 * @param {string} query - Search query (title, author, ISBN, etc.)
 * @returns {Promise<Array>} - Array of book objects from all sources
 */
export const searchBooks = async (query) => {
  try {
    if (!query.trim()) return [];
    
    // Search all APIs simultaneously
    const searchPromises = [
      searchGoogleBooks(query),
      searchOpenLibrary(query),
      searchItunesBooks(query),
      searchWorldCat(query)
    ];
    
    const results = await Promise.allSettled(searchPromises);
    const allBooks = [];
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        allBooks.push(...result.value);
      }
    });
    
    // Remove duplicates based on title + author combination
    const uniqueBooks = [];
    const seenBooks = new Set();
    
    allBooks.forEach(book => {
      const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
      if (!seenBooks.has(key)) {
        seenBooks.add(key);
        uniqueBooks.push(book);
      }
    });
    
    // Sort by relevance score (highest first)
    uniqueBooks.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    
    return uniqueBooks.slice(0, 30); // Limit to 30 results
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

/**
 * Search for books by author name using all available APIs
 * @param {string} authorName - Author name to search for
 * @returns {Promise<Array>} - Array of book objects from all sources
 */
export const searchBooksByAuthor = async (authorName) => {
  try {
    if (!authorName.trim()) return [];
    
    // Search all APIs with author-specific queries
    const searchPromises = [
      searchGoogleBooks(`inauthor:"${authorName}"`),
      searchOpenLibrary(`author:"${authorName}"`),
      searchItunesBooks(`author:"${authorName}"`),
      searchWorldCat(authorName)
    ];
    
    const results = await Promise.allSettled(searchPromises);
    const allBooks = [];
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        allBooks.push(...result.value);
      }
    });
    
    // Remove duplicates based on title + author combination
    const uniqueBooks = [];
    const seenBooks = new Set();
    
    allBooks.forEach(book => {
      const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
      if (!seenBooks.has(key)) {
        seenBooks.add(key);
        uniqueBooks.push(book);
      }
    });
    
    // Sort by relevance score (highest first)
    uniqueBooks.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    
    return uniqueBooks.slice(0, 30); // Limit to 30 results
  } catch (error) {
    console.error('Error searching books by author:', error);
    return [];
  }
};

/**
 * Get detailed information about a specific book from Google Books
 * @param {string} bookId - The Google Books ID for the book
 * @returns {Promise<Object>} - Detailed book object
 */
export const getBookDetails = async (bookId) => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch book details');
    }
    
    const data = await response.json();
    const volumeInfo = data.volumeInfo;
    
    return {
      id: data.id,
      title: volumeInfo.title || 'Unknown Title',
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
      cover: volumeInfo.imageLinks?.thumbnail || 
             volumeInfo.imageLinks?.smallThumbnail || 
             `https://via.placeholder.com/150x220/4A5568/FFFFFF?text=${volumeInfo.title?.substring(0, 15).replace(/\s/g, '+') || 'No+Title'}`,
      description: volumeInfo.description || 'No description available',
      publisher: volumeInfo.publisher || 'Unknown Publisher',
      publishedDate: volumeInfo.publishedDate || 'Unknown Date',
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || [],
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || '',
      source: 'Google Books'
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
};