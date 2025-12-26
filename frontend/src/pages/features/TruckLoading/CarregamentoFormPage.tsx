import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tabs, message, Modal, AutoComplete, Input, Select } from 'antd'
import { ArrowLeft, FileText, CheckCircle2, Truck, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { carregamentosService } from '../../../services/carregamentos'
import { armazensService, Armazem } from '../../../services/armazens'
import { farmsService, Farm } from '../../../services/farms'
import { groupsService } from '../../../services/groups'
import { destinatariosService } from '../../../services/destinatarios'
import { useAuth } from '../../../contexts/AuthContext'
import './TruckLoading.css'
import PremiumModal from '../../../components/ui/PremiumModal'

// --- Zod Schema ---
const schema = z.object({
    scheduledAt: z.string().min(1, 'Data é obrigatória'),
    truck: z.string({ required_error: 'Placa é obrigatória' }).min(1, 'Placa é obrigatória').max(10, 'Placa deve ter no máximo 10 caracteres'),
    driver: z.string({ required_error: 'Motorista é obrigatório' }).min(1, 'Motorista é obrigatório'),
    driver_document: z.string().optional(),
    farm: z.string({ required_error: 'Fazenda é obrigatória' }).min(1, 'Fazenda é obrigatória'),
    field: z.string({ required_error: 'Talhão é obrigatório' }).min(1, 'Talhão é obrigatório'),
    product: z.string({ required_error: 'Produto é obrigatório' }).min(1, 'Produto é obrigatório'),
    variety: z.string().optional(),
    quantity: z.string({ required_error: 'Quantidade é obrigatória' }).min(1, 'Quantidade é obrigatória'),
    unit: z.string({ required_error: 'Unidade é obrigatória' }).min(1, 'Unidade é obrigatória'),
    destination: z.string({ required_error: 'Destino é obrigatório' }).min(1, 'Destino é obrigatório'),

    // Pesagem
    peso_estimado_kg: z.number().nullable().optional(),
    peso_bruto_kg: z.number().nullable().optional(),
    tara_kg: z.number().nullable().optional(),
    umidade_percent: z.number().nullable().optional(),
    impurezas_percent: z.number().nullable().optional(),
    armazem_destino_id: z.string().nullable().optional(),
    peso_recebido_final_kg: z.number().nullable().optional(),

    // Configurações (Editáveis)
    umidade_padrao: z.number().optional().default(14),
    fator_umidade: z.number().optional().default(1.5),
    impurezas_padrao: z.number().optional().default(1),

    // Matrícula Rural

    // Comparativo Empresa (Remessa)
    umidade_empresa_percent: z.number().nullable().optional(),
    impurezas_empresa_percent: z.number().nullable().optional(),
    peso_com_desconto_empresa: z.number().nullable().optional(),

    // NFe Fields (Opcionais no schema base, validados por contexto se necessário)
    natureza_operacao: z.string().optional(),
    cfop: z.string().optional(),
    valor_unitario: z.string().optional(),
    ncm: z.string().optional(),
    modalidade_frete: z.string().optional(),
    forma_pagamento: z.string().optional(),
    consumidor_final: z.string().optional(),

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
    tem_cte: z.boolean().optional(),
}).superRefine((data, ctx) => {
    // Validação Condicional NFe (Campos Fiscais se preenchidos)
    if (data.natureza_operacao && data.natureza_operacao !== '') {
        // if (!data.cnpj_destinatario) ctx.addIssue({ path: ['cnpj_destinatario'], code: z.ZodIssueCode.custom, message: 'CNPJ Obrigatório' }) 
        // Acima já validado pelo type, redundante mas ok manter se quiser strictness duplo

        if (!data.nome_destinatario) ctx.addIssue({ path: ['nome_destinatario'], code: z.ZodIssueCode.custom, message: 'Nome Obrigatório' })
        if (!data.logradouro_destinatario) ctx.addIssue({ path: ['logradouro_destinatario'], code: z.ZodIssueCode.custom, message: 'Endereço Obrigatório' })
        if (!data.municipio_destinatario) ctx.addIssue({ path: ['municipio_destinatario'], code: z.ZodIssueCode.custom, message: 'Município Obrigatório' })
        if (!data.uf_destinatario) ctx.addIssue({ path: ['uf_destinatario'], code: z.ZodIssueCode.custom, message: 'UF Obrigatória' })

        // IE Logic
        if (data.indicador_inscricao_estadual_destinatario === '1' && !data.inscricao_estadual_destinatario) {
            ctx.addIssue({ path: ['inscricao_estadual_destinatario'], code: z.ZodIssueCode.custom, message: 'IE Obrigatória' })
        }
    }
})

type FormData = z.infer<typeof schema>

const UNITS = ['kg', 'ton', 'sacas']

export default function CarregamentoFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { user, hasModulePermission } = useAuth()
    const isEditing = !!id
    const [activeTab, setActiveTab] = useState('interno')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [loading, setLoading] = useState(false)
    const [cnpjLoading, setCnpjLoading] = useState(false)
    const [cepLoading, setCepLoading] = useState(false)
    const [addressFallbackRequested, setAddressFallbackRequested] = useState(false)

    // State for Suggestions (Options)
    // baseOptions stores the raw strings from API
    // State for Suggestions (Options)
    // baseOptions stores the raw strings from API
    const [baseOptions, setBaseOptions] = useState<Record<string, string[]>>({
        truck: [],
        driver: [],
        product: [],
        destination: []
    })
    // displayOptions stores the formatted options for AutoComplete
    const [displayOptions, setDisplayOptions] = useState<Record<string, { value: string; label: ReactNode }[]>>({
        truck: [],
        driver: [],
        product: [],
        destination: []
    })

    // Helper to format options
    const formatOptions = (values: string[]) => values.map(v => ({ value: v, label: v }))

    // State for Farms & Matriculas
    const [farms, setFarms] = useState<Farm[]>([])

    const [nfeData, setNfeData] = useState<{
        status: string | null;
        danfe_url: string | null;
        xml_url: string | null;
        ref: string | null;
        chave: string | null;
        protocolo: string | null;
    } | null>(null)

    // --- State for Quick Add (Farm/Field/Variety) ---
    const [quickAdd, setQuickAdd] = useState<{ type: 'farm' | 'field' | 'variety' | 'truck' | 'driver' | 'product' | 'destination', visible: boolean }>({ type: 'farm', visible: false })
    const [quickAddValue, setQuickAddValue] = useState('')

    const handleOpenQuickAdd = (type: 'farm' | 'field' | 'variety' | 'truck' | 'driver' | 'product' | 'destination') => {
        setQuickAdd({ type, visible: true })
        setQuickAddValue('')
    }

    const handleQuickSave = async () => {
        try {
            if (!quickAddValue.trim()) return

            if (quickAdd.type === 'farm') {
                await farmsService.create({ name: quickAddValue, group_id: user?.group_id })
                message.success('Fazenda criada com sucesso!')
                const updatedFarms = await farmsService.getAll()
                setFarms(updatedFarms)
                setValue('farm', quickAddValue)
            } else if (quickAdd.type === 'field') {
                const farmName = getValues('farm')
                const farm = farms.find(f => f.name === farmName)
                if (!farm) {
                    message.error('Selecione uma fazenda primeiro')
                    return
                }
                await farmsService.createField(farm.id, { name: quickAddValue, product: 'Safra' })
                message.success('Talhão criado com sucesso!')
                const updatedFarms = await farmsService.getAll()
                setFarms(updatedFarms)
                setValue('field', quickAddValue)
                // Also trigger search/options update
                handleFieldSearch(quickAddValue)
            } else if (quickAdd.type === 'variety') {
                const farmName = getValues('farm')
                const fieldName = getValues('field')
                const farm = farms.find(f => f.name === farmName)
                if (!farm) return
                const fieldObj = farm?.fields?.find(f => f.name === fieldName)
                if (!fieldObj) {
                    message.error('Selecione um talhão primeiro')
                    return
                }

                await farmsService.updateField(farm.id, fieldObj.id, { variety: quickAddValue })
                message.success('Variedade atualizada!')
                const updatedFarms = await farmsService.getAll()
                setFarms(updatedFarms)
                setValue('variety', quickAddValue)
            } else {
                // Generic handler for Truck, Driver, Product, Destination
                const fieldName = quickAdd.type as 'truck' | 'driver' | 'product' | 'destination'
                setValue(fieldName, quickAddValue)

                // Add to options so it appears selected
                const newOption = { value: quickAddValue, label: quickAddValue }
                setDisplayOptions(prev => ({
                    ...prev,
                    [fieldName]: [...(prev[fieldName] || []), newOption]
                }))
                message.success('Item adicionado!')
            }
            setQuickAdd({ ...quickAdd, visible: false })
            setQuickAddValue('')
        } catch (error) {
            console.error(error)
            message.error('Erro ao salvar')
        }
    }

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

    const { control, handleSubmit, watch, reset, setValue, getValues, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            scheduledAt: new Date().toISOString().slice(0, 16),
            unit: 'kg',
            // Defaults Configs
            umidade_padrao: 14,
            fator_umidade: 1.5,
            impurezas_padrao: 1,
            // Defaults NFe
            natureza_operacao: 'VENDA DE PRODUCAO DO ESTABELECIMENTO',
            cfop: '5933',
            valor_unitario: '100.00',

            // Emitente
            cnpj_emitente: '',
            nome_emitente: '',
            logradouro_emitente: '',
            numero_emitente: '',
            bairro_emitente: '',
            municipio_emitente: '',
            uf_emitente: '',
            cep_emitente: '',
            inscricao_estadual_emitente: '',

            // Destinatário
            cnpj_destinatario: '',
            nome_destinatario: '',
            logradouro_destinatario: '',
            numero_destinatario: '',
            bairro_destinatario: '',
            municipio_destinatario: '',
            uf_destinatario: '',
            cep_destinatario: '',
            indicador_inscricao_estadual_destinatario: '',
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
                    const data = await farmsService.getAll()
                    console.log("Farms fetched:", data)
                    if (data) {
                        setFarms(data)
                        // Auto-select if only one farm e não estiver editando
                        if (data.length === 1 && !isEditing) {
                            console.log("Setting farm value to:", data[0].name)
                            setValue('farm', data[0].name)
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

    // --- NEW: Sync Farm Data to Emitter Fields ---
    const selectedFarmName = watch('farm')
    useEffect(() => {
        // Only run if we have farms loaded and a selection
        if (selectedFarmName && farms.length > 0) {
            const selectedFarm = farms.find(f => f.name === selectedFarmName)
            if (selectedFarm) {
                // Auto-fill Emitter Data (Dados da Fazenda = Emitente)
                // Use setValue only if fields are empty or to enforce data consistency
                setValue('cnpj_emitente', selectedFarm.cnpj || '')
                setValue('inscricao_estadual_emitente', selectedFarm.inscricao_estadual || '')
                setValue('nome_emitente', selectedFarm.name)
                setValue('logradouro_emitente', selectedFarm.logradouro || '')
                setValue('numero_emitente', selectedFarm.numero || '')
                setValue('bairro_emitente', selectedFarm.bairro || '')
                setValue('municipio_emitente', selectedFarm.municipio || '')
                setValue('uf_emitente', selectedFarm.uf || '')
                setValue('cep_emitente', selectedFarm.cep || '')
            }
        }
    }, [selectedFarmName, farms, setValue])


    // ... (imports remain)

    // ... (schema and other setup)

    // --- Search Logic for Fields (filtered by Farm) ---
    const handleFieldSearch = (value: string) => {
        const selectedFarmName = getValues('farm')
        let availableFields: string[] = []

        if (selectedFarmName && farms.length > 0) {
            const farm = farms.find(f => f.name === selectedFarmName)
            if (farm && farm.fields) {
                availableFields = farm.fields.map(f => f.name)
            }
        } else {
            // If no farm selected, maybe show empty or all? User asked to constrain "only appear fields of that farm"
            // So empty list if no farm.
            availableFields = []
        }

        const filtered = availableFields.filter(item =>
            item.toUpperCase().includes(value.toUpperCase())
        )
        const options: { value: string; label: ReactNode }[] = filtered.map(v => ({ value: v, label: v }))

        // Allow custom "Add" if not strict (optional based on preference, keeping flexible for now but prioritizing list)
        const exactMatch = availableFields.some(item => item.toUpperCase() === value.toUpperCase())
        if (value && !exactMatch) {
            options.unshift({
                value: value,
                label: (
                    <span style={{ color: '#1677ff', cursor: 'pointer', fontWeight: 500 }}>
                        + Adicionar "{value}" (Novo)
                    </span>
                )
            })
        }
        setDisplayOptions(prev => ({ ...prev, field: options }))
    }

    // --- NEW: Sync Field to Product/Variety ON CHANGE ---
    // Replacing the previous useEffect approach with a direct onChange handler or keeping the useEffect if easier.
    // The previous useEffect `useEffect(() => { if (selectedFarmName && selectedField ...` was working but maybe aggressive?
    // Let's refine it to be strictly ensuring the LIST is correct, and values sync.

    const selectedField = watch('field')
    const selectedFarmForEffect = watch('farm')

    useEffect(() => {
        if (selectedFarmForEffect && selectedField && farms.length > 0) {
            const farm = farms.find(f => f.name === selectedFarmForEffect)
            if (farm && farm.fields) {
                const fieldObj = farm.fields.find(f => f.name === selectedField)
                if (fieldObj) {
                    const currentProduct = getValues('product')
                    const currentVariety = getValues('variety')

                    // Logica user: "somente a variedade daquele talhão" implies strictness or singular option.
                    // setting value directly.
                    if (!currentProduct || currentProduct !== fieldObj.product) {
                        setValue('product', fieldObj.product)
                    }
                    if (fieldObj.variety && (!currentVariety || currentVariety !== fieldObj.variety)) {
                        setValue('variety', fieldObj.variety)
                    }
                }
            }
        }
    }, [selectedFarmForEffect, selectedField, farms, setValue, getValues])


    // Update the render part to use handleFieldSearch on Search
    // And ensure `baseOptions.field` is not just global distinct values but context aware if possible, 
    // BUT `AutoComplete` relies on options passed to it.

    // ... (rest of component logic)

    // We need to inject the `handleFieldSearch` into the AutoComplete for `field` name.
    // In the JSX below (not shown in snippet but implied replacement target), we find the Controller for "field".


    // Populate form when data is loaded
    useEffect(() => {
        if (carregamentoData) {
            console.log('CARREGAMENTO DATA LOADED FROM DB:', carregamentoData) // Debug Log Requested by User
            // Ensure dates are formatted correctly for datetime-local input
            const formattedDate = carregamentoData.scheduledAt
                ? new Date(carregamentoData.scheduledAt).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16)

            setNfeData({
                status: carregamentoData.nfe_status || null,
                danfe_url: carregamentoData.nfe_danfe_url || null,
                xml_url: carregamentoData.nfe_xml_url || null,
                ref: carregamentoData.nfe_ref || null,
                chave: carregamentoData.nfe_chave || null,
                protocolo: carregamentoData.nfe_protocolo || null
            })

            if (carregamentoData.type) {
                const type = carregamentoData.type.toLowerCase()
                setActiveTab(type)
            }

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

                // Configs
                umidade_padrao: carregamentoData.umidade_padrao,
                fator_umidade: carregamentoData.fator_umidade,
                impurezas_padrao: carregamentoData.impurezas_padrao,

                // Explicitly map fiscal fields to avoid undefined behavior if backend sends null
                nome_destinatario: carregamentoData.nome_destinatario || '',
                cnpj_destinatario: carregamentoData.cnpj_destinatario || '',
                inscricao_estadual_destinatario: carregamentoData.inscricao_estadual_destinatario || '',
                logradouro_destinatario: carregamentoData.logradouro_destinatario || '',
                numero_destinatario: carregamentoData.numero_destinatario || '',
                bairro_destinatario: carregamentoData.bairro_destinatario || '',
                municipio_destinatario: carregamentoData.municipio_destinatario || '',
                uf_destinatario: carregamentoData.uf_destinatario || '',
                cep_destinatario: carregamentoData.cep_destinatario || '',

                // Transport
                driver_document: carregamentoData.driver_document || '',
                uf_veiculo: carregamentoData.uf_veiculo || '',
                nome_transportador: carregamentoData.nome_transportador || '',
                cnpj_transportador: carregamentoData.cnpj_transportador || '',
            })
        }
    }, [carregamentoData, reset])

    // Sync Driver Info to Transportador (Avoids double typing)
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'driver' && value.driver) {
                const currentTransportName = getValues('nome_transportador')
                if (!currentTransportName || currentTransportName === '') {
                    setValue('nome_transportador', value.driver)
                }
            }
            if (name === 'driver_document') {
                // Cast to any to access new field if type inference lags
                const docVal = (value as any).driver_document
                if (docVal) {
                    const currentTransportDoc = getValues('cnpj_transportador')
                    if (!currentTransportDoc || currentTransportDoc === '') {
                        setValue('cnpj_transportador', docVal)
                    }
                }
            }
        })
        return () => subscription.unsubscribe()
    }, [watch, setValue, getValues])

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

    // Configs Watched
    const umidadePadrao = watch('umidade_padrao')
    const fatorUmidade = watch('fator_umidade')
    const impurezasPadrao = watch('impurezas_padrao')

    const selectedArmazem = armazens.find(a => String(a.id) === String(armazemDestinoId))

    // Serviço de cálculo de descontos (mockado/simplificado aqui ou importado)
    const calcularDesconto = (pesoLiq: number, umi: number, imp: number, umiPadrao: number = 14, fator: number = 1.5, impPadrao: number = 1.0) => {
        if (!pesoLiq) return 0
        let peso = pesoLiq
        // Desconto Umidade
        if (umi > umiPadrao) {
            const diff = umi - umiPadrao
            const desc = (diff * fator * peso) / 100
            peso -= desc
        }
        // Desconto Impureza (Agora usando o padrão configurável)
        // Se imp > impPadrao, desconta o excedente (imp - impPadrao)
        if (imp > impPadrao) {
            const descImp = ((imp - impPadrao) * peso) / 100
            peso -= descImp
        }
        return peso
    }

    const pesoComDescontoFazenda = pesoLiquido
        ? calcularDesconto(pesoLiquido, Number(umidade || 0), Number(impurezas || 0), umidadePadrao || 14, fatorUmidade || 1.5, impurezasPadrao || 1)
        : null

    const pesoComDescontoArmazem = (pesoLiquido && selectedArmazem)
        ? calcularDesconto(
            pesoLiquido,
            Number(umidade || 0),
            Number(impurezas || 0),
            Number(selectedArmazem.umidade_padrao),
            Number(selectedArmazem.fator_umidade),
            Number(selectedArmazem.impurezas_padrao)
        )
        : null

    const pesoComDescontoEmpresa = pesoLiquido
        ? calcularDesconto(
            pesoLiquido,
            umidadeEmpresa || 0,
            impurezasEmpresa || 0,
            selectedArmazem?.umidade_padrao || 14, // Usa padrão do armazém ou 14
            selectedArmazem?.fator_umidade || 1.5,
            selectedArmazem?.impurezas_padrao || 1.0
        )
        : null

    // Efeito para capturar dados da Fazenda (Emitente) quando selecionada
    // Efeito para capturar dados da Fazenda (Emitente) quando selecionada
    useEffect(() => {
        const selectedFarmName = watch('farm')
        if (selectedFarmName && farms.length > 0) {
            const farm = farms.find(f => f.name === selectedFarmName)
            if (farm) {
                // Preencher dados do Emitente automaticamente
                setValue('nome_emitente', farm.name)
                setValue('cnpj_emitente', farm.cnpj || '')
            }
        }
    }, [watch('farm'), farms, setValue])

    // Efeito para configurar defaults STRICT ao trocar de aba (Prevention Layer) + CFOP DINÂMICO
    const ufEmitente = watch('uf_emitente')
    const ufDestinatario = watch('uf_destinatario')

    // Calcula CFOP baseado nas UFs
    useEffect(() => {
        if (activeTab === 'remessa' && ufEmitente && ufDestinatario) {
            const correctCfop = ufEmitente === ufDestinatario ? '5934' : '6934'
            const currentCfop = watch('cfop')
            if (currentCfop !== correctCfop) {
                setValue('cfop', correctCfop)
            }
        }
    }, [ufEmitente, ufDestinatario, activeTab, setValue, watch])

    useEffect(() => {
        if (!isEditing) {
            if (activeTab === 'remessa') {
                // REGRA 1: Remessa Strict
                setValue('natureza_operacao', 'REMESSA DE GRÃOS PARA ARMAZENAGEM, SECAGEM E LIMPEZA')
                setValue('modalidade_frete', '0') // Default: CIF (Emitente)
                setValue('tem_cte', false)
                setValue('forma_pagamento', '90')

                // CFOP Inicial
                if (!ufDestinatario) setValue('cfop', '5934')

                // Limpar campos de transporte
                setValue('nome_transportador', '')
                setValue('placa_veiculo', '')
                setValue('uf_veiculo', '')
            } else if (activeTab === 'venda') {
                setValue('natureza_operacao', 'VENDA DE PRODUCAO DO ESTABELECIMENTO')
                setValue('cfop', '5101')
                setValue('modalidade_frete', '9')
            } else {
                setValue('natureza_operacao', '')
                setValue('cfop', '')
            }
        }
    }, [activeTab, isEditing, setValue])

    // Automação Regra 696: IndIEDest=9 -> ConsumidorFinal=1
    const indicadorIEDest = watch('indicador_inscricao_estadual_destinatario')
    useEffect(() => {
        if (indicadorIEDest === '9') {
            setValue('consumidor_final', '1') // Sim
            setValue('inscricao_estadual_destinatario', '') // Limpa IE
        } else {
            // Opcional: Resetar ou manter como estava
            // setValue('consumidor_final', '0') 
        }
    }, [indicadorIEDest, setValue])

    const isFieldDisabled = (section: 'basic' | 'weight' | 'quality' | 'config' | 'nfe' | 'nfe-recipient' | 'nfe-fiscal'): boolean => {
        if (section === 'nfe') return isFieldDisabled('nfe-recipient') && isFieldDisabled('nfe-fiscal')

        // Disable ALL fields only if NFe is authorized
        if (isEditing && (activeTab === 'remessa' || activeTab === 'venda')) {
            if (nfeData?.status === 'autorizado') return true
            // If pending/error/null, fall through to specific section logic (allow edits)
        }

        // Admin/Manager Override (Full Access)
        const isManager = ['system_admin', 'owner', 'manager'].includes(user?.base_role || '')
        if (isManager) return false

        // Granular Checks for Operators
        if (section === 'weight') return !hasModulePermission('truck-loading', 'manage_weight')
        if (section === 'quality') return !hasModulePermission('truck-loading', 'manage_quality')
        if (section === 'config') return true // Operators can't edit config

        if (activeTab === 'interno' && (section === 'nfe-recipient' || section === 'nfe-fiscal')) return true

        if (activeTab === 'interno' && (section === 'nfe-recipient' || section === 'nfe-fiscal')) return true

        // Remessa Creation Logic:
        if (activeTab === 'remessa') {
            if (section === 'nfe-fiscal') return true // Strict
            if (section === 'nfe-recipient') return false // Editable
        }

        // Basic/Other sections require 'update' (Generic)
        if (!hasModulePermission('truck-loading', 'update')) return true

        return false
    }

    const showFiscalSection = activeTab !== 'interno'

    const [pendingData, setPendingData] = useState<FormData | null>(null)

    // Sync Truck -> Placa Veiculo
    const truckValue = watch('truck')
    useEffect(() => {
        if (truckValue) {
            setValue('placa_veiculo', truckValue)
        }
    }, [truckValue, setValue])

    // Auto-fill Recipient Data from Armazem Selection
    const selectedArmazemId = watch('armazem_destino_id')
    useEffect(() => {
        // Prevent overwriting data when editing (Data from DB is source of truth)
        if (isEditing) return

        if (selectedArmazemId && armazens.length > 0) {
            const armazem = armazens.find(a => String(a.id) === String(selectedArmazemId))
            if (armazem) {
                setValue('nome_destinatario', armazem.nome)
                // Only overwrite if empty or if strictly binding (let's overwrite for convenience as it is a "selection")
                setValue('cnpj_destinatario', armazem.cnpj || '')
                setValue('inscricao_estadual_destinatario', armazem.inscricao_estadual || '')
                setValue('logradouro_destinatario', armazem.logradouro || '')
                setValue('numero_destinatario', armazem.numero || '')
                setValue('bairro_destinatario', armazem.bairro || '')
                setValue('municipio_destinatario', armazem.municipio || '')
                setValue('uf_destinatario', armazem.uf || '')
                setValue('cep_destinatario', armazem.cep || '')
            }
        }
    }, [selectedArmazemId, armazens, setValue])

    // --- CNPJ & Address Logic ---
    // --- CNPJ & Address Logic ---
    // Trigger via useEffect on change
    const cnpjValue = watch('cnpj_destinatario')
    useEffect(() => {
        const checkCNPJ = async () => {
            const raw = cnpjValue || ''
            const clean = raw.replace(/\D/g, '')

            if (clean.length === 14) {
                if (cnpjLoading) return

                setCnpjLoading(true)
                setAddressFallbackRequested(false)

                try {
                    const data = await destinatariosService.buscarPorCNPJ(clean)
                    if (data) {
                        message.success('CNPJ encontrado! Dados preenchidos.')
                        setValue('nome_destinatario', data.razao_social || data.nome_fantasia)
                        setValue('logradouro_destinatario', data.logradouro)
                        setValue('numero_destinatario', data.numero)
                        setValue('bairro_destinatario', data.bairro)
                        setValue('municipio_destinatario', data.municipio)
                        setValue('uf_destinatario', data.uf)
                        setValue('cep_destinatario', data.cep)

                        if (!data.logradouro || !data.municipio) {
                            message.warning('Endereço incompleto no CNPJ. Informe o CEP para completar.')
                            setAddressFallbackRequested(true)
                        }
                    }
                } catch (error) {
                    console.error("CNPJ error", error)
                    message.warning('CNPJ não encontrado na base pública. Preencha manualmente.')
                    setAddressFallbackRequested(true)
                } finally {
                    setCnpjLoading(false)
                }
            }
        }

        // Simple debounce
        const timer = setTimeout(() => {
            if (cnpjValue && cnpjValue.replace(/\D/g, '').length === 14) {
                checkCNPJ()
            }
        }, 500)

        return () => clearTimeout(timer)

    }, [cnpjValue, setValue])

    const handleCEPBlur = async () => {
        const rawCep = getValues('cep_destinatario')
        if (!rawCep) return

        const cep = rawCep.replace(/\D/g, '')
        if (cep.length !== 8) return

        setCepLoading(true)
        try {
            const data = await destinatariosService.buscarCEP(cep)
            if (data && !data.erro) {
                setValue('logradouro_destinatario', data.logradouro)
                setValue('bairro_destinatario', data.bairro)
                setValue('municipio_destinatario', data.localidade)
                setValue('uf_destinatario', data.uf)
                message.success('Endereço completado via CEP!')
            } else {
                message.error('CEP não encontrado.')
            }
        } catch (error) {
            console.error(error)
            // Silent fail or manual entry allow
        } finally {
            setCepLoading(false)
        }
    }

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

                // Configs
                umidade_padrao: data.umidade_padrao,
                fator_umidade: data.fator_umidade,
                impurezas_padrao: data.impurezas_padrao,

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

    const handleSyncNFe = async () => {
        if (!id) return
        try {
            setLoading(true)
            const updated = await carregamentosService.syncNFe(Number(id))
            setNfeData({
                status: updated.nfe_status || null,
                danfe_url: updated.nfe_danfe_url || null,
                xml_url: updated.nfe_xml_url || null,
                ref: updated.nfe_ref || null,
                chave: updated.nfe_chave || null,
                protocolo: updated.nfe_protocolo || null
            })
            message.success('Status da NFe atualizado!')
        } catch (error) {
            console.error(error)
            message.error('Erro ao sincronizar NFe')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        if (!id || !nfeData?.danfe_url) return
        try {
            // Using service to fetch blob with Auth Token
            const blob = await carregamentosService.downloadPDF(Number(id))

            // Create Blob URL
            const url = window.URL.createObjectURL(blob)

            // Open in new Tab
            window.open(url, '_blank')

            // Cleanup handled by browser eventually or on unload, 
            // but for new tab we can't revoke immediately or it breaks.
            // A simple timeout helps but not perfect. 
            setTimeout(() => window.URL.revokeObjectURL(url), 10000)

        } catch (error) {
            console.error(error)
            message.error("Erro ao abrir PDF. Verifique se o backend conseguiu baixar o arquivo.")
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

                {/* NFe Status Card (Visible if Editing and has NFe Ref) */}
                {isEditing && nfeData?.ref && (
                    < div className="nfe-status-card" style={{
                        marginBottom: '24px',
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                    }>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#334155' }}>Status da NFe:</span>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    backgroundColor: nfeData.status === 'autorizado' ? '#dcfce7' : nfeData.status === 'erro' ? '#fee2e2' : '#ffedd5',
                                    color: nfeData.status === 'autorizado' ? '#166534' : nfeData.status === 'erro' ? '#991b1b' : '#9a3412',
                                }}>
                                    {nfeData.status || 'PENDENTE'}
                                </span>
                            </div>
                            {nfeData.chave && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Chave: {nfeData.chave}</span>}
                            {nfeData.protocolo && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Protocolo: {nfeData.protocolo}</span>}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={handleSyncNFe}
                                disabled={loading}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                {loading ? 'Sincronizando...' : 'Atualizar Status'}
                            </button>

                            {nfeData.danfe_url && (
                                <button
                                    type="button"
                                    onClick={handleDownloadPDF}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#0f172a',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <FileText size={16} />
                                    Baixar PDF
                                </button>
                            )}
                        </div>
                    </div >
                )}

                <h3 className="section-title" style={{ marginTop: 0, marginBottom: '12px' }}>
                    Tipo de Carregamento
                </h3>
                <div className="type-selection-container">
                    {items.map(item => {
                        const isSelected = activeTab === item.key
                        return (
                            <div
                                key={item.key}
                                className={`type-card ${isSelected ? 'selected' : ''} ${isEditing ? 'disabled' : ''}`}
                                onClick={() => !isEditing && setActiveTab(item.key)}
                            >
                                <div className="type-icon">
                                    {item.icon}
                                </div>
                                <span className="type-label">{item.label}</span>
                                {isSelected && <div className="type-indicator" />}
                            </div>
                        )
                    })}
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit, (errors) => {
                        console.error("Form Validation Errors:", errors)
                        message.error("Verifique os campos obrigatórios")
                    })}
                    className="modal-form-content"
                    style={{ overflow: 'visible' }}
                >

                    {/* Bloco Operacional */}
                    <div className="operational-block">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 className="block-title" style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: '#1f2937' }}>
                                📦 Dados Operacionais
                            </h3>
                            {activeTab === 'remessa' && (
                                <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={14} />
                                    <span>Estes dados não constam na NF-e de Remessa (Apenas placa interna)</span>
                                </div>
                            )}
                        </div>

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
                                    <label className="form-label">Caminhão (Placa)</label>
                                    <Controller
                                        name="truck"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="smart-select-wrapper">
                                                <Select
                                                    {...field}
                                                    value={field.value || null}

                                                    allowClear
                                                    placeholder="Placa do Caminhão"
                                                    optionFilterProp="label"
                                                    disabled={isFieldDisabled('basic')}
                                                    className="form-select-antd"
                                                    style={{ width: '100%', height: '42px' }}
                                                    options={[
                                                        { value: '__NEW__', label: <div style={{ background: 'rgba(58, 125, 68, 0.08)', borderRadius: '8px', color: 'var(--green)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Plus size={16} /> Cadastrar Novo Caminhão</div> },
                                                        ...(displayOptions.truck || [])
                                                    ]}
                                                    onChange={(val) => {
                                                        if (val === '__NEW__') handleOpenQuickAdd('truck')
                                                        else field.onChange(val || '')
                                                    }}
                                                />
                                            </div>
                                        )}
                                    />
                                    {errors.truck && <span className="error-text">{errors.truck.message}</span>}
                                </div>
                                <div className="field">
                                    <label className="form-label">UF Veículo</label>
                                    <Controller
                                        name="uf_veiculo"
                                        control={control}
                                        render={({ field }) => <input {...field} className="form-input" maxLength={2} style={{ textTransform: 'uppercase' }} placeholder="UF" disabled={isFieldDisabled('basic')} />}
                                    />
                                </div>
                                <div className="field">
                                    <label className="form-label">Motorista</label>
                                    <Controller
                                        name="driver"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="smart-select-wrapper">
                                                <Select
                                                    {...field}
                                                    value={field.value || null}

                                                    allowClear
                                                    placeholder="Nome do Motorista"
                                                    optionFilterProp="label"
                                                    disabled={isFieldDisabled('basic')}
                                                    className="form-select-antd"
                                                    style={{ width: '100%', height: '42px' }}
                                                    options={[
                                                        { value: '__NEW__', label: <div style={{ background: 'rgba(58, 125, 68, 0.08)', borderRadius: '8px', color: 'var(--green)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Plus size={16} /> Cadastrar Novo Motorista</div> },
                                                        ...(displayOptions.driver || [])
                                                    ]}
                                                    onChange={(val) => {
                                                        if (val === '__NEW__') handleOpenQuickAdd('driver')
                                                        else field.onChange(val || '')
                                                    }}
                                                />
                                            </div>
                                        )}
                                    />
                                    {errors.driver && <span className="error-text">{errors.driver.message}</span>}
                                </div>
                                <div className="field">
                                    <label className="form-label">CPF/CNPJ Motorista</label>
                                    <Controller
                                        name="driver_document"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                className="form-input"
                                                placeholder="Documento para Controle Interno"
                                                disabled={isFieldDisabled('basic')}
                                                value={field.value || ''}
                                            />
                                        )}
                                    />
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
                                            <div className="smart-select-wrapper">
                                                <Select
                                                    {...field}
                                                    value={field.value || null}

                                                    allowClear
                                                    placeholder="Selecione a Fazenda"
                                                    optionFilterProp="label"
                                                    disabled={isFieldDisabled('basic')}
                                                    className="form-select-antd"
                                                    style={{ width: '100%', height: '42px' }}
                                                    options={[
                                                        { value: '__NEW__', label: <div style={{ background: 'rgba(58, 125, 68, 0.08)', borderRadius: '8px', color: 'var(--green)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Plus size={16} /> Cadastrar Nova Fazenda</div> },
                                                        ...farms.map(f => ({ value: f.name, label: f.name }))
                                                    ]}
                                                    onChange={(val) => {
                                                        if (val === '__NEW__') {
                                                            handleOpenQuickAdd('farm')
                                                        } else {
                                                            field.onChange(val || '')
                                                            // Limpar talhão ao mudar fazenda
                                                            setValue('field', '')
                                                            setValue('variety', '')
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    />
                                    {errors.farm && <span className="error-text">{errors.farm.message}</span>}
                                </div>
                                <div className="field">
                                    <label className="form-label">Talhão</label>
                                    <Controller
                                        name="field"
                                        control={control}
                                        render={({ field }) => {
                                            const selectedFarmName = getValues('farm')
                                            const farm = farms.find(f => f.name === selectedFarmName)
                                            const fieldOptions = farm?.fields?.map(f => ({ value: f.name, label: f.name })) || []

                                            // Ensure current value is in options if not found (edge case)
                                            // But generally we rely on farm fields.

                                            return (
                                                <div className="smart-select-wrapper">
                                                    <Select
                                                        {...field}
                                                        value={field.value || null}

                                                        allowClear
                                                        placeholder="Selecione o Talhão"
                                                        optionFilterProp="label"
                                                        disabled={isFieldDisabled('basic') || !selectedFarmName}
                                                        className="form-select-antd"
                                                        style={{ width: '100%', height: '42px' }}
                                                        options={[
                                                            { value: '__NEW__', label: <div style={{ background: 'rgba(58, 125, 68, 0.08)', borderRadius: '8px', color: 'var(--green)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Plus size={16} /> Cadastrar Novo Talhão</div> },
                                                            ...fieldOptions
                                                        ]}
                                                        onChange={(val) => {
                                                            if (val === '__NEW__') {
                                                                handleOpenQuickAdd('field')
                                                            } else {
                                                                field.onChange(val || '')
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )
                                        }}
                                    />
                                    {errors.field && <span className="error-text">{errors.field.message}</span>}
                                </div>
                                <div className="field">
                                    <label className="form-label">Variedade</label>
                                    <Controller
                                        name="variety"
                                        control={control}
                                        render={({ field }) => {
                                            const selectedFarmName = getValues('farm')
                                            const selectedFieldName = getValues('field')

                                            // Opção atual (se existir)
                                            const currentVariety = field.value ? [{ value: field.value, label: field.value }] : []
                                            // Se o talhão tem variedade definida mas não está no form state ainda (ex: ao carregar), deveriamos pegar do talhão
                                            // Mas o useEffect já faz isso.

                                            return (
                                                <div className="smart-select-wrapper">
                                                    <Select
                                                        {...field}
                                                        allowClear
                                                        placeholder="Variedade"
                                                        disabled={isFieldDisabled('basic') || !selectedFieldName}
                                                        className="form-select-antd"
                                                        style={{ width: '100%', height: '42px' }}
                                                        options={[
                                                            { value: '__NEW__', label: <div style={{ background: 'rgba(58, 125, 68, 0.08)', borderRadius: '8px', color: 'var(--green)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Plus size={16} /> {field.value ? 'Alterar Variedade' : 'Definir Variedade'}</div> },
                                                            ...currentVariety
                                                        ]}
                                                        onChange={(val) => {
                                                            if (val === '__NEW__') {
                                                                handleOpenQuickAdd('variety')
                                                            } else {
                                                                field.onChange(val || '')
                                                            }
                                                        }}
                                                        // Ensure value is displayed even if options list is weird
                                                        value={field.value || null}
                                                    />
                                                </div>
                                            )
                                        }}
                                    />
                                    {errors.variety && <span className="error-text">{errors.variety.message}</span>}
                                </div>
                            </div>
                            <div className="modal-grid" style={{ marginTop: '12px' }}>
                                <div className="field">
                                    <label className="form-label">Destino</label>
                                    <Controller
                                        name="destination"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="smart-select-wrapper">
                                                <Select
                                                    {...field}
                                                    value={field.value || null}

                                                    allowClear
                                                    placeholder="Destino / Cliente"
                                                    optionFilterProp="label"
                                                    disabled={isFieldDisabled('basic')}
                                                    className="form-select-antd"
                                                    style={{ width: '100%', height: '42px' }}
                                                    options={[
                                                        { value: '__NEW__', label: <div style={{ background: 'rgba(58, 125, 68, 0.08)', borderRadius: '8px', color: 'var(--green)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Plus size={16} /> Cadastrar Novo Destino</div> },
                                                        ...(displayOptions.destination || [])
                                                    ]}
                                                    onChange={(val) => {
                                                        if (val === '__NEW__') handleOpenQuickAdd('destination')
                                                        else field.onChange(val || '')
                                                    }}
                                                />
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
                                    <label className="form-label">Produto (Fiscal)</label>
                                    <Controller
                                        name="product"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="smart-select-wrapper">
                                                <Select
                                                    {...field}
                                                    value={field.value || null}

                                                    allowClear
                                                    placeholder="Ex: Soja, Milho"
                                                    optionFilterProp="label"
                                                    disabled={isFieldDisabled('basic')}
                                                    className="form-select-antd"
                                                    style={{ width: '100%', height: '42px' }}
                                                    options={[
                                                        { value: '__NEW__', label: <div style={{ background: 'rgba(58, 125, 68, 0.08)', borderRadius: '8px', color: 'var(--green)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Plus size={16} /> Cadastrar Novo Produto</div> },
                                                        ...(displayOptions.product || [])
                                                    ]}
                                                    onChange={(val) => {
                                                        if (val === '__NEW__') handleOpenQuickAdd('product')
                                                        else field.onChange(val || '')
                                                    }}
                                                />
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
                                                        render={({ field }) => <input {...field} type="number" step="0.1" className="form-input compact" style={{ textAlign: 'right' }} onChange={e => field.onChange(Number(e.target.value))} disabled={isFieldDisabled('quality')} value={field.value ?? ''} />}
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
                                                        render={({ field }) => <input {...field} type="number" step="0.1" className="form-input compact" style={{ textAlign: 'right' }} onChange={e => field.onChange(Number(e.target.value))} disabled={isFieldDisabled('quality')} value={field.value ?? ''} />}
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
                    </div> {/* Fechamento do Bloco Operacional */}

                    {/* Seção 5: Dados Fiscais (Apenas Venda/Remessa) - PREVENTION LAYER */}
                    {showFiscalSection && (
                        <>
                            <div className="section-divider"></div>

                            <div className="fiscal-block" style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 className="block-title" style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: '#1f2937' }}>
                                        🧾 Dados Fiscais (Nota Fiscal)
                                    </h3>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: '8px' }}>
                                        <span style={{ backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>
                                            Tipo: {activeTab.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Destinatário */}
                                <section className="form-section">
                                    <h4 className="section-title">Dados do Destinatário</h4>

                                    {/* Seleção Rápida */}
                                    <div className="field full-width" style={{ marginBottom: '16px' }}>
                                        <label className="form-label">Selecionar Destinatário Pré-cadastrado (Armazém)</label>
                                        <Controller
                                            name="armazem_destino_id"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="smart-select-wrapper">
                                                    <select {...field} className="form-select" disabled={isFieldDisabled('nfe')} value={field.value || ''}>
                                                        <option value="">-- Selecionar da Lista --</option>
                                                        {armazens.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.municipio}-{a.uf})</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className="modal-grid" style={{ marginBottom: '24px' }}>
                                        <div className="field">
                                            <label className="form-label">CNPJ / CPF</label>
                                            <Controller
                                                name="cnpj_destinatario"
                                                control={control}
                                                render={({ field }) => (
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            {...field}
                                                            className="form-input"
                                                            disabled={isFieldDisabled('nfe') || cnpjLoading}
                                                            placeholder="00.000.000/0000-00 (Busca Automática)"
                                                            maxLength={18}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(/\D/g, '')
                                                                // Apply Mask
                                                                let masked = raw
                                                                if (raw.length > 0) {
                                                                    masked = raw.replace(/^(\d{2})(\d)/, '$1.$2')
                                                                    masked = masked.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                                                                    masked = masked.replace(/\.(\d{3})(\d)/, '.$1/$2')
                                                                    masked = masked.replace(/(\d{4})(\d)/, '$1-$2')
                                                                }
                                                                masked = masked.slice(0, 18)

                                                                field.onChange(masked)
                                                            }}
                                                        />
                                                        {cnpjLoading && (
                                                            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#666' }}>
                                                                ⌛
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.cnpj_destinatario && <span className="error-text">{errors.cnpj_destinatario.message}</span>}
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
                                        <div className="field">
                                            <label className="form-label">Inscrição Estadual</label>
                                            <Controller
                                                name="inscricao_estadual_destinatario"
                                                control={control}
                                                render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe') || watch('indicador_inscricao_estadual_destinatario') === '9'} placeholder="ISENTO ou Número" />}
                                            />
                                        </div>
                                    </div>

                                    {/* Endereço - Simplificado visualmente */}
                                    <h5 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>📍 Endereço Fiscal</h5>
                                    <div className="modal-grid four-cols" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr', marginBottom: '24px' }}>
                                        <div className="field">
                                            <label className="form-label">CEP</label>
                                            <Controller name="cep_destinatario" control={control} render={({ field }) => (
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        {...field}
                                                        className={`form-input ${addressFallbackRequested ? 'highlight-input-warning' : ''}`}
                                                        disabled={isFieldDisabled('nfe') || cepLoading}
                                                        placeholder={addressFallbackRequested ? "Obrigatório para endereço" : "CEP"}
                                                        onBlur={() => {
                                                            field.onBlur()
                                                            handleCEPBlur()
                                                        }}
                                                    />
                                                    {cepLoading && (
                                                        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#666' }}>
                                                            ⌛
                                                        </div>
                                                    )}
                                                </div>
                                            )} />
                                        </div>
                                        <div className="field">
                                            <label className="form-label">Logradouro</label>
                                            <Controller name="logradouro_destinatario" control={control} render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />} />
                                        </div>
                                        <div className="field">
                                            <label className="form-label">Número</label>
                                            <Controller name="numero_destinatario" control={control} render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />} />
                                        </div>
                                        <div className="field">
                                            <label className="form-label">Bairro</label>
                                            <Controller name="bairro_destinatario" control={control} render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />} />
                                        </div>
                                        <div className="field">
                                            <label className="form-label">Município</label>
                                            <Controller name="municipio_destinatario" control={control} render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} />} />
                                        </div>
                                        <div className="field">
                                            <label className="form-label">UF</label>
                                            <Controller name="uf_destinatario" control={control} render={({ field }) => <input {...field} className="form-input" maxLength={2} style={{ textTransform: 'uppercase' }} disabled={isFieldDisabled('nfe')} />} />
                                        </div>
                                    </div>
                                </section>

                                {/* Dados da Operação (Regras Estritas) */}
                                <section className="form-section" style={{ marginTop: '24px' }}>
                                    <h4 className="section-title">Dados da Operação e Frete</h4>

                                    {activeTab === 'remessa' ? (
                                        <div className="modal-grid" style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                            <div className="field full-width">
                                                <label className="form-label">Natureza da Operação</label>
                                                <div style={{ padding: '8px 12px', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', color: '#374151', fontSize: '0.9rem', fontWeight: 500 }}>
                                                    REMESSA DE GRÃOS PARA ARMAZENAGEM, SECAGEM E LIMPEZA
                                                </div>
                                            </div>
                                            <div className="field">
                                                <label className="form-label">CFOP</label>
                                                <div style={{ display: 'inline-flex', padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    Automático (5934 / 6934)
                                                </div>
                                            </div>
                                            <div className="field">
                                                <label className="form-label">Pagamento</label>
                                                <div style={{ display: 'inline-flex', padding: '4px 12px', background: '#f3f4f6', color: '#374151', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    90 - Sem Pagamento
                                                </div>
                                            </div>

                                            {/* Frete Logic */}
                                            <div className="field full-width" style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                                                <label className="form-label">Quem paga o Frete?</label>
                                                <Controller
                                                    name="modalidade_frete"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <select {...field} className="form-select">
                                                            <option value="0">0 - Por conta do Emitente (CIF)</option>
                                                            <option value="1">1 - Por conta do Destinatário (FOB)</option>
                                                            <option value="2">2 - Por conta de Terceiros</option>
                                                            <option value="9">9 - Sem Frete</option>
                                                        </select>
                                                    )}
                                                />
                                            </div>

                                            <div className="field full-width">
                                                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
                                                    <Controller
                                                        name="tem_cte"
                                                        control={control}
                                                        render={({ field: { value, onChange } }) => (
                                                            <input
                                                                type="checkbox"
                                                                checked={!!value}
                                                                onChange={onChange}
                                                                style={{ width: '16px', height: '16px' }}
                                                            />
                                                        )}
                                                    />
                                                    <span>Frete com emissão de CT-e (Conhecimento de Transporte)?</span>
                                                </label>
                                                <small style={{ color: '#666', display: 'block', marginLeft: '24px' }}>
                                                    Se marcado, os dados do transportador serão ocultados na NFe (regras fiscais).
                                                </small>
                                            </div>

                                        </div>
                                    ) : (
                                        // MODO VENDA (Standard)
                                        <div className="modal-grid">
                                            <div className="field full-width">
                                                <label className="form-label">Natureza da Operação</label>
                                                <Controller name="natureza_operacao" control={control} render={({ field }) => <input {...field} className="form-input" />} />
                                            </div>
                                            <div className="field">
                                                <label className="form-label">CFOP</label>
                                                <Controller
                                                    name="cfop"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <select {...field} className="form-select">
                                                            <option value="5101">5101 - Venda (Estadual)</option>
                                                            <option value="6101">6101 - Venda (Interestadual)</option>
                                                        </select>
                                                    )}
                                                />
                                            </div>
                                            <div className="field">
                                                <label className="form-label">Frete</label>
                                                <Controller
                                                    name="modalidade_frete"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <select {...field} className="form-select">
                                                            <option value="9">9 - Sem Frete</option>
                                                            <option value="0">0 - CIF (Emitente)</option>
                                                            <option value="1">1 - FOB (Destinatário)</option>
                                                        </select>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* Transporte (Condicional) */}
                                {(!watch('tem_cte') && watch('modalidade_frete') !== '9' && watch('modalidade_frete') !== '1' && watch('modalidade_frete') !== '2') && (
                                    <section className="form-section" style={{ marginTop: '24px', borderLeft: '4px solid #3b82f6', paddingLeft: '16px' }}>
                                        <h4 className="section-title">Transportador (Sem CT-e)</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px' }}>
                                            Preencha apenas se o frete for por conta do emitente (CIF) e realizado em veículo próprio ou autônomo sem emissão de CT-e.
                                        </p>
                                        <div className="modal-grid">
                                            <div className="field">
                                                <label className="form-label">Nome do Transportador</label>
                                                <Controller name="nome_transportador" control={control} render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} placeholder="Nome da Transportadora / Motorista" />} />
                                            </div>
                                            <div className="field">
                                                <label className="form-label">CNPJ Transportador (Opcional)</label>
                                                <Controller name="cnpj_transportador" control={control} render={({ field }) => <input {...field} className="form-input" disabled={isFieldDisabled('nfe')} placeholder="CNPJ" />} />
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </>
                    )}

                    <div className="modal-footer" style={{ marginTop: '24px', padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb', borderRadius: '0 0 16px 16px', margin: '0 -32px -32px -32px' }}>
                        <button type="button" className="secondary-button" onClick={() => navigate('/carregamento')} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="primary-button" disabled={loading}>
                            {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar Carregamento')}
                            {!loading && <CheckCircle2 size={18} />}
                        </button>
                    </div>
                </form>

            </div >

            <PremiumModal
                title="Revisar e Emitir NFe"
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                footer={(
                    <>
                        <button type="button" className="premium-btn-secondary" onClick={() => setShowConfirmation(false)}>
                            Voltar
                        </button>
                        <button
                            type="button"
                            className="premium-btn-primary"
                            onClick={() => {
                                if (pendingData) {
                                    saveCarregamento(pendingData)
                                    setShowConfirmation(false)
                                }
                            }}
                        >
                            Confirmar e Emitir
                        </button>
                    </>
                )}
            >
                <div>
                    <p>Confirma a emissão da Nota Fiscal?</p>
                    <p>Verifique os dados antes de prosseguir.</p>
                </div>
            </PremiumModal>

            <PremiumModal
                title={`Adicionar ${quickAdd.type === 'farm' ? 'Fazenda' :
                    quickAdd.type === 'field' ? 'Talhão' :
                        quickAdd.type === 'variety' ? 'Variedade' :
                            quickAdd.type === 'truck' ? 'Caminhão' :
                                quickAdd.type === 'driver' ? 'Motorista' :
                                    quickAdd.type === 'product' ? 'Produto' : 'Destino'
                    }`}
                isOpen={quickAdd.visible}
                onClose={() => setQuickAdd({ ...quickAdd, visible: false })}
                width="500px"
                footer={(
                    <>
                        <button type="button" className="premium-btn-secondary" onClick={() => setQuickAdd({ ...quickAdd, visible: false })}>
                            Cancelar
                        </button>
                        <button type="button" className="premium-btn-primary" onClick={handleQuickSave}>
                            Salvar
                        </button>
                    </>
                )}
            >
                <div className="pt-2">
                    <label className="premium-form-label">
                        Nome {
                            quickAdd.type === 'variety' ? 'da Variedade' :
                                quickAdd.type === 'field' ? 'do Talhão' :
                                    quickAdd.type === 'farm' ? 'da Fazenda' :
                                        quickAdd.type === 'truck' ? 'do Caminhão' :
                                            quickAdd.type === 'driver' ? 'do Motorista' :
                                                quickAdd.type === 'product' ? 'do Produto' : 'do Destino'
                        }
                    </label>
                    <input
                        className="premium-form-input"
                        value={quickAddValue}
                        onChange={e => setQuickAddValue(e.target.value)}
                        placeholder="Digite o nome..."
                        autoFocus
                    />
                </div>
            </PremiumModal>
        </div >
    )
}
