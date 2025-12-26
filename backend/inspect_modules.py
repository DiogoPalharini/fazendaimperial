import sys
import os

sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.farm import Farm
from sqlalchemy import select

def inspect_modules():
    db = SessionLocal()
    try:
        farms = db.execute(select(Farm)).scalars().all()
        for farm in farms:
            print(f"Farm {farm.id} modules: {farm.modules} (Type: {type(farm.modules)})")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_modules()
