"""
Esse módulo realiza testes automatizados das funções do módulo db.py.
"""
import unittest
from backend import db

class TestDB(unittest.TestCase):
    """Represena uma TestCase para testes automatizados de db.py."""

    def setUp(self) -> None:
        db.init_db()

    def tearDown(self) -> None:
        db.drop_db()

    def test_get_connection_raises(self):
        """Testa o raise `ConnectionError` da função `get_connection`."""
        db.drop_db()
        with self.assertRaises(ConnectionError):
            db.get_connection()

    def test_insert(self):
        ...

# if __name__ == "__main__":
suite = unittest.TestSuite()
suite.addTest(unittest.defaultTestLoader.loadTestsFromTestCase(TestDB))
runner = unittest.TextTestRunner()
runner.run(suite)
