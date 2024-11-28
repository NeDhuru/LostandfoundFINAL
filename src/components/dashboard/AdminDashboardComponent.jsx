import React, { useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
	Paper,
	Snackbar,
	Alert,
	Checkbox,
	CircularProgress,
	TextField,
} from '@mui/material';
import { useItemsMutation } from '../../hooks/useItemsMutation';
import AdminLayout from '../layout/AdminLayout';
import { format, parseISO, isValid } from 'date-fns'; // Make sure to install date-fns if you haven't already

function AdminDashboardComponent() {
	const { useItemsQuery, addItem, updateItem, deleteItem } =
		useItemsMutation();
	const {
		data: items = [],
		isLoading,
		isFetching,
		isError,
	} = useItemsQuery();
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'info',
	});

	// Add this function to format dates
	const formatDate = (date) => {
		if (!date) return '';
		if (date instanceof Date) {
			return format(date, 'yyyy-MM-dd');
		}
		if (typeof date === 'object' && date.seconds) {
			// Firestore Timestamp
			return format(new Date(date.seconds * 1000), 'yyyy-MM-dd');
		}
		try {
			return format(parseISO(date), 'yyyy-MM-dd');
		} catch {
			return 'Invalid Date';
		}
	};

	const columns = [
		{ title: 'Name', field: 'name' },
		{ title: 'Description', field: 'description' },
		{ title: 'Color', field: 'color' },
		{ title: 'Size', field: 'size' },
		{ title: 'Found Location', field: 'foundLocation' },
		{ title: 'Drop-off Location', field: 'dropOffLocation' },
		{
			title: 'Claimed By',
			field: 'claimedBy',
			emptyValue: 'Not claimed',
			render: (rowData) =>
				Array.isArray(rowData.claimedBy)
					? rowData.claimedBy.join(', ')
					: rowData.claimedBy,
			editComponent: (props) => (
				<input
					type="text"
					value={
						Array.isArray(props.value)
							? props.value.join(', ')
							: props.value || ''
					}
					onChange={(e) => props.onChange(e.target.value)}
				/>
			),
		},
		{
			title: 'Verified',
			field: 'isVerified',
			type: 'boolean',
			render: (rowData) => (
				<Checkbox checked={rowData.isVerified} readOnly />
			),
			editComponent: (props) => (
				<Checkbox
					checked={props.value}
					onChange={(e) => props.onChange(e.target.checked)}
				/>
			),
		},
		{
			title: 'Created At',
			field: 'createdAt',
			render: (rowData) => formatDate(rowData.createdAt),
			editable: 'never',
		},
		{
			title: 'Found Date',
			field: 'foundDate',
			render: (rowData) => formatDate(rowData.foundDate),
			editComponent: (props) => {
				const value = props.value ? formatDate(props.value) : '';
				return (
					<input
						type="date"
						value={value}
						onChange={(e) => props.onChange(e.target.value)}
					/>
				);
			},
		},
		{
			title: 'Image',
			field: 'image',
			render: (rowData) =>
				rowData.imageUrl ? (
					<img
						src={rowData.imageUrl}
						alt={rowData.name}
						style={{ width: 50, height: 50, objectFit: 'cover' }}
					/>
				) : (
					'No image'
				),
			editComponent: (props) => (
				<>
					{props.value instanceof File ? (
						<img
							src={URL.createObjectURL(props.value)}
							alt="Preview"
							style={{
								width: 50,
								height: 50,
								objectFit: 'cover',
								marginBottom: 10,
							}}
						/>
					) : props.value ? (
						<img
							src={props.value}
							alt="Item"
							style={{
								width: 50,
								height: 50,
								objectFit: 'cover',
								marginBottom: 10,
							}}
						/>
					) : null}
					<input
						type="file"
						accept="image/*"
						onChange={(e) => {
							const file = e.target.files[0];
							if (file) {
								console.log('File selected:', file.name);
								props.onChange(file);
							}
						}}
					/>
				</>
			),
		},
	];

	const theme = createTheme();

	const handleAddItem = async (newData) => {
		try {
			console.log('Adding new item:', newData);
			// Convert comma-separated string to array for claimedBy
			if (newData.claimedBy && typeof newData.claimedBy === 'string') {
				newData.claimedBy = newData.claimedBy
					.split(',')
					.map((item) => item.trim())
					.filter(Boolean);
			} else {
				newData.claimedBy = [];
			}
			// Set createdAt to current date string
			newData.createdAt = format(new Date(), 'yyyy-MM-dd');
			// Ensure foundDate is a string
			if (newData.foundDate) {
				if (newData.foundDate instanceof Date) {
					newData.foundDate = format(newData.foundDate, 'yyyy-MM-dd');
				} else if (typeof newData.foundDate === 'string') {
					const parsedDate = parseISO(newData.foundDate);
					if (isValid(parsedDate)) {
						newData.foundDate = format(parsedDate, 'yyyy-MM-dd');
					} else {
						newData.foundDate = ''; // Set to empty string if invalid
					}
				} else {
					newData.foundDate = ''; // Set to empty string if not a Date or string
				}
			} else {
				newData.foundDate = ''; // Set to empty string if undefined
			}
			await addItem(newData);
			setSnackbar({
				open: true,
				message: 'Item added successfully',
				severity: 'success',
			});
		} catch (error) {
			console.error('Error adding item:', error);
			setSnackbar({
				open: true,
				message: 'Error adding item: ' + error.message,
				severity: 'error',
			});
		}
	};

	const handleUpdateItem = async (newData, oldData) => {
		try {
			console.log('Updating item:', newData);
			// Convert comma-separated string to array for claimedBy
			if (newData.claimedBy && typeof newData.claimedBy === 'string') {
				newData.claimedBy = newData.claimedBy
					.split(',')
					.map((item) => item.trim())
					.filter(Boolean);
			} else if (!Array.isArray(newData.claimedBy)) {
				newData.claimedBy = [];
			}
			// Ensure foundDate is a Date object
			if (newData.foundDate && !(newData.foundDate instanceof Date)) {
				newData.foundDate = new Date(newData.foundDate);
			}
			await updateItem(newData);
			setSnackbar({
				open: true,
				message: 'Item updated successfully',
				severity: 'success',
			});
		} catch (error) {
			console.error('Error updating item:', error);
			setSnackbar({
				open: true,
				message: 'Error updating item: ' + error.message,
				severity: 'error',
			});
		}
	};

	const onRowUpdate = (newData, oldData) =>
		new Promise((resolve, reject) => {
			console.log('Updating row:', newData);
			console.log('Old data:', oldData);

			const updatedItem = {
				...oldData, // Start with all old data
				...newData, // Overwrite with new data
				foundDate: newData.foundDate
					? typeof newData.foundDate === 'string'
						? parseISO(newData.foundDate)
						: newData.foundDate
					: oldData.foundDate, // Preserve old foundDate if not changed
				createdAt: oldData.createdAt, // Always preserve the original createdAt
				image:
					newData.imageUrl instanceof File
						? newData.imageUrl
						: undefined, // Only pass the File object if it's a new image
			};

			// Handle claimedBy field
			if (newData.claimedBy) {
				if (typeof newData.claimedBy === 'string') {
					updatedItem.claimedBy = newData.claimedBy
						.split(',')
						.map((item) => item.trim())
						.filter(Boolean);
				} else if (Array.isArray(newData.claimedBy)) {
					updatedItem.claimedBy = newData.claimedBy;
				} else {
					updatedItem.claimedBy = [];
				}
			} else {
				updatedItem.claimedBy = [];
			}

			// Remove the tableData property as it's not needed for the update
			delete updatedItem.tableData;

			// If foundDate is still null after the update, and oldData had a foundDate, preserve the old foundDate
			if (updatedItem.foundDate === null && oldData.foundDate) {
				updatedItem.foundDate = oldData.foundDate;
			}

			console.log('Sending updated item:', updatedItem);

			updateItem(updatedItem)
				.then(() => {
					console.log('Update successful');
					resolve();
				})
				.catch((error) => {
					console.error('Error updating item:', error);
					reject(error);
				});
		});

	return (
		<AdminLayout>
			<ThemeProvider theme={theme}>
				<div
					style={{
						padding: '20px',
						maxWidth: '95vw',
						overflow: 'auto',
						margin: '0 auto',
					}}
				>
					<Paper style={{ overflow: 'auto', maxHeight: '80vh' }}>
						{isLoading || isFetching ? (
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<CircularProgress />
							</div>
						) : (
							<MaterialTable
								title="Item List"
								columns={columns}
								data={items}
								editable={{
									onRowAdd: handleAddItem,
									onRowUpdate: onRowUpdate,
									onRowDelete: (oldData) =>
										new Promise((resolve, reject) => {
											deleteItem(oldData.id)
												.then(() => {
													setSnackbar({
														open: true,
														message:
															'Item deleted successfully',
														severity: 'success',
													});
													resolve();
												})
												.catch((error) => {
													console.error(
														'Error deleting item:',
														error
													);
													setSnackbar({
														open: true,
														message:
															'Error deleting item: ' +
															error.message,
														severity: 'error',
													});
													reject();
												});
										}),
								}}
								options={{
									addRowPosition: 'first',
									actionsColumnIndex: -1,
									pageSize: 10,
									pageSizeOptions: [5, 10, 20],
									tableLayout: 'auto',
									headerStyle: {
										backgroundColor: '#f5f5f5',
										color: '#333',
										padding: '12px 16px',
										fontFamily:
											"ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
										fontWeight: 'bold',
										whiteSpace: 'nowrap',
									},
									rowStyle: (rowData, index) => ({
										backgroundColor:
											index % 2 === 0
												? '#fff'
												: '#f9f9f9',
										transition: 'background-color 0.3s',
										'&:hover': {
											backgroundColor: '#e8f4fd',
										},
									}),
									cellStyle: {
										whiteSpace: 'nowrap',
										padding: '8px 16px',
									},
								}}
								components={{
									Container: (props) => (
										<div
											{...props}
											style={{ maxHeight: '100%' }}
										/>
									),
								}}
								style={{
									width: '100%',
								}}
							/>
						)}
					</Paper>
				</div>
				<Snackbar
					open={snackbar.open}
					autoHideDuration={6000}
					onClose={() => setSnackbar({ ...snackbar, open: false })}
				>
					<Alert
						onClose={() =>
							setSnackbar({ ...snackbar, open: false })
						}
						severity={snackbar.severity}
						sx={{ width: '100%' }}
					>
						{snackbar.message}
					</Alert>
				</Snackbar>
			</ThemeProvider>
		</AdminLayout>
	);
}

export default AdminDashboardComponent;
