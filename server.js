//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var dotenv = require('dotenv');
var pg = require('pg');
var app = express();

//client id and client secret here, taken from .env (which you need to create)
dotenv.load();

//connect to database
var conString = process.env.DATABASE_CONNECTION_URL;
var client = new pg.Client(conString);
client.connect(function(err) {
    if (err) {
        console.error('could not connect to postgres', err);
    } else {
        console.log("Successfully connected to postgres")
    }
});

//Configures the Template engine
app.engine('html', handlebars({
    defaultLayout: 'layout',
    extname: '.html'
}));
app.set("view engine", "html");
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true
}));

//set environment ports and start application
app.set('port', process.env.PORT || 3000);

//routes
app.get('/', function(req, res) {
    res.render('index');
});

app.get('/uberData', function(req, res) {
    data = {};

    client.query('SELECT hhsa_san_diego_demographics_median_income_2012."Area", hhsa_san_diego_demographics_median_income_2012."Median Household Income" FROM cogs121_16_raw.hhsa_san_diego_demographics_median_income_2012', function(err, dat) {
        for (var i = 0; i < dat.rows.length; i++) {
            var area = dat.rows[i]['Area'].trim().replace("SD", "San Diego");
            area = area.split('-').join(' ');
            data[area] = {
                "Median income": dat.rows[i]['Median Household Income']
            }
        }
        console.log("Done loading income")

    });

    client.query('SELECT hhsa_san_diego_demographics_county_population_2012."Area", hhsa_san_diego_demographics_county_population_2012."Total 2012 Population" FROM cogs121_16_raw.hhsa_san_diego_demographics_county_population_2012;', function(err, dat) {
        for (var i = 0; i < dat.rows.length; i++) {
            var area = dat.rows[i]['Area'].trim().replace("SD", "San Diego");
            area = area.split('-').join(' ');

            if (data[area]) {
                data[area]['population'] = dat.rows[i]['Total 2012 Population']
            } else {
                data[area] = {
                    'population': dat.rows[i]['Total 2012 Population']
                }
            }
        }
        console.log("Done loading population")

    });

    client.query('SELECT hhsa_san_diego_demographics_household_composition_2012."Subregional Area", hhsa_san_diego_demographics_household_composition_2012."Family households -with children age<18" FROM cogs121_16_raw.hhsa_san_diego_demographics_household_composition_2012;', function(err, dat) {
        for (var i = 0; i < dat.rows.length; i++) {
            var area = dat.rows[i]['Subregional Area'].trim().replace("SD", "San Diego");
            area = area.split('-').join(' ');
            if (data[area]) {
                data[area]['Family Households With Children'] = dat.rows[i]['Family households -with children age<18']
            } else {
                data[area] = {
                    'Family Households With Children': dat.rows[i]['Family households -with children age<18']
                }
            }
        }
        console.log("done loading family households with children")
    });

    client.query('SELECT hhsa_san_diego_demographics_county_popul_by_race_2012_norm."Area", hhsa_san_diego_demographics_county_popul_by_race_2012_norm."Population" FROM cogs121_16_raw.hhsa_san_diego_demographics_county_popul_by_race_2012_norm WHERE hhsa_san_diego_demographics_county_popul_by_race_2012_norm."Race" = \'Hispanic\';', function(err, dat) {
        for (var i = 0; i < dat.rows.length; i++) {
            var area = dat.rows[i]['Area'].trim().replace("SD", "San Diego");
            area = area.split('-').join(' ');
            if (data[area]) {
                data[area]['Hispanic Population'] = dat.rows[i]['Population']
            } else {
                data[area] = {
                    'Hispanic Population': dat.rows[i]['Population']
                }
            }
        }
        console.log("Done loading Hispanic population")
    });
    client.query('SELECT hhsa_san_diego_demographics_vehicle_availability_2012."Area", hhsa_san_diego_demographics_vehicle_availability_2012."no vehicle available", hhsa_san_diego_demographics_vehicle_availability_2012."1 vehicle available" FROM cogs121_16_raw.hhsa_san_diego_demographics_vehicle_availability_2012;', function(err, dat) {
        for (var i = 0; i < dat.rows.length; i++) {
            var area = dat.rows[i]['Area'].trim().replace("SD", "San Diego");
            area = area.split('-').join(' ');
            if (data[area]) {
                data[area]['Families without vehicles'] = dat.rows[i]['no vehicle available'];
                data[area]['Families with only 1 vehicle'] = dat.rows[i]['1 vehicle available'];
            } else {
                data[area] = {
                    'Families without vehicles': dat.rows[i]['no vehicle available'],
                    'Families with only 1 vehicle': dat.rows[i]['1 vehicle available']
                }
            }
        }
    });
    client.query('SELECT hhsa_san_diego_demographics_occupational_industry_2012."Area", hhsa_san_diego_demographics_occupational_industry_2012."Occupation - total all occupations" FROM cogs121_16_raw.hhsa_san_diego_demographics_occupational_industry_2012;', function(err, dat) {
        for (var i = 0; i < dat.rows.length; i++) {
            var area = dat.rows[i]['Area'].trim().replace("SD", "San Diego");
            area = area.split('-').join(' ');
            if (data[area]) {
                data[area]['Number of people working in this region'] = dat.rows[i]['Occupation - total all occupations']
            } else {
                data[area] = {
                    'Number of people working in this region': dat.rows[i]['Occupation - total all occupations']
                }
            }
        }
        result = rename(data);
        res.json(result);
    });
})

function rename(data) {
    for (var attrname in data['Anza Borrego Springs']) {
        data['Anza Borrego'][attrname] = data['Anza Borrego Springs'][attrname];
    }

    for (var attrname in data['Southeast San Diego']) {
        data['Southeastern San Diego'][attrname] = data['Southeast San Diego'][attrname];
    }

    var toDelete = ['Southeast San Diego', 'Anza Borrego Springs', 'San Diego County', 'North Coastal Region', 'North Central Region', 'Central Region', 'South Region', 'East Region', 'North Inland Region', 'County Total', 'Harbison Crest El Cajon combo','Harbison Crest El Cajon'];
    for (var i=0; i<toDelete.length;i++){
      delete data[toDelete[i]];
    }
    return data
}



http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});