const mysql2 = require('mysql2');
const dotenv = require('dotenv');

//Configura DotEnv
dotenv.config();

// Crear conexión a la base de datos MySQL
function createConnection(){
    const connection = mysql2.createConnection({
        host: 'localhost',
        user: 'leo',
        password: '123',
        database: 'converter',
        port: '3306',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return connection;
}

module.exports = {
    createConnection
}
