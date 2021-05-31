/*
	Arrays para almacenar datos y marcadores 
*/
let data = new Array();
let markers = new Array();
/*
	Implementacion para usar webSockets
*/
client = new Paho.MQTT.Client("192.168.1.71", 9001, "ClienteWeb-1234567890"); // Create a client instance
client.onConnectionLost = onConnectionLost;// set callback handlers
client.onMessageArrived = onMessageArrived;
client.connect({onSuccess:onConnect});// connect the client

function onConnect() {// called when the client connects
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe("outTopic");
  message = new Paho.MQTT.Message("1");
  message.destinationName = "inTopic";
  client.send(message);
}

function onConnectionLost(responseObject) {// called when the client loses its connection
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

/*
	Primer Avanze
  "{\"lat\":19.565638, \"lon\":-96.917285, \"tem\":22, \"id\":1, \"name\":\"Samuel\"}"
  "{\"lat\":19.559072, \"lon\":-96.928507, \"tem\":21, \"id\":2, \"name\":\"Jessica\"}"
*/
function onMessageArrived(message) {// called when a message arrives
  console.log("onMessageArrived:"+message.payloadString);
  try {
    const json = JSON.parse(message.payloadString);
    verificarMarker(json);
  }catch(error) {
    console.log(error);
    alert(" Ojo: Existe un problema :)");
  }
}

function verificarMarker(json) {
  const isData = data.findIndex((some) => some.id === json.id);//regresa true o false (asigna el id del marker)
  if(isData === -1 ){//si no existe el id regresa -1 
    agregarMarker(json);//mando mi json para agregar el marker
  }else if(data[isData].tem !== json.tem){//si existe pero la temperatura cambio
    modificarMarker(json,isData)//is Data tiene la posicion de donde se encuentra el marcador
  }
}

const agregarMarker = (json) => {
	let popup = popupTemplate(json); //se define un popup en el cual le pasaremos estructura html con la tem
	let marker = L.marker([json.lat, json.lon]).addTo(mymap);//crear marcador
	marker.bindPopup(popup);  // enviamos nuestra estructura de html para mostrar la temperatura
	data.push(json); //agregamos los datos del json a nuestro array
	markers.push(marker); //agregamos el nuevo marker a nuestro array 
  console.log(marker);
}

const modificarMarker = (json, index) => { //paso el json e index. Index es la posicion para ubicar el marker
	let popup; //se declara un popup que mas adelante se utilizara para mostrar cambios 
	console.log("Id: " + json.id + " Usuario: " + json.name + " Nueva Temperatura: " + json.tem);// muestro el id que voy a modificar
	data[index] = json;//modifico temperatura del marker
	if(markers[index].isPopupOpen()){//en dado caso que el marcador se esta mostrando
    popup = document.querySelector(`[id='${json.id}']`);//Selecciono el id de mi marker
		popup.querySelector("span.tem-data > span").textContent = json.tem; //hago el cambio en el popup del marker
  }else{//en caso de que no se muestre
    markers[index]._popup.options._content = popupTemplate(json);// a la propiedad _content le paso mi json (tem)
  }
}

function popupTemplate(json){
  return `
    <div class="popup-info" id="${ json.id }">
      <div>
        <div class="name">
          <h3>${ json.name }</h3>
        </div>
        <div class="temp">
          <span class="name">Temperatura: </span>
          <span class="tem-data"> 
            <span>${ json.tem }</span> °C
          </span>
        </div>
    </div>
  `;
}

