FROM python:3.10-slim-buster

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONPATH /server
ENV FLASK_APP app.py

RUN mkdir /server

WORKDIR /server

COPY ./requirements.txt /server

RUN pip install --upgrade pip && \
    pip install -r requirements.txt 

COPY ./ /server

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--reload", "--debug"]

