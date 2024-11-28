import { useMutation } from '@tanstack/react-query';
import {
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const googleProvider = new GoogleAuthProvider();

const useLoginMutation = () => {
	const navigate = useNavigate();
	return useMutation({
		mutationFn: ({ email, password, isGoogleSignIn }) => {
			if (isGoogleSignIn) {
				return signInWithPopup(auth, googleProvider);
			}
			return signInWithEmailAndPassword(auth, email, password);
		},
		onSuccess: (userCredential) => {
			console.log('Login successful', userCredential.user);
			if (userCredential?.user?.email === 'admin@gmail.com') {
				return navigate('/dashboard');
			} else {
				navigate('/app');
			}
			// You can add global success handling here if needed
		},
		onError: (error) => {
			console.error('Login failed', error.message);
			// You can add global error handling here if needed
		},
	});
};

export default useLoginMutation;
