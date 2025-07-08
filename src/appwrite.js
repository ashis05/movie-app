import {Client, Databases, ID, Query} from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const METRICS_ID = import.meta.env.VITE_APPWRITE_METRICS_ID;

const client = new Client().setEndpoint('https://nyc.cloud.appwrite.io/v1').setProject(PROJECT_ID);
const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        console.log('Attempting to search with term:', searchTerm);
        console.log('Using Database ID:', DATABASE_ID);
        console.log('Using Collection ID:', METRICS_ID);
        
        const result = await database.listDocuments(DATABASE_ID, METRICS_ID, [Query.equal('searchTerm', searchTerm)]);
        console.log('Search result:', result);
        
        if(result.documents.length > 0){
            const document = result.documents[0];
            console.log('Updating existing document:', document.$id);
            await database.updateDocument(DATABASE_ID, METRICS_ID, document.$id, {
                count: document.count + 1
            });
        } else {
            console.log('Creating new document');
            const newDoc = await database.createDocument(DATABASE_ID, METRICS_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            });
            console.log('New document created:', newDoc);
        }
    } catch(error) {
        console.error('Detailed error:', error);
        if (error.response) {
            console.error('Error response:', error.response);
        }
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, METRICS_ID, [Query.limit(5), Query.orderDesc("count")]);
        return result.documents;
    }catch(error) {
        console.error('Detailed error:', error);
    }
}