from sqlalchemy import CHAR, Column, Date, DateTime, ForeignKey, String
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
    father_id = Column(String(8), ForeignKey('tree.id'))
    mother_id = Column(String(8), ForeignKey('tree.id'))
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
