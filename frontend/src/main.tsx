import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { getGoogleClientId } from '@/lib/googleAuth'

const googleClientId = getGoogleClientId()

if (!googleClientId) {
  console.warn('Missing VITE_GOOGLE_CLIENT_ID/REACT_APP_GOOGLE_CLIENT_ID env variables. Google login will be disabled.')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || 'missing-google-client-id'}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
