import chromadb

chroma_client = chromadb.PersistentClient(path="/app/chroma_db")

collection = chroma_client.get_or_create_collection(
    name="rag-chunks",
)

semantic_cache_collection = chroma_client.get_or_create_collection(
    name="semantic-cache"
)
