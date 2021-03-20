var botonSolicitud = document.getElementById('solicitud')
botonSolicitud.addEventListener('click', function() {
    axios.post('http://cf27691d4c6d.ngrok.io/datos', 
    {
        nomb : document.getElementById('nomb').value,
        apellido1 : document.getElementById('apellido1').value,
        apellido2 : document.getElementById('apellido2').value,

    }).then (function(res){
        console.log(res.data);
    }).catch(function(err){
        console.log(err);
    });
})