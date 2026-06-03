from sentence_transformers import CrossEncoder

model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def rerank(query: str, chunks: list[str], top_k: int=5):
    if not chunks:
        return []
    
    pairs = [(query, chunk) for chunk in chunks]
    scores = model.predict(pairs)
    scored_chunks = list(zip(scores, chunks))
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    return [chunk for score, chunk in scored_chunks[:top_k]]

chunks = [
    "Python was created by Guido van Rossum",
    "FastAPI supports dependency injection through Depends()",
    "A REST API uses HTTP methods"
]

query = "How does FastAPI dependency injection work?"

print(rerank(query, chunks))