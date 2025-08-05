from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda
from langchain.text_splitter import CharacterTextSplitter
import os
import sys

# Use Mistral model from Ollama
llm = ChatOllama(model="mistral")

# Check if university_data.txt exists
file_path = os.path.join(os.path.dirname(__file__), "university_data.txt")
if not os.path.isfile(file_path):
    print("❌ Error: university_data.txt not found. Please add it to the backend folder.")
    sys.exit(1)

# Load and prepare documents
documents = TextLoader(file_path).load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
split_docs = text_splitter.split_documents(documents)

# Embeddings
embeddings = OllamaEmbeddings(model="nomic-embed-text")
vectorstore = FAISS.from_documents(split_docs, embeddings)
retriever = vectorstore.as_retriever()

# Prompt to rewrite vague questions
rewrite_prompt = PromptTemplate.from_template(
    "Rewrite the following question to be more specific and helpful for a university search engine. Just return the rewritten question:\n\n{query}"
)

rewrite_chain = (
    RunnableLambda(lambda x: {"query": x}) |
    rewrite_prompt |
    llm |
    StrOutputParser()
)

# Answer generation function
def generate_answer(query: str) -> str:
    if "exit" in query.lower():
        return "Goodbye!"

    rewritten_query = rewrite_chain.invoke(query)
    retrieved_content = retriever.invoke(rewritten_query)

    system_prompt = (
        "You are a friendly and knowledgeable university assistant. "
        "Use the provided context to give clear, helpful, and conversational answers. "
        "Only answer using the retrieved documents(provided context). If a user asks about personal information and it is present in the documents, respond with it."
        "If a question is vague or lacks detail, you may clarify or enrich it automatically to improve the answer. "
        "Never start your response with phrases like 'According to the context'. "
        "Give short and precise answers if possible."
        "If you don't know the answer, say 'I don't know' and ask 'Is there something else I can help you with?'\n\n"
        f"Context:\n{retrieved_content}"
    )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=query)
    ]

    response = llm.invoke(messages)
    return response.content.strip()


# CLI OR importable
if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else input("Ask Unibot: ")
    try:
        answer = generate_answer(query)
        print("\n🤖 Unibot:", answer)
    except Exception as e:
        print("❌ Error:", e)
        sys.exit(1)
