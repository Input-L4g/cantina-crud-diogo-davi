"""
Esse módulo contém classes Enum.
"""
from enum import Enum


class ProductCategory(Enum):
    """
    Representa uma categoria de um produto.

    - SALGADOS = "salgados"
    - DOCES = "doces"
    - BEBIDAS = "bebidas"
    - REFEICOES = "refeições
    """
    SALGADOS = "salgado"
    DOCES = "doce"
    BEBIDAS = "bebida"
    REFEICOES = "refeição"
