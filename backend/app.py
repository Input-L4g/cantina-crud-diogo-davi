from typing import Union, Literal, List, Tuple
from threading import Thread
from time import sleep, time
from decimal import Decimal
from flask import Flask, request, render_template
from flask_cors import CORS
from pydantic import BaseModel, ValidationError
from pydantic_core import ErrorDetails
from mysql.connector import Error, IntegrityError, DataError, ProgrammingError, DatabaseError
from utils import http_response, _HTTPResponse
import enums
import db

# pylint: disable=broad-exception-caught,broad-exception-raised
def is_valide_product_json(
    product_dict: dict
) -> Union[Tuple[Literal[True], Literal[None]], Tuple[Literal[False], List[ErrorDetails]]]:
    """Verifica se um dicionário que representa um produto é valido em tipo."""
    class BaseProductDict(BaseModel):
        """Representa a estrutura de um dicionário representando um produto."""
        name: str
        price: Union[int, float, Decimal]
        category: enums.ProductCategory
    try:
        _ = BaseProductDict(**product_dict)
    except ValidationError as VError:
        return False, VError.errors()
    return True, None

_db_connected = False

MYSQL_ERRORS = (Error, IntegrityError, DataError, ProgrammingError, DatabaseError)
COOLDOWN_SECONDS = 2
routes_cooldowns = {}

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}})

def on_test_connection() -> None:
    """Testa a conexão com o DB."""
    global _db_connected # pylint: disable=global-statement
    _has_connected = False
    while True:
        if _db_connected is True and _has_connected is False:
            db.init_db()
            _has_connected = True
        if db.test_connection():
            _db_connected = True
        else:
            _db_connected = False
            _has_connected = False
        sleep(5)
test_connection = Thread(target=on_test_connection, daemon=True)
test_connection.start()

@app.route("/")
def index():
    """Rota da root."""
    return render_template("index.html")

@app.route("/api/test", methods=["GET", "POST", "PUT", "DELETE"])
def test():
    """Rota para testar o funcionamento da API."""
    try:
        if request.method in ["POST", "PUT"]:
            _ = request.get_json()
        return http_response(200, "Teste feito, nenhum erro aparente")
    except Exception as e:
        return http_response(500, f"Teste falhado em método: {request.method}", error=e)

@app.route("/api/test/db", methods=["GET"])
def test_db():
    """Rota para testar a conexão com o DB."""
    if db.test_connection():
        return http_response()
    return http_response(preset="db_connection_error")

@app.route("/api/products", methods=["GET"])
def list_all_products() -> _HTTPResponse:
    try:
        all_products = db.select()
        if not all_products:
            return http_response(204, "Nenhum produto foi criado ainda.", data=[])
        return http_response(200, data=all_products)
    except MYSQL_ERRORS as e:
        return http_response(preset="sql_error", error=e)
    except Exception as e:
        return http_response(preset="generic_internal_error", error=e)


@app.route("/api/products", methods=["POST"])
def create_product() -> _HTTPResponse:
    """Rota para criar um produto novo."""
    route_ip = request.remote_addr
    last_use = routes_cooldowns.get(route_ip, 0)
    current_time = time()
    time_execute = current_time - last_use
    if time_execute < COOLDOWN_SECONDS:
        return http_response(
            200, f"Tente novamente em {(COOLDOWN_SECONDS - time_execute):.2} segundos."
        )
    routes_cooldowns[route_ip] = current_time
    try:
        if not _db_connected:
            return http_response(preset="db_connection_error")
        new_data: dict = request.get_json(silent=True)
        if new_data is None:
            return http_response(preset="bad_json")
        is_valide, error = is_valide_product_json(new_data)
        if not is_valide:
            return http_response(
                400,
                "Os dados estão inválidos.",
                error=error
            )
        try:
            new_id = db.insert(**new_data)
        except MYSQL_ERRORS as e:
            return http_response(409, "Esse produto já existe", error=e)
        if new_id is None:
            raise Exception("Produto não encontrado no primeiro processo.")
        data = db.select(id=new_id)
        if data is None:
            raise Exception("Produto não encontrado no segundo processo.")
        return http_response(201, "Produto criado.", data=data[0])
    except MYSQL_ERRORS as e:
        return http_response(preset="sql_error", error=e)
    except Exception as e:
        return http_response(preset="generic_internal_error", error=e)


@app.route("/api/products/<int:id_>", methods=["GET"])
def get_product(id_: int) -> _HTTPResponse:
    try:
        if not _db_connected:
            return http_response(preset="db_connection_error")
        product = db.select("*", id=id_)
        if product is None:
            return http_response(404, "Produto não encontrado.")
        return http_response(message="Produto encontrado.", data=product[0])
    except MYSQL_ERRORS as e:
        return http_response(preset="sql_error", error=e)
    except Exception as e:
        return http_response(preset="generic_internal_error", error=e)

@app.route("/api/products/<int:id_>", methods=["PUT"])
def update_product(id_: int) -> _HTTPResponse:
    """Rota para atualizar um produto."""
    route_ip = request.remote_addr
    last_use = routes_cooldowns.get(route_ip, 0)
    current_time = time()
    time_execute = current_time - last_use
    if time_execute < COOLDOWN_SECONDS:
        return http_response(
            200, f"Tente novamente em {(COOLDOWN_SECONDS - time_execute):.2} segundos."
        )
    routes_cooldowns[route_ip] = current_time
    try:
        if not _db_connected:
            return http_response(preset="db_connection_error")
        new_data: dict = request.get_json(silent=True)
        if new_data is None:
            return http_response(preset="bad_json")
        is_valide, error = is_valide_product_json(new_data)
        if not is_valide:
            return http_response(
                400,
                "Os dados estão inválidos.",
                error=error
            )
        affected_lines = db.update(("id", id_), **new_data)
        if affected_lines in [0, None]:
            return http_response(404, error="Produto não encontrado.")
        return http_response(204, "Produto atualizado.")
    except MYSQL_ERRORS as e:
        return http_response(preset="sql_error", error=e)
    except Exception as e:
        return http_response(preset="generic_internal_error", error=e)

@app.route("/api/products/<int:id_>", methods=["DELETE"])
def delete_product(id_: int) -> _HTTPResponse:
    """Rota para apagar um produto por id."""
    route_ip = request.remote_addr
    last_use = routes_cooldowns.get(route_ip, 0)
    current_time = time()
    time_execute = current_time - last_use
    if time_execute < COOLDOWN_SECONDS:
        return http_response(
            200, f"Tente novamente em {(COOLDOWN_SECONDS - time_execute):.2} segundos."
        )
    routes_cooldowns[route_ip] = current_time
    try:
        if not _db_connected:
            return http_response(preset="db_connection_error")
        product = db.select(id=id_)
        if product is None:
            return http_response(404, error="Produto não encontado.")
        db.delete(("id", id_))
        return http_response(204, "O produto foi deletado.")
    except MYSQL_ERRORS as e:
        return http_response(preset="sql_error", error=e)
    except Exception as e:
        return http_response(preset="generic_internal_error", error=e)

# pylint: enable=broad-exception-caught,broad-exception-raised

if __name__ == "__main__":
    app.run(debug=True)
