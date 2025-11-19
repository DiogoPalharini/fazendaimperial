from typing import Literal

from app.schemas.base import ORMModel


class ModuleRead(ORMModel):
    key: str
    name: str
    path: str
    category: Literal['estrategico', 'operacional', 'financeiro', 'suporte']
    description: str
    tags: list[str] | tuple[str, ...] = ()



