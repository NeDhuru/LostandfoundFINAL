import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Make sure this path is correct
import Button from '@mui/material/Button';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { List } from '@mui/material';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
	({ theme, open }) => ({
		flexGrow: 1,
		padding: theme.spacing(3),
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		marginLeft: `-${drawerWidth}px`,
		...(open && {
			transition: theme.transitions.create('margin', {
				easing: theme.transitions.easing.easeOut,
				duration: theme.transitions.duration.enteringScreen,
			}),
			marginLeft: 0,
		}),
	})
);

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
	transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: `${drawerWidth}px`,
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'flex-end',
}));

export default function AdminLayout({ children }) {
	const theme = useTheme();
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const { data: userData } = useQuery({
		queryKey: ['user', user?.uid],
		queryFn: async () => {
			if (!user?.uid || user?.displayName) return null;
			const userDoc = await getDoc(doc(db, 'users', user.uid));
			return userDoc.exists() ? userDoc.data() : null;
		},
		enabled: !!user?.uid && !user?.displayName,
	});

	const displayName =
		user?.displayName || userData?.displayName || user?.email || 'Admin';

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	const handleLogout = async () => {
		try {
			await logout();
			navigate('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<Box className="bg-[#e7e2ff]" sx={{ display: 'flex' }}>
			<CssBaseline />
			<AppBar
				sx={{
					background:
						'linear-gradient(217.64deg, #9181F4 -5.84%, #5038ED 106.73%)',
					color: 'white', // White text color for better contrast against the gradient
				}}
				position="fixed"
				open={open}
			>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						edge="start"
						sx={{ mr: 2, ...(open && { display: 'none' }) }}
					>
						<MenuIcon />
					</IconButton>
					<Typography
						variant="h6"
						noWrap
						component="div"
						sx={{ flexGrow: 1 }}
					>
						Eureka
					</Typography>
					{user && (
						<>
							<Typography variant="subtitle1" sx={{ mr: 2 }}>
								Welcome, {displayName}
							</Typography>
							<Button color="inherit" onClick={handleLogout}>
								Logout
							</Button>
						</>
					)}
				</Toolbar>
			</AppBar>
			<Drawer
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: drawerWidth,
						boxSizing: 'border-box',
					},
				}}
				variant="persistent"
				anchor="left"
				open={open}
			>
				<DrawerHeader>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'ltr' ? (
							<ChevronLeftIcon />
						) : (
							<ChevronRightIcon />
						)}
					</IconButton>
				</DrawerHeader>
				<Divider />
				<List>
					<ListItem disablePadding>
						<ListItemButton onClick={() => navigate('/dashboard')}>
							<ListItemIcon>
								<DashboardIcon />
							</ListItemIcon>
							<ListItemText primary="Dashboard" />
						</ListItemButton>
					</ListItem>
				</List>
				<Divider />
				<List>
					<ListItem disablePadding>
						<ListItemButton onClick={handleLogout}>
							<ListItemIcon>
								<ExitToAppIcon />
							</ListItemIcon>
							<ListItemText primary="Logout" />
						</ListItemButton>
					</ListItem>
				</List>
			</Drawer>
			<Main open={open}>
				<DrawerHeader />
				{children}
			</Main>
		</Box>
	);
}
