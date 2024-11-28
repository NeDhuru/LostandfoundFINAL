import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
	collection,
	getDocs,
	addDoc,
	doc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	arrayUnion,
	arrayRemove,
	getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';
import { parseISO, isValid } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export const useItemsMutation = () => {
	const queryClient = useQueryClient();

	const fetchItems = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, 'items'));
			return querySnapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					...data,
					createdAt: data.createdAt || null,
				};
			});
		} catch (error) {
			console.error('Error fetching items:', error);
			return []; // Return an empty array if there's an error
		}
	};

	const useItemsQuery = () => useQuery({
		queryKey: ['items'],
		queryFn: fetchItems,
		refetchOnWindowFocus: false,
	});

	const uploadImage = async (file) => {
		if (!file) return null;
		try {
			console.log('Uploading image:', file.name);
			const storageRef = ref(storage, `items/${Date.now()}_${file.name}`);
			await uploadBytes(storageRef, file);
			const url = await getDownloadURL(storageRef);
			console.log('Image uploaded successfully. URL:', url);
			return url;
		} catch (error) {
			console.error('Error uploading image:', error);
			throw error;
		}
	};

	const deleteImage = async (imageUrl) => {
		if (!imageUrl) return;
		try {
			const imageRef = ref(storage, imageUrl);
			await deleteObject(imageRef);
			console.log('Image deleted successfully');
		} catch (error) {
			console.error('Error deleting image:', error);
			throw error;
		}
	};

	const addItem = async (newItem) => {
		try {
			console.log('Adding new item:', newItem);
			let imageUrl = null;
			if (newItem.image instanceof File) {
				imageUrl = await uploadImage(newItem.image);
			}
			const itemToAdd = {
				...newItem,
				imageUrl,
				createdAt: serverTimestamp(),
				isVerified: false,
			};
			delete itemToAdd.image; // Remove the File object
			const docRef = await addDoc(collection(db, 'items'), itemToAdd);
			console.log('Item added successfully. ID:', docRef.id);
			return docRef.id;
		} catch (error) {
			console.error('Error adding item:', error);
			throw error;
		}
	};
  const addItemUsers = async (formData) => {
		try {
			const newItem = Object.fromEntries(formData.entries());
			
			// Handle image upload
			if (formData.get('image')) {
				const imageFile = formData.get('image');
				const storageRef = ref(storage, `item-images/${Date.now()}_${imageFile.name}`);
				const snapshot = await uploadBytes(storageRef, imageFile);
				const downloadURL = await getDownloadURL(snapshot.ref);
				newItem.imageUrl = downloadURL;
			}

			// Add timestamp
			newItem.createdAt = serverTimestamp();

			// Remove the image file from newItem as we've already uploaded it
			delete newItem.image;

			const docRef = await addDoc(collection(db, 'items'), newItem);
			console.log('Item added successfully. ID:', docRef.id);
			return docRef.id;
		} catch (error) {
			console.error('Error adding item:', error);
			throw error;
		}
	};

	const claimItem = useMutation({
		mutationFn: async ({ itemId, username }) => {
			const itemRef = doc(db, 'items', itemId);
			await updateDoc(itemRef, {
				claimedBy: arrayUnion(username)
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['items'] });
		},
	});

	const unclaimItem = useMutation({
		mutationFn: async ({ itemId, username }) => {
			const itemRef = doc(db, 'items', itemId);
			const itemDoc = await getDoc(itemRef);
			const currentClaimedBy = itemDoc.data().claimedBy || [];

			if (Array.isArray(currentClaimedBy)) {
				await updateDoc(itemRef, {
					claimedBy: currentClaimedBy.filter(claimer => claimer !== username)
				});
			} else if (typeof currentClaimedBy === 'string') {
				await updateDoc(itemRef, {
					claimedBy: currentClaimedBy === username ? [] : [currentClaimedBy]
				});
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['items'] });
		},
	});

	const updateItem = async (updatedItem) => {
		try {
			console.log('Updating item:', updatedItem);
			const { id, image, ...itemData } = updatedItem;
			
			// Handle image update
			if (image instanceof File) {
				console.log('Uploading new image for update');
				itemData.imageUrl = await uploadImage(image);
				// Attempt to delete old image if it exists
				if (updatedItem.imageUrl) {
					try {
						await deleteImage(updatedItem.imageUrl);
					} catch (error) {
						console.warn('Failed to delete old image:', error);
						// Continue with the update even if image deletion fails
					}
				}
			} else if (image === null && updatedItem.imageUrl) {
				// If image is explicitly set to null, attempt to remove the existing image
				console.log('Removing existing image');
				try {
					await deleteImage(updatedItem.imageUrl);
					itemData.imageUrl = null;
				} catch (error) {
					console.warn('Failed to delete image:', error);
					// Continue with the update even if image deletion fails
					itemData.imageUrl = null;
				}
			}
			// If image is undefined, it means no change, so we don't update imageUrl

			// Handle date fields
			if (itemData.foundDate) {
				if (itemData.foundDate instanceof Date) {
					if (isValid(itemData.foundDate)) {
						itemData.foundDate = Timestamp.fromDate(itemData.foundDate);
					} else {
						delete itemData.foundDate; // Remove invalid date instead of setting to null
					}
				} else if (itemData.foundDate instanceof Timestamp) {
					// If it's already a Timestamp, leave it as is
				} else if (typeof itemData.foundDate === 'object' && itemData.foundDate.seconds) {
					// It's already a Firestore Timestamp, leave it as is
				} else if (typeof itemData.foundDate === 'string') {
					const parsedDate = parseISO(itemData.foundDate);
					if (isValid(parsedDate)) {
						itemData.foundDate = Timestamp.fromDate(parsedDate);
					} else {
						delete itemData.foundDate; // Remove invalid date instead of setting to null
					}
				} else {
					delete itemData.foundDate; // Remove invalid date instead of setting to null
				}
			} else if (itemData.foundDate === null) {
				delete itemData.foundDate; // Remove the foundDate field if it's null
			}

			// Handle createdAt if it exists (it shouldn't be updated, but just in case)
			if (itemData.createdAt && !(itemData.createdAt instanceof Timestamp)) {
				if (itemData.createdAt instanceof Date) {
					itemData.createdAt = Timestamp.fromDate(itemData.createdAt);
				} else {
					delete itemData.createdAt; // Remove createdAt if it's not a valid Date or Timestamp
				}
			}

			// Remove undefined fields to avoid overwriting with undefined
			Object.keys(itemData).forEach(key => itemData[key] === undefined && delete itemData[key]);

			console.log('Updating with data:', itemData);
			await updateDoc(doc(db, 'items', id), itemData);
			console.log('Item updated successfully');
			queryClient.invalidateQueries({ queryKey: ['items'] });
		} catch (error) {
			console.error('Error updating item:', error);
			throw error;
		}
	};

	const deleteItem = async (itemId) => {
		try {
			const itemDoc = await getDoc(doc(db, 'items', itemId));
			const item = itemDoc.data();
			if (item.imageUrl) {
				await deleteImage(item.imageUrl);
			}
			await deleteDoc(doc(db, 'items', itemId));
			console.log('Item deleted successfully');
			queryClient.invalidateQueries({ queryKey: ['items'] });
		} catch (error) {
			console.error('Error deleting item:', error);
			throw error;
		}
	};

	const addItemMutation = useMutation({
		mutationFn: addItem,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['items'] });
		},
	});

  const addItemUsersMutation = useMutation({
		mutationFn: addItemUsers,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['items'] });
		},
	});

	const updateItemMutation = useMutation({
		mutationFn: updateItem,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['items'] });
		},
	});

	const deleteItemMutation = useMutation({
		mutationFn: deleteItem,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['items'] });
		},
	});

	return {
		useItemsQuery,
		addItem: addItemMutation.mutate,
    addItemUsers: addItemUsersMutation.mutate,
		updateItem: updateItemMutation.mutate,
		deleteItem: deleteItemMutation.mutate,
		claimItem: claimItem.mutate,
		unclaimItem: unclaimItem.mutate,
		uploadImage,
	};
};
