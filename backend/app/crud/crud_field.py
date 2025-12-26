from app.crud.base import CRUDBase
from app.models.field import Field
from app.schemas.field import FieldCreate, FieldBase

class CRUDField(CRUDBase[Field, FieldCreate, FieldBase]):
    pass

field = CRUDField(Field)
