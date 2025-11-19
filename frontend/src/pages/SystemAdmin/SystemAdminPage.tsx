import { useMemo, useState } from 'react'
import './SystemAdminPage.css'
import { ShieldCheck, Building2, Puzzle, Users as UsersIcon, PlusCircle } from 'lucide-react'
import { useTranslation } from '../../contexts/LanguageContext'
import { MOCK_FARMS } from '../../data/farms'
import type { Farm } from '../../types/farm'
import { MODULE_DEFINITIONS } from '../../data/modules'
import CreateFarmModal, { type CreateFarmPayload } from './components/CreateFarmModal'

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

export default function SystemAdminPage() {
  const t = useTranslation()
  const [farms, setFarms] = useState<Farm[]>(MOCK_FARMS)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const moduleMap = useMemo(() => {
    return MODULE_DEFINITIONS.reduce<Record<string, (typeof MODULE_DEFINITIONS)[number]>>((acc, module) => {
      acc[module.key] = module
      return acc
    }, {})
  }, [])

  const stats = useMemo(() => {
    const activeFarms = farms.filter((farm) => farm.status === 'active').length
    const uniqueModules = new Set(farms.flatMap((farm) => farm.modules)).size
    const totalUsers = farms.reduce((acc, farm) => acc + farm.totalUsers, 0)
    return { totalFarms: farms.length, activeFarms, uniqueModules, totalUsers }
  }, [farms])

  const handleCreateFarm = (payload: CreateFarmPayload) => {
    const newFarm: Farm = {
      id: generateId('farm'),
      name: payload.farmName.trim(),
      code: payload.farmCode.trim() || payload.farmName.trim().slice(0, 3).toUpperCase(),
      cityState: payload.cityState.trim(),
      hectares: Number(payload.hectares) || 0,
      modules: payload.modules,
      status: 'active',
      createdAt: new Date().toISOString(),
      totalUsers: 1,
      owner: {
        id: generateId('owner'),
        name: payload.ownerName.trim(),
        email: payload.ownerEmail.trim().toLowerCase(),
        phone: payload.ownerPhone?.trim(),
      },
    }
    setFarms((prev) => [...prev, newFarm])
    setIsModalOpen(false)
  }

  return (
    <div className="system-admin-page">
      <header className="system-admin-header">
        <div>
          <p className="system-admin-eyebrow">{t('systemAdmin.title')}</p>
          <h1>{t('systemAdmin.subtitle')}</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} />
          {t('systemAdmin.createFarm')}
        </button>
      </header>

      <section className="system-admin-stats">
        <article className="system-admin-stat-card">
          <ShieldCheck size={28} />
          <div>
            <strong>{stats.totalFarms}</strong>
            <span>{t('systemAdmin.stats.totalFarms')}</span>
          </div>
        </article>
        <article className="system-admin-stat-card">
          <Building2 size={28} />
          <div>
            <strong>{stats.activeFarms}</strong>
            <span>{t('systemAdmin.stats.activeFarms')}</span>
          </div>
        </article>
        <article className="system-admin-stat-card">
          <Puzzle size={28} />
          <div>
            <strong>{stats.uniqueModules}</strong>
            <span>{t('systemAdmin.stats.modulesCoverage')}</span>
          </div>
        </article>
        <article className="system-admin-stat-card">
          <UsersIcon size={28} />
          <div>
            <strong>{stats.totalUsers}</strong>
            <span>{t('systemAdmin.stats.totalUsers')}</span>
          </div>
        </article>
      </section>

      <section className="system-admin-card">
        <header>
          <div>
            <h2>{t('systemAdmin.table.title')}</h2>
            <p>{t('systemAdmin.table.subtitle')}</p>
          </div>
        </header>

        <div className="farms-table-wrapper">
          <table className="farms-table">
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('systemAdmin.table.owner')}</th>
                <th>{t('systemAdmin.table.modules')}</th>
                <th>{t('systemAdmin.table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {farms.map((farm) => (
                <tr key={farm.id}>
                  <td>
                    <div className="farm-name-cell">
                      <strong>{farm.name}</strong>
                      <span>
                        {farm.code} • {farm.cityState}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="farm-owner-cell">
                      <strong>{farm.owner.name}</strong>
                      <span>{farm.owner.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="modules-chip-list">
                      {farm.modules.map((module) => (
                        <span key={module} className="module-chip">
                          {moduleMap[module]?.name || module}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${farm.status}`}>
                      {farm.status === 'active' ? t('systemAdmin.status.active') : t('systemAdmin.status.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <CreateFarmModal
          availableModules={MODULE_DEFINITIONS}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateFarm}
        />
      )}
    </div>
  )
}



