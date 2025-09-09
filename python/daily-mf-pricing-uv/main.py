import sys
import pandas as pd
import numpy as np

# Pass the filename as argument.
file = sys.argv[1]

# Read the passed argument.
df = pd.read_csv(file, sep="\t")

# Clean the data.
df["minimum-seller-allowed-price"] = df["minimum-seller-allowed-price"].replace({r'\$|\,':''}, regex = True).astype(float)
df["maximum-seller-allowed-price"] = df["maximum-seller-allowed-price"].replace({r'\$|\,':''}, regex = True).astype(float)

# Discard columns that are not needed.
df = df.drop(columns=["quantity", "handling-time", "fulfillment-channel"])

# Query base on certain criterias.
min_over_30 = df.query("`minimum-seller-allowed-price` > 30")
min_less_10_max_less_15 = df.query("`minimum-seller-allowed-price` < 10 and `maximum-seller-allowed-price` < 15")
min_over_40_max_over_80 = df.query("`minimum-seller-allowed-price` > 40 and `maximum-seller-allowed-price` > 80")

# Empty rows have columns with the correct dtypes (like float, int, object) and pandas won't warn.
def create_empty_rows(n, columns, dtypes):
    data = {}
    for col, dtype in zip(columns, dtypes):
        if pd.api.types.is_numeric_dtype(dtype):
            data[col] = [np.nan] * n
        elif pd.api.types.is_string_dtype(dtype):
            data[col] = [pd.NA] * n
        else:
            data[col] = [np.nan] * n
    return pd.DataFrame(data, columns=columns)

# Validate df.query
def validate(data, expected_columns=None):
    if expected_columns is None:
        expected_columns = data.columns.tolist()

    if data.empty:
        dtypes = data.dtypes
        return create_empty_rows(10, expected_columns, dtypes)

    sample_size = min(len(data), 10)
    sampled = data.sample(sample_size)

    if sample_size < 10:
        n_missing = 10 - sample_size
        dtypes = data.dtypes
        empty_rows = create_empty_rows(n_missing, expected_columns, dtypes)
        result = pd.concat([sampled, empty_rows], ignore_index=True)
    else:
        result = sampled.reset_index(drop=True)

    return result

# Write data to text file.
output_file = 'sku.txt'

# Headers
expected_cols = df.columns.tolist()

# Initial write
random_10 = validate(df)
random_10.to_csv(output_file, sep='\t', mode='w', index=False)

# Append to output file
for subset in [min_over_30, min_less_10_max_less_15, min_over_40_max_over_80]:
    validated = validate(subset, expected_columns=expected_cols)
    validated.to_csv(output_file, sep='\t', index=False, mode='a', header=True)