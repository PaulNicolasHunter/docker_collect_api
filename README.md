# Docker Collect API 
An API to stimulate Collect platform data processing and aborting process.

## usage

**running the containers**
```
docker run -p 6379:6379 --name redis-server redis
docker run -p 3000:3000 --link redis-server paulnickhunter/mints-pie
```

**testing**
### install the pandas package for converting our data to testable data
```
pip install pandas
```
### testing out results.
```
python tester.py 
```
***

contact: choudhary.vivek98@gmail.com 
*:)*
