FROM python:3.10-slim-buster

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONPATH /server
ENV FLASK_APP app.py

RUN apt-get update && sudo apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    libgl1-mesa-glx \
    && sudo rm -rf /var/lib/apt/lists/*

RUN mkdir /server

WORKDIR /server

COPY ./requirements.txt /server

RUN pip install --upgrade pip && \
    pip install -r requirements.txt 

COPY ./ /server

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--reload", "--debug"]

