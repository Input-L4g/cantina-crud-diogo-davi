from typing import (
    Dict, Any, Tuple,
    Union, Iterable, TypeAlias,
    TypeVar, Sequence,
    Type, List, overload,
    Optional, Literal
)
from enum import Enum
from flask import jsonify, Response

AnyIterable: TypeAlias = Iterable[Any]
T_KeyType = TypeVar("T_KeyType")
T_ValueType = TypeVar("T_ValueType")
_HTTPResponse = Tuple[Response, int]
_HTTPResponsePresetLiteral = Literal[
    "sql_error",
    "generic_internal_error",
    "bad_json"
]

def iterable_to_str(iterable: AnyIterable) -> Tuple[str, ...]:
    """
    Converte de forma superficial os elementos de um iterável para string e retorna uma
    tupla com os valores convertido.
    """
    return tuple(str(x) for x in iterable)

def dict_to_tuple(dict_: Dict[str, Any], convert_enum: bool = True) -> Tuple[Union[str, Any], ...]:
    """Converte um dicionário em uma tupla com nível 0 de profundidade."""
    if not dict_:
        return ()
    return tuple(
        i.value if isinstance(i, Enum) and convert_enum else i
        for pair in dict_.items()
        for i in pair
    )

def get_even_elements(iterable: Iterable[T_ValueType]) -> Tuple[T_ValueType, ...]:
    """
    Retorna um tupla com apenas os valores em indexs pares de um iterável.
    """
    return tuple([element for i, element in enumerate(iterable) if i%2 == 0])

def get_odd_elements(iterable: Iterable[T_ValueType]) -> Tuple[T_ValueType, ...]:
    """
    Retorna um tupla com apenas os valores em indexs impares de um iterável.
    """
    return tuple([element for i, element in enumerate(iterable) if i%2 != 0])

@overload
def to_unique_depth(
    sequence: Sequence[T_ValueType],
    *,
    convert_dict: bool = True,
    to: Type[tuple] = tuple
) -> Tuple[T_ValueType, ...]:
    ...

@overload
def to_unique_depth(
    sequence: Sequence[T_ValueType],
    *,
    convert_dict: bool = True,
    to: Type[list]
) -> List[T_ValueType]:
    ...

@overload
def to_unique_depth(
    sequence: Sequence[T_ValueType],
    *,
    convert_dict: bool = True,
    to: Type[dict]
) -> Dict[int, T_ValueType]:
    ...

@overload
def to_unique_depth(
    sequence: Dict[T_KeyType, T_ValueType],
    *,
    convert_dict: bool = True,
    to: Type[tuple] = tuple
) -> Tuple[T_ValueType, ...]:
    ...

@overload
def to_unique_depth(
    sequence: Dict[T_KeyType, T_ValueType],
    *,
    convert_dict: bool = True,
    to: Type[list]
) -> List[T_ValueType]:
    ...

@overload
def to_unique_depth(
    sequence: Dict[T_KeyType, T_ValueType],
    *,
    convert_dict: bool = True,
    to: Type[dict]
) -> Dict[T_KeyType, T_ValueType]:
    ...

def to_unique_depth(
    sequence: Union[Sequence[T_ValueType], Dict[T_KeyType, T_ValueType]],
    *,
    convert_dict = True,
    to: Type[Union[tuple, list, dict]] = tuple
) -> Union[Tuple[T_ValueType, ...], List[T_ValueType], Dict[T_KeyType, T_ValueType]]:
    """
    Retorna uma tupla com todos os valores de
    um iterável em uma única profundidade.
    """
    sequence_types = (list, tuple, set)
    if isinstance(sequence, dict):
        sequence = tuple(sequence.items()) # pyright: ignore[reportAssignmentType]
    if len(sequence) == 1:
        if isinstance(sequence, tuple) and isinstance(sequence[0], sequence_types):
            return to_unique_depth(sequence[0], to=to)
        return to(sequence)
    temp_list = []
    for element in sequence:
        if isinstance(element, dict) and convert_dict:
            element = tuple(element.items())
        if isinstance(element, sequence_types):
            new_sequence = to_unique_depth(element) # pyright: ignore[reportArgumentType]
            temp_list.extend(new_sequence)
            continue
        temp_list.append(element)
    return to(temp_list)

def http_response(
    code: int = 200,
    message: str = "OK",
    *,
    data: Optional[Any] = None,
    error: Optional[Any] = None,
    preset: Optional[_HTTPResponsePresetLiteral] = None
) -> _HTTPResponse:
    """Retorna uma resposta HTTP usando jsonify."""
    if preset == "sql_error":
        return http_response(500, "Um erro interno de SQL ocorreu.", error=error)
    if preset == "generic_internal_error":
        return http_response(500, "Um erro interno ocorreu.", error=error)
    if preset == "bad_json":
        return http_response(400, "O JSON enviado é inválido.", error="JSON inválido.")
    response = {
        "success": 200 <= code <= 299,
        "message": message,
    }
    if data is not None:
        response["data"] = data
    if error is not None:
        if isinstance(error, BaseException):
            error_info = {
                "type": type(error).__name__,
                "message": str(error)
            }
        else:
            error_info = error
        response["error"] = error_info
    return jsonify(response), code
