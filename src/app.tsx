import { Provider } from 'react-redux'
import store from './store'
import { MainPage } from './pages/main/component'

export function App () {
    return (
        <Provider store={store}>
            <MainPage />
        </Provider>
    )
}
