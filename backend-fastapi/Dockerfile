# Use official Python 3.11 image
FROM python:3.11-slim

# Set working folder inside container
WORKDIR /app

# Copy requirements file first (faster builds)
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code
COPY . .

# Expose port 8000 (FastAPI default)
EXPOSE 8000

# Command to run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
