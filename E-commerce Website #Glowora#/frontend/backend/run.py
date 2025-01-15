import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",  # Allows external connections
        port=8000,
        reload=True,      # Auto-reload on code changes
        workers=1         # Number of worker processes
    ) 