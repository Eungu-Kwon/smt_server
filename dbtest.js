var oracle = require("oracledb");

oracle.getConnection({
    user: "sw", password: "sw", connectString: "125.6.37.219:16000/xe"
}, function(err, conn){
    if(err){
        console.error(err.message);
        return;
    }

    conn.execute("SELECT * FROM USERS", function(err, result){
        if(err){
            console.error(err.message);
            conn.close()
            return;
        }
        console.log(result.rows);
    });

    // conn.execute("INSERT INTO USERS " + 
    //             "VALUES(:Id, :Pwd, :NAME, :Email, :Did, :Birth_date)", ['dmsrn13579', 'qwerasdf', 'dmsrn', 'ezzz', 3, null], function(err, result){
    //     if(err){
    //         console.error(err.message);
    //         conn.close()
    //         return;
    //     }
    //     console.log("result: " + result.rowsAffected);
    //     conn.commit();
    //     conn.close();
    // });
})