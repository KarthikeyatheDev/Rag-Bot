import chromadb
from utils.embeddings import generate_embedding

chroma_client = chromadb.PersistentClient(path="./chroma_db")

collection = chroma_client.get_or_create_collection(
    name="rag-chunks",
    )