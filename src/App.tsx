import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard'
import ItemsPage from './pages/Items/ItemsPage'
import CategoriesPage from './pages/Categories/CategoriesPage'
import AppLayout from './layouts/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/itens" element={<ItemsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
