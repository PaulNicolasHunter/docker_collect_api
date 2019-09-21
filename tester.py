import requests
import pandas as pd
import json

dat = pd.read_excel('dummy_data.xlsx')
data = {
    "cols": list(dat.columns.values), 
}
for _ in dat:
   data.update({_: dat[_].values.tolist()}) 

a = requests.post( 'http://localhost:3000/upload',  data=data)

print(a.text)
