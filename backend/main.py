from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import google.generativeai as genai
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

app = FastAPI(
    title="Travel Assistant API",
    description="An intelligent Q&A system for travel-related queries",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

query_history = []


class QueryRequest(BaseModel):
    question: str = Field(
        ..., min_length=1, max_length=1000, description="User's travel-related question"
    )


class QueryResponse(BaseModel):
    id: str
    question: str
    answer: str
    timestamp: datetime
    processing_time: Optional[float] = None


class QueryHistory(BaseModel):
    queries: List[QueryResponse]
    total_count: int


@app.get("/")
async def root():
    return {
        "message": "Travel Assistant API",
        "version": "1.0.0",
        "endpoints": {
            "query": "/api/query",
            "history": "/api/history",
            "health": "/health",
            "docs": "/docs",
        },
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    try:
        start_time = datetime.now()

        enhanced_prompt = f"""You are an expert travel assistant. Please provide comprehensive, accurate, and well-structured information for the following travel-related question.

Question: {request.question}

Please format your response in a clear, organized manner with:
- Bullet points for lists
- Clear sections if needed
- Specific details and requirements
- Any important tips or warnings

Keep the response informative but concise."""

        response = model.generate_content(enhanced_prompt)

        if not response or not response.text:
            raise HTTPException(
                status_code=500, detail="Failed to generate response from AI model"
            )

        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()

        query_response = QueryResponse(
            id=str(uuid.uuid4()),
            question=request.question,
            answer=response.text,
            timestamp=start_time,
            processing_time=processing_time,
        )

        query_history.append(query_response)

        if len(query_history) > 100:
            query_history.pop(0)

        return query_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@app.get("/api/history", response_model=QueryHistory)
async def get_query_history(limit: int = 10, offset: int = 0):
    total_count = len(query_history)

    sorted_history = sorted(query_history, key=lambda x: x.timestamp, reverse=True)

    paginated_history = sorted_history[offset : offset + limit]

    return QueryHistory(queries=paginated_history, total_count=total_count)


@app.delete("/api/history")
async def clear_history():
    global query_history
    query_history = []
    return {"message": "Query history cleared successfully"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
