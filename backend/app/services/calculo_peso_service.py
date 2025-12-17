def calcular_descontos(
    peso_liquido: float,
    umidade_medida: float,
    impurezas_medida: float,
    umidade_padrao: float = 14.0,
    fator_umidade: float = 1.5,
    impurezas_padrao: float = 1.0,
) -> dict:

    desconto_umidade_percent = max(0, (umidade_medida - umidade_padrao) * fator_umidade)
    desconto_umidade_kg = (peso_liquido / 100) * desconto_umidade_percent
    desconto_impurezas_kg = (peso_liquido / 100) * impurezas_medida
    peso_final = peso_liquido - desconto_umidade_kg - desconto_impurezas_kg

    return {
        "desconto_umidade_percent": desconto_umidade_percent,
        "desconto_umidade_kg": desconto_umidade_kg,
        "desconto_impurezas_kg": desconto_impurezas_kg,
        "peso_com_desconto": round(peso_final, 3)
    }
