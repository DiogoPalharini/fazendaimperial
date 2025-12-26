import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard'
import AppLayout from './layouts/AppLayout'
import TruckLoading from './pages/features/TruckLoading/TruckLoading'
import TruckLoadingDashboard from './pages/features/TruckLoading/TruckLoadingDashboard'
import CarregamentoFormPage from './pages/features/TruckLoading/CarregamentoFormPage'
import Notafiscal from './pages/features/Notafiscal/index'
import MachinesControl from './pages/features/MachinesControl/index'
import InputsControl from './pages/features/InputsControl'
import FinanceControl from './pages/features/FinanceControl/index'
import ActivitiesControl from './pages/features/ActivitiesControl/index'
import Meteorologia from './pages/features/Meteorologia/index'
import SafraControl from './pages/features/SafraControl/index'
import UsersControl from './pages/features/UsersControl/index'
import ArmazensPage from './pages/features/Armazens/ArmazensPage'
import SoloPage from './pages/Solo/SoloPage'
import SystemAdminPage from './pages/SystemAdmin/SystemAdminPage'
import FarmManagement from './pages/features/FarmManagement/FarmManagement'
import HomeRedirect from './components/HomeRedirect'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/carregamento/dashboard" element={<TruckLoadingDashboard />} />
            <Route path="/carregamento" element={<TruckLoading />} />
            <Route path="/carregamento/novo" element={<CarregamentoFormPage />} />
            <Route path="/carregamento/:id" element={<CarregamentoFormPage />} />
            <Route path="/nota-fiscal" element={<Notafiscal />} />
            <Route path="/maquinas" element={<MachinesControl />} />
            <Route path="/insumos" element={<InputsControl />} />
            <Route path="/financeiro" element={<FinanceControl />} />
            <Route path="/atividades" element={<ActivitiesControl />} />
            <Route path="/meteorologia" element={<Meteorologia />} />
            <Route path="/solo" element={<SoloPage />} />
            <Route path="/safra" element={<SafraControl />} />
            <Route path="/safra" element={<SafraControl />} />
            <Route path="/armazens" element={<ArmazensPage />} />
            <Route path="/usuarios" element={<UsersControl />} />
            <Route path="/fazendas" element={<FarmManagement />} />
            <Route path="/admin/sistema" element={<SystemAdminPage />} />
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}
