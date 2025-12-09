from pprint import pprint
from backend import db, enums

def test_insert():
    """Testa a função `insert`."""
    names = ("Coxinha", "Café", "Água")
    categories = (
        enums.ProductCategory.SALGADOS,
        enums.ProductCategory.BEBIDAS,
        enums.ProductCategory.BEBIDAS
    )
    prices = (5, 4.5, 4)
    for name, category, price in zip(names, categories, prices):
        db.insert(name, category, price)

def test_select():
    """Testa a função `select`."""
    assert1 = db.select("name", name = "Coxinha")
    expected1 = [{"name": "Coxinha"}]
    assert assert1 == expected1

def test_update():
    """Testa a função `update`."""
    conditions = (("name", "Coxinha"), ("price", 3.2), ("category", enums.ProductCategory.SALGADOS))
    fields = {"name": "Maçã", "price": 4.2}
    db.update(conditions, **fields) # pyright: ignore[reportArgumentType]

def test_delete():
    """Testa da função `delete`."""
    conditions = (("name", "Coxinha"), ("price", 3.2), ("category", enums.ProductCategory.SALGADOS))
    db.delete(*conditions) # pyright: ignore[reportArgumentType]

def test_drop():
    """Testa a função `drop`."""
    db.drop_db(force_drop=True)

def test_all():
    """Testa todas as funcionalidades."""
    db.drop_db(force_drop=True)
    db.init_db()
    db.insert("Dildo", enums.ProductCategory.REFEICOES, 0)
    db.insert("Arroz", enums.ProductCategory.SALGADOS, 5)
    db.update(("name", "Arroz"), price=8)
    db.delete(("name", "Dildo"))
    select_return = db.select()
    pprint(select_return)
