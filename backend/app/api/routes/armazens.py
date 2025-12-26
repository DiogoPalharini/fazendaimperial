from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.armazem import Armazem
from app.schemas.armazem import Armazem as ArmazemSchema, ArmazemCreate, ArmazemUpdate

router = APIRouter()

@router.get("/", response_model=List[ArmazemSchema])
def read_armazens(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve armazens.
    """
    armazens = db.query(Armazem).offset(skip).limit(limit).all()
    return armazens

@router.post("/", response_model=ArmazemSchema)
def create_armazem(
    *,
    db: Session = Depends(deps.get_db),
    armazem_in: ArmazemCreate,
) -> Any:
    """
    Create new armazem.
    """
    armazem = Armazem(**armazem_in.model_dump())
    db.add(armazem)
    db.commit()
    db.refresh(armazem)
    return armazem

@router.put("/{armazem_id}", response_model=ArmazemSchema)
def update_armazem(
    *,
    db: Session = Depends(deps.get_db),
    armazem_id: UUID,
    armazem_in: ArmazemUpdate,
) -> Any:
    """
    Update an armazem.
    """
    armazem = db.query(Armazem).filter(Armazem.id == armazem_id).first()
    if not armazem:
        raise HTTPException(status_code=404, detail="Armazem not found")
    
    update_data = armazem_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(armazem, field, value)
        
    db.add(armazem)
    db.commit()
    db.refresh(armazem)
    return armazem

@router.delete("/{armazem_id}", response_model=ArmazemSchema)
def delete_armazem(
    *,
    db: Session = Depends(deps.get_db),
    armazem_id: UUID,
) -> Any:
    """
    Delete an armazem.
    """
    armazem = db.query(Armazem).filter(Armazem.id == armazem_id).first()
    if not armazem:
        raise HTTPException(status_code=404, detail="Armazem not found")
        
    db.delete(armazem)
    db.commit()
    return armazem
