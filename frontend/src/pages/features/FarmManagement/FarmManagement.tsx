import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit, X } from 'lucide-react'
import { Button, Form, Input, message, Popconfirm } from 'antd'
import { farmsService, Farm, Field } from '../../../services/farms'
import { useAuth } from '../../../contexts/AuthContext'
import '../FeaturePage.css'
import '../TruckLoading/TruckLoading.css'
import './FarmManagement.css' // Ensures overrides are loaded

export default function FarmManagement() {
    const { user } = useAuth()
    const [farms, setFarms] = useState<Farm[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modals
    const [isFarmModalOpen, setIsFarmModalOpen] = useState(false)
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    // State
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
    const [selectedField, setSelectedField] = useState<Field | null>(null) // For editing

    const [farmForm] = Form.useForm()
    const [fieldForm] = Form.useForm()

    useEffect(() => {
        loadFarms()
    }, [])

    const loadFarms = async () => {
        setLoading(true)
        try {
            const data = await farmsService.getAll()
            setFarms(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateFarm = async (values: any) => {
        try {
            await farmsService.create({
                name: values.name,
                group_id: user?.group_id
            })
            message.success('Nova fazenda adicionada!')
            setIsFarmModalOpen(false)
            farmForm.resetFields()
            loadFarms()
        } catch (error) {
            message.error('Erro ao adicionar fazenda')
        }
    }

    const handleSaveField = async (values: any) => {
        if (!selectedFarm) return
        try {
            if (selectedField) {
                // Edit mode
                await farmsService.updateField(selectedFarm.id, selectedField.id, {
                    ...values,
                    product: 'Safra' // Maintain product consistency
                })
                message.success('Talhão atualizado!')
            } else {
                // Create mode
                await farmsService.createField(selectedFarm.id, {
                    ...values,
                    product: 'Safra',
                    farm_id: selectedFarm.id
                })
                message.success('Talhão criado!')
            }

            setIsFieldModalOpen(false)
            fieldForm.resetFields()
            setSelectedField(null)
            loadFarms() // Refresh lists
        } catch (error) {
            message.error('Erro ao salvar talhão')
        }
    }

    const handleDeleteFarm = async (farmId: number) => {
        try {
            await farmsService.delete(farmId)
            message.success('Fazenda removida com sucesso.')
            loadFarms()
        } catch (error) {
            console.error(error)
            message.error('Erro ao remover fazenda. Verifique se existem registros vinculados.')
        }
    }

    const handleDeleteField = async (farm: Farm, fieldId: number) => {
        try {
            await farmsService.deleteField(farm.id, fieldId)
            message.success('Talhão removido')
            loadFarms() // This will also update the details modal if open because of the existing useEffect that syncs selectedFarm
        } catch (error) {
            message.error('Erro ao remover talhão')
        }
    }

    // Sync selectedFarm when farms list updates
    useEffect(() => {
        if (selectedFarm) {
            const updated = farms.find(f => f.id === selectedFarm.id)
            if (updated) setSelectedFarm(updated)
        }
    }, [farms, selectedFarm])

    const openDetailsModal = (farm: Farm) => {
        setSelectedFarm(farm)
        setIsDetailsModalOpen(true)
    }

    const openFieldModal = (farm: Farm, field?: Field) => {
        setSelectedFarm(farm)
        setSelectedField(field || null)
        if (field) {
            fieldForm.setFieldsValue(field)
        } else {
            fieldForm.resetFields()
        }
        setIsFieldModalOpen(true)
    }

    const filteredFarms = farms.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="feature-page loading-page">
            <header className="feature-header">
                <h2 className="feature-title">Gestão de Fazendas</h2>
                <p className="feature-description">
                    Adicione novas unidades (fazendas) e gerencie seus talhões e variedades produtivas.
                </p>
            </header>

            <div className="loading-toolbar">
                <div className="search-group">
                    <Search size={20} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Buscar Fazenda..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters-group"></div>
            </div>

            <div className="loading-actions">
                <button
                    type="button"
                    className="add-button"
                    onClick={() => setIsFarmModalOpen(true)}
                >
                    <Plus size={20} />
                    Adicionar Fazenda
                </button>
            </div>

            <div className="table-wrapper" style={{ overflowX: 'hidden' }}>
                {loading ? (
                    <div className="loading-state">Carregando...</div>
                ) : filteredFarms.length === 0 ? (
                    <div className="empty">Nenhuma fazenda encontrada.</div>
                ) : (
                    <table className="table farm-table-custom">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                <th>Nome da Fazenda</th>
                                <th style={{ textAlign: 'center', width: '200px' }}>Talhões</th>
                                <th style={{ textAlign: 'right', width: '100px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFarms.map((farm, index) => (
                                <tr
                                    key={farm.id}
                                    className={`carregamento-row ${index % 2 === 0 ? 'alt' : ''}`}
                                    onClick={() => openDetailsModal(farm)}
                                >
                                    <td>{farm.id}</td>
                                    <td>
                                        <span className="font-semibold text-slate-700">{farm.name}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                                            {farm.fields ? farm.fields.length : 0} Talhões
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex justify-end">
                                            <Popconfirm
                                                title="Desativar Fazenda"
                                                description="Tem certeza? A fazenda será removida."
                                                onConfirm={(e) => {
                                                    e?.stopPropagation()
                                                    handleDeleteFarm(farm.id)
                                                }}
                                                onCancel={(e) => e?.stopPropagation()}
                                                okText="Sim"
                                                cancelText="Não"
                                            >
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<Trash2 size={18} />}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center justify-center hover:bg-red-50"
                                                />
                                            </Popconfirm>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Standard System Modal Wrapper for "Nova Fazenda" */}
            {isFarmModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsFarmModalOpen(false)}>
                    <div className="modal loading-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <header className="modal-header">
                            <div>
                                <h3 className="modal-title">Nova Fazenda</h3>
                                <p className="modal-subtitle">Adicione uma nova unidade produtiva.</p>
                            </div>
                            <button className="close-btn" onClick={() => setIsFarmModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </header>

                        <div className="modal-form-content p-6">
                            <Form layout="vertical" form={farmForm} onFinish={handleCreateFarm}>
                                <div className="form-section">
                                    <div className="field">
                                        <label className="form-label">Nome da Fazenda</label>
                                        <Form.Item name="name" rules={[{ required: true, message: 'Obrigatório' }]} noStyle>
                                            <Input className="form-input" placeholder="Ex: Fazenda Retiro II" />
                                        </Form.Item>
                                        <p className="text-xs text-slate-500 mt-2">
                                            A nova fazenda compartilhará o CNPJ e Inscrição Estadual do seu grupo.
                                        </p>
                                    </div>
                                </div>
                                <footer className="modal-footer mt-6 justify-end flex gap-3">
                                    <button type="button" className="btn secondary secondary-button" onClick={() => setIsFarmModalOpen(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn primary primary-button">
                                        Salvar Fazenda
                                    </button>
                                </footer>
                            </Form>
                        </div>
                    </div>
                </div>
            )}

            {/* Standard System Modal Wrapper for "Details" */}
            {isDetailsModalOpen && selectedFarm && (
                <div className="modal-backdrop" onClick={() => setIsDetailsModalOpen(false)}>
                    <div className="modal loading-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
                        <header className="modal-header">
                            <div>
                                <h3 className="modal-title">Talhões de {selectedFarm.name}</h3>
                                <p className="modal-subtitle">Gerencie as áreas produtivas desta unidade.</p>
                            </div>
                            {/* Removed Button from Header as requested */}
                            <button className="close-btn" onClick={() => setIsDetailsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </header>

                        <div className="modal-form-content p-0">
                            <div className="overflow-x-auto">
                                {!selectedFarm.fields || selectedFarm.fields.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        Nenhum talhão cadastrado nesta fazenda.
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-6 font-medium text-slate-600">Talhão</th>
                                                <th className="py-3 px-6 font-medium text-slate-600">Variedade</th>
                                                <th className="py-3 px-6 font-medium text-slate-600">Área (ha)</th>
                                                <th className="py-3 px-6 font-medium text-slate-600 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedFarm.fields.map((field) => (
                                                <tr key={field.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-3 px-6 font-medium text-slate-800">{field.name}</td>
                                                    <td className="py-3 px-6 text-slate-600">{field.variety || '-'}</td>
                                                    <td className="py-3 px-6 text-slate-600">
                                                        {field.area_hectares ? field.area_hectares.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="py-3 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                type="text"
                                                                icon={<Edit size={16} className="text-blue-600" />}
                                                                onClick={() => openFieldModal(selectedFarm, field)}
                                                            />
                                                            <Popconfirm
                                                                title="Excluir Talhão"
                                                                onConfirm={() => handleDeleteField(selectedFarm, field.id)}
                                                                okText="Sim"
                                                                cancelText="Não"
                                                            >
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    icon={<Trash2 size={16} />}
                                                                />
                                                            </Popconfirm>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Footer now acts as the Main Action bar */}
                        <footer className="modal-footer flex flex-row items-center justify-end gap-3 p-4 border-t border-slate-100">
                            {/* Removed "Fechar" button to avoid redundancy with Header X */}
                            <button
                                className="btn primary primary-button"
                                style={{ padding: '8px 24px' }}
                                onClick={() => openFieldModal(selectedFarm)}
                            >
                                <Plus size={16} className="mr-2" />
                                Adicionar Novo Talhão
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Edit Field Modal */}
            {isFieldModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsFieldModalOpen(false)} style={{ zIndex: 1100 }}>
                    <div className="modal loading-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <header className="modal-header">
                            <div>
                                <h3 className="modal-title">{selectedField ? 'Editar Talhão' : 'Novo Talhão'}</h3>
                                <p className="modal-subtitle">
                                    {selectedField ? `Editando ${selectedField.name}` : `Adicionando à ${selectedFarm?.name}`}
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setIsFieldModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </header>

                        <div className="modal-form-content p-6">
                            <Form layout="vertical" form={fieldForm} onFinish={handleSaveField}>
                                <div className="modal-grid">
                                    <div className="field full-width">
                                        <label className="form-label">Identificação do Talhão</label>
                                        <Form.Item name="name" rules={[{ required: true, message: 'Obrigatório' }]} noStyle>
                                            <Input className="form-input" placeholder="Ex: Talhão 01 A" />
                                        </Form.Item>
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Variedade</label>
                                        <Form.Item name="variety" rules={[{ required: true, message: 'Obrigatório' }]} noStyle>
                                            <Input className="form-input" placeholder="Ex: Intacta" />
                                        </Form.Item>
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Área (Hectares)</label>
                                        <Form.Item name="area_hectares" noStyle>
                                            <Input type="number" className="form-input" placeholder="Ex: 50.5" />
                                        </Form.Item>
                                    </div>
                                </div>

                                <footer className="modal-footer mt-8 -mx-6 -mb-6">
                                    <button type="button" className="btn secondary secondary-button" onClick={() => setIsFieldModalOpen(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn primary primary-button">
                                        Salvar Talhão
                                    </button>
                                </footer>
                            </Form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
