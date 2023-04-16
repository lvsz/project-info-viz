#!/usr/bin/env python3
from bokeh.plotting import figure, show, output_file
import nasdaqdatalink as quandl

bigmac = {'USA': quandl.get('ECONOMIST/BIGMAC_USA', start_date='2000-01-01')['dollar_price'],
          'BEL': quandl.get('ECONOMIST/BIGMAC_BEL', start_date='2000-01-01')['dollar_price'],
          'EUR': quandl.get('ECONOMIST/BIGMAC_EUR', start_date='2000-01-01')['dollar_price'],
          'JPN': quandl.get('ECONOMIST/BIGMAC_JPN', start_date='2000-01-01')['dollar_price']}

# consumer price index
cpi = {'USA': quandl.get('RATEINF/CPI_USA', start_date='2000-01-01')['Value']}

output_file("bokeh_graph.html")

# inspect some data
x = bigmac['USA'].keys()
y1 = bigmac['USA'].values
y2 = bigmac['EUR'].values
print(bigmac['EUR'])

# create a new plot with a title and axis labels
p = figure(
    title="Big Mac Index",
    x_axis_label="Time",
    x_axis_type="datetime",
    y_axis_label="USD"
)

# add multiple renderers
p.line(x, y1, legend_label="USA", color="red", line_width=2)
p.line(bigmac['BEL'].keys(), bigmac['BEL'], legend_label="Belgium",
       color="yellow", line_width=2)
p.line(bigmac['EUR'].keys(), bigmac['EUR'],
       legend_label="Euro", color="blue", line_width=2)
p.line(bigmac['JPN'].keys(), bigmac['JPN'],
       legend_label="Japan", color="green", line_width=2)

# show the results
show(p)
