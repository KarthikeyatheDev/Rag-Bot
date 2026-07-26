from functools import lru_cache
import chromadb

@lru_cache(maxsize=1)
def get_chroma_client():
    return chromadb.PersistentClient(path="/app/chroma_db")

@lru_cache(maxsize=1)
def get_collection():
    return get_chroma_client().get_or_create_collection(name="rag-chunks")

@lru_cache(maxsize=1)
def get_semantic_cache_collection():
    return get_chroma_client().get_or_create_collection(name="semantic-cache")
