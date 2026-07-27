from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Conversation(Base):

    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, index=True)
    content = Column(Text, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    # conversation = relationship("Conversation", back_populates="messages")


class Document(Base):

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String)

    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    content = Column(Text)


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, index=True)

    chunk_index = Column(Integer)
    document_id = Column(Integer, ForeignKey("documents.id"))
