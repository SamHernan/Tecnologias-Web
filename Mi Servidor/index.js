var mqtt = require('mqtt'); 
var assert = require('assert');
var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var dateTime = require('node-datetime');

(async function() { //funcion asincrona para la conexion con Mongo
    //Puerto
    // ¿Existe un puerto? ¿No? Entonces ocupa el 8080.
    var PORT = process.env.PORT /*Se obtiene el puerto de las variables de entorno*/ || 3000;

    // Aplicacion del servidor
	var app = express();
    //Configuracion del Servidor
    app.use(bodyParser.json()); //Para permitir el retorno de obj json en las rutas
    app.use(express.static("public")); //le dice al servidor la locacion de la pagina web
    app.use(bodyParser.urlencoded({ extended: true })); // Esto es lo mismo que los json, solo que es para recibir queries en la uri

    // Conexion mongo
	var uri = "mongodb+srv://Sam_User:Sam_Pass@FirstCluster.uo0uq.mongodb.net/Sensojito?retryWrites=true&w=majority";
	var client = MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });// configuracion del cliente para la bd
    await client.connect(); //conexion a la bd
    var collection = client.db('Sensojito').collection('Estadisticas-Invernadero'); //enlaze a la coleccion para los datos
    
    // Rutas
    app.get('/',function(request, response){ //pagina principal de la pwa
        response.sendFile('index.html');
    });
    
    app.get('/historial', (request,response) => { //obtener datos de mi bd
        //collection.find({})  find se encarga de buscar, en este lleva un obj {vacio}, por tanto va a obtener todos los datos
        collection.find({}).toArray((err, data) => { //obtiene datos y lo pasa en un array
            assert.equal(null, err); // comparamos si el objeto es nulo, si lo es = error
            response.status(200).json(data); // obtenemos el status 200 y retornamos el objeto que viene de la bd
        });
    });
    
    //MQTT Client
    var client  = mqtt.connect('mqtt://broker.emqx.io', { 
        clientId: "MyServer" 
    });
    client.on('connect', function () {
        client.subscribe('datosMetereologicos', function (err) {
        })
    })
    var ultimoEstado = '';
    client.on('message', function (topic, message) {
        const json = JSON.parse(message);
        //datos del sensor
        var temperatura = json.temperatura;
        var humedad= json.humedad;
        var estado = json.estado;
        var fecha = json.fecha;
        var valor = {
            fecha: fecha,
            temp: temperatura,
            hum: humedad,
            state: estado
        }
        //console.log("Fecha: "+formatted+" Tem: "+temperatura+" Hum: "+humedad+" Estado: "+estado);
        if(ultimoEstado !== estado){// si el ultimo estado cambio, entonces
            ultimoEstado = estado;// el ultimo estado recibido va a ser el nuevo
            collection.insertOne(valor, (err, e) =>{ // insertamos el objeto en la bd
                //si hay un problema, nos lo dira
                assert.equal(null,err);
            });
        }
    })
    client.on("error", (error) => {
        console.log(error);
    });
    app.listen(PORT, function () {
        console.log(`Server start on port ${PORT}!`)
    })
})();


