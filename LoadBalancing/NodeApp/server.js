var express =require('express');
var fs = require('fs');
var os = require('os');
var app = express();

const FILE_PATH = 'stats.json'
const FILE_MESSAGE_PATH = 'message.json'
const WELCOME_FILE_PATH = 'index.html'

// read json object from file
const readStats = () => {
    let result = {}
    try {
        result = JSON.parse(fs.readFileSync(FILE_PATH))
    } catch (err) {
        console.error(err)
    }
    return result
}

const readMessages = () => {
    let result = {}
    try {
        result = JSON.parse(fs.readFileSync(FILE_MESSAGE_PATH))
    } catch (err) {
        console.error(err)
    }
    return result
}

// dump json object to file
const dumpStats = (stats) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(stats), { flag: 'w+' })
    } catch (err) {
        console.error(err)
    }
}

// dump json object to file
const writeMessage = (message) => {
    try {
        fs.writeFileSync(FILE_MESSAGE_PATH, JSON.stringify(message), { flag: 'w+' })
    } catch (err) {
        console.error(err)
    }
}

const clearFiles = () => {
    try {
        fs.unlinkSync(FILE_PATH)
        fs.writeFileSync(FILE_PATH, "{}", { flag: 'w+' })
        fs.unlinkSync(FILE_MESSAGE_PATH)
        fs.writeFileSync(FILE_MESSAGE_PATH, "[]", { flag: 'w+' })
    } catch (err) {
        console.error(err)
    }

    console.log("clar")
}

const getRoute = (req) => {
    const route = req.route ? req.route.path : '' // check if the handler exist
    const baseUrl = req.baseUrl ? req.baseUrl : '' // adding the base url if the handler is child of other handler

    return route ? `${baseUrl === '/' ? '' : baseUrl}${route}` : 'unknown route'
}

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)

    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

function initCountObject(countObj, method, statusCode,durationInMilliseconds) {
    countObj.count = 1;
    countObj.maxDuration = durationInMilliseconds;
    countObj.minDuration = durationInMilliseconds;
}

app.use(express.json());


app.use((req, res, next) => {

    var start = process.hrtime()
 
    res.on("finish", () => {
        const stats = readStats()

        const path = `${getRoute(req)}`
        const method = `${req.method}`
        const statusCode = `${res.statusCode}`
        
        
        console.log ("s" + statusCode)
        //const event = `${req.method} ${getRoute(req)} ${res.statusCode}`
        const countObj = {
            
        }
        
        const durationInMilliseconds = getDurationInMilliseconds (start)

        
        if(stats[path]){

            if(stats[path][method]){

                if(stats[path][method][statusCode]){
                    countObj.count = stats[path][method][statusCode].count + 1
            
                    const maxDuration = stats[path][method][statusCode].maxDuration ? stats[path][method][statusCode].maxDuration : 0
                    const minDuration = stats[path][method][statusCode].minDuration ? stats[path][method][statusCode].minDuration : 0

                    countObj.maxDuration = maxDuration < durationInMilliseconds ? durationInMilliseconds : maxDuration
                    countObj.minDuration = minDuration > durationInMilliseconds ? durationInMilliseconds : minDuration

                    console.log("1a " + JSON.stringify(stats))
                    console.log("1b " + JSON.stringify(countObj))

                    stats[path][method][statusCode] = countObj

                    console.log("1." + JSON.stringify(stats))
                }else{
                    initCountObject(countObj, method, statusCode, durationInMilliseconds);
                    stats[path][method][statusCode] = countObj
                    console.log("2." + stats)
                }
                
            }else{
                
                initCountObject(countObj, method, statusCode, durationInMilliseconds);
                stats[path][method] = {}
                stats[path][method][statusCode] = countObj
                console.log("3a." + stats)
            }

        }else{
            initCountObject(countObj, method, statusCode, durationInMilliseconds);
            stats[path] = {}
            stats[path][method] = {}
            stats[path][method][statusCode] = countObj
            console.log("3b." + stats)
        } 
        

        //stats[path] = countObj
        console.log(stats)
        dumpStats(stats)
        console.log(`${req.method} ${getRoute(req)} ${res.statusCode}`) 
        
        console.log("duration: " +durationInMilliseconds.toLocaleString() + " ms");
    })
    next()
 })
 
app.get('/',function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile(WELCOME_FILE_PATH, function (err,data) {
        res.end(data);
    });
});

app.get('/index.js',function(req, res) {
    res.writeHead(200, {'Content-Type': 'application/javascript'});
    fs.readFile("index.js", function (err,data) {
        res.end(data);
    });
});

app.get('/api/hostname', function(req,res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({hostname: os.hostname()}));
});

app.get('/api/stats/', (req, res) => {
    res.json(readStats())
})

app.post('/api/message', (req, res) => {
    
    const messages = readMessages();
    console.log("body " + JSON.stringify(req.body))

    var msg = { 
        message: `${req.body.message}`,
        date: new Date().toLocaleString("fr-CH")
    }

    console.log(msg)

    messages.push(msg)

    writeMessage(messages)
    res.json(msg);
    
})

app.get('/api/message', (req, res) => {
    
    res.json(readMessages())    
})

app.listen(8080, function () {
    clearFiles();
    console.log('Server running at ' + os.hostname());
});



