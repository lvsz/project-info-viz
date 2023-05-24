#!/usr/bin/env python3
import pandas as pd

iso_codes = pd.read_csv("data/iso.csv")
currency_codes = pd.read_csv("data/country-code-to-currency-code-mapping.csv")

iso_codes = iso_codes.merge(currency_codes, left_on="alpha-2", right_on="CountryCode")

dataframes = []

for index, row in iso_codes.iterrows():
    try:
        df = pd.read_csv(f'https://data.nasdaq.com/api/v3/datasets/ECONOMIST/BIGMAC_{row["alpha-3"]}.csv?api_key=yevCWLs4uK6kBsztBiZy')
        if row["alpha-3"] == "EUR":
            df["iso_a3"] = "EUZ"
        else:
            df["iso_a3"] = row["alpha-3"] 
        df["currency_code"] = row["Code"]
        df["name"] = row["name"]
        dataframes.append(df)
    except:
        print(f'{row["alpha-3"]} does not have a dataset')


output = pd.concat(dataframes)
output = output.rename(columns={"Date": "date"})

output.to_csv("download-output.csv", index=False)