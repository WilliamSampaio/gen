from os import environ

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from gen.database.entities import FatherOf, MotherOf, Root, TreeNode

engine = create_engine(environ['SQLALCHEMY_DATABASE_URI'], echo=False)

Session = sessionmaker(engine)


def add_tree_node(node: TreeNode):
    if node.gender:
        if node.gender not in ['f', 'F', 'm', 'M']:
            raise Exception('Error! Gender value is invalid.')
        else:
            node.gender = str(node.gender).upper()
    try:
        session = Session()
        session.add(node)
        session.commit()
        session.close()
    except Exception as e:
        print(e)
        return False
    return True


def update_tree_node(id: str, data: dict):
    try:
        session = Session()
        session.query(TreeNode).filter(TreeNode.id == id).update(data)
        session.commit()
        session.close()
    except Exception as e:
        print(e)
        return False
    return True


def get_tree_node(id: str):
    session = Session()
    result = session.query(TreeNode).get(id)
    session.close()
    return result


def remove_tree_node(id: str):
    try:
        session = Session()
        node = session.query(TreeNode).get(id)
        session.delete(node)
        session.commit()
        session.close()
    except Exception as e:
        print(e)
        return False
    return True


def add_root(tree_id: str):
    try:
        root = Root()
        root.tree_id = tree_id
        session = Session()
        session.add(root)
        session.commit()
        session.close()
    except Exception as e:
        print(e)
        return False
    return True


def add_paternal_filiation(father_id: str, son_id: str):
    try:
        filiation = FatherOf()
        filiation.father_id = father_id
        filiation.son_id = son_id
        session = Session()
        session.add(filiation)
        session.commit()
        session.close()
    except Exception as e:
        print(e)
        return False
    return True


def add_maternal_filiation(mother_id: str, son_id: str):
    try:
        filiation = MotherOf()
        filiation.mother_id = mother_id
        filiation.son_id = son_id
        session = Session()
        session.add(filiation)
        session.commit()
        session.close()
    except Exception as e:
        print(e)
        return False
    return True


def get_roots():
    sql = """
    select distinct * from tree t
    where
        t.id in (select rn.tree_id from root_nodes rn) or
        t.id not in (select fo.son_id from father_of fo) and
        t.id not in (select mo.son_id from mother_of mo)
    order by t.name asc
    """
    session = Session()
    result = [x for x in session.execute(text(sql)).all()]
    session.close()
    return result


def get_leaves():
    sql = """
    select distinct t.id, t.inserted_in from tree t
    where
        t.scraped is null and
        t.leaf is false and
        t.id not in (select fo.father_id from father_of fo) and
        t.id not in (select mo.mother_id from mother_of mo)
    order by t.inserted_in asc
    """
    session = Session()
    result = [x[0] for x in session.execute(text(sql)).all()]
    session.close()
    return result
