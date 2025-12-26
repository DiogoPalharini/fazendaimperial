import React, { useEffect, useState } from 'react'
import { Table, Button, Card, Tag, Space, Modal, Form, Input, Select, message } from 'antd'
import { Plus, Settings, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { usersService, User, UserCreate } from '../../../services/users'
import { groupsService, Farm } from '../../../services/groups'
import UserPermissionModal from '../../../components/UserPermissionModal'

export default function UsersControl() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isPermModalVisible, setIsPermModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPermissions, setCurrentPermissions] = useState<Record<string, any>>({})
  const [permLoading, setPermLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersData, groupData] = await Promise.all([
        usersService.getGroupUsers(),
        currentUser?.group_id ? groupsService.getGroup(currentUser.group_id) : Promise.resolve(null)
      ])
      setUsers(usersData)
      if (groupData) {
        setFarms(groupData.farms)
      }
    } catch (error) {
      message.error('Erro ao carregar dados')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchData()
    }
  }, [currentUser])

  const handleCreateUser = async (values: UserCreate) => {
    try {
      await usersService.createUser(values)
      message.success('Usuário criado com sucesso')
      setIsCreateModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Erro ao criar usuário'
      message.error(msg)
    }
  }

  const openPermissions = async (user: User) => {
    if (!farms.length) {
      message.error('Nenhuma fazenda encontrada para configurar permissões.')
      return
    }

    setSelectedUser(user)
    setPermLoading(true)
    try {
      // Fetch existing permissions for the first farm
      // In future: dropdown to select farm
      const permData = await usersService.getUserFarmPermissions(user.id, farms[0].id)
      setCurrentPermissions(permData.allowed_modules || {})
      setIsPermModalVisible(true)
    } catch (error) {
      console.error(error)
      message.warning('Não foi possível carregar as permissões existentes. Começando vazio.')
      setCurrentPermissions({})
      setIsPermModalVisible(true)
    } finally {
      setPermLoading(false)
    }
  }

  const handleSavePermissions = async (perms: any) => {
    if (!selectedUser || !farms.length) return

    try {
      // Format payload if needed, ensuring boolean structure matches backend expectance
      // Backend expects Record<string, ModulePermission>
      await usersService.updateUserFarmPermissions(selectedUser.id, farms[0].id, perms)
      message.success('Permissões salvas com sucesso!')
      setIsPermModalVisible(false)
    } catch (error) {
      console.error(error)
      message.error('Erro ao salvar permissões')
    }
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Função',
      dataIndex: 'base_role',
      key: 'base_role',
      render: (role: string) => (
        <Tag color={role === 'owner' ? 'gold' : role === 'manager' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'ATIVO' : 'INATIVO'}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            icon={<Settings size={14} />}
            onClick={() => openPermissions(record)}
            loading={permLoading && selectedUser?.id === record.id}
            disabled={record.base_role === 'owner'} // Don't edit owner permissions via this simple UI maybe?
          >
            Permissões
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Controle de Usuários</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Gerencie funcionários e suas permissões de acesso</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsCreateModalVisible(true)}
          size="large"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Novo Usuário
        </Button>
      </div>

      <Card variant="borderless" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* Modal Create User */}
      <Modal
        title="Novo Usuário"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose={true}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateUser}>
          <Form.Item name="name" label="Nome Completo" rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input prefix={<UserIcon size={14} />} placeholder="Nome do funcionário" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Obrigatório', type: 'email' }]}>
            <Input placeholder="email@exemplo.com" />
          </Form.Item>
          <Form.Item name="cpf" label="CPF" rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input placeholder="000.000.000-00" />
          </Form.Item>
          <Form.Item name="password" label="Senha Inicial" rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input.Password placeholder="******" />
          </Form.Item>
          <Form.Item name="base_role" label="Função" initialValue="operational">
            <Select options={[
              { label: 'Operacional', value: 'operational' },
              { label: 'Gerente (Manager)', value: 'manager' },
              { label: 'Financeiro', value: 'financial' }
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Permissions */}
      {selectedUser && isPermModalVisible && (
        <UserPermissionModal
          user={selectedUser as any}
          onClose={() => setIsPermModalVisible(false)}
          onSave={handleSavePermissions}
          initialPermissions={currentPermissions}
          availableModules={(() => {
            if (!farms.length || !farms[0].modules) return undefined

            // Handle structure {"enabled": ["truck-loading", ...]}
            if (Array.isArray((farms[0].modules as any).enabled)) {
              return (farms[0].modules as any).enabled
            }

            // Handle flat structure {"truck-loading": true, ...}
            if (Object.keys(farms[0].modules).length > 0) {
              return Object.keys(farms[0].modules)
            }

            return undefined
          })()}
        />
      )}
    </div>
  )
}
