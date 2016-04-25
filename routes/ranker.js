var uberXrank = {
    'population weight': 0.8,
    'hispanic weight': 0,
    'income weight': 0.5,
    'no vehicle weight': 0.8,
    'one vehicle weight': 0.8,
    'family weight': 0.5,
    'workers weight': 0.5
}

var uberEsponalRank = {
    'population weight': 0.8,
    'hispanic weight': 1,
    'income weight': 0.5,
    'no vehicle weight': 0.8,
    'one vehicle weight': 0.8,
    'family weight': 0.5,
    'workers weight': 0.5
}

var uberSelectRank = {
    'population weight': 0.4,
    'hispanic weight': 0,
    'income weight': 0.7,
    'no vehicle weight': 0.8,
    'one vehicle weight': 0.5,
    'family weight': 0.3,
    'workers weight': 0.5
}

var blackRank = {
    'population weight': 0.3,
    'hispanic weight': 0,
    'income weight': 1,
    'no vehicle weight': 0.8,
    'one vehicle weight': 0.4,
    'family weight': 0.2,
    'workers weight': 0.5
}

var UBER_SUVRank = {
    'population weight': 1,
    'hispanic weight': 0,
    'income weight': 0.7,
    'no vehicle weight': 0.8,
    'one vehicle weight': 0.6,
    'family weight': 1,
    'workers weight': 0.4
}



exports.getData = function(req, res) {
    var data = require('../DelphiUberData.json');
    console.log(req.query);
    var uberRank;
    if (req.query.uber == 'UberX') {
        uberRank = uberXrank;
    } else if (req.query.uber == 'Uber Esponal') {
        uberRank = uberXrank;
    } else if (req.query.uber == 'Uber Select') {
        uberRank = uberXrank;
    } else if (req.query.uber == 'Uber Black') {
        uberRank = uberXrank;
    } else if (req.query.uber == 'Uber SUV') {
        uberRank = uberXrank;
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
    var result = {'Sorted Data': datalist};
    // console.log(result)
    res.json(result);
}