import sys
import pandas as pd
import glob
import shutil

def combine_excels(source_file):
    destination_file = f"{source_file}.xlsx"
    files = glob.glob(f"{source_file}/*.xlsx")
    
    df_combined = pd.DataFrame()

    for f in files:
        print(f"Reading {f}")
        df_source = pd.read_excel(f, sheet_name="scans")
        df_combined = pd.concat([df_combined, df_source], ignore_index=True)

    print(f"Saving the combined data to {destination_file}...")
    df_combined.to_excel(destination_file, index=False)

    print("Program has finished running!")

    # Optionally delete the folder (uncomment if needed)
    shutil.rmtree(source_file)

if __name__ == "__main__":
    combine_excels(sys.argv[1])
