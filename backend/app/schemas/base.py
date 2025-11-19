from pydantic import BaseModel


class ORMModel(BaseModel):
    class Config:
        from_attributes = True



