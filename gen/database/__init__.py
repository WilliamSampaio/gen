from os import environ

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from gen.database.entities import TreeNode

engine = create_engine(environ['GEN_SQLALCHEMY_DATABASE_URI'], echo=False)

Session = sessionmaker(engine)


def add_tree_node(node: TreeNode):
    if node.gender:
        if node.gender not in ['f', 'F', 'm', 'M']:
            raise Exception('Error! Gender value is invalid.')
        else:
            node.gender = str(node.gender).upper()
    try:
        with Session.begin() as session:
            session.add(node)
    except Exception as e:
        print(e)
        return False
    return True


def get_tree_node(id: str):
    return Session().query(TreeNode).get(id)


def remove_tree_node(id: str):
    try:
        with Session.begin() as session:
            node = session.query(TreeNode).get(id)
            session.delete(node)
    except Exception as e:
        print(e)
        return False
    return True


def add_root(tree_id: str):
    try:
        root = Root()
        root.tree_id = tree_id
        with Session.begin() as session:
            session.add(root)
    except Exception as e:
        print(e)
        return False
    return True
