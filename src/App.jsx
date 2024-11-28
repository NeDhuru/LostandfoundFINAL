// Functionality imports
import { Provider } from 'react-redux';
import store from './redux/store';
// UI imports
import RouteConfig from './routes/RouteConfig';

function App() {
	return (
		<>
			<Provider store={store}>
				<RouteConfig />
			</Provider>
		</>
	);
}

export default App;
