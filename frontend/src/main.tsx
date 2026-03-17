import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import api from './services/api'

// ฟังก์ชันสำหรับดึง Client ID จาก Backend ก่อนเริ่มแอพ
const initApp = async () => {
  let clientId = null;

  try {
    const response = await api.get('/auth/google-client-id');
    clientId = response.data.clientId;
  } catch (error) {
    console.error('Failed to fetch Google Client ID from backend:', error);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {clientId ? (
        <GoogleOAuthProvider clientId={clientId}>
          <App />
        </GoogleOAuthProvider>
      ) : (
        <App />
      )}
    </StrictMode>,
  )
}

initApp();
