const express = require('express')
const redis = require('ioredis')
const Queue = require('bull');
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ limit: '100mb' })); // set the limit here
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
const upload = new Queue('upload', {redis: {host: 'redis-server', port: 6379}})
const stop = new Queue('stop', {redis: {host: 'redis-server', port: 6379}})
const jobs = new Queue('jobs', {redis: {host: 'redis-server', port: 6379}})
const client = redis.createClient({port: 6379, host:'redis-server'})
const port = 3000

client.on('connect', () => {
    console.log('connected')
})

client.on('error', (e) => {
    console.log(e)
})

/* upload process queue */
upload.process((job) => {

    let dat = job.data; // first element is the array name and second is the actual data which we unpack. 
    try {
        let res = client.rpush(dat[0].toString(), ...dat[1])
        return Promise.resolve(res)
    } catch (error) {
        return Promise.resolve(error)
    }
})

/* abort process queue */
stop.process((job, done) => {

    upload.pause().then(() => {
        upload.empty().then((e) => {
            done()
        }).catch(e => console.log(e))
    }).catch(e => console.log(e))
})

/* main process */
jobs.process((job, done) => {

    try {
        let data = job.data;

        if (data.type === 'upload') {
            upload.add(data.data).then((e) => done(e)).catch(e => console.log(46))
        }
        else {
            stop.add().then(() => done()).catch(e => console.log(e))
        }

    } catch (error) {
        console.log(error)
    }

})

app.get('/', (res, req) => {

    req.send('hello')
})

/* upload route end-point */
/*
    expected data structure for post ->
    {
    attribs : ['name', 'age', 'DOB'],
    name: ['jay', 'ron', 'katy'...],
    age: [25, 42, 21 ...],
    DOB: ['2/5/1994', '5/3/1977', '6/8/1998'...],
    }
*/

app.post('/upload', (req, res) => {

    let dat = req.body
    let cols = dat.cols

    let loop = new Promise((resolve, reject) => { // primisifying it so that we don't get any re-setting of headers problem in the response seindin g
        cols.forEach(async element => {
            await jobs.add({ type: "upload", data: [element, dat[element]] }).then(() => {
                console.log(`query string ${element} uploaded successfully`)
            }).catch(e => reject(e))
        })
        resolve()
    })

    loop.then(() => {
        res.sendStatus(200)
    }).catch((e) => console.log(e))
})

/* abort route end-point */
app.post('/abort', (req, res) => {

    jobs.add({ type: "abort" }).then(() => {

        console.log('job aborted')
        res.sendStatus(200)

    }).catch(e => console.log(e))
})

app.use('*', (req, res) => {
    res.send('invaid endpoint kindly contact me, <3');
})

app.listen(port, () => {
    console.log(`listening at port ${port}`)
})