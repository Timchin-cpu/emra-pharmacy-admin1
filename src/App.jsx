import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Categories from './pages/Categories'
import Banners from './pages/Banners'

function RequireAuth({ children }) {
  const token = localStorage.getItem('adminToken')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  // Храним флаг авторизации в state, чтобы после логина приложение перерисовалось
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('adminToken'))

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token)
    setIsAuth(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuth(false)
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isAuth
                ? <Navigate to="/" replace />
                : <Login onLogin={handleLogin} />
            }
          />
          {isAuth ? (
            <Route path="/" element={<Layout onLogout={handleLogout} />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="categories" element={<Categories />} />
              <Route path="banners" element={<Banners />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  )
}
