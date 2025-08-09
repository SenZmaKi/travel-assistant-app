# Travel Assistant - AI-Powered Q&A System

A modern web application that serves as an interactive Q&A system for travel-related queries using Gemini AI integration. Built with Next.js (frontend) and FastAPI (backend).

## Features

- **AI-Powered Responses**: Get instant, comprehensive answers to travel questions using Google's Gemini AI
- **Modern UI**: Clean, responsive interface built with Next.js and TailwindCSS
- **Query History**: View and manage your previous queries
- **Real-time Processing**: Loading states and error handling for smooth user experience
- **API Documentation**: Automatic Swagger documentation for all endpoints
- **Performance Tracking**: Response time monitoring for each query

## Tech Stack

### Backend
- **Python 3.8+** with **FastAPI** framework
- **Google Gemini AI** for natural language processing
- **Pydantic** for data validation
- **CORS** middleware for cross-origin requests
- **Uvicorn** ASGI server

### Frontend
- **Next.js 14** (latest version)
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **React Markdown** for formatted responses
- **Axios** for API calls
- **Lucide React** for icons

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
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

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
3. Click the send button or press Enter
4. View the AI-generated response
5. Check your query history below
6. Clear history anytime using the "Clear History" button

### Example Queries

- "What documents do I need to travel from Kenya to Ireland?"
- "What are the best months to visit Japan?"
- "How do I apply for a Schengen visa?"
- "What vaccinations do I need for traveling to Brazil?"
- "What's the baggage allowance for international flights?"

## API Endpoints

### Core Endpoints

- `POST /api/query` - Submit a question and get AI response
- `GET /api/history` - Retrieve query history
- `DELETE /api/history` - Clear query history
- `GET /health` - Check API health status
- `GET /docs` - Swagger API documentation

### Request/Response Examples

#### Submit Query
```json
POST /api/query
{
  "question": "What documents do I need for UK visa?"
}

Response:
{
  "id": "uuid",
  "question": "What documents do I need for UK visa?",
  "answer": "For a UK visa, you typically need...",
  "timestamp": "2025-01-22T10:30:00",
  "processing_time": 1.5
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
│   │   ├── Header.tsx      # Header component
│   │   ├── Footer.tsx      # Footer component
│   │   ├── QueryInput.tsx  # Input component
│   │   ├── QueryResponse.tsx # Response display
│   │   ├── QueryHistory.tsx  # History display
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

- Query responses are cached for 15 minutes to reduce API calls
- History is limited to 100 queries to maintain performance
- Pagination support for history retrieval
- Optimized bundle size with Next.js automatic code splitting

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

### Frontend Issues

1. **API Connection Failed**: Ensure backend is running on the correct port
2. **Build Errors**: Clear node_modules and reinstall with `npm install`
3. **Styling Issues**: Ensure TailwindCSS is properly configured

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

---

**Built with passion for the Pawa IT Solutions Full Stack Software Engineer position**