from backend import utils

def test_to_unique_depth():
    """Testa a função `to_unique_depth`"""
    sequence1 = [1, [2, [3, 4, [5, 6]], 7], 8, [[9, [10, 11]], 12, [13, [14, [15]]]], 16]
    expected1 = (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
    assert utils.to_unique_depth(sequence1) == expected1
    sequence2 = {"name": "Coxinha", "price": 5.2}
    expected2 = ("name", "Coxinha", "price", 5.2)
    assert utils.to_unique_depth(sequence2) == expected2
