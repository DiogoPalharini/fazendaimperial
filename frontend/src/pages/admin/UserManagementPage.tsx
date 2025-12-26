import { useState } from 'react'
import { User } from '../../types/user'
import { TEST_USERS } from '../../data/users'
import { useAuth } from '../../contexts/AuthContext'
import { Pencil, Trash2, Shield, Plus } from 'lucide-react'
import UserPermissionModal from '../../components/UserPermissionModal'
import './UserManagementPage.css' // Assuming CSS exists or will use inline/global

export default function UserManagementPage() {
    const { user } = useAuth()
    const [users, setUsers] = useState<User[]>(TEST_USERS)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    // Mock permission storage per user ID
    // In real app, this comes from API
    const [userPermissions, setUserPermissions] = useState<Record<string, any>>({})

    const handleOpenPermissions = (user: User) => {
        setSelectedUser(user)
    }

    const handleSavePermissions = (perms: any) => {
        if (selectedUser) {
            setUserPermissions(prev => ({
                ...prev,
                [selectedUser.id]: perms
            }))
            console.log('Saved permissions for user:', selectedUser.name, perms)

            // Here we would call the API to update perms
            // api.put(`/users/${selectedUser.id}/permissions`, perms)
        }
    }

    return (
        <div className="page-container" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Gestão de Usuários</h1>
                    <p style={{ color: '#6b7280' }}>Gerencie o acesso e permissões granulares da equipe.</p>
                </div>
                <button className="btn primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Novo Usuário
                </button>
            </header>

            <div className="users-table-container" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Usuário</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Função</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Permissões</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {u.avatar || u.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#111827' }}>{u.nome || u.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        fontWeight: 500
                                    }}>
                                        {u.role || u.base_role}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button
                                        onClick={() => handleOpenPermissions(u)}
                                        style={{
                                            color: '#2563eb',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Shield size={16} /> Configurar Acesso
                                    </button>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button className="icon-btn" title="Editar"><Pencil size={18} color="#4b5563" /></button>
                                        <button className="icon-btn" title="Excluir"><Trash2 size={18} color="#ef4444" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <UserPermissionModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onSave={handleSavePermissions}
                    initialPermissions={userPermissions[selectedUser.id]}
                />
            )}
        </div>
    )
}
