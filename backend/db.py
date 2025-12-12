"""
Esse módulo contém funções para
inserir, listar, atualizar e apagar um dado de uma
abela de um banco de dados.
"""
from typing import (
    Union, TypeAlias,
    Literal, List, Dict,
    Unpack, TypedDict,
    Tuple, Optional
)
from decimal import Decimal
import datetime
from enum import Enum
from mysql.connector import connect
from mysql.connector.pooling import PooledMySQLConnection
from mysql.connector.errors import DatabaseError
from mysql.connector.abstracts import MySQLConnectionAbstract, MySQLCursorAbstract
from enums import ProductCategory
from utils import to_unique_depth, get_even_elements, get_odd_elements

# * ==============================
# * == INICIALIZANDO CONSTANTES ==
# * ==============================

_INITIZALIED = False
_DATABASE_NAME = "cantina_escolar"
_TABLE_NAME = 'produtos'
_TABLE_NAME_REFERENCE = f"`{_TABLE_NAME}`"
_TABLE_COLUMNS = ("name", "category", "price")
_DATABASE_NAME_REFERENCE = f"`{_DATABASE_NAME}`"

# * ===============================
# * == DEFININDO TIPOS ESTÁTICOS ==
# * ===============================

_Connection: TypeAlias = Union[PooledMySQLConnection, MySQLConnectionAbstract]
_ColumnsValuesTypes: TypeAlias = Union[
    str, Union[Decimal, float, int], ProductCategory
]
_ColumnsNamesLiteral = Literal["id", "name", "category", "price"]
_WhereConditions = Tuple[_ColumnsNamesLiteral, _ColumnsValuesTypes]

class ProductDataDict(TypedDict):
    """
    Representa um dicionário tipado com as informações de um produto.
    """
    id: int
    name: str
    category: ProductCategory
    price: Decimal
    time_stamp: datetime.datetime

class ProductDBDataDict(ProductDataDict):
    """
    Representa um dicionário tipado com as informações de um produto
    sob os tipos de dados retornados ou enviados para o MySQL.
    """
    category: str

_SelectedItemDict: TypeAlias = Dict[str, ProductDBDataDict]
_SelectedItemsDict: TypeAlias = List[_SelectedItemDict]
_SelectedItemsReturns: TypeAlias = Union[_SelectedItemDict, _SelectedItemsDict]

class TableColumnsDict(TypedDict, total=False):
    """
    Representa um dicionário tipado com as colunas
    da tabela `produtos`, excluindo o id.
    """
    name: str
    category: ProductCategory
    price: Union[Decimal, float, int, str]

class AllTableColumnsDict(TableColumnsDict, total=False):
    """
    Representa um dicionário tipado com as colunas
    da tabela `produtos`, incluindo o id.
    """
    id: int

# * ======================
# * == FUNÇÕES PRIVADAS ==
# * ======================

def _get_global_connection() -> _Connection:
    """Retorna uma conexão global do MySQL."""
    return connect(
        host="localhost",
        user="root",
        password=""
    )

def _where_SQL(*columns: _ColumnsNamesLiteral) -> str:
    """Cria um comando WHERE com as condições indicadas."""
    # Sintaxe: WHERE coluna1 = valor1, ...
    # Sendo os valores em %s
    where_cmd = f"WHERE {' AND '.join([f"{column} = %s" for column in columns])}"
    return where_cmd

def _set_SQL(*set_fields: _ColumnsNamesLiteral) -> str:
    """Cria um comando SET com os campos e valores indicados."""
    # Sintaxe: SET coluna1 = valor1, coluna2 = valor2, ...
    set_cmd = f"SET {', '.join([f"{column} = %s" for column in set_fields])}"
    return set_cmd

def _delete_SQL(*delete_fields: _ColumnsNamesLiteral) -> str:
    """Cria um comando DELETE com nos campos indicados."""
    where_cmd = _where_SQL(*delete_fields)
    delete_cmd = f"DELETE FROM {_TABLE_NAME_REFERENCE} {where_cmd}"
    return delete_cmd

def _order_by_SQL(
    *sort_columns: _ColumnsNamesLiteral,
    desc_sort: bool = False
) -> str:
    """Cria um comando ORDER BY com as colunas indicadas."""
    mode = "DESC" if desc_sort else "ASC"
    order_by_cmd = f"ORDER BY {", ".join(sort_columns)} {mode}"
    return order_by_cmd

def _group_by_SQL(*group_columns: _ColumnsNamesLiteral) -> str:
    """Cria um comando GROUP BY com as colunas indicadas."""
    return f"GROUP BY {", ".join(group_columns)}"

# * ======================
# * == FUNÇÕES PÚBLICAS ==
# * ======================

def test_connection() -> bool:
    """Testa a conexão com o banco de dados."""
    try:
        _get_global_connection()
    except DatabaseError:
        return False
    return True

def close_connection(
    conn: _Connection,
    cursor: MySQLCursorAbstract,
    *,
    with_commit: bool = True
) -> None:
    """Encerra a conexão e o cursor com o banco de dados"""
    if with_commit:
        conn.commit()
    cursor.close()
    conn.close()

def start_connection(
    *,
    is_global_connection: bool = False,
    dictionary_cursor: bool = False
) -> Tuple[_Connection, MySQLCursorAbstract]:
    """Retorna uma conexão e um cursor dessa conexão."""
    conn = _get_global_connection() if is_global_connection else get_connection()
    return (conn, conn.cursor(dictionary=dictionary_cursor))

def get_connection() -> _Connection:
    """Retorna uma conexão com um banco de dados."""
    if not _INITIZALIED:
        raise ConnectionError(
            "O banco de dados esperado não foi inicializado.")
    return connect(
        host="localhost",
        user="root",
        password="",
        database=_DATABASE_NAME
    )

def db_has_initialized():
    """Retorna se o banco de dados `cantina_escolar` já foi inicializado."""
    return _INITIZALIED

def init_db() -> None:
    """Cria o banco de dados `cantina_escolar` e a tabela `produtos`."""
    global _INITIZALIED  # pylint: disable=global-statement
    if _INITIZALIED:
        return
    with open("backend/schema.sql", encoding="utf-8") as f:
        data = f.read()
    data = data.split(";")
    conn = _get_global_connection()
    cursor = conn.cursor()
    for line in data:
        line = line.strip()
        if line:
            cursor.execute(line)
    close_connection(conn, cursor)
    _INITIZALIED = True

def drop_db(*, force_drop: bool = False) -> None:
    """Exclui o banco de dados `cantina_escolar`."""
    global _INITIZALIED  # pylint: disable=global-statement
    if not (_INITIZALIED or force_drop):
        return
    conn, cursor = start_connection(is_global_connection=True)
    cursor.execute(f"DROP DATABASE IF EXISTS {_DATABASE_NAME_REFERENCE}")
    close_connection(conn, cursor)
    _INITIZALIED = False

#* CREATE
def insert(
    name: str,
    category: Union[ProductCategory, str],
    price: Union[float, Decimal, int]
) -> Optional[int]:
    """Insere um novo produto na tabela `produtos`."""
    if not isinstance(price, Decimal):
        price = Decimal(price)
    if isinstance(category, ProductCategory):
        category = category.value
    values = (name, category, price)
    cmd = f"INSERT INTO {_TABLE_NAME_REFERENCE} ({", ".join(_TABLE_COLUMNS)}) VALUES (%s, %s, %s)"
    conn, cursor = start_connection()
    cursor.execute(cmd, values)
    id_ = cursor.lastrowid
    close_connection(conn, cursor)
    return id_

#* READ
def select(
    selected_columns: Union[Tuple[_ColumnsNamesLiteral, ...], Literal["*"]] = "*",
    desc_sort: bool = False,
    order_by_columns: Union[Tuple[_ColumnsNamesLiteral, ...], Literal["*"]] = "*",
    group_by_columns: Union[Tuple[_ColumnsNamesLiteral, ...], Literal["*"]] = "*",
    **where_fields: Unpack[AllTableColumnsDict]
) -> Optional[_SelectedItemsDict]:
    """Retorna uma seleção feita no SQL."""
    where_cmd = ""
    columns_cmd = "*"

    if selected_columns and selected_columns != "*":
        columns_cmd = ", ".join(selected_columns)
    if where_fields:
        if where_fields.get("category") is not None and isinstance(where_fields["category"], ProductCategory):
            where_fields["category"] = where_fields["category"].value
        if where_fields.get("price") is not None:
            where_fields["price"] = Decimal(where_fields["price"])
        where_cmd = _where_SQL(*where_fields) # pyright: ignore[reportArgumentType]
    if order_by_columns == "*":
        order_by_columns = ("id", *_TABLE_COLUMNS)
    if group_by_columns == "*":
        group_by_columns = ("id", *_TABLE_COLUMNS)
    order_by_cmd = _order_by_SQL(*order_by_columns, desc_sort=desc_sort)
    group_by_cmd = _group_by_SQL(*group_by_columns)
    cmd = (
        f"SELECT {columns_cmd} FROM {_TABLE_NAME_REFERENCE} " +
        f"{where_cmd} {group_by_cmd} {order_by_cmd}"
    )
    conn, cursor = start_connection(dictionary_cursor=True)
    cursor.execute(cmd, (*where_fields.values(),)) # pyright: ignore[reportArgumentType]

    selected_return: _SelectedItemsDict
    selected_return = cursor.fetchall() # pyright: ignore[reportAssignmentType]

    close_connection(conn, cursor, with_commit=False)
    for i, selected in enumerate(selected_return):
        time_stamp = selected.get("time_stamp")
        if time_stamp is not None and isinstance(time_stamp, datetime.datetime):
            selected_return[i]["time_stamp"] = time_stamp.strftime("%d/%m/%Y - %H:%M:%S")
    return selected_return or None

#* UPDATE
def update(
    *conditions: _WhereConditions, # (("name", "Coxinha"), ("price", 5.5), ...) -> Linhas procuradas
    **set_fields: Unpack[AllTableColumnsDict] # {"name": "Maçã", "price": 4.2} -> Novos valores
) -> Optional[int]:
    """
    Atualiza um produto na tabela `produtos`.

    Returns:
        (int | None): Número de linhas que foram atualizadas.
    """
    if not (conditions or set_fields):
        return None
    normalized_conditions = to_unique_depth(conditions, to=list)
    for i, condition in enumerate(normalized_conditions):
        if isinstance(condition, Enum):
            normalized_conditions[i] = condition.value
        elif isinstance(condition, (float, int)):
            normalized_conditions[i] = Decimal(condition)
    if set_fields.get("category") is not None and isinstance(set_fields["category"], ProductCategory):
        set_fields["category"] = set_fields["category"].value
    if set_fields.get("price") is not None:
        set_fields["price"] = Decimal(set_fields["price"])
    where_columns = get_even_elements(normalized_conditions)
    where_cmd = _where_SQL(*where_columns) # pyright: ignore[reportArgumentType]
    set_cmd = _set_SQL(*set_fields) # pyright: ignore[reportArgumentType]

    values = (*set_fields.values(), *get_odd_elements(normalized_conditions))
    cmd = f"UPDATE {_TABLE_NAME_REFERENCE} {set_cmd} {where_cmd}"
    conn, cursor = start_connection()
    cursor.execute(cmd, values)
    affected_lines = cursor.rowcount
    close_connection(conn, cursor)
    return affected_lines

def delete(*where_condition: _WhereConditions) -> None:
    """Apaga um linha da tabela `produtos`."""
    if not where_condition:
        return
    normalized_conditions = to_unique_depth(where_condition, to=list)
    for i, condition in enumerate(normalized_conditions):
        if isinstance(condition, Enum):
            normalized_conditions[i] = condition.value
    delete_cmd = _delete_SQL(*get_even_elements(normalized_conditions))
    values = get_odd_elements(normalized_conditions)
    conn, cursor = start_connection()
    cursor.execute(delete_cmd, values)
    close_connection(conn, cursor)
