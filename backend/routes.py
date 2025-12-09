from flask import Flask, jsonify, request, render_template
from mysql.connector import Error
from backend.utils import http_response, _HTTPResponse
from backend import db

app = Flask(__name__, static_folder="static", template_folder="templates")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/products", methods=["GET"])
def list_all_products() -> _HTTPResponse:
    """Retorna todos os produtos do DB."""
    try:
        all_products = db.select()
    except Error as e:
        return http_response(preset="sql_error", error=e)
    except Exception as e:
        return http_response(preset="generic_internal_error", error=e)
    return http_response(200, "", data=all_products)

@app.route("/api/products/<int:id>", methods=["GET"])
def get_product(id_: int) -> _HTTPResponse:
    """Retorna um produto procurado por id."""
    try:
        product = db.select("*", id=id_)
    except Error as e:
        return http_response(preset="sql_error", error=e)
    except Exception as e:
        return http_response(preset="generic_internal_error", error=e)
    if product is None:
        return http_response(404, "Produto não encontrado.")
    return http_response(message="Produto encontrado.", data=product[0])

#! CRIAR AS OUTRAS ROTAS
