import { useState, useEffect } from 'react'
import { MODULE_DEFINITIONS } from '../data/modules'
import { X, Info } from 'lucide-react'
import type { User } from '../types/user'

type Props = {
    user: User
    onClose: () => void
    onSave: (permissions: Record<string, any>) => void
    initialPermissions?: Record<string, any>
    availableModules?: string[]
}

// Mapeamento de quais flags habilitam o que
// Mapeamento de quais flags habilitam o que
// Default: read -> ver listagem
// create/update/delete -> gerenciar
const PERMISSION_FLAGS = [
    { key: 'read', label: 'Ver / Acessar' },
    { key: 'create', label: 'Criar' },
    { key: 'update', label: 'Editar' },
    { key: 'delete', label: 'Excluir' }
]

export default function UserPermissionModal({ user, onClose, onSave, initialPermissions = {}, availableModules }: Props) {
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(
        initialPermissions || {}
    )

    useEffect(() => {
        if (initialPermissions) {
            setPermissions(initialPermissions)
        }
    }, [initialPermissions])


    const togglePermission = (moduleKey: string, flag: string) => {
        setPermissions(prev => {
            const modulePerms = prev[moduleKey] || { read: false, dashboard: false, create: false, update: false, delete: false, manage_weight: false, manage_quality: false }
            const newValue = !modulePerms[flag]
            return {
                ...prev,
                [moduleKey]: {
                    ...modulePerms,
                    [flag]: newValue
                }
            }
        })
    }

    const handleSave = () => {
        onSave(permissions)
        onClose()
    }

    const filteredModules = availableModules && availableModules.length > 0
        ? MODULE_DEFINITIONS.filter(m => availableModules.includes(m.key))
        : MODULE_DEFINITIONS

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '950px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <header className="modal-header">
                    <h3>Permissões de Acesso: {user.nome || user.name}</h3>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </header>

                <div className="modal-body" style={{ padding: '20px' }}>
                    <div className="info-box" style={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Info size={20} color="#3b82f6" />
                            <div>
                                <p style={{ margin: 0, color: '#1e40af', fontWeight: 500 }}>Configuração de Acesso</p>
                                <p style={{ margin: '4px 0 0 0', color: '#1e3a8a', fontSize: '0.9rem' }}>
                                    Selecione quais módulos e ações este usuário pode acessar.
                                </p>
                            </div>
                        </div>
                    </div>

                    <table className="permissions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ textAlign: 'left', padding: '12px', color: '#374151' }}>Módulo</th>
                                {PERMISSION_FLAGS.map(flag => (
                                    <th key={flag.key} style={{ textAlign: 'center', padding: '12px', color: '#374151', fontSize: '0.85rem' }}>{flag.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredModules.map(module => {
                                // Special handling for Carregamento to split Dashboard vs Management vs Submodules
                                if (module.key === 'truck-loading') {
                                    return (
                                        <>
                                            {/* Sub-module: Dashboard */}
                                            <tr key={`${module.key}-dash`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '20px' }}>
                                                        <module.icon size={18} color="#6b7280" />
                                                        <div>
                                                            <div style={{ fontWeight: 500, color: '#111827' }}>Carregamento: Dashboard</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Visualização de indicadores</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {PERMISSION_FLAGS.map(flag => {
                                                    // Dashboard only uses 'read' (mapped to dashboard)
                                                    if (flag.key !== 'read') return <td key={flag.key}></td>

                                                    const isChecked = permissions[module.key]?.['dashboard']
                                                    return (
                                                        <td key={flag.key} style={{ textAlign: 'center', padding: '12px' }}>
                                                            <label className="checkbox-container">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!isChecked}
                                                                    onChange={() => togglePermission(module.key, 'dashboard')}
                                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                                />
                                                            </label>
                                                        </td>
                                                    )
                                                })}
                                            </tr>

                                            {/* Sub-module: Gestão (List/Create/Update/Delete) */}
                                            <tr key={`${module.key}-list`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '20px' }}>
                                                        <module.icon size={18} color="#6b7280" />
                                                        <div>
                                                            <div style={{ fontWeight: 500, color: '#111827' }}>Carregamento: Gestão</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Lista e operações gerais</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {PERMISSION_FLAGS.map(flag => {
                                                    const isChecked = permissions[module.key]?.[flag.key]
                                                    return (
                                                        <td key={flag.key} style={{ textAlign: 'center', padding: '12px' }}>
                                                            <label className="checkbox-container">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!isChecked}
                                                                    onChange={() => togglePermission(module.key, flag.key)}
                                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                                />
                                                            </label>
                                                        </td>
                                                    )
                                                })}
                                            </tr>

                                            {/* Sub-module: Balança (Standalone Row) */}
                                            <tr key={`${module.key}-weight`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '50px' }}>
                                                        <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb', marginRight: '10px' }}></div>
                                                        <div>
                                                            <div style={{ fontWeight: 500, color: '#4b5563' }}>↳ Balança</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Editar Peso Bruto/Tara</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {PERMISSION_FLAGS.map(flag => {
                                                    // Only show checkbox in 'update' column
                                                    if (flag.key !== 'update') return <td key={flag.key}></td>

                                                    const isChecked = permissions[module.key]?.['manage_weight']
                                                    return (
                                                        <td key={flag.key} style={{ textAlign: 'center', padding: '12px' }}>
                                                            <label className="checkbox-container">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!isChecked}
                                                                    onChange={() => togglePermission(module.key, 'manage_weight')}
                                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                                />
                                                            </label>
                                                        </td>
                                                    )
                                                })}
                                            </tr>

                                            {/* Sub-module: Secador (Standalone Row) */}
                                            <tr key={`${module.key}-quality`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '50px' }}>
                                                        <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb', marginRight: '10px' }}></div>
                                                        <div>
                                                            <div style={{ fontWeight: 500, color: '#4b5563' }}>↳ Secador</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Editar Umidade/Impurezas</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {PERMISSION_FLAGS.map(flag => {
                                                    // Only show checkbox in 'update' column
                                                    if (flag.key !== 'update') return <td key={flag.key}></td>

                                                    const isChecked = permissions[module.key]?.['manage_quality']
                                                    return (
                                                        <td key={flag.key} style={{ textAlign: 'center', padding: '12px' }}>
                                                            <label className="checkbox-container">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!isChecked}
                                                                    onChange={() => togglePermission(module.key, 'manage_quality')}
                                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                                />
                                                            </label>
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        </>
                                    )
                                }

                                // Standard rendering for other modules
                                return (
                                    <tr key={module.key} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <module.icon size={18} color="#6b7280" />
                                                <div>
                                                    <div style={{ fontWeight: 500, color: '#111827' }}>{module.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{module.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {PERMISSION_FLAGS.map(flag => {
                                            const isChecked = permissions[module.key]?.[flag.key]
                                            return (
                                                <td key={flag.key} style={{ textAlign: 'center', padding: '12px' }}>
                                                    <label className="checkbox-container">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!isChecked}
                                                            onChange={() => togglePermission(module.key, flag.key)}
                                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                        />
                                                    </label>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <footer className="modal-footer" style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} className="btn secondary">Cancelar</button>
                    <button onClick={handleSave} className="btn primary">Salvar Permissões</button>
                </footer>
            </div>
        </div>
    )
}
