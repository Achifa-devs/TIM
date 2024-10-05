FROM python:3.10.15

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV FLASK_APP app.py

RUN apt-get update && apt-get install -y libgl1-mesa-dev

RUN mkdir /server

WORKDIR /server

COPY ./requirements.txt /server

RUN pip install --upgrade pip && \
    pip install -r requirements.txt 

COPY ./ /server

EXPOSE 5000
EXPOSE 8000
EXPOSE 10000

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--reload", "--debug"]

