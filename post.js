const data = [{ typeId: 126, width: 3210, height: 2200, vendorId: 4, locationId: 53, quantity: 1, Comment: "" }, { typeId: 126, width: 3210, height: 2540, vendorId: 4, locationId: 53, quantity: 6, Comment: "" }, { typeId: 126, width: 3210, height: 2200, vendorId: 4, locationId: 53, quantity: 5, Comment: "" }]


const axios = require('axios')

const user = {
    name: 'MANTENIMIENTO UVEG',
    email: 'mantenimiento@uveg.ar',
    image: null,
    id: 'clid221kv0000lq0h3tvno38h',
}



async function main(index) {




    const { typeId, width, height, vendorId, locationId, quantity, Comment } = data[index]

    const response = await axios.post('https://inventario-vidrios.vercel.app//api/glass', {
        user,
        glass: {
            typeId,
            width,
            height,
            vendorId,
            locationId,
            quantity,
            Comment,
        },
    })

    console.log(`Indice: ${index}`)

}




var i = 0;

function myLoop() {
    setTimeout(function () {
        try {
            main(i)
        }
        catch(e){
            console.log(`Error al cargar ${i}`)
        }
        i++;
        if (i < data.length) {
            myLoop();
        }
    }, 3000)
}

myLoop();  