var bPedir = document.getElementById('pedir')
bPedir.addEventListener('click', function() {
    axios.post('http://22a5d8c0b80b.ngrok.io/hola', 
    {
        nomb : document.getElementById('nomb').value
    }).then (function(res){
        console.log(res.data);
    }).catch(function(err){
        console.log(err);
    });
})