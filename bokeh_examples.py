#!/usr/bin/env python3
from bokeh.plotting import figure, show, output_file
import nasdaqdatalink as quandl

data = quandl.get('ECONOMIST/BIGMAC_USA', start_date='2000-01-01')['dollar_price']
data2 = quandl.get('ECONOMIST/BIGMAC_BEL', start_date='2000-01-01')['dollar_price']
data3 = quandl.get('ECONOMIST/BIGMAC_EUR', start_date='2000-01-01')['dollar_price']
data4 = quandl.get('ECONOMIST/BIGMAC_JPN', start_date='2000-01-01')['dollar_price']

output_file("bokeh_graph.html")

# inspect some data
x = data.keys()
y1 = data.values
y2 = data2.values
print(data2)

# create a new plot with a title and axis labels
p = figure(
        title="Big Mac Index",
        x_axis_label="Time",
        x_axis_type="datetime",
        y_axis_label="USD"
        )

# add multiple renderers
p.line(x, y1, legend_label="USA", color="red", line_width=2)
p.line(data2.keys(), data2, legend_label="Belgium", color="yellow", line_width=2)
p.line(data3.keys(), data3, legend_label="Euro", color="blue", line_width=2)
p.line(data4.keys(), data4, legend_label="Japan", color="green", line_width=2)

# show the results
show(p)
