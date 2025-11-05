import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard'
import ItemsPage from './pages/Items/ItemsPage'
import CategoriesPage from './pages/Categories/CategoriesPage'
import AppLayout from './layouts/AppLayout'
import TruckLoading from './pages/features/TruckLoading'
import LoadSelection from './pages/features/LoadSelection'
import InvoiceGeneration from './pages/features/InvoiceGeneration'
import MachinesControl from './pages/features/MachinesControl'
import InputsControl from './pages/features/InputsControl'
import FinanceControl from './pages/features/FinanceControl'
import ActivitiesControl from './pages/features/ActivitiesControl'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/carregamento" element={<TruckLoading />} />
        <Route path="/selecao-cargas" element={<LoadSelection />} />
        <Route path="/itens" element={<ItemsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/nota-fiscal" element={<InvoiceGeneration />} />
        <Route path="/maquinas" element={<MachinesControl />} />
        <Route path="/insumos" element={<InputsControl />} />
        <Route path="/financeiro" element={<FinanceControl />} />
        <Route path="/atividades" element={<ActivitiesControl />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
