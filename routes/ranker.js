var uberXrank = {
    'population weight': 0.7,
    'hispanic weight': 0,
    'income weight': 0.5,
    'no vehicle weight': 0.5,
    'one vehicle weight': 0.3,
    'family weight': 0.5,
    'workers weight': 0.5
}

var uberEsponalRank = {
    'population weight': 0.7,
    'hispanic weight': 1,
    'income weight': 0.5,
    'no vehicle weight': 0.5,
    'one vehicle weight': 0.3,
    'family weight': 0.5,
    'workers weight': 0.5
}

var uberSelectRank = {
    'population weight': 0.5,
    'hispanic weight': 0,
    'income weight': 0.8,
    'no vehicle weight': 0.3,
    'one vehicle weight': 0.1,
    'family weight': 0.3,
    'workers weight': .8
}

var blackRank = {
    'population weight': 0.4,
    'hispanic weight': 0,
    'income weight': 1,
    'no vehicle weight': 0.8,
    'one vehicle weight': 0.4,
    'family weight': 0.2,
    'workers weight': .8
}

var UBER_SUVRank = {
    'population weight': 0.5,
    'hispanic weight': 0,
    'income weight': 0.9,
    'no vehicle weight': 0.8,
    'one vehicle weight': 0.1,
    'family weight': .8,
    'workers weight': 0.6
}

var UBERXLRank = {
    'population weight': 0.5,
    'hispanic weight': 0,
    'income weight': 0.5,
    'no vehicle weight': 1,
    'one vehicle weight': 0.7,
    'family weight': .8,
    'workers weight': 0.8
}


exports.getData = function(req, res) {
    var data = require('../DelphiUberData.json');
    console.log(req.query);
    var uberRank;
    if(!req.query.uber){
    	res.json({
            'err': 'Need to provide an Uber. Options are UberX, Uber Esponal, Uber Select, Uber Black, Uber SUV'
        })
    }
    if (req.query.uber == 'UberX') {
        uberRank = uberXrank;
    } else if (req.query.uber == 'Uber Esponal') {
        uberRank = uberEsponalRank;
    } else if (req.query.uber == 'Uber Select') {
        uberRank = uberSelectRank;
    } else if (req.query.uber == 'Uber Black') {
        uberRank = blackRank;
    } else if (req.query.uber == 'Uber SUV') {
        uberRank = UBER_SUVRank;
    } else if (req.query.uber == 'UberXL') {
        uberRank = UBERXLRank;
    } else {
        res.json({
            'err': 'cannot find the Uber you are looking for, options are UberX, Uber Esponal, Uber Select, Uber Black, Uber SUV'
        })
    }
    var datalist = []
    for (var area in data) {
        var areaObj = {}
        var areaDat = data[area]['scaled data'];
        var power = areaDat['population scaled'] * uberRank['population weight'] +
            areaDat['Median income scaled'] * uberRank['income weight'] +
            areaDat['Family Households With Children scaled'] * uberRank['family weight'] +
            areaDat['Hispanic Population scaled'] * uberRank['hispanic weight'] +
            areaDat['Families without vehicles scaled'] * uberRank['no vehicle weight'] +
            areaDat['Families with only 1 vehicle scaled'] * uberRank['one vehicle weight'] +
            areaDat['Number of people working in this region'] * uberRank['workers weight'];
        areaObj['power'] = power;
        areaObj['Area'] = area;
        areaObj['data'] = data[area];
        datalist.push(areaObj);
    }
    datalist.sort(function(a, b) {
    		return a['power']-b['power'];
        })
    for(var i = 0; i<datalist.length;i++){
    	datalist[i]['rank'] = i+1;
    }
    var result = {'SortedData': datalist};
    console.log(result)
    res.json(result);
}
