FROM python:3.6       
ADD . /rumour
WORKDIR /rumour

RUN pip install -r requirements.txt
ENTRYPOINT ["python", "api.py"]
