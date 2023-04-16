# Project Information Visualization

## API key

Available at: https://data.nasdaq.com/sign-up

Once you have the API key, store it at `~/.nasdaq/data_link_apikey`, or export it as an environment variable:

```sh
export NASDAQ_DATA_LINK_API_KEY="YOUR_KEY_HERE"
```

## Dependencies

Using `conda`:

```sh
# Create a new virtual environment in the folder venv:
$ conda env create -y -f environment.yml -p ./venv
# Activate the virtual environment in the current shell session:
$ conda activate ./venv
```

Using `venv`:

```sh
# Create a new virtual environment in the folder venv:
$ python3 -m venv venv
# Activate the virtual environment in the current shell session:
$ source venv/bin/activate
# Install the dependencies:
$ pip install -r requirements.txt
```

TODO:

- [ ] Landen kiezen
- [ ] Target user definieren
- [ ] Visualisaties kiezen
- [ ] Gantt chart maken
