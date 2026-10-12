import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Dashboard from './components/Dashboard.jsx'
import Login from './components/Login.jsx'
import MeshWriteNew from './components/MeshWriteNew.jsx'
import MeshWriteView from './components/MeshWriteView.jsx'
import Profile from './components/Profile.jsx'
import PublicProfile from './components/PublicProfile.jsx'
import Register from './components/Register.jsx'
import { isAuthenticated } from './lib/auth.js'
import { getLanguage } from './lib/i18n.js'

document.documentElement.lang = getLanguage()

const ROUTES = {
  '/login': Login,
  '/profile': Profile,
  '/register': Register,
  '/dashboard': Dashboard,
  '/meshwrite/new': MeshWriteNew,
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const profileMatch = path.match(/^\/@([^/]+)$/)
const meshwriteViewMatch = path.match(/^\/meshwrite\/view\/([^/]+)$/)
const redirectToProfile = isAuthenticated() && (path === '/' || path === '/login')
const Page = ROUTES[path] || App

if (redirectToProfile) {
  window.location.replace('/profile')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {redirectToProfile ? null : profileMatch ? (
      <PublicProfile username={safeDecode(profileMatch[1])} />
    ) : meshwriteViewMatch ? (
      <MeshWriteView id={safeDecode(meshwriteViewMatch[1])} />
    ) : (
      <Page />
    )}
  </StrictMode>,
)
