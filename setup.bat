@echo off
echo Setting up Travel Assistant Application...
echo.

echo Installing Backend Dependencies...
cd backend
python -m venv .venv
call .venv\Scripts\activate
pip install -r requirements.txt
echo Backend setup complete!
echo.

echo Installing Frontend Dependencies...
cd ../frontend
npm install
echo Frontend setup complete!
echo.

echo.
echo Setup complete! 
echo.
echo To run the application:
echo 1. Start the backend: cd backend && python main.py
echo 2. Start the frontend: cd frontend && npm run dev
echo.
echo Don't forget to add your Gemini API key to backend/.env file!
pause