from typing import Union, Literal, List, Tuple
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

MYSQL_ERRORS = (Error, IntegrityError, DataError, ProgrammingError, DatabaseError)
app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}})
db.init_db()

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

@app.route("/api/products", methods=["GET"])
def list_all_products() -> _HTTPResponse:
    """Retorna todos os produtos do DB."""
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
    try:
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
    """Rota para buscar um produto por id."""
    try:
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
    try:
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
    """Apaga um produto por id."""
    try:
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
