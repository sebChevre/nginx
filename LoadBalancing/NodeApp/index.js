
var getRandom255 = function () {
    console.log(Math.floor(Math.random() * 255))
    return Math.floor(Math.random() * 255);
};

var getRandomColour = function (){

    var color = 'rgba(' + getRandom255() +', ' + getRandom255() +', ' +getRandom255() +', 1)'
    console.log(color)
    return color
    
};

$(function () {
    
    var countByPathChart;

    setInterval(function(){ 
        alert("Hello"); 
    }, 3000);


    var labels= []
    
    //map : key[path] --> map : key[method] --> count  
    var countByPath = new Map()
    var timeByPath = new Map()

    $.getJSON('/api/hostname')
        .done(function(data) {
            $('#hostname').html(data.hostname);
            $('#update_date').html(new Date());
    });

    $.getJSON('/api/stats')
        .done(function(data) {

            //path iteration
            for (var path in data){
                console.log(path)
                labels.push(path)

                //method iteration
                for (var method in data[path]){
                    var pathCount = 0
                    var minDuration = 0
                    
                    if(!countByPath.has(path)){
                        countByPath.set(path,new Map())
                        timeByPath.set(path, new Map())
                    }

                    //statusCode iteration sur code de status
                    for(var statusCode in data[path][method]){
                        
                        var pathByMethodCount = 0;
                        //nombre d'appel au path par méthode
                        pathCount += data[path][method][statusCode].count

                        var duration = {}
                        //TODO voir plusieurs sttaus code 
                        duration.minDuration = data[path][method][statusCode].minDuration
                        duration.maxDuration = data[path][method][statusCode].maxDuration
                        //var methodCount = countByMethod.has(method) ? countByMethod.get(method) + pathCount : pathCount
                        //countByMethod.set(method,methodCount);
                        
                        pathByMethodCount += pathCount
                        countByPath.set(path,countByPath.get(path).set(method,pathByMethodCount))
                        timeByPath.set(path,timeByPath.get(path).set(method,duration))
                    }
                    //countByPath.push(pathCount)
                    //countByPath.set(path,pathCount)
                }
            }

            //console.log(countByMethod)
            console.log(countByPath)

            var totalRequestCount = 0;
            [...countByPath.values()].forEach(element => {
                totalRequestCount += [...element.values()].reduce((a,b) => a + b)
            });
            //var totalRequestCount =[...[...countByPath.values()].values()].reduce((a,b) => a + b)
            
            
            var pathCountDataset = new Map();
            var timeMeasureDataset = new Map();
            
            //parcours des valeurs méthodes
            fillpathCountDataset(countByPath, pathCountDataset);
            fillTimeMeasureDataset(timeByPath, timeMeasureDataset)

            countByPathChart = renderPathCountGraph(countByPath, pathCountDataset, totalRequestCount);
            renderTimeMeasureGraph(timeByPath, timeMeasureDataset, totalRequestCount);
        });
})

function renderTimeMeasureGraph(timeByPath, timeMeasureDataset, totalRequestCount) {
    var ctx = document.getElementById('timeChart');
    var delayed;
    var timeMeasureChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [...timeByPath.keys()],
            datasets: [...timeMeasureDataset.values()]
        },
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 300 + context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: `${totalRequestCount} requêtes`
                }
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true
                }
            }
        }
    });
}

function renderPathCountGraph(countByPath, pathCountDataset, totalRequestCount) {
    var ctx = document.getElementById('myChart');
    var delayed;
    var countByPathChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [...countByPath.keys()],
            datasets: [...pathCountDataset.values()]
        },
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 300 + context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: `${totalRequestCount} requêtes`
                }
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true
                }
            }
        }
    });

    return countByPathChart;
}

function fillpathCountDataset(countByPath, pathCountDataset) {
    var valuesIterationCount = 0;
            
    [...countByPath.values()].forEach(element => {

        //pacrours des clés (méthodes http)
        [...element.keys()].forEach(key => {

            if (!pathCountDataset.has(key)) {

                var dataset = {};
                dataset.label = `${key}`;
                dataset.data = [];
                dataset.backgroundColor = [getRandomColour()];
                dataset.borderColor = [getRandomColour()];

                dataset.borderWidth = 1;

                var dataCount = element.has(key) ? element.get(key) : 0;

                dataset.data = new Array(countByPath.size).fill(0);
                dataset.data.splice(valuesIterationCount, 0, dataCount);
                console.log(valuesIterationCount);
                pathCountDataset.set(key, dataset);

            } else {

                var dataset = pathCountDataset.get(key);
                var dataCount = element.has(key) ? element.get(key) : 0;
                pathCountDataset.get(key).data.splice(valuesIterationCount, 0, dataCount);
                console.log(valuesIterationCount);
            }


        });

        valuesIterationCount++;
    });
    
}

function fillTimeMeasureDataset(timeByPath, timeMeasureDataset) {
    var valuesIterationCount = 0;
            
    [...timeByPath.values()].forEach(element => {

        //pacrours des clés (méthodes http)
        [...element.keys()].forEach(key => {

            if (!timeMeasureDataset.has(key + " min")) {

                var minDataset = {};
                minDataset.label = `${key} - min`;
                minDataset.data = [];
                minDataset.backgroundColor = [getRandomColour()];
                minDataset.borderColor = [getRandomColour()];
                minDataset.stack = `${key}min`
                minDataset.borderWidth = 1;

                //var measureCount = {}
                var min = element.has(key) ? element.get(key).minDuration : 0;
                //measureCount.max = element.has(key) ? element.get(key).maxDuration : 0;
                
                //var dataCount = element.has(key) ? element.get(key) : 0;

                //console.log(measureCount)
                minDataset.data = new Array(timeByPath.size).fill(0);
                minDataset.data.splice(valuesIterationCount, 0, min);
                //minDataset.data.splice(valuesIterationCount+1, 0, measureCount.max);
                //console.log(valuesIterationCount);
                timeMeasureDataset.set(key + " min", minDataset);
            }else{
                var minDataset = timeMeasureDataset.get(key + " min");
                //var measureCount = {}
                var min = element.has(key) ? element.get(key).minDuration : 0;
                //measureCount.max = element.has(key) ? element.get(key).maxDuration : 0;
                minDataset.data.splice(valuesIterationCount, 0, min);
                //minDataset.data.splice(valuesIterationCount+1, 0, measureCount.man);
            }

            if (!timeMeasureDataset.has(key + " max")) {
                var maxDataset = {};
                maxDataset.label = `${key} - max`;
                maxDataset.data = [];
                maxDataset.backgroundColor = [getRandomColour()];
                maxDataset.borderColor = [getRandomColour()];
                maxDataset.stack = `${key}max`
                maxDataset.borderWidth = 1;

                //var measureCount = {}
                var max = element.has(key) ? element.get(key).maxDuration : 0;
                //measureCount.max = element.has(key) ? element.get(key).maxDuration : 0;
                
                //var dataCount = element.has(key) ? element.get(key) : 0;

                //console.log(measureCount)
                maxDataset.data = new Array(timeByPath.size).fill(0);
                maxDataset.data.splice(valuesIterationCount, 0, max);


                
                timeMeasureDataset.set(key + " max", maxDataset);
            } else {

                
                var maxDataset = timeMeasureDataset.get(key + " max");
                //var measureCount = {}
                var max = element.has(key) ? element.get(key).maxDuration : 0;
                //measureCount.max = element.has(key) ? element.get(key).maxDuration : 0;
                maxDataset.data.splice(valuesIterationCount, 0, max);

                console.log(valuesIterationCount);
            }

            
        });
        valuesIterationCount ++;
        
    });
    
    console.log(timeMeasureDataset)
}
