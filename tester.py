import requests
import pandas as pd
import json

dat = pd.read_excel('dummy_data.xlsx')
data = {
    "cols": list(dat.columns.values), 
}
for _ in dat:
   data.update({_: dat[_].values.tolist()}) 

"""
    upload route end-point. Expected data structure for post, have a look at dummy_data.xlsx
    
    data ->
    {
        col : ['name', 'age', 'DOB'],
        name: ['jay', 'ron', 'katy'...],
        age: [25, 42, 21 ...],
        DOB: ['2/5/1994', '5/3/1977', '6/8/1998'...],
    }

"""
a = requests.post( 'http://localhost:3000/upload',  data=data)

print(a.text)
