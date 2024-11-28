import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
	apiKey: 'AIzaSyD_6SQvB2rAMxt7XwjFnnp-wNXkPfQ18a8',
	authDomain: 'claimit-campus.firebaseapp.com',
	projectId: 'claimit-campus',
	storageBucket: 'claimit-campus.appspot.com',
	messagingSenderId: '18127767164',
	appId: '1:18127767164:web:72b9fb4804a2c8fc282bf9',
	measurementId: 'G-D3EWGBYSDM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Auth
const auth = getAuth(app);

export { db, storage, auth };
