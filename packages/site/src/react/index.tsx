import ReactDOM from 'react-dom/client'
import App from './App'

export default function mount() {
  ReactDOM.createRoot(
    document.getElementById('react-app') as HTMLElement
  ).render(<App />)
}
