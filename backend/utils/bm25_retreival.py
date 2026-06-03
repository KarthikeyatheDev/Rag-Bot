import bm25s
from typing import List, cast


def keyword_retrieval(all_chunks, query, top_k=2):

    corpus_tokens = bm25s.tokenize(all_chunks, stopwords="en")

    retriever = bm25s.BM25()
    retriever.index(corpus_tokens)

    query_tokens = bm25s.tokenize([query])
    results, scores = retriever.retrieve(query_tokens, corpus=all_chunks, k=top_k)
    # print(type(results), type(scores))
    return results[0].tolist()


# keyword_retrieval(["The car is parked outside.", "The dog is sleeping.", "Python is a programming language."], "automobile", top_k=2)
