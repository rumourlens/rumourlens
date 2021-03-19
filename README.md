
# exRumourLens
exRumourLens: Early Rumour Detection with Multi-View Explanations

# Prerequisites
### Installation
This repo is tested on Python 3.6.8.
You should install this program on [conda](https://docs.conda.io/projects/conda/en/latest/index.html).<br>
If you're unfamiliar with conda, check out the [user guide](https://docs.conda.io/projects/conda/en/latest/user-guide/index.html). <br>
Create a conda environment with the version of Python you're going to use and activate it. <br>
You should also install the additional packages required by this project:

```
pip install -r requirements.txt
```
### Database
Please contact us to receive the dataset.

This project use [PostgreSQL](https://www.postgresql.org/) which has version 12.0 for purpose of saving data.  
Firstly, you must install PostgreSQL 12.0 and create a database with the following configurations:
```
dbuser='rumourlens',
dbpass='rumourlens2@21',
dbhost='localhost',
dbname='rumourlens'
``` 
Or you can modify app/config.py to match with your DB config.


# Running
To run the app:<br>
```
python api.py
```
Your app will be run on the url: <!-- markdownlint-capture --> [http://localhost:8888/](http://localhost:8888/)


