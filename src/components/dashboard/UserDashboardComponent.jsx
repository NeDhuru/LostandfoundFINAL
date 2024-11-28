import React, { useState, useMemo } from 'react';
import { useItemsMutation } from '../../hooks/useItemsMutation';
import { useAuth } from '../../hooks/useAuth';
import {
	Container,
	Typography,
	TextField,
	Grid,
	Card,
	CardContent,
	CardActions,
	Button,
	CircularProgress,
	Snackbar,
	Alert,
	AppBar,
	Toolbar,
	IconButton,
	Box,
	Chip,
	CardMedia,
	CardActionArea,
	Fab,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Input,
	Stepper,
	Step,
	StepLabel,
	Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import StraightenIcon from '@mui/icons-material/Straighten';
import AddIcon from '@mui/icons-material/Add';
import InputAdornment from '@mui/material/InputAdornment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { keyframes } from '@emotion/react';

/**
 * Component for displaying and managing user dashboard items.
 * @returns {JSX.Element} The rendered UserDashboardComponent
 */
function UserDashboardComponent() {
	const { useItemsQuery, claimItem, unclaimItem, addItemUsers } = useItemsMutation();
	const { data: items = [], isLoading, error } = useItemsQuery();
	const { user, logout } = useAuth();
	const [searchTerm, setSearchTerm] = useState('');
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'info',
	});
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [newItem, setNewItem] = useState({
		name: '',
		description: '',
		foundLocation: '',
		dropOffLocation: '',
		color: '',
		size: '',
		foundDate: '',
		image: null
	});

	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			const isClaimedByCurrentUser = Array.isArray(item.claimedBy) &&
				item.claimedBy.includes(user?.displayName || user?.email);
			
			const searchFields = [
				item.name,
				item.description,
				item.color,
				item.foundLocation,
				item.dropOffLocation
			];

			const matchesSearch = searchFields.some(field => 
				field && field.toLowerCase().includes(searchTerm.toLowerCase())
			);

			return (!item.isVerified || (item.isVerified && isClaimedByCurrentUser)) && matchesSearch;
		});
	}, [items, searchTerm, user]);

	const handleClaim = async (itemId) => {
		if (user && (user.displayName || user.email)) {
			try {
				const username = user.displayName || user.email;
				const item = items.find(item => item.id === itemId);
				const currentClaimedBy = Array.isArray(item.claimedBy) ? item.claimedBy : [];
				
				if (!currentClaimedBy.includes(username)) {
					await claimItem({ itemId, username, currentClaimedBy });
					setSnackbar({
						open: true,
						message: 'Item claimed successfully',
						severity: 'success',
					});
				} else {
					setSnackbar({
						open: true,
						message: 'You have already claimed this item',
						severity: 'warning',
					});
				}
			} catch (error) {
				console.error('Error claiming item:', error);
				setSnackbar({
					open: true,
					message: 'Error claiming item: ' + error.message,
					severity: 'error',
				});
			}
		} else {
			setSnackbar({
				open: true,
				message: 'You must be logged in to claim items',
				severity: 'warning',
			});
		}
	};

	const handleUnclaim = async (itemId) => {
		if (user && (user.displayName || user.email)) {
			try {
				const username = user.displayName || user.email;
				const item = items.find(item => item.id === itemId);
				const currentClaimedBy = Array.isArray(item.claimedBy) ? item.claimedBy : [];
				
				if (currentClaimedBy.includes(username)) {
					await unclaimItem({ itemId, username, currentClaimedBy });
					setSnackbar({
						open: true,
						message: 'Item unclaimed successfully',
						severity: 'success',
					});
				} else {
					setSnackbar({
						open: true,
						message: 'You have not claimed this item',
						severity: 'warning',
					});
				}
			} catch (error) {
				console.error('Error unclaiming item:', error);
				setSnackbar({
					open: true,
					message: 'Error unclaiming item: ' + error.message,
					severity: 'error',
				});
			}
		}
	};

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const handleLogout = async () => {
		try {
			await logout();
			setSnackbar({
				open: true,
				message: 'Logged out successfully',
				severity: 'success',
			});
		} catch (error) {
			console.error('Error logging out:', error);
			setSnackbar({
				open: true,
				message: 'Error logging out: ' + error.message,
				severity: 'error',
			});
		}
	};

	const handleaddItemUsers = async () => {
		const formData = new FormData();
		Object.keys(newItem).forEach(key => {
			if (key === 'image' && newItem[key]) {
				formData.append(key, newItem[key]);
			} else {
				formData.append(key, newItem[key]);
			}
		});

		try {
			await addItemUsers(formData);
			setSnackbar({ open: true, message: 'Item added successfully', severity: 'success' });
			setIsAddDialogOpen(false);
			setNewItem({
				name: '',
				description: '',
				foundLocation: '',
				dropOffLocation: '',
				color: '',
				size: '',
				foundDate: '',
				image: null
			});
		} catch (error) {
			console.error('Error adding item:', error);
			setSnackbar({ open: true, message: 'Error adding item: ' + error.message, severity: 'error' });
		}
	};

	const handleImageChange = (event) => {
		setNewItem({ ...newItem, image: event.target.files[0] });
	};

	const renderActionButton = (item) => {
		const isClaimedByCurrentUser = Array.isArray(item.claimedBy) &&
			item.claimedBy.includes(user?.displayName || user?.email);
		
		if (isClaimedByCurrentUser && item.isVerified) {
			return (
				<Button
					size="small"
					variant="contained"
					color="success"
					disabled
					fullWidth
				>
					Delivered
				</Button>
			);
		} else if (isClaimedByCurrentUser) {
			return (
				<Button
					size="small"
					variant="contained"
					color="secondary"
					onClick={() => handleUnclaim(item.id)}
					fullWidth
				>
					Unclaim
				</Button>
			);
		} else {
			return (
				<Button
					size="small"
					variant="contained"
					color="primary"
					onClick={() => handleClaim(item.id)}
					fullWidth
				>
					Claim
				</Button>
			);
		}
	};

	const pulse = keyframes`
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.1);
			opacity: 0.7;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	`;

	const rotate = keyframes`
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	`;

	const bounce = keyframes`
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
		60% {
			transform: translateY(-5px);
		}
	`;

	const gradientAnimation = keyframes`
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	`;

	const steps = [
		{
			label: 'Search for Items',
			description: 'Browse through the list of found items.',
			icon: <SearchIcon sx={{ color: 'white', animation: `${pulse} 2s infinite` }} />,
		},
		{
			label: 'Add Lost Item',
			description: 'Report your lost item to the system.',
			icon: <AddIcon sx={{ color: 'white', animation: `${pulse} 2s infinite` }} />,
		},
		{
			label: 'Claim Your Item',
			description: 'If you find your lost item, claim it.',
			icon: <AssignmentTurnedInIcon sx={{ color: 'white', animation: `${rotate} 5s linear infinite` }} />,
		},
	];

	if (isLoading) return <CircularProgress />;
	if (error)
		return <Typography color="error">Error: {error.message}</Typography>;

	return (
		<div className="bg-[#e7e2ff]">
			<AppBar 
				className='mb-4' 
				position="static" 
				sx={{ 
					background: 'linear-gradient(217.64deg, #9181F4 -5.84%, #5038ED 106.73%)',
					color: 'white'  // White text color for better contrast against the gradient
				}}
			>
				<Toolbar>
					<Typography
						variant="h6"
						component="div"
						sx={{ flexGrow: 1 }}
						style={{ color: 'white' }}
					>
						Eureka
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<Typography variant="subtitle1" sx={{ mr: 2 }}>
							Welcome, {user?.displayName || user?.email || 'User'}
						</Typography>
						<IconButton
							color="inherit"
							onClick={handleLogout}
							title="Logout"
						>
							<LogoutIcon />
						</IconButton>
					</Box>
				</Toolbar>
			</AppBar>
			<Container maxWidth="lg" sx={{ py: 8, position: 'relative', backgroundColor: '#e7e2ff' }}>
				<Paper 
					elevation={3} 
					sx={{ 
						p: 3, 
						mb: 4, 
						background: 'linear-gradient(45deg, #FE6B8B, #FF8E53, #8ED1FC, #0693E3, #00D084)',
						backgroundSize: '400% 400%',
						animation: `${gradientAnimation} 15s ease infinite`,
					}}
				>
					<Typography variant="h5" gutterBottom align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
						How It Works
					</Typography>
					<Stepper activeStep={-1} alternativeLabel>
						{steps.map((step, index) => (
							<Step key={step.label}>
								<StepLabel icon={step.icon}>
									<Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>{step.label}</Typography>
									<Typography variant="body2" sx={{ color: 'white' }}>
										{step.description}
									</Typography>
								</StepLabel>
							</Step>
						))}
					</Stepper>
				</Paper>

				<Typography variant="h3" component="h1" gutterBottom>
					Found Items
				</Typography>
				<TextField
					fullWidth
						variant="outlined"
						placeholder="Search items..."
						value={searchTerm}
						onChange={handleSearchChange}
						sx={{ mb: 4 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>
					{filteredItems.length === 0 ? (
						<Typography variant="body1" color="text.secondary">
							No items found.
						</Typography>
					) : (
						<Grid container spacing={3}>
							{filteredItems.map((item) => (
								<Grid item xs={12} sm={6} md={4} key={item.id}>
									<Card
										sx={{
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											transition: 'all 0.3s ease-in-out',
											'&:hover': {
												transform: 'translateY(-5px)',
												boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
											},
										}}
									>
										<CardActionArea>
											<CardMedia
												component="div"
												sx={{
													height: 200,
													backgroundColor: 'grey.200',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												{item.imageUrl ? (
													<img
														src={item.imageUrl}
														alt={item.name}
														style={{ width: '100%', height: '100%', objectFit: 'cover' }}
													/>
												) : (
													<ImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
												)}
											</CardMedia>
											<CardContent sx={{ flexGrow: 1, height: 280 }}>
												<Typography gutterBottom variant="h6" component="h2" noWrap>
													{item.name}
												</Typography>
												<Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '2.5em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
													{item.description}
												</Typography>
												<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
													<LocationOnIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
													<Typography variant="body2" color="text.primary" noWrap>
														Found at: {item.foundLocation || 'Not specified'}
													</Typography>
												</Box>
												<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
													<LocationOnIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 20 }} />
													<Typography variant="body2" color="text.primary" noWrap>
														Drop-off: {item.dropOffLocation || 'Not specified'}
													</Typography>
												</Box>
												<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
													<ColorLensIcon sx={{ color: 'error.main', mr: 1, fontSize: 20 }} />
													<Typography variant="body2" color="text.primary" noWrap>
														Color: {item.color || 'Not specified'}
													</Typography>
												</Box>
												<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
													<StraightenIcon sx={{ color: 'info.main', mr: 1, fontSize: 20 }} />
													<Typography variant="body2" color="text.primary" noWrap>
														Size: {item.size || 'Not specified'}
													</Typography>
												</Box>
												{Array.isArray(item?.claimedBy) && item.claimedBy.length > 0 && (
													<Box sx={{ mt: 2 }}>
														<Typography variant="body2" color="text.secondary">
															Claimed by:
														</Typography>
														<Box 
															sx={{ 
																display: 'flex', 
																overflowX: 'auto', 
																'&::-webkit-scrollbar': { height: 6 },
																'&::-webkit-scrollbar-track': { backgroundColor: 'grey.200' },
																'&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.400', borderRadius: 3 },
															}}
														>
															{item.claimedBy.map((claimer, index) => (
																<Chip 
																	key={index} 
																	label={claimer} 
																	size="small" 
																	color="primary" 
																	variant="outlined" 
																	sx={{ mr: 1, my: 1, flexShrink: 0 }}
																/>
															))}
														</Box>
													</Box>
												)}
											</CardContent>
										</CardActionArea>
										<CardActions sx={{ justifyContent: 'center', p: 2, mt: 'auto' }}>
											{renderActionButton(item)}
										</CardActions>
									</Card>
								</Grid>
							))}
						</Grid>
					)}
					<Fab 
						color="primary" 
						aria-label="add" 
						style={{ position: 'fixed', bottom: 20, right: 20 }}
						onClick={() => setIsAddDialogOpen(true)}
					>
						<AddIcon />
					</Fab>
					<Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
						<DialogTitle>Add New Item</DialogTitle>
						<DialogContent>
							<TextField
								autoFocus
								margin="dense"
								label="Name"
								fullWidth
								value={newItem.name}
								onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
							/>
							<TextField
								margin="dense"
								label="Description"
								fullWidth
								multiline
								rows={3}
								value={newItem.description}
								onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
							/>
							<TextField
								margin="dense"
								label="Found Location"
								fullWidth
								value={newItem.foundLocation}
								onChange={(e) => setNewItem({ ...newItem, foundLocation: e.target.value })}
							/>
							<TextField
								margin="dense"
								label="Drop-off Location"
								fullWidth
								value={newItem.dropOffLocation}
								onChange={(e) => setNewItem({ ...newItem, dropOffLocation: e.target.value })}
							/>
							<TextField
								margin="dense"
								label="Color"
								fullWidth
								value={newItem.color}
								onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
							/>
							<TextField
								margin="dense"
								label="Size"
								fullWidth
								value={newItem.size}
								onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
							/>
							<TextField
								margin="dense"
								label="Found Date"
								type="date"
								fullWidth
								InputLabelProps={{
									shrink: true,
								}}
								value={newItem.foundDate}
								onChange={(e) => setNewItem({ ...newItem, foundDate: e.target.value })}
							/>
							<Input
								type="file"
								onChange={handleImageChange}
								fullWidth
								margin="dense"
							/>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
							<Button onClick={handleaddItemUsers}>Add</Button>
						</DialogActions>
					</Dialog>
				</Container>
				<Snackbar
					open={snackbar.open}
					autoHideDuration={6000}
					onClose={() => setSnackbar({ ...snackbar, open: false })}
				>
					<Alert
						onClose={() => setSnackbar({ ...snackbar, open: false })}
						severity={snackbar.severity}
						sx={{ width: '100%' }}
					>
						{snackbar.message}
					</Alert>
				</Snackbar>
			</div>
		);
	}

	export default UserDashboardComponent;
