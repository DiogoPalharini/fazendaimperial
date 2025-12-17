import { useQuery } from '@tanstack/react-query'
import { ArrowDownToLine, Truck, Scale } from 'lucide-react'
import api from '../../../services/api'
import { formatNumber } from './utils'
import '../FeaturePage.css'
import './TruckLoading.css'

export default function TruckLoadingDashboard() {
    // Fetch Produção Resumo
    const { data: producaoResumo, isLoading } = useQuery({
        queryKey: ['producao-resumo'],
        queryFn: async () => {
            const response = await api.get('/producao/resumo')
            return response.data
        }
    })

    if (isLoading) return <div className="loading-state">Carregando dashboard...</div>

    return (
        <div className="feature-page loading-page">
            <header className="feature-header">
                <h2 className="feature-title">Dashboard de Cargas</h2>
                <p className="feature-description">
                    Visão geral da produção, carregamento e saldo na lavoura.
                </p>
            </header>

            {producaoResumo && (
                <div className="summary-cards-container">
                    <div className="summary-card">
                        <div className="summary-icon-wrapper green">
                            <ArrowDownToLine size={28} strokeWidth={2.5} />
                        </div>
                        <div className="summary-content">
                            <span className="summary-label">Total Colhido</span>
                            <strong className="summary-value">{formatNumber(producaoResumo.total_colhido)} kg</strong>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon-wrapper blue">
                            <Truck size={28} strokeWidth={2.5} />
                        </div>
                        <div className="summary-content">
                            <span className="summary-label">Total Carregado</span>
                            <strong className="summary-value">{formatNumber(producaoResumo.total_carregado)} kg</strong>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon-wrapper orange">
                            <Scale size={28} strokeWidth={2.5} />
                        </div>
                        <div className="summary-content">
                            <span className="summary-label">Saldo na Lavoura</span>
                            <strong className="summary-value">{formatNumber(producaoResumo.saldo)} kg</strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
