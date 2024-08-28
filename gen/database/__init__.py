from os import environ

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from gen.database.entities import FatherOf, MotherOf, Root, TreeNode

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


def update_tree_node(id: str, data: dict):
    try:
        with Session.begin() as session:
            session.query(TreeNode).filter(TreeNode.id == id).update(data)
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


def add_paternal_filiation(father_id: str, son_id: str):
    try:
        filiation = FatherOf()
        filiation.father_id = father_id
        filiation.son_id = son_id
        with Session.begin() as session:
            session.add(filiation)
    except Exception as e:
        print(e)
        return False
    return True


def add_maternal_filiation(mother_id: str, son_id: str):
    try:
        filiation = MotherOf()
        filiation.mother_id = mother_id
        filiation.son_id = son_id
        with Session.begin() as session:
            session.add(filiation)
    except Exception as e:
        print(e)
        return False
    return True


def get_roots():
    sql = """
    select distinct t.id from tree t
    where
        t.id in (select rn.tree_id from root_nodes rn) or
        t.id not in (select fo.son_id from father_of fo) and
        t.id not in (select mo.son_id from mother_of mo)
    """
    return [x[0] for x in Session().execute(text(sql)).all()]


def get_leaves():
    sql = """
    select distinct t.id from tree t
    where
        t.id not in (select fo.father_id from father_of fo) and
        t.id not in (select mo.mother_id from mother_of mo) and
        t.leaf is false
    order by t.id asc
    """
    return [x[0] for x in Session().execute(text(sql)).all()]
