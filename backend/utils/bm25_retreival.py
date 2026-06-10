import bm25s
from typing import List


def keyword_retrieval(all_chunks, query, top_k=2):
    if not all_chunks:
        return []
    top_k = min(top_k, len(all_chunks))

    corpus_tokens = bm25s.tokenize(all_chunks, stopwords="en")

    retriever = bm25s.BM25()
    retriever.index(corpus_tokens)

    query_tokens = bm25s.tokenize([query])
    results, scores = retriever.retrieve(query_tokens, corpus=all_chunks, k=top_k)
    return list(results[0])