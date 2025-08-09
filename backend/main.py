from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, AsyncGenerator
from datetime import datetime
import google.generativeai as genai
import os
from dotenv import load_dotenv
import uuid
import json
import asyncio

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


@app.post("/api/query/stream")
async def process_query_stream(request: QueryRequest):
    async def generate_stream() -> AsyncGenerator[str, None]:
        try:
            start_time = datetime.now()
            query_id = str(uuid.uuid4())
            
            # Send initial metadata
            yield f"data: {json.dumps({'type': 'metadata', 'id': query_id, 'question': request.question, 'timestamp': start_time.isoformat()})}\n\n"
            
            enhanced_prompt = f"""You are an expert travel assistant. Please provide comprehensive, accurate, and well-structured information for the following travel-related question.

Question: {request.question}

Please format your response in a clear, organized manner with:
- Bullet points for lists
- Clear sections if needed
- Specific details and requirements
- Any important tips or warnings

Keep the response informative but concise."""
            
            # Generate streaming response
            response = model.generate_content(enhanced_prompt, stream=True)
            
            full_answer = ""
            for chunk in response:
                if chunk.text:
                    full_answer += chunk.text
                    # Send each chunk as SSE
                    yield f"data: {json.dumps({'type': 'content', 'content': chunk.text})}\n\n"
                    await asyncio.sleep(0.01)  # Small delay for smooth streaming
            
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()
            
            # Save to history
            query_response = QueryResponse(
                id=query_id,
                question=request.question,
                answer=full_answer,
                timestamp=start_time,
                processing_time=processing_time,
            )
            query_history.append(query_response)
            
            if len(query_history) > 100:
                query_history.pop(0)
            
            # Send completion signal
            yield f"data: {json.dumps({'type': 'done', 'processing_time': processing_time})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

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
