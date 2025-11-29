"""
Esse módulo contém funções para
inserir, listar, atualizar e apagar um dado de uma
abela de um banco de dados.
"""
from typing import Union, TypeAlias, Literal, List, Dict, Optional, Tuple, Any, TypedDict
from decimal import Decimal
from mysql.connector import connect
from mysql.connector.types import RowItemType
from mysql.connector.pooling import PooledMySQLConnection
from mysql.connector.abstracts import MySQLConnectionAbstract, MySQLCursorAbstract
from backend.enums import ProductCategory

#* ==============================
#* == INICIALIZANDO CONSTANTES ==
#* ==============================

_INITIZALIED = False
_DATABASE_NAME = "cantina_escolar"
_TABLE_NAME = "produtos"
_TABLE_COLUMNS = ("name", "category", "price")
_DATABASE_NAME_REFERENCE = f"`{_DATABASE_NAME}`"
_TABLE_NAME_REFERENCE = f"`{_TABLE_NAME}`"


#* ===============================
#* == DEFININDO TIPOS ESTÁTICOS ==
#* ===============================

_Connection: TypeAlias = Union[PooledMySQLConnection, MySQLConnectionAbstract]
_SelectedItemDict: TypeAlias = Dict[str, RowItemType]
_SelectedItemsDict: TypeAlias = List[_SelectedItemDict]
_SelectedItemsReturns: TypeAlias = Union[_SelectedItemDict, _SelectedItemsDict]
_ColumnsValuesTypes: TypeAlias = Union[
    str, Union[Decimal, float], ProductCategory
]
_ColumnsNamesLiteral = Literal["name", "category", "price"]

class UpdateOptions(TypedDict):
    """Representa um dicionário tipado para as opções de update."""
    condition: Tuple[str, _ColumnsValuesTypes]
    name: str
    price: Union[Decimal, float]
    category: ProductCategory


#* ======================
#* == FUNÇÕES PRIVADAS ==
#* ======================

def _get_global_connection() -> _Connection:
    """Retorna uma conexão global do MySQL."""
    return connect(
        host="localhost",
        user="root",
        password=""
    )


#* ======================
#* == FUNÇÕES PÚBLICAS ==
#* ======================

def close_connection(
    conn: _Connection,
    cursor: MySQLCursorAbstract,
    with_commit: bool = True
) -> None:
    """Encerra a conexão e o cursor com o banco de dados"""
    if with_commit:
        conn.commit()
    cursor.close()
    conn.close()


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


def drop_db() -> None:
    """Exclui o banco de dados `cantina_escolar`."""
    global _INITIZALIED  # pylint: disable=global-statement
    if not _INITIZALIED:
        return
    conn = _get_global_connection()
    cursor = conn.cursor()
    cursor.execute(f"DROP DATABASE IF EXISTS {_DATABASE_NAME_REFERENCE}")
    close_connection(conn, cursor)
    _INITIZALIED = False


def insert(name: str, category: ProductCategory, price: Union[float, Decimal]) -> None:
    """Insere um novo produto na tabela `produtos`."""
    if isinstance(price, float):
        price = Decimal(price)
    values = (
        _TABLE_NAME_REFERENCE, *_TABLE_COLUMNS,
        name, category.value, price)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO %s (%s, %s, %s) VALUES (%s, %s, %s)",
        values  # Respectivamente: Nome da tabela, colunas e o valores
    )
    close_connection(conn, cursor)


def select(
    *columns: _ColumnsNamesLiteral,
    filters: Optional[str] = None,
    filters_values: Tuple[Any, ...] = (),
    orders: Optional[str] = None,
    orders_values: Tuple[Any, ...] = (),
    limit: int = -1
) -> _SelectedItemsReturns:
    """Seleciona as colunas da tabela `produtos`."""
    if len(columns) == 0:
        return []
    sql = f"SELECT %s, %s, %s FROM {_TABLE_NAME_REFERENCE}"
    if filters is not None and len(filters_values) != 0:
        sql += f" WHERE {orders}"
    else:
        filters_values = ()
    if orders is not None and len(orders_values) != 0:
        sql += f" ORDER BY {orders}"
    else:
        orders_values = ()
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(sql, (*columns, *filters_values, *orders_values))
    selected: _SelectedItemsReturns
    if limit < 0:
        selected = cursor.fetchall()  # type: ignore[reportAssignmentType]
    elif limit == 1:
        selected = cursor.fetchone() or []  # type: ignore[reportAssignmentType]
    else:
        selected = cursor.fetchmany(limit) # type: ignore[reportAssignmentType]

    close_connection(conn, cursor)
    return selected


def update(**kwargs: UpdateOptions):
    """Altera os valores em uma determinada linha da tabela `produtos`."""
    if not (1 <= len(kwargs) <= 4): # pylint: disable=superfluous-parens
        return
    kwargs_values: Tuple[Union[_ColumnsNamesLiteral, _ColumnsValuesTypes], ...]
    kwargs_values = tuple( # type: ignore[reportAssignmentType]
        i.value if isinstance(i, ProductCategory) else i
        for pair in kwargs.items()  # Intercala chave e valor numa tupla
        for i in pair
    )

    #! ============================================
    #! == ADICIONAR A FUNCIONALIDADE CONDITIONS  ==
    #! ============================================

    sql_sets = ", ".join(["%s = %s" for _ in range(len(kwargs_values))])
    sql = f"UPDATE {_TABLE_NAME_REFERENCE} SET " + sql_sets
    # sql += sql + " WHERE" + conditions
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(sql, kwargs_values)
