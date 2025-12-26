
import httpx
from typing import Optional, Dict, Any

class CNPJService:
    BASE_URL = "https://brasilapi.com.br/api/cnpj/v1"

    @staticmethod
    async def fetch_cnpj_data(cnpj: str) -> Optional[Dict[str, Any]]:
        """
        Busca dados de um CNPJ na BrasilAPI.
        Retorna um dicionário padronizado ou None se não encontrado.
        """
        clean_cnpj = ''.join(filter(str.isdigit, cnpj))
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(f"{CNPJService.BASE_URL}/{clean_cnpj}")
                
                if response.status_code == 404:
                    return None
                
                response.raise_for_status()
                data = response.json()
                
                # Padronizar retorno
                return {
                    "razao_social": data.get("razao_social") or data.get("nome_fantasia"),
                    "nome_fantasia": data.get("nome_fantasia"),
                    "logradouro": data.get("logradouro"),
                    "numero": data.get("numero"),
                    "complemento": data.get("complemento"),
                    "bairro": data.get("bairro"),
                    "municipio": data.get("municipio"),
                    "uf": data.get("uf"),
                    "cep": data.get("cep"),
                    "situacao_cadastral": data.get("situacao_cadastral"),
                }
            except Exception as e:
                print(f"Erro ao consultar CNPJ {cnpj}: {e}")
                # Em caso de erro na API (timeout, 500), retornamos None para o frontend lidar (fallback)
                return None
