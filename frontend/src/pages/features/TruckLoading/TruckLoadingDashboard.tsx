import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownToLine, Truck, Scale, Settings } from 'lucide-react'
import api from '../../../services/api'
import { formatNumber } from './utils'
import DestinationManagementModal from './components/DestinationManagementModal'
import '../FeaturePage.css'
import './TruckLoading.css'

export default function TruckLoadingDashboard() {
    const [modalVisible, setModalVisible] = useState(false)

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
                <div>
                    <h2 className="feature-title">Dashboard de Cargas</h2>
                    <p className="feature-description">
                        Visão geral da produção, carregamento e saldo na lavoura.
                    </p>
                </div>
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

            {/* Configurações / Cadastros */}
            <div style={{ marginTop: '24px' }}>
                <h3 className="section-title" style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#374151' }}>Cadastros & Configurações</h3>
                <div className="summary-cards-container">
                    <div
                        className="summary-card"
                        onClick={() => setModalVisible(true)}
                        style={{ cursor: 'pointer', border: '1px solid #e5e7eb' }}
                    >
                        <div className="summary-icon-wrapper" style={{ background: '#f3f4f6', color: '#4b5563' }}>
                            <Settings size={28} strokeWidth={2.5} />
                        </div>
                        <div className="summary-content">
                            <span className="summary-label">Destinatários</span>
                            <strong className="summary-value" style={{ fontSize: '1.1rem' }}>Gerenciar</strong>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Adicionar, editar ou remover</span>
                        </div>
                    </div>
                </div>
            </div>
            <DestinationManagementModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </div>
    )
}
