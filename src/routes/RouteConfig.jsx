import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress, Box } from '@mui/material';
import Login from '../pages/auth/Login';
import Registration from '../pages/auth/Registration';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import UserDashboard from '../pages/dashboard/UserDashboard';
import { useAuth } from '../hooks/useAuth'; // Import the useAuth hook
// Import other components as needed

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
				<CircularProgress />
			</Box>
		);
	}

	console.log(user);
	// Redirect admin to dashboard
	if (
		user?.email === 'admin@gmail.com' &&
		window.location.pathname === '/app'
	) {
		return <Navigate to="/dashboard" replace />;
	}

	if (
		user?.email !== 'admin@gmail.com' &&
		window.location.pathname === '/dashboard'
	) {
		return <Navigate to="/app" replace />;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return children;
};

const router = createBrowserRouter([
	{
		path: '/login',
		element: <Login />,
	},
	{
		path: '/',
		element: <Login />,
	},
	{
		path: '/register',
		element: <Registration />,
	},

	{
		path: 'app',
		element: (
			<ProtectedRoute>
				<UserDashboard />
			</ProtectedRoute>
		),
	},
	{
		path: 'dashboard',
		element: (
			<ProtectedRoute>
				<AdminDashboard />
			</ProtectedRoute>
		),
	},
	// Add other protected routes here
]);

const queryClient = new QueryClient();
const theme = createTheme();

// Main component for the application that provides QueryClient, Theme, and Router
function RouteConfig() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<RouterProvider router={router} />
			</ThemeProvider>
		</QueryClientProvider>
	);
}

export default RouteConfig;
