# Project Information Visualization

## API key

Available after creating an account at: <https://data.nasdaq.com/account/profile>

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

- Landen:
  - [ ] Landen kiezen
  - [ ] Highlights zoeken waar op gefocust kan worden
  - [ ] Extra data sources zoeken voor correlaties
- Target user:
  - [x] Formeel definieren
  - [x] Target platform (website/print/presentatie?)
  - [ ] Data aanpassen aan target user (?)
  - [ ] Visualisatie aanpassen aan target user
  - [ ] Presentatie aanpassen aan target user
- Visualisaties:
  - [ ] Visualisaties kiezen
  - [ ] Prototypes maken

Markets:

- EU
- USA
- UK
- Japan
- Switzerland
- Canada
- Australia
