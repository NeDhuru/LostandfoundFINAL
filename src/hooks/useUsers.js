import { useState, useCallback } from 'react';
import { getFirestore, getDocs, query, where, collection } from 'firebase/firestore';

export function useUsers() {
  const [userNames, setUserNames] = useState({});

  const getUserNames = useCallback(async (userIds) => {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', 'in', userIds));

    try {
      const querySnapshot = await getDocs(q);
      const names = {};
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        names[userData.uid] = userData.displayName || userData.email || 'Unknown User';
      });
      setUserNames((prevNames) => ({ ...prevNames, ...names }));
      return names;
    } catch (error) {
      console.error('Error fetching user names:', error);
      return {};
    }
  }, []);

  return { userNames, getUserNames };
}
