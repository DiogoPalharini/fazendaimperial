import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard'
import AppLayout from './layouts/AppLayout'
import TruckLoading from './pages/features/TruckLoading'
import Notafiscal from './pages/features/Notafiscal/index'
import MachinesControl from './pages/features/MachinesControl/index'
import InputsControl from './pages/features/InputsControl'
import FinanceControl from './pages/features/FinanceControl/index'
import ActivitiesControl from './pages/features/ActivitiesControl/index'
import Meteorologia from './pages/features/Meteorologia/index'
import SafraControl from './pages/features/SafraControl/index'
import UsersControl from './pages/features/UsersControl/index'
import SoloPage from './pages/Solo/SoloPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/carregamento" element={<TruckLoading />} />
        <Route path="/nota-fiscal" element={<Notafiscal />} />
        <Route path="/maquinas" element={<MachinesControl />} />
        <Route path="/insumos" element={<InputsControl />} />
        <Route path="/financeiro" element={<FinanceControl />} />
        <Route path="/atividades" element={<ActivitiesControl />} />
        <Route path="/meteorologia" element={<Meteorologia />} />
        <Route path="/solo" element={<SoloPage />} />
        <Route path="/safra" element={<SafraControl />} />
        <Route path="/usuarios" element={<UsersControl />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
