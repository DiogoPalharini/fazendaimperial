import { useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd'
import { Plus, Edit, Trash2, Building2, MapPin } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { armazensService, Armazem } from '../../../services/armazens'

export default function ArmazensPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form] = Form.useForm()
    const queryClient = useQueryClient()

    const { data: armazens = [], isLoading } = useQuery({
        queryKey: ['armazens'],
        queryFn: armazensService.getAll
    })

    const createMutation = useMutation({
        mutationFn: armazensService.create,
        onSuccess: () => {
            message.success('Armazém/Destinatário criado com sucesso!')
            handleCloseModal()
            queryClient.invalidateQueries({ queryKey: ['armazens'] })
        },
        onError: () => message.error('Erro ao criar registro.')
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Armazem> }) => armazensService.update(id, data),
        onSuccess: () => {
            message.success('Atualizado com sucesso!')
            handleCloseModal()
            queryClient.invalidateQueries({ queryKey: ['armazens'] })
        },
        onError: () => message.error('Erro ao atualizar registro.')
    })

    const deleteMutation = useMutation({
        mutationFn: armazensService.delete,
        onSuccess: () => {
            message.success('Removido com sucesso!')
            queryClient.invalidateQueries({ queryKey: ['armazens'] })
        },
        onError: () => message.error('Erro ao remover registro.')
    })

    const handleEdit = (record: Armazem) => {
        setEditingId(record.id)
        form.setFieldsValue(record)
        setIsModalOpen(true)
    }

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingId(null)
        form.resetFields()
    }

    const onFinish = (values: any) => {
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: values })
        } else {
            createMutation.mutate(values)
        }
    }

    const columns = [
        {
            title: 'Nome / Razão Social',
            dataIndex: 'nome',
            key: 'nome',
            render: (text: string, record: Armazem) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} color="#666" />
                    <strong>{text}</strong>
                    {record.eh_proprio && <Tag color="blue">Próprio</Tag>}
                </div>
            )
        },
        {
            title: 'CNPJ',
            dataIndex: 'cnpj',
            key: 'cnpj',
        },
        {
            title: 'Município/UF',
            key: 'location',
            render: (_: any, record: Armazem) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666' }}>
                    <MapPin size={14} />
                    {record.municipio} - {record.uf}
                </div>
            )
        },
        {
            title: 'Parâmetros (Umi/Imp)',
            key: 'params',
            render: (_: any, record: Armazem) => (
                <span style={{ fontSize: '0.85rem' }}>
                    Umi: {record.umidade_padrao}% | Imp: {record.impurezas_padrao}%
                </span>
            )
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, record: Armazem) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button icon={<Edit size={16} />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Tem certeza que deseja excluir?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button icon={<Trash2 size={16} />} danger />
                    </Popconfirm>
                </div>
            )
        }
    ]

    return (
        <div className="feature-page">
            <header className="feature-header">
                <div>
                    <h2 className="feature-title">Armazéns e Destinatários</h2>
                    <p className="feature-subtitle">Gerencie os locais de destino e clientes para suas remessas e vendas.</p>
                </div>
                <Button type="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Novo Destino
                </Button>
            </header>

            <div className="table-container" style={{ background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <Table
                    columns={columns}
                    dataSource={armazens}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            <Modal
                title={editingId ? "Editar Armazém/Destinatário" : "Novo Armazém/Destinatário"}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={800}
            >
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <div className="modal-grid">
                        <Form.Item name="nome" label="Nome / Razão Social" rules={[{ required: true, message: 'Obrigatório' }]} className="field full-width">
                            <Input placeholder="Nome do Armazém ou Cliente" />
                        </Form.Item>

                        <Form.Item name="cnpj" label="CNPJ" className="field">
                            <Input placeholder="00.000.000/0000-00" />
                        </Form.Item>

                        <Form.Item name="inscricao_estadual" label="Inscrição Estadual" className="field">
                            <Input />
                        </Form.Item>

                        <div className="field full-width section-divider" style={{ height: '1px', background: '#eee', margin: '12px 0' }}></div>

                        {/* Endereço */}
                        <h4 style={{ gridColumn: '1/-1', marginBottom: '8px', color: '#666' }}>Endereço</h4>

                        <Form.Item name="cep" label="CEP" className="field">
                            <Input />
                        </Form.Item>
                        <Form.Item name="logradouro" label="Logradouro" className="field">
                            <Input />
                        </Form.Item>
                        <Form.Item name="numero" label="Número" className="field">
                            <Input />
                        </Form.Item>
                        <Form.Item name="bairro" label="Bairro" className="field">
                            <Input />
                        </Form.Item>
                        <Form.Item name="municipio" label="Município" className="field">
                            <Input />
                        </Form.Item>
                        <Form.Item name="uf" label="UF" className="field">
                            <Input maxLength={2} style={{ textTransform: 'uppercase' }} />
                        </Form.Item>

                        <div className="field full-width section-divider" style={{ height: '1px', background: '#eee', margin: '12px 0' }}></div>

                        {/* Parâmetros */}
                        <h4 style={{ gridColumn: '1/-1', marginBottom: '8px', color: '#666' }}>Parâmetros de Desconto (Padrão)</h4>

                        <Form.Item name="umidade_padrao" label="Umidade Padrão (%)" initialValue={14} className="field">
                            <Input type="number" step="0.1" />
                        </Form.Item>
                        <Form.Item name="impurezas_padrao" label="Impurezas Padrão (%)" initialValue={1} className="field">
                            <Input type="number" step="0.1" />
                        </Form.Item>
                        <Form.Item name="fator_umidade" label="Fator de Umidade" initialValue={1.5} className="field">
                            <Input type="number" step="0.1" />
                        </Form.Item>

                        <Form.Item name="eh_proprio" label="Tipo" initialValue={false} className="field">
                            <Select>
                                <Select.Option value={false}>Terceiro / Cliente</Select.Option>
                                <Select.Option value={true}>Armazém Próprio</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <Button onClick={handleCloseModal}>Cancelar</Button>
                        <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                            Salvar
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}
