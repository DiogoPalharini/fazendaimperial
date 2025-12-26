import sys
import os

sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.farm import Farm
from sqlalchemy import select

def migrate_modules():
    db = SessionLocal()
    try:
        farms = db.execute(select(Farm)).scalars().all()
        
        key_map = {
            'carregamento': 'truck-loading',
            'nota-fiscal': 'invoice',
            'maquinas': 'machines',
            'insumos': 'inputs',
            'financeiro': 'finance',
            'atividades': 'activities',
            'meteorologia': 'weather',
            'solo': 'soil',
            'safra': 'harvest',
            'usuarios': 'users',
            'logistica': 'logistics'
        }
        
        updated_count = 0
        
        for farm in farms:
            if not farm.modules or not isinstance(farm.modules, dict):
                continue
            
            # Helper to migrate a list of keys
            def migrate_list(key_list):
                if not key_list: return key_list
                new_list = []
                list_changed = False
                for k in key_list:
                    if k in key_map:
                        new_list.append(key_map[k])
                        print(f"Farm {farm.id}: Renaming '{k}' -> '{key_map[k]}'")
                        list_changed = True
                    else:
                        new_list.append(k)
                return new_list, list_changed

            # 1. Handle "enabled" list (Most common structure)
            if 'enabled' in farm.modules and isinstance(farm.modules['enabled'], list):
                new_enabled, changed = migrate_list(farm.modules['enabled'])
                
                if changed:
                    # Create a new dict to ensure SQLAlchemy detects the change
                    new_modules_dict = farm.modules.copy()
                    new_modules_dict['enabled'] = new_enabled
                    farm.modules = new_modules_dict
                    updated_count += 1
            
            # 2. Handle flat dict structure (Fail-safe if schema varies)
            else:
                 # Check if it's a flat dict like {'carregamento': True}
                 original_modules = farm.modules.copy()
                 new_modules_flat = {}
                 flat_changed = False
                 for k, v in original_modules.items():
                     if k in key_map:
                         print(f"Farm {farm.id} (flat): Renaming '{k}' -> '{key_map[k]}'")
                         new_modules_flat[key_map[k]] = v
                         flat_changed = True
                     else:
                         new_modules_flat[k] = v
                 
                 if flat_changed:
                     farm.modules = new_modules_flat
                     updated_count += 1
        
        if updated_count > 0:
            db.commit()
            print(f"Successfully updated {updated_count} farms.")
        else:
            print("No farms needed updating.")
            
    except Exception as e:
        print(f"Error migrating modules: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting migration...")
    migrate_modules()
