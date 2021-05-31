/*Implementacion para usar webSockets*/
client = new Paho.MQTT.Client("broker.emqx.io", 8084, "MiCliente"); // Create a client instance
client.onConnectionLost = onConnectionLost;// set callback handlers
client.onMessageArrived = onMessageArrived;
client.connect({useSSL: true, onSuccess:onConnect});// connect the client

// called when the client connects
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("Conectado");
    client.subscribe("datosMetereologicos");
}

  // called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:"+responseObject.errorMessage);
      client.connect({useSSL: true, onSuccess:onConnect});
    }
}

  // called when a message arrives
function onMessageArrived(message) {
	try {
		const json = JSON.parse(message.payloadString);
    document.getElementById('tem').innerHTML = json.temperatura + " ºC";
    document.getElementById('hum').innerHTML = json.humedad + " %";
    document.getElementById('mensaje').innerHTML = json.estado;

    if(json.estado=='¡Humedad Baja!'){
      Push.create("Sensojito App", { //Titulo de la notificación
        body: "Estado: La humedad es baja. ¡Active el sistema de riego!", //Texto del cuerpo de la notificación
        icon: '/img/tomato.png', //Icono de la notificación
        timeout: 6000, //Tiempo de duración de la notificación
          onClick: function () {//Función que se cumple al realizar clic cobre la notificación  
            this.close(); //Cierra la notificación
          }
        });
    }else if (json.estado=='¡Humedad Alta!'){
      Push.create("Sensojito App", { //Titulo de la notificación
        body: "Estado: La humedad es alta. ¡Active el sistema de ventilación!", //Texto del cuerpo de la notificación
        icon: '/img/tomato.png', //Icono de la notificación
        timeout: 6000, //Tiempo de duración de la notificación
          onClick: function () {//Función que se cumple al realizar clic cobre la notificación
            this.close(); //Cierra la notificación
          }
        });
    }else if(json.estado=='¡Temperatura y Humedad Baja!'){
      //Todo el código que se encuentra aquí se auto explica 
		  Push.create("Sensojito App", { //Titulo de la notificación
			body: "Estado: La temperatura y humedad es baja. ¡Active el sistema de riego y active la calefacción por 10 minutos", //Texto del cuerpo de la notificación
			icon: '/img/tomato.png', //Icono de la notificación
			timeout: 6000, //Tiempo de duración de la notificación
			  onClick: function () {//Función que se cumple al realizar clic cobre la notificación
				  this.close(); //Cierra la notificación
			  }
		  });
    }else if(json.estado=='¡Temperatura Baja!'){
      //Todo el código que se encuentra aquí se auto explica 
		  Push.create("Sensojito App", { //Titulo de la notificación
			body: "Estado: La temperatura y humedad es baja. ¡Active la calefacción por 10 minutos", //Texto del cuerpo de la notificación
			icon: '/img/tomato.png', //Icono de la notificación
			timeout: 6000, //Tiempo de duración de la notificación
			  onClick: function () {//Función que se cumple al realizar clic cobre la notificación
				  this.close(); //Cierra la notificación
			  }
		  });
    }else if(json.estado=='¡Temperatura y Humedad Alta!'){
        //Todo el código que se encuentra aquí se auto explica 
		  Push.create("Sensojito App", { //Titulo de la notificación
        body:  "Estado: La temperatura y Humedad es alta. ¡Active el sistema de ventilación!", //Texto del cuerpo de la notificación
        icon: '/img/tomato.png', //Icono de la notificación
        timeout: 6000, //Tiempo de duración de la notificación
          onClick: function () {//Función que se cumple al realizar clic cobre la notificación
            this.close(); //Cierra la notificación
          }
        });
    }else if(json.estado=='¡Temperatura Alta!'){
        //Todo el código que se encuentra aquí se auto explica 
		  Push.create("Sensojito App", { //Titulo de la notificación
        body:  "Estado: La temperatura es alta. ¡Active el sistema de ventilación!", //Texto del cuerpo de la notificación
        icon: '/img/tomato.png', //Icono de la notificación
        timeout: 6000, //Tiempo de duración de la notificación
          onClick: function () {//Función que se cumple al realizar clic cobre la notificación
            this.close(); //Cierra la notificación
          }
        });

    }else if(json.estado=='¡Temperatura y Humedad Peligrosas!'){
       //Todo el código que se encuentra aquí se auto explica 
		  Push.create("Sensojito App", { //Titulo de la notificación
        body: "Estado: La temperatura y Humedad es alta. ¡Active el sistema sistema de ventilación!", //Texto del cuerpo de la notificación
        icon: '/img/tomato.png', //Icono de la notificación
        timeout: 6000, //Tiempo de duración de la notificación
          onClick: function () {//Función que se cumple al realizar clic cobre la notificación
            this.close(); //Cierra la notificación
          }
        });
    }
  }catch(error) {
		console.log(error);
		alert("No pude obtener datos. ¡Intentelo mas tarde!");
	}
}