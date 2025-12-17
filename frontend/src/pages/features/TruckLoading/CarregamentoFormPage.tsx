import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tabs, message, Modal, AutoComplete } from 'antd'
import { ArrowLeft, FileText, CheckCircle2, Truck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { carregamentosService } from '../../../services/carregamentos'
import { armazensService, Armazem } from '../../../services/armazens'
import { groupsService, Farm } from '../../../services/groups'
import { useAuth } from '../../../contexts/AuthContext'
import './TruckLoading.css'

// --- Zod Schema ---
const schema = z.object({
    scheduledAt: z.string().min(1, 'Data é obrigatória'),
    truck: z.string().min(1, 'Caminhão é obrigatório'),
    driver: z.string().min(1, 'Motorista é obrigatório'),
    farm: z.string().min(1, 'Fazenda é obrigatória'),
    field: z.string().min(1, 'Talhão é obrigatório'),
    product: z.string().min(1, 'Produto é obrigatório'),
    quantity: z.string().min(1, 'Quantidade é obrigatória'),
    unit: z.string().min(1, 'Unidade é obrigatória'),
    destination: z.string().min(1, 'Destino é obrigatório'),

    // Pesagem
    peso_estimado_kg: z.number().nullable().optional(),
    peso_bruto_kg: z.number().nullable().optional(),
    tara_kg: z.number().nullable().optional(),
    umidade_percent: z.number().nullable().optional(),
    impurezas_percent: z.number().nullable().optional(),
    armazem_destino_id: z.string().nullable().optional(),
    peso_recebido_final_kg: z.number().nullable().optional(),

    // Comparativo Empresa (Remessa)
    umidade_empresa_percent: z.number().nullable().optional(),
    impurezas_empresa_percent: z.number().nullable().optional(),
    peso_com_desconto_empresa: z.number().nullable().optional(),

    // NFe Fields (Opcionais no schema base, validados por contexto se necessário)
    natureza_operacao: z.string().optional(),
    cfop: z.string().optional(),
    valor_unitario: z.string().optional(),
    ncm: z.string().optional(),

    // Emitente
    cnpj_emitente: z.string().optional(),
    nome_emitente: z.string().optional(),
    logradouro_emitente: z.string().optional(),
    numero_emitente: z.string().optional(),
    bairro_emitente: z.string().optional(),
    municipio_emitente: z.string().optional(),
    uf_emitente: z.string().optional(),
    cep_emitente: z.string().optional(),
    inscricao_estadual_emitente: z.string().optional(),

    // Destinatário
    cnpj_destinatario: z.string().optional(),
    nome_destinatario: z.string().optional(),
    logradouro_destinatario: z.string().optional(),
    numero_destinatario: z.string().optional(),
    bairro_destinatario: z.string().optional(),
    municipio_destinatario: z.string().optional(),
    uf_destinatario: z.string().optional(),
    cep_destinatario: z.string().optional(),
    indicador_inscricao_estadual_destinatario: z.string().optional(),
    inscricao_estadual_destinatario: z.string().optional(),

    // Transportador
    nome_transportador: z.string().optional(),
    cnpj_transportador: z.string().optional(),
    placa_veiculo: z.string().optional(),
    uf_veiculo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const UNITS = ['kg', 'ton', 'sacas']

export default function CarregamentoFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { user } = useAuth()
    const isEditing = !!id
    const [activeTab, setActiveTab] = useState('interno')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [loading, setLoading] = useState(false)

    // State for Suggestions (Options)
    // baseOptions stores the raw strings from API
    const [baseOptions, setBaseOptions] = useState<Record<string, string[]>>({
        truck: [],
        driver: [],
        product: [],
        field: [],
        destination: []
    })
    // displayOptions stores the formatted options for AutoComplete
    const [displayOptions, setDisplayOptions] = useState<Record<string, { value: string; label: ReactNode }[]>>({
        truck: [],
        driver: [],
        product: [],
        field: [],
        destination: []
    })

    // Helper to format options
    const formatOptions = (values: string[]) => values.map(v => ({ value: v, label: v }))

    // State for Farms
    const [farms, setFarms] = useState<Farm[]>([])

    // Fetch Carregamento Data if Editing
    const { data: carregamentoData, isLoading: isLoadingData } = useQuery({
        queryKey: ['carregamento', id],
        queryFn: () => carregamentosService.getById(Number(id)),
        enabled: isEditing
    })

    // Fetch Armazéns
    const { data: armazens = [] } = useQuery<Armazem[]>({
        queryKey: ['armazens'],
        queryFn: armazensService.getAll
    })

    const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            scheduledAt: new Date().toISOString().slice(0, 16),
            unit: 'kg',
            // Defaults NFe
            natureza_operacao: 'VENDA DE PRODUCAO DO ESTABELECIMENTO',
            cfop: '5933',
            valor_unitario: '100.00',
            cnpj_emitente: '63661106000156',
            nome_emitente: 'INTERLINK AGRORURAL SOFTWARE LTDA',
            logradouro_emitente: 'AV VALDIR MASUTTI',
            numero_emitente: '528S',
            bairro_emitente: 'CENTRO',
            municipio_emitente: 'Campos de Júlio',
            uf_emitente: 'MT',
            cep_emitente: '78319000',
            inscricao_estadual_emitente: 'ISENTO',
            cnpj_destinatario: '99999999000191',
            nome_destinatario: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
            logradouro_destinatario: 'RUA EXEMPLO DEST',
            numero_destinatario: '456',
            bairro_destinatario: 'CENTRO',
            municipio_destinatario: 'Campos de Julio',
            uf_destinatario: 'MT',
            cep_destinatario: '78319000',
            indicador_inscricao_estadual_destinatario: '9',
        }
    })

    // Search Handler for AutoComplete
    const handleSearch = (field: string, value: string) => {
        const originalList = baseOptions[field] || []
        const filtered = originalList.filter(item =>
            item.toUpperCase().includes(value.toUpperCase())
        )

        const options: { value: string; label: ReactNode }[] = filtered.map(v => ({ value: v, label: v }))

        // Logic to add "+ Adicionar Novo" if it doesn't exist
        const exactMatch = originalList.some(item => item.toUpperCase() === value.toUpperCase())
        if (value && !exactMatch) {
            options.unshift({
                value: value,
                label: (
                    <span style={{ color: '#1677ff', cursor: 'pointer', fontWeight: 500 }}>
                        + Adicionar "{value}"
                    </span>
                )
            })
        }

        setDisplayOptions(prev => ({ ...prev, [field]: options }))
    }

    // Fetch Suggestions & Farms
    useEffect(() => {
        const fetchSuggestions = async () => {
            const fields = ['truck', 'driver', 'product', 'field', 'destination']
            const newBaseOptions: Record<string, string[]> = {}
            const newDisplayOptions: Record<string, any[]> = {}

            for (const field of fields) {
                try {
                    const values = await carregamentosService.getDistinctValues(field)
                    // TODO: Remove example later as requested
                    const exampleMap: Record<string, string> = {
                        truck: 'Caminhão Exemplo',
                        driver: 'Motorista Exemplo',
                        product: 'Soja Exemplo',
                        field: 'Talhão 01 Exemplo',
                        destination: 'Destino Exemplo'
                    }

                    const uniqueValues = Array.from(new Set([...values, exampleMap[field]]))
                    newBaseOptions[field] = uniqueValues
                    newDisplayOptions[field] = formatOptions(uniqueValues)
                } catch (err) {
                    console.error(`Error fetching distinct values for ${field}`, err)
                    // Fallback example
                    newBaseOptions[field] = ['Exemplo']
                    newDisplayOptions[field] = formatOptions(['Exemplo'])
                }
            }
            setBaseOptions(newBaseOptions as any)
            setDisplayOptions(newDisplayOptions as any)
        }

        const fetchFarms = async () => {
            console.log("FetchFarms running. User:", user)
            if (user?.group_id) {
                try {
                    const group = await groupsService.getGroup(user.group_id)
                    console.log("Group fetched:", group)
                    if (group && group.farms) {
                        setFarms(group.farms)
                        console.log("Farms set:", group.farms)
                        // Auto-select if only one farm e não estiver editando (ou se estiver, mas quiser garantir)
                        if (group.farms.length === 1 && !isEditing) {
                            console.log("Setting farm value to:", group.farms[0].name)
                            setValue('farm', group.farms[0].name)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching group farms", error)
                }
            }
        }

        fetchSuggestions()
        fetchFarms()
    }, [user, isEditing, setValue])

    // Populate form when data is loaded
    useEffect(() => {
        if (carregamentoData) {
            // Ensure dates are formatted correctly for datetime-local input
            const formattedDate = carregamentoData.scheduledAt
                ? new Date(carregamentoData.scheduledAt).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16)

            reset({
                ...carregamentoData,
                scheduledAt: formattedDate,
                quantity: String(carregamentoData.quantity), // Ensure string for input
                // Ensure numbers are handled correctly (or nulls)
                peso_estimado_kg: carregamentoData.peso_estimado_kg,
                peso_bruto_kg: carregamentoData.peso_bruto_kg,
                tara_kg: carregamentoData.tara_kg,
                umidade_percent: carregamentoData.umidade_percent,
                impurezas_percent: carregamentoData.impurezas_percent,
                peso_recebido_final_kg: carregamentoData.peso_recebido_final_kg,
                umidade_empresa_percent: carregamentoData.umidade_empresa_percent,
                impurezas_empresa_percent: carregamentoData.impurezas_empresa_percent,
            })
        }
    }, [carregamentoData, reset])

    const watchPesoBruto = watch('peso_bruto_kg')
    const watchTara = watch('tara_kg')

    // Logic for Weight Calculation
    const pesoBruto = watchPesoBruto ? Number(watchPesoBruto) : 0
    const tara = watchTara ? Number(watchTara) : 0
    const pesoLiquido = pesoBruto - tara

    const umidade = watch('umidade_percent')
    const impurezas = watch('impurezas_percent')
    const armazemDestinoId = watch('armazem_destino_id')
    const umidadeEmpresa = watch('umidade_empresa_percent')
    const impurezasEmpresa = watch('impurezas_empresa_percent')

    const selectedArmazem = armazens.find(a => String(a.id) === String(armazemDestinoId))

    // Serviço de cálculo de descontos (mockado/simplificado aqui ou importado)
    // Para simplificar e manter consistente, copiamos a lógica ou usamos se fosse exportada.
    // Como é frontend, apenas replicamos a estimativa visual.

    const calcularDesconto = (pesoLiq: number, umi: number, imp: number, umiPadrao: number = 14, fator: number = 1.5) => {
        if (!pesoLiq) return 0
        let peso = pesoLiq
        // Desconto Umidade
        if (umi > umiPadrao) {
            const diff = umi - umiPadrao
            const desc = (diff * fator * peso) / 100
            peso -= desc
        }
        // Desconto Impureza (exemplo simples: 1% acima de 1%?)
        // Backend que manda a verdade. Aqui é estimativa.
        if (imp > 1) {
            const descImp = ((imp - 1) * peso) / 100
            peso -= descImp
        }
        return peso
    }

    const pesoComDescontoFazenda = pesoLiquido
        ? calcularDesconto(pesoLiquido, Number(umidade || 0), Number(impurezas || 0))
        : null

    const pesoComDescontoArmazem = (pesoLiquido && selectedArmazem)
        ? calcularDesconto(
            pesoLiquido,
            Number(umidade || 0),
            Number(impurezas || 0),
            Number(selectedArmazem.umidade_padrao),
            Number(selectedArmazem.fator_umidade)
        )
        : null

    const pesoComDescontoEmpresa = pesoLiquido
        ? calcularDesconto(
            pesoLiquido,
            umidadeEmpresa || 0,
            impurezasEmpresa || 0,
            selectedArmazem?.umidade_padrao || 14, // Usa padrão do armazém ou 14
            selectedArmazem?.fator_umidade || 1.5
        )
        : null

    // Efeito para configurar defaults ao trocar de aba
    useEffect(() => {
        if (!isEditing) {
            if (activeTab === 'remessa') {
                setValue('natureza_operacao', 'REMESSA PARA ARMAZENAGEM')
                setValue('cfop', '5949')
            } else if (activeTab === 'venda') {
                setValue('natureza_operacao', 'VENDA DE PRODUCAO DO ESTABELECIMENTO')
                setValue('cfop', '5101')
            } else {
                // Interno
                setValue('natureza_operacao', '')
                setValue('cfop', '')
            }
        }
    }, [activeTab, isEditing, setValue])

    const isFieldDisabled = (section: 'basic' | 'weight' | 'nfe') => {
        if (activeTab === 'interno' && section === 'nfe') return true
        // For Remessa/Venda, NFe is enabled
        return false
    }

    const [pendingData, setPendingData] = useState<FormData | null>(null)

    const onSubmit = async (data: FormData) => {
        console.log("onSubmit Clicked", data)
        if (activeTab === 'venda' || activeTab === 'remessa') {
            try {
                console.log("Setting pending data...")
                setPendingData(data)
                console.log("Showing confirmation modal...")
                setShowConfirmation(true)
            } catch (e) {
                console.error("Error showing modal:", e)
                alert("Erro ao abrir modal: " + e)
            }
        } else {
            await saveCarregamento(data)
        }
    }



    const saveCarregamento = async (data: FormData) => {
        try {
            setLoading(true)
            const payload = {
                ...data,
                type: activeTab as any,
                scheduledAt: new Date(data.scheduledAt).toISOString(),
                // Garantir números
                peso_estimado_kg: data.peso_estimado_kg ? Number(data.peso_estimado_kg) : null,
                peso_bruto_kg: data.peso_bruto_kg ? Number(data.peso_bruto_kg) : null,
                tara_kg: data.tara_kg ? Number(data.tara_kg) : null,
                umidade_percent: data.umidade_percent ? Number(data.umidade_percent) : null,
                impurezas_percent: data.impurezas_percent ? Number(data.impurezas_percent) : null,
                peso_recebido_final_kg: data.peso_recebido_final_kg ? Number(data.peso_recebido_final_kg) : null,

                // Calculated Fields to Save
                peso_liquido_kg: pesoLiquido,
                peso_com_desconto_fazenda: pesoComDescontoFazenda,
                peso_com_desconto_armazem: pesoComDescontoArmazem,

                // Empresa Fields
                umidade_empresa_percent: data.umidade_empresa_percent ? Number(data.umidade_empresa_percent) : null,
                impurezas_empresa_percent: data.impurezas_empresa_percent ? Number(data.impurezas_empresa_percent) : null,
                peso_com_desconto_empresa: pesoComDescontoEmpresa,
            }

            if (isEditing) {
                await carregamentosService.update(Number(id), payload)
                message.success('Carregamento atualizado com sucesso!')
            } else {
                await carregamentosService.create(payload)
                message.success('Carregamento salvo com sucesso!')
            }
            navigate('/carregamento')
        } catch (error: any) {
            console.error(error)
            const errorMsg = error.response?.data?.detail || 'Erro ao salvar carregamento.'
            message.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const items = [
        { key: 'interno', label: 'Interno', icon: <Truck size={16} /> },
        { key: 'remessa', label: 'Remessa', icon: <FileText size={16} /> },
        { key: 'venda', label: 'Venda', icon: <CheckCircle2 size={16} /> },
    ]

    if (isEditing && isLoadingData) {
        return <div className="loading-state">Carregando dados...</div>
    }

    return (
        <div className="feature-page loading-page">
            <header className="feature-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate('/carregamento')} className="close-btn" style={{ background: 'transparent', border: '1px solid #e5e7eb' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="feature-title">{isEditing ? 'Editar Carregamento' : 'Novo Carregamento'}</h2>
                </div>
            </header>

            <div className="loading-modal" style={{ margin: '0 auto', maxWidth: '1100px', width: '100%', maxHeight: 'none', boxShadow: 'none', border: 'none' }}>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items.map(item => ({
                        key: item.key,
                        label: (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {item.icon}
                                {item.label}
                            </span>
                        ),
                    }))}
                    style={{ marginBottom: '24px' }}
                />

                <form
                    onSubmit={handleSubmit(onSubmit, (errors) => {
                        console.error("Form Validation Errors:", errors)
                        message.error("Verifique os campos obrigatórios")
                    })}
                    className="modal-form-content"
                    style={{ overflow: 'visible' }}
                >

                    {/* Seção 1: Dados Básicos */}
                    <section className="form-section">
                        <h4 className="section-title">Dados do Carregamento</h4>
                        <div className="modal-grid">
                            <div className="field">
                                <label className="form-label">Data e Hora</label>
                                <Controller
                                    name="scheduledAt"
                                    control={control}
                                    render={({ field }) => <input {...field} type="datetime-local" className="form-input" disabled={isFieldDisabled('basic')} />}
                                />
                                {errors.scheduledAt && <span className="error-text">{errors.scheduledAt.message}</span>}
                            </div>
                            <div className="field">
                                <label className="form-label">Caminhão</label>
                                <Controller
                                    name="truck"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="smart-select-wrapper">
                                            <AutoComplete
                                                value={field.value}
                                                options={displayOptions.truck}
                                                onSearch={(val) => handleSearch('truck', val)}
                                                onSelect={(val) => field.onChange(val)}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="Placa ou ID do Caminhão"
                                                disabled={isFieldDisabled('basic')}
                                                className="form-input-autocomplete"
                                                style={{ width: '100%' }}
                                            >
                                                <input className="form-input" style={{ paddingRight: '30px' }} />
                                            </AutoComplete>
                                            <div className="select-arrow">
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        </div>
                                    )}
                                />
                                {errors.truck && <span className="error-text">{errors.truck.message}</span>}
                            </div>
                            <div className="field">
                                <label className="form-label">Motorista</label>
                                <Controller
                                    name="driver"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="smart-select-wrapper">
                                            <AutoComplete
                                                value={field.value}
                                                options={displayOptions.driver}
                                                onSearch={(val) => handleSearch('driver', val)}
                                                onSelect={(val) => field.onChange(val)}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="Nome do Motorista"
                                                disabled={isFieldDisabled('basic')}
                                                className="form-input-autocomplete"
                                                style={{ width: '100%' }}
                                            >
                                                <input className="form-input" style={{ paddingRight: '30px' }} />
                                            </AutoComplete>
                                            <div className="select-arrow">
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        </div>
                                    )}
                                />
                                {errors.driver && <span className="error-text">{errors.driver.message}</span>}
                            </div>
                        </div>
                    </section>

                    <div className="section-divider"></div>

                    {/* Seção 2: Origem e Destino */}
                    <section className="form-section">
                        <h4 className="section-title">Origem e Destino</h4>
                        <div className="modal-grid three-cols">
                            <div className="field">
                                <label className="form-label">Fazenda</label>
                                <Controller
                                    name="farm"
                                    control={control}
                                    render={({ field }) => (
                                        farms.length > 1 ? (
                                            <div className="smart-select-wrapper">
                                                <select {...field} className="form-select" disabled={isFieldDisabled('basic')}>
                                                    <option value="">Selecione a Fazenda</option>
                                                    {farms.map(f => (
                                                        <option key={f.id} value={f.name}>{f.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <input {...field} value={field.value || ''} className="form-input" placeholder="Fazenda" disabled={true} />
                                        )
                                    )}
                                />
                                {errors.farm && <span className="error-text">{errors.farm.message}</span>}
                            </div>
                            <div className="field">
                                <label className="form-label">Talhão</label>
                                <Controller
                                    name="field"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="smart-select-wrapper">
                                            <AutoComplete
                                                value={field.value}
                                                options={displayOptions.field}
                                                onSearch={(val) => handleSearch('field', val)}
                                                onSelect={(val) => field.onChange(val)}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="Identificação do Talhão"
                                                disabled={isFieldDisabled('basic')}
                                                className="form-input-autocomplete"
                                                style={{ width: '100%' }}
                                            >
                                                <input className="form-input" style={{ paddingRight: '30px' }} />
                                            </AutoComplete>
                                            <div className="select-arrow">
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        </div>
                                    )}
                                />
                                {errors.field && <span className="error-text">{errors.field.message}</span>}
                            </div>
                            <div className="field">
                                <label className="form-label">Destino</label>
                                <Controller
                                    name="destination"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="smart-select-wrapper">
                                            <AutoComplete
                                                value={field.value}
                                                options={displayOptions.destination}
                                                onSearch={(val) => handleSearch('destination', val)}
                                                onSelect={(val) => field.onChange(val)}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="Destino / Cliente"
                                                disabled={isFieldDisabled('basic')}
                                                className="form-input-autocomplete"
                                                style={{ width: '100%' }}
                                            >
                                                <input className="form-input" style={{ paddingRight: '30px' }} />
                                            </AutoComplete>
                                            <div className="select-arrow">
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        </div>
                                    )}
                                />
                                {errors.destination && <span className="error-text">{errors.destination.message}</span>}
                            </div>
                        </div>
                    </section>

                    <div className="section-divider"></div>

                    {/* Seção 3: Produto */}
                    <section className="form-section">
                        <h4 className="section-title">Produto</h4>
                        <div className="modal-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                            <div className="field">
                                <label className="form-label">Produto</label>
                                <Controller
                                    name="product"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="smart-select-wrapper">
                                            <AutoComplete
                                                value={field.value}
                                                options={displayOptions.product}
                                                onSearch={(val) => handleSearch('product', val)}
                                                onSelect={(val) => field.onChange(val)}
                                                onChange={(val) => field.onChange(val)}
                                                placeholder="Ex: Soja, Milho"
                                                disabled={isFieldDisabled('basic')}
                                                className="form-input-autocomplete"
                                                style={{ width: '100%' }}
                                            >
                                                <input className="form-input" style={{ paddingRight: '30px' }} />
                                            </AutoComplete>
                                            <div className="select-arrow">
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        </div>
                                    )}
                                />
                                {errors.product && <span className="error-text">{errors.product.message}</span>}
                            </div>
                            <div className="field">
                                <label className="form-label">Quantidade</label>
                                <Controller
                                    name="quantity"
                                    control={control}
                                    render={({ field }) => <input {...field} type="number" className="form-input" disabled={isFieldDisabled('basic')} />}
                                />
                                {errors.quantity && <span className="error-text">{errors.quantity.message}</span>}
                            </div>
                            <div className="field">
                                <label className="form-label">Unidade</label>
                                <Controller
                                    name="unit"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="smart-select-wrapper">
                                            <select {...field} className="form-select" disabled={isFieldDisabled('basic')}>
                                                <option value="">Selecione</option>
                                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>
                                    )}
                                />
                                {errors.unit && <span className="error-text">{errors.unit.message}</span>}
                            </div>
                        </div>
                    </section>

                    <div className="section-divider"></div>

                    {/* Seção 4: Pesagem e Descontos - Apenas na Edição */}
                    {isEditing && (
                        <section className="form-section" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                            <h4 className="section-title">Pesagem e Descontos</h4>

                            <div className="modal-grid">
                                <div className="field">
                                    <label className="form-label">Armazém de Destino</label>
                                    <Controller
                                        name="armazem_destino_id"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="smart-select-wrapper">
                                                <select {...field} className="form-select" disabled={isFieldDisabled('weight')} value={field.value || ''}>
                                                    <option value="">Selecione um Armazém</option>
                                                    {armazens.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="comparison-table-container" style={{ marginTop: '16px', overflowX: 'auto' }}>
                                <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                            <th style={{ textAlign: 'left', padding: '8px', color: '#6b7280' }}>Indicador</th>
                                            <th style={{ textAlign: 'right', padding: '8px', color: '#6b7280' }}>Medição (Fazenda)</th>
                                            <th style={{ textAlign: 'right', padding: '8px', color: '#6b7280' }}>Comparativo (Padrão)</th>
                                            {activeTab === 'remessa' && <th style={{ textAlign: 'right', padding: '8px', color: '#6b7280' }}>Real (Empresa)</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '8px', fontWeight: 500 }}>Peso Bruto (kg)</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                                <Controller
                                                    name="peso_bruto_kg"
                                                    control={control}
                                                    render={({ field }) => <input {...field} type="number" className="form-input compact" style={{ textAlign: 'right' }} onChange={e => field.onChange(Number(e.target.value))} disabled={isFieldDisabled('weight')} value={field.value ?? ''} />}
                                                />
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'right', color: '#6b7280' }}>{pesoBruto || '-'}</td>
                                            {activeTab === 'remessa' && <td style={{ padding: '8px', textAlign: 'right', color: '#6b7280' }}>-</td>}
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px', fontWeight: 500 }}>Tara (kg)</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                                <Controller
                                                    name="tara_kg"
                                                    control={control}
                                                    render={({ field }) => <input {...field} type="number" className="form-input compact" style={{ textAlign: 'right' }} onChange={e => field.onChange(Number(e.target.value))} disabled={isFieldDisabled('weight')} value={field.value ?? ''} />}
                                                />
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'right', color: '#6b7280' }}>{tara || '-'}</td>
                                            {activeTab === 'remessa' && <td style={{ padding: '8px', textAlign: 'right', color: '#6b7280' }}>-</td>}
                                        </tr>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <td style={{ padding: '8px', fontWeight: 600 }}>Peso Líquido (kg)</td>
                                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{pesoLiquido || '-'}</td>
                                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{pesoLiquido || '-'}</td>
                                            {activeTab === 'remessa' && <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{pesoLiquido || '-'}</td>}
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px', fontWeight: 500 }}>Umidade (%)</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                                <Controller
                                                    name="umidade_percent"
                                                    control={control}
                                                    render={({ field }) => <input {...field} type="number" step="0.1" className="form-input compact" style={{ textAlign: 'right' }} onChange={e => field.onChange(Number(e.target.value))} disabled={isFieldDisabled('weight')} value={field.value ?? ''} />}
                                                />
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'right', color: '#6b7280' }}>{umidade || '-'}</td>
                                            {activeTab === 'remessa' && (
                                                <td style={{ padding: '8px', textAlign: 'right' }}>
                                                    <Controller
                                                        name="umidade_empresa_percent"
                                                        control={control}
                                                        render={({ field }) => <input {...field} type="number" step="0.1" className="form-input compact" style={{ textAlign: 'right', borderColor: '#d1fae5', backgroundColor: '#ecfdf5' }} onChange={e => field.onChange(Number(e.target.value))} disabled={isFieldDisabled('weight')} value={field.value ?? ''} />}
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px', fontWeight: 500 }}>Impurezas (%)</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                                <Controller
                                                    name="impurezas_percent"
                                                    control={control}
                                                    render={({ field }) => <input {...field} type="number" step="0.1" className="form-input compact" style={{ textAlign: 'right' }} onChange={e => field.onChange(Number(e.target.value))} disabled={isFieldDisabled('weight')} value={field.value ?? ''} />}
                                                />
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'right', color: '#6b7280' }}>{impurezas || '-'}</td>
                                            {activeTab === 'remessa' && (
                                                <td style={{ padding: '8px', textAlign: 'right' }}>
                                                    <Controller
                                                        name="impurezas_empresa_percent"
                                                        control={control}
                                                        render={({ field }) => <input {...field} type="number" step="0.1" className="form-input compact" style={{ textAlign: 'right', borderColor: '#d1fae5', backgroundColor: '#ecfdf5' }} onChange={e => field.onChange(Number(e.target.value))} disabled={isFieldDisabled('weight')} value={field.value ?? ''} />}
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                        <tr style={{ borderTop: '2px solid #e5e7eb', backgroundColor: '#ecfdf5' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 700, color: '#065f46' }}>Peso Final (kg)</td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>
                                                {pesoComDescontoFazenda?.toFixed(0) || '-'}
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>
                                                {pesoComDescontoArmazem?.toFixed(0) || '-'}
                                            </td>
                                            {activeTab === 'remessa' && (
                                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>
                                                    {pesoComDescontoEmpresa?.toFixed(0) || '-'}
                                                </td>
                                            )}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="field" style={{ marginTop: '16px' }}>
                                <label className="form-label">Peso Recebido Final (Real/Nota)</label>
                                <Controller
                                    name="peso_recebido_final_kg"
                                    control={control}
                                    render={({ field }) => <input {...field} type="number" className="form-input" placeholder="Peso final confirmado pelo armazém" onChange={e => field.onChange(Number(e.target.value))} disabled={isFieldDisabled('weight')} value={field.value ?? ''} />}
                                />
                            </div>
                        </section>
                    )}

                    {/* Seção 5: Dados Fiscais (Apenas Venda/Remessa) */}
                    {(activeTab === 'venda' || activeTab === 'remessa') && (
                        <>
                            <div className="section-divider"></div>
                            <section className="form-section">
                                <h4 className="section-title">Dados do Destinatário (NFe)</h4>
                                <div className="modal-grid" style={{ marginBottom: '24px' }}>
                                    <div className="field">
                                        <label className="form-label">CNPJ / CPF</label>
                                        <Controller
                                            name="cnpj_destinatario"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} placeholder="Apenas números" />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Nome / Razão Social</label>
                                        <Controller
                                            name="nome_destinatario"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Inscrição Estadual</label>
                                        <Controller
                                            name="inscricao_estadual_destinatario" // Assuming this field exists in schema/form
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} placeholder="ISENTO ou Número" />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Indicador IE</label>
                                        <Controller
                                            name="indicador_inscricao_estadual_destinatario"
                                            control={control}
                                            render={({ field }) => (
                                                <select {...field} className="form-select" disabled={isFieldDisabled('nfe')}>
                                                    <option value="1">1 - Contribuinte ICMS</option>
                                                    <option value="2">2 - Contribuinte Isento</option>
                                                    <option value="9">9 - Não Contribuinte</option>
                                                </select>
                                            )}
                                        />
                                    </div>
                                </div>

                                <h5 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>Endereço do Destinatário</h5>
                                <div className="modal-grid" style={{ marginBottom: '24px' }}>
                                    <div className="field">
                                        <label className="form-label">CEP</label>
                                        <Controller
                                            name="cep_destinatario"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Logradouro (Rua)</label>
                                        <Controller
                                            name="logradouro_destinatario"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Número</label>
                                        <Controller
                                            name="numero_destinatario"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Bairro</label>
                                        <Controller
                                            name="bairro_destinatario"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Município</label>
                                        <Controller
                                            name="municipio_destinatario"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">UF</label>
                                        <Controller
                                            name="uf_destinatario"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" maxLength={2} style={{ textTransform: 'uppercase' }} disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                </div>

                            </section>
                            <div className="section-divider"></div>

                            <section className="form-section">
                                <h4 className="section-title">Dados Fiscais (Operação)</h4>
                                <div className="modal-grid">
                                    <div className="field full-width">
                                        <label className="form-label">Natureza da Operação</label>
                                        <Controller
                                            name="natureza_operacao"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">CFOP</label>
                                        <Controller
                                            name="cfop"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="form-label">Valor Unitário</label>
                                        <Controller
                                            name="valor_unitario"
                                            control={control}
                                            render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />}
                                        />
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    <div className="modal-footer" style={{ marginTop: '24px', padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb', borderRadius: '0 0 16px 16px', margin: '0 -24px -24px -24px' }}>
                        <button type="button" className="secondary-btn" onClick={() => navigate('/carregamento')} disabled={loading} style={{ background: '#fff', border: '1px solid #d1d5db' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="primary-btn" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar Carregamento')}
                            {!loading && <CheckCircle2 size={18} />}
                        </button>
                    </div>
                </form>

            </div>

            <Modal
                title="Revisar e Emitir NFe"
                open={showConfirmation}
                onOk={() => {
                    if (pendingData) {
                        saveCarregamento(pendingData)
                        setShowConfirmation(false)
                    }
                }}
                onCancel={() => setShowConfirmation(false)}
                okText="Confirmar e Emitir"
                cancelText="Voltar"
            >
                <div>
                    <p>Confirma a emissão da Nota Fiscal?</p>
                    <p>Verifique os dados antes de prosseguir.</p>
                </div>
            </Modal>
        </div>
    )
}
