import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Profile from './components/Profile.jsx'
import Register from './components/Register.jsx'
import { isAuthenticated } from './lib/auth.js'

const ROUTES = {
  '/login': Login,
  '/profile': Profile,
  '/register': Register,
}

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const redirectToProfile = isAuthenticated() && (path === '/' || path === '/login')
const Page = ROUTES[path] || App

if (redirectToProfile) {
  window.location.replace('/profile')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {redirectToProfile ? null : <Page />}
  </StrictMode>,
)
