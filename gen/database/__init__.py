from os import environ

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from gen.database.entities import TreeNode
from gen.env_loader import env_is_defined, load

load()

if not env_is_defined('GEN_SQLALCHEMY_DATABASE_URI'):
    raise Exception('Error! Database URI not defined.')

engine = create_engine(environ['GEN_SQLALCHEMY_DATABASE_URI'], echo=False)

Session = sessionmaker(engine)


def add_tree_node(node: TreeNode):
    try:
        with Session.begin() as session:
            session.add(node)
    except Exception as e:
        print(e)
        return False
    return True


def get_tree_node(id: str):
    return Session().query(TreeNode).get(id)


if __name__ == '__main__':
    ...
