//consumir datos provenientes del servidor
const body = document.querySelector('table > tbody');

fetch('/historial')
.then((resp) => resp.json())
.then(function(data) {
    //console.log('Resultado: ',data);
    const rows = data.map((item) => tbody(item));
    body.innerHTML = rows.join("");
})
.catch(function(error) {
  console.log(error);
});


//table 
function tbody(json) {
	return `
    <tr>
        <td class="text-center">${ json.fecha }</td>
        <td class="text-center">${ json.temp }</td>
        <td class="text-center">${ json.hum }</td>
        <td class="text-center">${ json.state }</td>
    </tr>
	`;
}

