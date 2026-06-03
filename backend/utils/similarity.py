import math
import ast


def cosine_similarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    return dot_product / (norm1 * norm2)


def parse_embedding(embedding_str):
    return ast.literal_eval(embedding_str)


def retrieve_relevant_chunks(query_embedding, chunks, top_k=3):
    scored_chunks = []
    for chunk in chunks:
        chunk_embedding = parse_embedding(chunk.embedding)
        score = cosine_similarity(query_embedding, chunk_embedding)
        scored_chunks.append((score, chunk))
    scored_chunks.sort(key=lambda x: x[0],reverse=True)
    return [chunk for score, chunk in scored_chunks[:top_k]]

