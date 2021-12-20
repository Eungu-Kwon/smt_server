var express = require('express');
var oracle = require("oracledb");
var net = require("net");
var moment = require('moment-timezone');
var app = express();

var moment = require('moment'); moment.tz.setDefault("Asia/Seoul"); exports.moment = moment;

const conn_info = { user: "sw", password: "sw", connectString: "125.6.37.219:16000/xe" };

app.use(express.json())
app.use(express.urlencoded({ extends: true}))

app.post('/user', function (req, res) {
    q_str = req.query.id;
    oracle.getConnection({
        user: "sw", password: "sw", connectString: "125.6.37.219:16000/xe"
    }, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
    
        conn.execute("SELECT * FROM USERS WHERE id = '" + req.body.id + "' AND pwd = '" + req.body.pwd + "'", function(err, result){
            if(err){
                console.error(err.message);
                res.send({
                    result: false
                });
                conn.close();
                return;
            }

            if(result.rows.length == 0){
                res.send({
                    result: false
                });
            }
            else{
                console.log(result.rows[0][6]);
                res.send({
                    result: true,
                    id: result.rows[0][0],
                    pwd: result.rows[0][1],
                    name: result.rows[0][2],
                    email: result.rows[0][3],
                    sex: result.rows[0][4],
                    smoking: result.rows[0][5],
                    birthday: result.rows[0][6]
                });
            }
            
            conn.close();
        });
    })
});

app.get('/validuser', function (req, res) {
    q_str = req.query.id;
    oracle.getConnection({
        user: "sw", password: "sw", connectString: "125.6.37.219:16000/xe"
    }, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
    
        conn.execute("SELECT * FROM USERS WHERE id = '" + req.query.id + "'", function(err, result){
            if(err){
                console.error(err.message);
                res.send({
                    result: false
                });
                conn.close();
                return;
            }
            
            if(result.rows.length == 0){
                res.send({
                    result: false
                });
            }
            else{
                res.send({
                    result: true
                });
            }
            
            conn.close();
        });
    })
});

app.post('/addUser', function (req, res) {
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
    
        conn.execute("INSERT INTO USERS " + 
                    "VALUES(:Id, :Pwd, :Name, :Email, :Sex, :Smoking, TO_DATE(:Birth_date, 'yyyy/mm/dd'))", [
                        req.body.id, 
                        req.body.pwd,
                        req.body.name,
                        req.body.email,
                        req.body.sex,
                        req.body.smoking,
                        req.body.birthday
                    ], function(err, result){
            if(err){
                console.error(err.message);
                res.send({
                    result: false
                });
                conn.close();
                return;
            }
            if(result.rowsAffected == 1){
                res.send({
                    result: true
                });
            }
            else{
                res.send({
                    result: false
                });
            }
            conn.commit();
            conn.close();
        });
    });
    
});

app.post('/todo', function (req, res) {
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
    
        conn.execute("INSERT INTO TODO " + 
                    "VALUES(TODOSEQ.NEXTVAL, :Userid, :ToDostr, TO_DATE(:Pdate, 'yyyy/mm/dd'), '0')", [
                        req.body.id,
                        req.body.todo,
                        req.body.date
                    ], function(err, result){
            if(err){
                console.error(err.message);
                res.send({
                    _id: -1
                });
                conn.close();
                return;
            }
            if(result.rowsAffected == 1){
                conn.execute("SELECT id FROM TODO ORDER BY id DESC", function(err, result){
                    if(err){
                        console.error(err.message);
                        res.send({
                            _id: -1
                        });
                        conn.close();
                        return;
                    }

                    if(result.rows.length == 0){
                        res.send({
                            _id: -1
                        });
                    }
                    else{
                        res.send({
                            _id: result.rows[0][0]
                        });
                    }
                    conn.commit();
                    conn.close();
                });
            }
            else{
                res.send({
                    _id: -1
                });
            }
        });
    });
    
});

app.post('/todoDelete', function (req, res) {
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
    
        conn.execute("DELETE FROM TODO WHERE id = " + req.body._id + "", function(err, result){
            if(err){
                console.error(err.message);
                res.send({
                    result: false
                });
                conn.close();
                return;
            }
            if(result.rowsAffected == 1){
                res.send({
                    result: true
                });
            }
            else{
                res.send({
                    result: false
                });
            }
            conn.commit();
            conn.close();
        });
    });
    
});

app.get('/todoCheck', function (req, res) {
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
    
        conn.execute("UPDATE TODO SET checked=" + req.query.check + " WHERE id=" + req.query._id + "", function(err, result){
            if(err){
                console.error(err.message);
                res.send({
                    result: false
                });
                conn.close();
                return;
            }
            if(result.rowsAffected == 1){
                res.send({
                    result: true
                });
            }
            else{
                res.send({
                    result: false
                });
            }
            conn.commit();
            conn.close();
        });
    });
    
});

app.get('/healthdailydata', function (req, res) {
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
    
        conn.execute("SELECT Id, Userid, Pulse, MaxPressure, MinPressure, Spo, TO_CHAR (Pdate, 'yyyy/MM/dd') FROM HEALTHDATA WHERE Userid = '" + req.query.id + "' AND TO_CHAR(Pdate, 'yyyy/mm/dd') = '" + req.query.date + "'", function(err, result){
            if(err){
                console.error(err.message);
                res.send([]);
                conn.close();
                return;
            }

            if(result.rows[0] == undefined){
                res.send({"id": 0,
                "pulse": 0,
                "bloodMax": 0,
                "bloodMin": 0,
                "spo": 0,
                "date": req.query.date});
            }
            else{
                res.send({"id": result.rows[0][1],
                "pulse": result.rows[0][2],
                "bloodMax": result.rows[0][3],
                "bloodMin": result.rows[0][4],
                "spo": result.rows[0][5], "date": result.rows[0][6]});
            }
            conn.close();
        });
    });
});

app.get('/healthweeklydata', function (req, res) {
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send([]);
            return;
        }

        let d_str = req.query.date.split('/');
        let sd = new Date(Number(d_str[0]), Number(d_str[1]) - 1, Number(d_str[2]));
        let wod = sd.getDay();
        if(wod == 0){       //sunday
            wod = 7;
        }
        
        sd.setDate(sd.getDate() - wod + 1);
        let ed = new Date(sd);
        ed.setDate(sd.getDate() + 7);

        let start_date = get_datestr(sd);
        let end_date = get_datestr(ed);

        conn.execute("SELECT AVG(Pulse), AVG(MaxPressure), AVG(MinPressure), AVG(Spo), TO_CHAR (Pdate, 'yyyy/MM/dd') AS tempdate FROM HEALTHDATA WHERE Userid = '" + req.query.id + "' AND TO_CHAR(Pdate, 'yyyy/mm/dd') >= '" + start_date + "' AND TO_CHAR(Pdate, 'yyyy/mm/dd') < '" + end_date + "' GROUP BY TO_CHAR (Pdate, 'yyyy/MM/dd')", function(err, result){
            if(err){
                console.error(err.message);
                res.send([]);
                conn.close();
                return;
            }
            let temp = [];
            let to_send = [];
            result.rows.forEach(e => {
                temp[e[4]] = {"id": req.query.id, "pulse": e[0], "bloodMax": e[1], "bloodMin": e[2], "spo": e[3], "date": e[4]};
            });

            let t_date = new Date(sd);
            for(var i = 0; i < 7; i++){
                let temp_date_str = get_datestr(t_date);
                if(temp[temp_date_str] != undefined){
                    to_send.push(temp[temp_date_str]);
                }
                else{
                    to_send.push({"id": req.query.id, "pulse": 0, "bloodMax": 0, "bloodMin": 0, "spo": 0, "date": temp_date_str});
                }
                t_date.setDate(t_date.getDate() + 1);
            }
            res.send(to_send);
            conn.close();
        });
    });
});

app.get('/healthmonthlydata', function (req, res) {
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send([]);
            return;
        }

        let d_str = req.query.date.split('/');
        let sd = new Date(Number(d_str[0]), Number(d_str[1]) - 1, 1);
        let ed = new Date(sd);
        
        ed.setMonth(ed.getMonth() + 1);

        let start_date = get_datestr(sd);
        let end_date = get_datestr(ed);

        console.log(start_date, end_date);

        conn.execute("SELECT AVG(Pulse), AVG(MaxPressure), AVG(MinPressure), AVG(Spo), TO_CHAR (Pdate, 'yyyy/MM/dd') AS tempdate FROM HEALTHDATA WHERE Userid = '" + req.query.id + "' AND TO_CHAR(Pdate, 'yyyy/mm/dd') >= '" + start_date + "' AND TO_CHAR(Pdate, 'yyyy/mm/dd') < '" + end_date + "' GROUP BY TO_CHAR (Pdate, 'yyyy/MM/dd')", function(err, result){
            if(err){
                console.error(err.message);
                res.send([]);
                conn.close();
                return;
            }
            let temp = [];
            let to_send = [];
            result.rows.forEach(e => {
                console.log(e[4]);
                temp[e[4]] = {"id": req.query.id, "pulse": e[0], "bloodMax": e[1], "bloodMin": e[2], "spo": e[3], "date": e[4]};
            });
            console.log('========================');
            let t_date = new Date(sd);
            while(ed.getMonth() != t_date.getMonth()){
                
                let temp_date_str = get_datestr(t_date);
                console.log(temp_date_str);
                if(temp[temp_date_str] != undefined){
                    to_send.push(temp[temp_date_str]);
                }
                else{
                    to_send.push({"id": req.query.id, "pulse": 0, "bloodMax": 0, "bloodMin": 0, "spo": 0, "date": temp_date_str});
                }
                t_date.setDate(t_date.getDate() + 1);
            }
            res.send(to_send);
            conn.close();
        });
    });
});

function get_datestr(_date){
    return _date.getFullYear() + "/" + ((_date.getMonth() + 1) + '').padStart(2, '0') + "/" +  (_date.getDate()+'').padStart(2, '0');
}

app.get('/getTodo', function (req, res) {
    console.log("get");
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
    
        conn.execute("SELECT Id, Userid, ToDoStr, TO_CHAR (Pdate, 'yyyy/MM/dd') FROM TODO WHERE Userid = '" + req.query.id + "' ORDER BY ID", function(err, result){
            if(err){
                console.error(err.message);
                res.send([]);
                conn.close();
                return;
            }
            var temp = []
            result.rows.forEach(e => {
                temp.push({"_id": e[0], "id": e[1], "todo": e[2], "date": e[3]})
            });
            for(var i = temp.length; i < 6; i++){
                temp.push({"_id": 0, "id": 0, "todo": "", "date": ""});
            }
            res.send(temp);
            conn.close();
        });
    });
});

app.get('/getTodoDevice', function (req, res) {
    console.log("get");
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
    
        conn.execute("SELECT Id, Userid, ToDoStr, TO_CHAR (Pdate, 'yyyy/MM/dd') FROM TODO WHERE Userid = '" + req.query.id + "'", function(err, result){
            if(err){
                console.error(err.message);
                res.send([]);
                conn.close();
                return;
            }
            var temp = []
            result.rows.forEach(e => {
                temp.push({"_id": e[0], "id": e[1], "todo": e[2], "date": e[3]})
            });
            res.send({'value':temp});
            conn.close();
        });
    });
});

app.get('/addHealth', function (req, res) {
    oracle.getConnection(conn_info, function(err, conn){
        if(err){
            console.error(err.message);
            res.send({
                result: false
            });
            return;
        }
        var now = new Date();
        var date_str = now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        console.log("add");
        conn.execute("INSERT INTO HEALTHDATA " + 
                    "VALUES(HEALTHID.NEXTVAL, :Userid, :Pulse, :MaxPressure, :MinPressure, :Spo, TO_DATE('" + date_str + "', 'yyyy/mm/dd HH24:MI:SS'))", [
                        req.query.id, 
                        req.query.pulse,
                        req.query.max,
                        req.query.min,
                        req.query.spo2
                    ], function(err, result){
            if(err){
                console.error(err.message);
                res.send({
                    result: false
                });
                conn.close();
                return;
            }
            if(result.rowsAffected == 1){
                res.send({
                    result: true
                });
            }
            else{
                res.send({
                    result: false
                });
            }
            conn.commit();
            conn.close();
        });
    });
});

app.get('/healthdata', function (req, res) {
    res.send([{"bloodMin":143,"bloodMax":133,"o2":96,"pulse":144,"date":"7/16/2021","name ":"Didi"},
    {"bloodMin":128,"bloodMax":179,"o2":61,"pulse":69,"date":"10/6/2021","name ":"Ilene"},
    {"bloodMin":82,"bloodMax":122,"o2":50,"pulse":148,"date":"3/22/2021","name ":"Nikolas"},
    {"bloodMin":150,"bloodMax":121,"o2":83,"pulse":149,"date":"3/30/2021","name ":"Paddy"},
    {"bloodMin":85,"bloodMax":114,"o2":86,"pulse":127,"date":"11/1/2021","name ":"Katherine"},
    {"bloodMin":78,"bloodMax":167,"o2":56,"pulse":85,"date":"1/3/2021","name ":"Inga"},
    {"bloodMin":111,"bloodMax":138,"o2":71,"pulse":79,"date":"5/27/2021","name ":"Warden"}]);
});

app.get('/devicecode', function (req, res) {
    res.send({"code": "12345"});
});

app.listen(16002, function () {
    console.log('Example app listening on port 16002!');
});

var server = net.createServer();
var mirror_sockets = {};
var mobile_sockets = {};

server.on('connection', function(socket){
    var id = (Math.floor(Math.random() * 9000)) + 1000 - 1;

    socket.on('data', function(data){
        if(data.toString() == 'device'){
            socket.write(id + "");
            mirror_sockets[id] = socket;
        }
        else if(data.toString().startsWith('mobile')){
            console.log(data.toString());
            var d = data.toString().split('\n');
            var m_id = d[1] * 1;
            if(mirror_sockets[m_id] != undefined){
                mirror_sockets[m_id].write(d[2] + '\n' + d[3] + '\n');
                mirror_sockets[d[2]] = mirror_sockets[m_id];
                mobile_sockets[d[2]] = socket;
                mirror_sockets[m_id] = undefined;
                socket.write("true");
            }
            else{
                socket.write("false");
            }
        }
        else if(data.toString().startsWith('loggedin')){
            var d = data.toString().split('\n');
            mobile_sockets[d[1]] = socket;
            socket.write("true");
        }
        console.log(data.toString());
    });

    socket.on('error', function(){
        for(var k in mirror_sockets){
            if(mirror_sockets[k] == socket){
                mirror_sockets[k] = undefined;
                mobile_sockets[k] = undefined;
                console.log("close socket " + k);
                break;
            }
        }
    });
    
    //socket.destroy();
});

server.on('close', function(){
    console.log("close tcp socket");
});

server.listen(16005, function(){
    console.log('Example app listening on port 16005!');
});