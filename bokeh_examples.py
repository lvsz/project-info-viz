#!/usr/bin/env python3
import random
import pandas as pd
import nasdaqdatalink as quandl
from bokeh.plotting import figure, show, output_file
from bokeh.models import ColumnDataSource

#bigmac = {'USA': quandl.get('ECONOMIST/BIGMAC_USA', start_date='2000-01-01')['dollar_price'],
#          'BEL': quandl.get('ECONOMIST/BIGMAC_BEL', start_date='2000-01-01')['dollar_price'],
#          'EUR': quandl.get('ECONOMIST/BIGMAC_EUR', start_date='2000-01-01')['dollar_price'],
#          'JPN': quandl.get('ECONOMIST/BIGMAC_JPN', start_date='2000-01-01')['dollar_price']}

# keys for inflation data, values for big mac data
zones = {
    'EUR': 'EUZ',
    'USA': 'USA',
    'JPN': 'JPN',
    'CHE': 'CHE',
    'GBR': 'GBR', 
    'AUS': 'AUS', 
    'CAN': 'CAN', 
    'NZL': 'NZL',
    'RUS': 'RUS',
    'ARG': 'ARG',
    }

bigmac_data = pd.read_csv("data/bigmac/adjusted-index.csv")

bigmac = {zone: bigmac_data[bigmac_data['iso_a3'] == zone]['dollar_price'] for zone in zones.values()}

# consumer price index
#cpi = {zone: quandl.get(f'RATEINF/CPI_{zone}', start_date='2000-01-01')['Value'] for zone in cpi_zones}
cpi_data = {zone: pd.read_csv(f"data/rateinf/CPI_{zone}.csv") for zone in zones.keys()}

output_file("example_graph.html")

# inspect some data
x = bigmac['USA'].keys()
y1 = bigmac['USA'].values
y2 = bigmac['EUZ'].values
print(bigmac['EUZ'])

# create a new plot with a title and axis labels
p = figure(
    title="Big Mac Index",
    x_axis_label="Time",
    x_axis_type="datetime",
    y_axis_label="USD"
)

# add multiple renderers
#p.line(x, y1, legend_label="USA", color="red", line_width=2)
#p.line(bigmac['AUS'].keys(), bigmac['AUS'], legend_label="Australia",
#       color="yellow", line_width=2)
#p.line(bigmac['EUZ'].keys(), bigmac['EUZ'], legend_label="Euro",
#       color="blue", line_width=2)
#p.line(bigmac['JPN'].keys(), bigmac['JPN'], legend_label="Japan",
#       color="green", line_width=2)
def byte_gen(seed=100, lim=30_000, rand=False):
    if rand:
        random.seed(seed)
        while lim > 0:
            lim -= 1
            yield random.randint(0, 0xFF)
    else:
        while lim > 0:
            lim -= 1
            yield seed
            seed = (seed + 107) % 0x100

def color_gen(gen=byte_gen()):
    cont = True
    while cont:
        try:
            rgb = tuple(gen.send(None) for _ in range(3))
            yield f"rgb{rgb}"
        except:
            cont = False

gen_color = lambda: color_gen().send(None)

for cpi, mac in zones.items():
    p.line(bigmac[mac].keys(), bigmac[mac],
           legend_label=cpi, color=gen_color(), line_width=3)

if __name__ == '__main__':
       # show the results
       show(p)
