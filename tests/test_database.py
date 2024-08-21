import os
from datetime import date

import pytest
from alembic import command, config

from gen.database import add_tree_node, get_tree_node, remove_tree_node
from gen.database.entities import TreeNode


@pytest.fixture(autouse=True)
def setup():
    alembic_cfg = config.Config(os.path.join(os.getcwd(), 'alembic.ini'))
    command.upgrade(alembic_cfg, "head")
    yield


def test_add_tree_node():
    node = TreeNode()
    node.id = 'AAAA-AAA'
    node.name = 'FULANO DE TAL'
    node.born_in = date(day=1, month=1, year=2000)
    node.relevant = True
    node.gender = 'M'

    assert add_tree_node(node) is True


def test_add_tree_node_with_same_id():
    node = TreeNode()
    node.id = 'AAAA-AAA'
    node.name = 'FULANO DE TAL 2'

    assert add_tree_node(node) is False


def test_get_tree_node():
    assert isinstance(get_tree_node('AAAA-AAA'), TreeNode)
    assert print(get_tree_node('AAAA-AAA')) is None
    assert get_tree_node('XXXX-XXX') is None


def test_remove_tree_node():
    assert remove_tree_node('AAAA-AAA') is True


def test_remove_tree_node_exception():
    assert remove_tree_node('AAAA-AAA') is False


def test_add_tree_node_invalid_gender():
    node = TreeNode()
    node.id = 'AAAA-AAA'
    node.name = 'FULANO DE TAL 3'
    node.gender = 'X'

    with pytest.raises(Exception):
        add_tree_node(node)
