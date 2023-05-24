#!/usr/bin/env python3
import pandas as pd

iso_codes = pd.read_csv("data/iso.csv")

bigmac_data = pd.read_csv("download-output.csv")
bigmac_data = bigmac_data.merge(iso_codes[["alpha-3", "country-code"]], left_on="iso_a3", right_on="alpha-3")
bigmac_data = bigmac_data[["date", "iso_a3", "country-code", "currency_code", "name", "local_price", "dollar_price", "dollar_ex"]]
bigmac_data = bigmac_data.rename(columns={"country-code": "country_number"})

usa_prices = bigmac_data.loc[bigmac_data["iso_a3"] == "USA"][["date", "local_price"]].rename(columns={"local_price": "usa_price"})
bigmac_data = bigmac_data.merge(usa_prices, on="date", how='outer')

bigmac_data["dollar_ex_implied"] = bigmac_data["local_price"] / bigmac_data["usa_price"]


# bigmac_data = bigmac_data.loc[bigmac_data["dollar_ex"] > bigmac_data["dollar_ex_implied"]]

bigmac_data["over_under_valued"] = -(1 - bigmac_data["dollar_ex_implied"] / bigmac_data["dollar_ex"]) * 100

bigmac_data = bigmac_data.sort_values(by='date')

bigmac_data.to_csv("raw-index-valued.csv", index=False)