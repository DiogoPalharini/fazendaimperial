import { useState, useEffect } from 'react'
import { Table, Button, Input, Form, message, Popconfirm } from 'antd'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { armazensService, Armazem } from '../../../../services/armazens'
import { destinatariosService } from '../../../../services/destinatarios'

// Types
interface DestinationManagementModalProps {
    visible: boolean
    onClose: () => void
}

export default function DestinationManagementModal({ visible, onClose }: DestinationManagementModalProps) {
    const [loading, setLoading] = useState(false)
    const [list, setList] = useState<Armazem[]>([])
    const [editingItem, setEditingItem] = useState<Armazem | null>(null)
    const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST')
    const [searchText, setSearchText] = useState('')

    // Form Hooks
    const [form] = Form.useForm()

    useEffect(() => {
        if (visible) {
            setViewMode('LIST')
            fetchList()
        }
    }, [visible])

    const fetchList = async () => {
        setLoading(true)
        try {
            const data = await armazensService.getAll()
            setList(data)
        } catch (error) {
            console.error(error)
            message.error('Erro ao carregar destinatários.')
        } finally {
            setLoading(false)
        }
    }

    const filteredList = list.filter(item =>
        item.nome.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.cnpj && item.cnpj.includes(searchText))
    )

    // --- Actions ---
    const handleAdd = () => {
        setEditingItem(null)
        form.resetFields()
        setViewMode('FORM')
    }

    const handleEdit = (item: Armazem) => {
        setEditingItem(item)
        form.setFieldsValue(item)
        setViewMode('FORM')
    }

    const handleBackToList = () => {
        setViewMode('LIST')
        setEditingItem(null)
    }

    const handleDelete = async (id: string) => {
        try {
            await armazensService.delete(id)
            message.success('Destinatário removido com sucesso.')
            fetchList()
        } catch (error) {
            message.error('Erro ao remover destinatário.')
        }
    }

    const handleFormSubmit = async (values: any) => {
        try {
            if (editingItem) {
                // Update
                await armazensService.update(editingItem.id, values)
                message.success('Atualizado com sucesso!')
            } else {
                // Create
                const payload = {
                    ...values,
                    umidade_padrao: 14.0,
                    fator_umidade: 1.5,
                    impurezas_padrao: 1.0,
                    eh_proprio: false
                }
                await armazensService.create(payload)
                message.success('Criado com sucesso!')
            }
            setViewMode('LIST')
            fetchList()
        } catch (error) {
            message.error('Erro ao salvar.')
        }
    }

    // --- CNPJ Logic (Auto-Search) ---
    const cnpjValue = Form.useWatch('cnpj', form)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (cnpjValue && viewMode === 'FORM') {
                const clean = cnpjValue.replace(/\D/g, '')
                if (clean.length === 14) {
                    handleCNPJSearch(clean)
                }
            }
        }, 800)
        return () => clearTimeout(timer)
    }, [cnpjValue, viewMode])

    const handleCNPJSearch = async (cnpj: string) => {
        try {
            message.loading({ content: 'Buscando CNPJ...', key: 'cnpjSearch', duration: 1 })
            const data = await destinatariosService.buscarPorCNPJ(cnpj)
            if (data) {
                form.setFieldsValue({
                    nome: data.razao_social || data.nome_fantasia,
                    logradouro: data.logradouro,
                    numero: data.numero,
                    bairro: data.bairro,
                    municipio: data.municipio,
                    uf: data.uf,
                    cep: data.cep
                })
                message.success({ content: 'Dados preenchidos!', key: 'cnpjSearch' })
            }
        } catch (err) {
            // Quiet fail or notify only on explicit button click? 
            // Better to notify if it was auto-search to let user know why nothing happened?
            // "CarregamentoForm" notifies "CNPJ não encontrado".
            message.error({ content: 'CNPJ não encontrado.', key: 'cnpjSearch' })
        }
    }

    // --- CEP Logic ---
    const handleCEPBlur = async () => {
        const cep = form.getFieldValue('cep')?.replace(/\D/g, '')
        if (cep?.length === 8) {
            const data = await destinatariosService.buscarCEP(cep)
            if (data && !data.erro) {
                form.setFieldsValue({
                    logradouro: data.logradouro,
                    bairro: data.bairro,
                    municipio: data.localidade,
                    uf: data.uf
                })
            }
        }
    }

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
            sorter: (a: Armazem, b: Armazem) => a.nome.localeCompare(b.nome)
        },
        {
            title: 'CNPJ',
            dataIndex: 'cnpj',
            key: 'cnpj',
            render: (doc: string) => doc || '-'
        },
        {
            title: 'Local',
            key: 'local',
            render: (_: any, record: Armazem) => `${record.municipio || '-'} / ${record.uf || '-'}`
        },
        {
            title: 'Ações',
            key: 'actions',
            width: 100,
            render: (_: any, record: Armazem) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        size="small"
                        icon={<Pencil size={14} />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Tem certeza que deseja excluir?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button
                            size="small"
                            danger
                            icon={<Trash2 size={14} />}
                        />
                    </Popconfirm>
                </div>
            )
        }
    ]

    if (!visible) return null

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal loading-modal"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '800px',
                    maxWidth: '95%',
                    maxHeight: '90vh', // Constraint height
                    margin: '0 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden' // Disable container scroll, enable inner scroll
                }}
            >
                <header className="modal-header" style={{ justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <h3 className="modal-title">
                            {viewMode === 'LIST' ? 'Gerenciar Destinatários' : (editingItem ? 'Editar Destinatário' : 'Novo Destinatário')}
                        </h3>
                        <p className="modal-subtitle">
                            {viewMode === 'LIST' ? 'Cadastre os locais de destino das cargas.' : 'Os dados serão utilizados para emissão de NF-e.'}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</span>
                    </button>
                </header>

                <div className="modal-form-content" style={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    {viewMode === 'LIST' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                            <div style={{ padding: '24px 24px 0 24px', flexShrink: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <Input
                                        prefix={<Search size={16} />}
                                        placeholder="Buscar por nome ou CNPJ..."
                                        style={{ width: 300 }}
                                        value={searchText}
                                        onChange={e => setSearchText(e.target.value)}
                                    />
                                    <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
                                        Novo
                                    </Button>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px 24px' }}>
                                <Table
                                    dataSource={filteredList}
                                    columns={columns}
                                    rowKey="id"
                                    loading={loading}
                                    pagination={{ pageSize: 5 }} // Pagination might make scroll unnecessary if list is short, but safe to have
                                    size="small"
                                />
                            </div>
                        </div>
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFormSubmit}
                            style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
                        >
                            <div className="modal-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                                <Form.Item
                                    label="CNPJ"
                                    name="cnpj"
                                    tooltip="Ao digitar um CNPJ válido, os dados serão buscados automaticamente."
                                >
                                    <Input placeholder="00.000.000/0000-00" maxLength={18} />
                                </Form.Item>

                                <div className="form-section">
                                    <h4 className="section-title">Dados Principais</h4>
                                    <div className="section-divider"></div>
                                    <div className="modal-grid">
                                        <div className="field full-width">
                                            <Form.Item label="Nome / Razão Social" name="nome" rules={[{ required: true, message: 'Obrigatório' }]}>
                                                <Input />
                                            </Form.Item>
                                        </div>
                                        <div className="field">
                                            <Form.Item label="Inscrição Estadual" name="inscricao_estadual">
                                                <Input />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4 className="section-title">Endereço</h4>
                                    <div className="section-divider"></div>
                                    <div className="modal-grid">
                                        <div className="field">
                                            <Form.Item label="CEP" name="cep">
                                                <Input onBlur={handleCEPBlur} />
                                            </Form.Item>
                                        </div>
                                        <div className="field">
                                            <Form.Item label="UF" name="uf">
                                                <Input maxLength={2} style={{ textTransform: 'uppercase' }} />
                                            </Form.Item>
                                        </div>
                                        <div className="field">
                                            <Form.Item label="Município" name="municipio">
                                                <Input />
                                            </Form.Item>
                                        </div>
                                        <div className="field">
                                            <Form.Item label="Bairro" name="bairro">
                                                <Input />
                                            </Form.Item>
                                        </div>
                                        <div className="field full-width">
                                            <Form.Item label="Logradouro" name="logradouro">
                                                <Input />
                                            </Form.Item>
                                        </div>
                                        <div className="field">
                                            <Form.Item label="Número" name="numero">
                                                <Input />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <footer className="modal-footer" style={{ flexShrink: 0 }}>
                                <button type="button" className="secondary-button" onClick={handleBackToList}>
                                    Cancelar
                                </button>
                                <button type="submit" className="primary-button">
                                    Salvar
                                </button>
                            </footer>
                        </Form>
                    )}
                </div>
            </div>
        </div>
    )
}
