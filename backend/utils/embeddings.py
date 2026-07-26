from functools import lru_cache
from sentence_transformers import SentenceTransformer

@lru_cache(maxsize=1)
def get_embedding_model():
    return SentenceTransformer("all-MiniLM-L6-v2")

def generate_embedding(text: str):
    model = get_embedding_model()
    embedding = model.encode(text)
    return [float(x) for x in embedding]
