const express = require('express');

const app = express();

const fs = require('fs');

const bodyParser = require('body-parser');

const urlEncoded = bodyParser.urlencoded({extended: false});

app.use(express.static(__dirname + '/public'));

app.get('/units', (req, res) => {
    let content = fs.readFileSync('units.json', 'utf-8');
    let data = JSON.parse(content);
    res.send(data);
});

app.post('/units', urlEncoded, (req, res) => {
    let content = fs.readFileSync('units.json', 'utf-8');
    let data = JSON.parse(content);
    let unit = {mark: req.body.mark, officer: req.body.officer, status: req.body.status};
    data.push(unit);
    let data2 = JSON.stringify(data);
    fs.writeFileSync('units.json', data2);
    res.send(unit);
});

app.post('/change', urlEncoded, (req, res) => {
    let content = fs.readFileSync('units.json', 'utf-8');
    let units = JSON.parse(content);
    if (req.body.status != '') {
        units.find((el) => el.mark == req.body.mark).status = req.body.status;
    } else {
      units.splice(units.indexOf(units.find((el) => el.mark == req.body.mark)), 1);
    }  
    let units2 = JSON.stringify(units);
    fs.writeFileSync('units.json', units2);
    res.redirect('/success2.html');
});

app.get('/wanteds', (req, res) => {
    let content = fs.readFileSync('wanteds.json', 'utf-8');
    let data = JSON.parse(content);
    let wanteds = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].status != "Был взят под стражу") {
            wanteds.push(data[i]);
        }
    }
    res.send(wanteds);
});

app.get('/wanted_autos', (req, res) => {
    let content = fs.readFileSync('wanted-autos.json', 'utf-8');
    let autos = JSON.parse(content);
    let wanteds = [];
    for (let i = 0; i < autos.length; i++) {
        if (autos[i].status != "Был взят под стражу") {
            wanteds.push(autos[i]);
        }
    }
    res.send(wanteds);
})

app.get('/wanteds/:name', (req, res) => {
    let name = req.params.name;
    console.log(name);
    let content = fs.readFileSync('wanteds.json', 'utf-8');
    let wanteds = JSON.parse(content);
    let matches = [];
    for (let i = 0; i < wanteds.length; i++) {
        if (wanteds[i].name == name) {
            matches.push(wanteds[i]);
        }
    }
    res.send(matches);
});

app.get('/autos/:plate', (req, res) => {
    let plate = req.params.plate;
    let content = fs.readFileSync('autos.json', 'utf-8');
    let autos = JSON.parse(content);
    let auto = [];
    for (let i = 0; i < autos.length; i++) {
        if (autos[i].plate == plate) {
            auto.push(autos[i]);
        }
    }
    if (auto.length == 0) {
        auto = {status: "НЕ НАЙДЕНО!"};
    }
    res.send(auto);
    console.log(auto);
});

app.get('/calls', (req, res) => {
    let content = fs.readFileSync('calls.json', 'utf-8');
    let calls = JSON.parse(content);
    let lastcall = calls[calls.length - 1];
    if (calls.length != 1) {
        res.send(lastcall);
    } else {
        res.send([]);
    }
});

app.post('/arrest', urlEncoded, (req, res) => {
    let content = fs.readFileSync('arrests.json', 'utf-8');
    let content2 = fs.readFileSync('wanteds.json', 'utf-8');
    let content3 = fs.readFileSync('wanted-autos.json', 'utf-8');
    let data = JSON.parse(content);
    let wanteds = JSON.parse(content2);
    let autos = JSON.parse(content3);
    let prisoner = {
        name: req.body.name_surname,
        date_of_birth: req.body.date_birth,
        reason: req.body.reason_input,
        location: req.body.location_arrest_input,
        officer: req.body.officer_input,
        time: new Date().toLocaleString(),
        status: "Был взят под стражу"
    };
    let arrest_protocol = {
        name: req.body.name_surname.split(' ')[0],
        surname: req.body.name_surname.split(' ')[1],
        violations: [req.body.reason_input],
        signs: "Не известны",
        status: "Был взят под стражу"
    }
    wanteds.push(arrest_protocol);
    for (let i = 0; i < wanteds.length; i++) {
        if (wanteds[i].name == arrest_protocol.name) {
            wanteds.splice(i, 1);
            break;
        }
    }
    let index = autos.indexOf(autos.find((el) => el.owner == arrest_protocol.name + " " + arrest_protocol.surname));
    if (index != -1) {
        let content4 = fs.readFileSync('autos.json', 'utf-8');
        let writes = JSON.parse(content4);
        let push = {
            name_surname: autos[index].owner,
            plate: autos[index].plate,
            violations: "Был взят под стражу",
            officer: req.body.officer_input,
            auto: autos[index].signs
        }
        autos[index].status = "Был взят под стражу";
        writes.push(push);
        let data3 = JSON.stringify(autos);
        let data4 = JSON.stringify(writes);
        fs.writeFileSync('autos.json', data4);
        fs.writeFileSync('wanted-autos.json', data3);
    }
    data.push(prisoner);
    let data2 = JSON.stringify(data);
    let wanteds2 = JSON.stringify(wanteds);
    fs.writeFileSync('arrests.json', data2);
    fs.writeFileSync('wanteds.json', wanteds2);
    res.redirect('/success.html');
    console.log(arrest_protocol);
    console.log(wanteds);
    console.log(index);
});

app.post('/ticket', urlEncoded, (req, res) => {
    let content = fs.readFileSync('autos.json', 'utf-8');
    let autos = JSON.parse(content);
    let ticket = {
        name_surname : req.body.name_surname,
        plate        : req.body.number_plate,
        violations   : req.body.violations,
        auto         : req.body.auto,
        officer      : req.body.officer
    };
    autos.push(ticket);
    let data = JSON.stringify(autos);
    fs.writeFileSync('autos.json', data);
    res.redirect('/success.html');
});

app.post('/submit_call', urlEncoded, (req, res) => {
    let content = fs.readFileSync('calls.json', 'utf-8');
    let calls = JSON.parse(content);
    let maxid = calls[calls.length - 1].id;
    let call = {
        id: maxid + 1,
        description: req.body.description,
        location: req.body.location,
        status: req.body.status
    };
    calls.push(call);
    let data = JSON.stringify(calls);
    fs.writeFileSync('calls.json', data);
    res.redirect('/success3.html')
});

app.post('/change_call', urlEncoded, (req, res) => {
    let content = fs.readFileSync('calls.json', 'utf-8');
    let calls = JSON.parse(content);
    let id = req.body.id;
    if (req.body.new_status != '') {
        calls.find(el => el.id == id).status = req.body.new_status;
    } else {
        calls.splice(calls.indexOf(calls.find(el => el.id == id)), 1);
    }
    let data = JSON.stringify(calls);
    fs.writeFileSync('calls.json', data);
    res.redirect('/success2.html')
});

app.post('/add_wanted', urlEncoded, (req, res) => {
    let content = fs.readFileSync('wanteds.json', 'utf-8');
    let wanteds = JSON.parse(content);
    let wanted = {
        name: req.body.name.split(' ')[0],
        surname: req.body.name.split(' ')[1],
        violations: [req.body.violations],
        signs: req.body.signs,
        status: "Скрылся"
    };
    wanteds.push(wanted);
    let data = JSON.stringify(wanteds);
    fs.writeFileSync('wanteds.json', data);
    console.log(wanted);
    res.redirect('/success.html');
});

app.post('/add_auto', urlEncoded, (req, res) => {
    let content = fs.readFileSync('wanted-autos.json', 'utf-8');
    let autos = JSON.parse(content);
    let auto = {
        plate : req.body.plate,
        owner: req.body.owner,
        signs: req.body.signs,
        status: "Скрылся"
    }
    autos.push(auto);
    let data = JSON.stringify(autos);
    fs.writeFileSync('wanted-autos.json', data);
    res.redirect('/success.html');
});

app.post('/delete_auto', urlEncoded, (req, res) => {
    let content = fs.readFileSync('wanted-autos.json', 'utf-8');
    let autos = JSON.parse(content);
    let plate = req.body.plate;
    for (let i = 0; i < autos.length; i++) {
        if (autos[i].plate == plate) {
            autos.splice(i, 1);
        }
    }
    let data = JSON.stringify(autos);
    fs.writeFileSync('wanted-autos.json', data);
    console.log(plate);
    res.redirect('/success3.html');
})

app.listen(3030);