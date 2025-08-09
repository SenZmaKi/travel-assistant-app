# Travel Assistant - AI-Powered Q&A System

A modern web application that serves as an interactive Q&A system for travel-related queries using Gemini AI integration. Built with Next.js (frontend) and FastAPI (backend).

## Features

- **AI-Powered Responses**: Get instant, comprehensive answers to travel questions using Google's Gemini AI
- **Streaming Responses**: Real-time streaming responses like ChatGPT for enhanced user experience
- **Modern UI**: Clean, responsive interface with glass morphism effects built with Next.js and TailwindCSS
- **Query History**: View and manage your previous queries with expand/collapse functionality
- **Keyboard Shortcuts**: Press Enter to send queries quickly
- **Real-time Processing**: Loading animations and error handling for smooth user experience
- **API Documentation**: Automatic Swagger documentation accessible from the frontend
- **Performance Tracking**: Response time monitoring for each query with visual indicators
- **Beautiful Animations**: Gradient animations, floating elements, and smooth transitions

## Tech Stack

### Backend

- **Python 3.8+** with **FastAPI** framework
- **Google Gemini AI** (gemini-1.5-flash) for natural language processing
- **Server-Sent Events (SSE)** for real-time streaming responses
- **Pydantic** for data validation
- **CORS** middleware for cross-origin requests
- **Uvicorn** ASGI server with async support

### Frontend

- **Next.js 14** with App Router (latest version)
- **TypeScript** for type safety
- **TailwindCSS** for modern styling with custom animations
- **React Markdown** for formatted responses
- **EventSource API** for real-time streaming
- **React Context** for state management
- **Lucide React** for beautiful icons

## Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn package manager
- Google Gemini API key (free tier)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd travel-assistant-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env

# Edit .env file and add your Gemini API key
# Get your free API key from: https://makersuite.google.com/app/apikey
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# The .env.local file is already configured with default API URL
# If you change the backend port, update NEXT_PUBLIC_API_URL in .env.local
```

## Running the Application

### Start Backend Server

```bash
# From the backend directory
cd backend
python main.py

# The API will be available at http://localhost:8000
# Swagger documentation at http://localhost:8000/docs
```

### Start Frontend Development Server

```bash
# From the frontend directory (in a new terminal)
cd frontend
npm run dev

# The application will be available at http://localhost:3000
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter your travel-related question in the input field
3. Click the send button or press **Enter** for quick submission
4. Watch as the AI streams the response in real-time
5. Access **API Documentation** directly from the header button
6. View your query history below with expand/collapse options
7. Clear history anytime using the "Clear History" button

### Example Queries

- "What documents do I need to travel from Kenya to Ireland?"
- "What are the best months to visit Japan?"
- "How do I apply for a Schengen visa?"
- "What vaccinations do I need for traveling to Brazil?"
- "What's the baggage allowance for international flights?"

## API Endpoints

### Core Endpoints

- `POST /api/query` - Submit a question and get AI response (legacy)
- `POST /api/query/stream` - Submit a question and get streaming AI response
- `GET /api/history` - Retrieve query history (with pagination support)
- `DELETE /api/history` - Clear query history
- `GET /health` - Check API health status
- `GET /docs` - Interactive Swagger API documentation

### Request/Response Examples

#### Submit Streaming Query

```json
POST /api/query/stream
{
  "question": "What documents do I need for UK visa?"
}

Streaming Response (Server-Sent Events):
event: metadata
data: {"id": "uuid", "question": "What documents...", "timestamp": "2025-01-22T10:30:00"}

event: content
data: For a UK visa, you typically need...

event: content
data: additional content chunks...

event: done
data: {"processing_time": 1.5}
```

#### Get History

```json
GET /api/history?limit=10
Response:
{
  "queries": [...],
  "total": 15,
  "limit": 10,
  "offset": 0
}
```

## Project Structure

```
travel-assistant-app/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── .env                 # Environment variables (create from .env.example)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx        # Main page component
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── Header.tsx      # Header with API docs button
│   │   ├── Footer.tsx      # Footer component
│   │   ├── QueryInput.tsx  # Input with Enter key support
│   │   ├── QueryResponse.tsx # Response display
│   │   ├── StreamingQueryResponse.tsx # Real-time streaming display
│   │   ├── QueryHistory.tsx  # History with expand/collapse
│   │   └── LoadingAnimation.tsx # Loading state
│   ├── lib/
│   │   └── api.ts          # API client
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── package.json        # Node dependencies
│   ├── tailwind.config.ts  # Tailwind configuration
│   └── .env.local          # Frontend environment variables
│
└── README.md               # Documentation
```

## Environment Variables

### Backend (.env)

```
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Backend Deployment (Example with Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

## Performance Optimization

- **Streaming Responses**: Real-time content delivery for faster perceived performance
- **Pagination**: History queries support limit/offset parameters
- **Optimized Animations**: Smooth CSS transitions and GPU-accelerated effects
- **Code Splitting**: Next.js automatic code splitting for faster loading
- **Efficient State Management**: React Context for minimal re-renders

## Security Considerations

- API key stored in environment variables
- Input validation on both frontend and backend
- CORS configured for specific origins
- Rate limiting can be added for production

## Troubleshooting

### Backend Issues

1. **API Key Error**: Ensure your Gemini API key is valid and properly set in .env
2. **Port Already in Use**: Change the port in main.py or kill the process using port 8000
3. **Module Not Found**: Ensure all dependencies are installed with `pip install -r requirements.txt`
4. **Streaming Not Working**: Check that the Gemini model (gemini-1.5-flash) is accessible

### Frontend Issues

1. **API Connection Failed**: Ensure backend is running on the correct port
2. **Streaming Not Working**: Check browser support for EventSource API
3. **Build Errors**: Clear node_modules and reinstall with `npm install`
4. **Styling Issues**: Ensure TailwindCSS is properly configured
5. **Enter Key Not Working**: Ensure QueryInput component is properly imported

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is created for the Pawa IT Solutions technical assessment.

## Contact

For any queries or issues, please reach out through the GitHub repository.
