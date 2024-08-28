from sqlalchemy import (CHAR, Column, Date, DateTime, ForeignKey, Integer,
                        String)
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class TreeNode(Base):
    __tablename__ = 'tree'

    id = Column(String(8), primary_key=True)
    name = Column(String(100), nullable=False)
    born_in = Column(Date())
    died_in = Column(Date())
    gender = Column(CHAR())
    inserted_in = Column(
        DateTime(),
        nullable=False,
        server_default=func.now(),
    )

    def __repr__(self) -> str:
        return "TreeNode(id={}, name={})".format(
            self.id,
            self.name
        )


class Root(Base):
    __tablename__ = 'root_nodes'

    id = Column(Integer, primary_key=True)
    tree_id = Column(
        String(8),
        ForeignKey('tree.id'),
        unique=True,
        nullable=False
    )


class FatherOf(Base):
    __tablename__ = 'father_of'

    id = Column(Integer, primary_key=True)
    father_id = Column(
        String(8),
        ForeignKey('tree.id'),
        unique=True,
        nullable=False
    )
    son_id = Column(
        String(8),
        ForeignKey('tree.id'),
        unique=True,
        nullable=False
    )


class MotherOf(Base):
    __tablename__ = 'mother_of'

    id = Column(Integer, primary_key=True)
    mother_id = Column(
        String(8),
        ForeignKey('tree.id'),
        unique=True,
        nullable=False
    )
    son_id = Column(
        String(8),
        ForeignKey('tree.id'),
        unique=True,
        nullable=False
    )
