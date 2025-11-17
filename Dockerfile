# ================================
# 1) Base Python image
# ================================
FROM python:3.12-slim

# ================================
# 2) Set working directory
# ================================
WORKDIR /code

# ================================
# 3) Install system deps
# ================================
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ================================
# 4) Copy requirements
# ================================
COPY requirements.txt /code/

RUN pip install --no-cache-dir -r requirements.txt

# ================================
# 5) Copy Django project
# ================================
COPY . /code/

# ================================
# 6) Expose port
# ================================
EXPOSE 8000

# ================================
# 7) Default command (overwritten by docker-compose)
# ================================
CMD ["python", "backend/manage.py", "runserver", "0.0.0.0:8000"]
