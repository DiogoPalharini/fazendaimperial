from dataclasses import asdict, dataclass
from typing import Literal


ModuleCategory = Literal['estrategico', 'operacional', 'financeiro', 'suporte']


@dataclass(frozen=True, slots=True)
class ModuleConfig:
    key: str
    name: str
    path: str
    category: ModuleCategory
    description: str
    tags: tuple[str, ...] = ()


MODULE_DEFINITIONS: tuple[ModuleConfig, ...] = (
    ModuleConfig(
        key='dashboard',
        name='Visão Geral',
        path='/dashboard',
        category='estrategico',
        description='Indicadores estratégicos e visão macro da operação agrícola.',
        tags=('kpi', 'monitoramento'),
    ),
    ModuleConfig(
        key='carregamento',
        name='Carregamento de Caminhão',
        path='/carregamento',
        category='operacional',
        description='Gestão de expedições, filas e rastreamento logístico.',
        tags=('logistica',),
    ),
    ModuleConfig(
        key='nota-fiscal',
        name='Notas Fiscais',
        path='/nota-fiscal',
        category='financeiro',
        description='Emissão, recepção e conferência automática de NF-e.',
    ),
    ModuleConfig(
        key='maquinas',
        name='Máquinas e Equipamentos',
        path='/maquinas',
        category='operacional',
        description='Telemetria, manutenções e disponibilidade de ativos.',
        tags=('telemetria',),
    ),
    ModuleConfig(
        key='insumos',
        name='Controle de Insumos',
        path='/insumos',
        category='operacional',
        description='Rastreabilidade de estoque e movimentos de insumos.',
    ),
    ModuleConfig(
        key='financeiro',
        name='Financeiro',
        path='/financeiro',
        category='financeiro',
        description='Fluxos financeiros, margem operacional e centros de custo.',
    ),
    ModuleConfig(
        key='atividades',
        name='Atividades',
        path='/atividades',
        category='operacional',
        description='Planejamento diário, checklists e status dos talhões.',
    ),
    ModuleConfig(
        key='meteorologia',
        name='Meteorologia',
        path='/meteorologia',
        category='estrategico',
        description='Monitoramento climático hiperlocal com alertas preventivos.',
    ),
    ModuleConfig(
        key='solo',
        name='Análise de Solo',
        path='/solo',
        category='estrategico',
        description='Mapas de fertilidade, amostragens e recomendações.',
    ),
    ModuleConfig(
        key='safra',
        name='Gestão de Safras',
        path='/safra',
        category='estrategico',
        description='Planejamento e execução completa do ciclo de safra.',
    ),
    ModuleConfig(
        key='usuarios',
        name='Usuários',
        path='/usuarios',
        category='suporte',
        description='Controle granular de perfis e permissões.',
    ),
)

MODULE_KEYS: set[str] = {module.key for module in MODULE_DEFINITIONS}


def as_json(module: ModuleConfig) -> dict[str, str | tuple[str, ...]]:
    return asdict(module)



