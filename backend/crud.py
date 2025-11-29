"""
Esse módulo contém funções de CRUD:
- create
- read
- update
- delete
Referentes a um item no DataBase.
O item é composto por NOME, CATEGORIA e PREÇO
"""
from backend.enums import ProductCategory
from backend.db import get_connection

def create(name: str, category: ProductCategory, price: float) -> None:
    """Cria um produto e insere ele no banco de dados"""
    ...
