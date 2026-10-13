FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the networksecurity package and install it
COPY networksecurity/ ./networksecurity/
COPY setup.py .
RUN pip install --no-cache-dir -e .

# Copy application files
COPY app.py .
COPY templates/ ./templates/
COPY final_model/ ./final_model/
COPY Network_Data/ ./Network_Data/
COPY data_schema/ ./data_schema/

# Create directories the app expects at runtime
RUN mkdir -p prediction_output logs

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
