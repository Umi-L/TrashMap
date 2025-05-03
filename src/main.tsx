import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { APIProvider } from '@vis.gl/react-google-maps'

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <APIProvider apiKey={apiKey}>
            <App />
        </APIProvider>
    </StrictMode>,
)
