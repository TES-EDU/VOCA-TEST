import pandas as pd
import os

file_path = r'C:\Users\82107\Downloads\TES_APP\data-template\TES_VOCA_Lv1.xlsx'

try:
    df = pd.read_excel(file_path)
    print("Columns:", df.columns.tolist())
    print("First 3 rows:")
    print(df.head(3))
except Exception as e:
    print(f"Error reading file: {e}")
