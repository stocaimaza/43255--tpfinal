// import { useState, useContext } from "react";
// import {CarritoContext} from '../../context/CarritoContext';
// import { db } from "../../services/config";
// import { collection, addDoc } from "firebase/firestore";

// //Versión sin actualización del stock: 

// const Checkout = () => {
//     const {carrito, vaciarCarrito, cantidadTotal} = useContext(CarritoContext);
//     const [nombre, setNombre] = useState("");
//     const [apellido, setApellido] = useState("");
//     const [telefono, setTelefono] = useState("");
//     const [email, setEmail] = useState("");
//     const [emailConfirmacion, setEmailConfirmacion] = useState("");
//     const [error, setError] = useState("");
//     const [orderId, setOrdenId] = useState("");

//     //Funciones y validaciones: 

//     const manejadorFormulario = (e) => {
//         e.preventDefault();

//         //Verificamos que los campos esten completos: 
//         if(!nombre || !apellido || !telefono || !email || !emailConfirmacion) {
//             setError("Por favor complete todos los campos");
//             return;
//         }

//         //Validamos que los campos del email coincidan: 
//         if(email !== emailConfirmacion) {
//             setError("Los campos del email no coinciden, maldito seas!!");
//             return;
//         }

//         //Paso 1: Creamos el objeto de la orden. 
//         const orden = {
//             items: carrito.map( producto => ({
//                 id: producto.item.id,
//                 nombre: producto.item.nombre,
//                 cantidad: producto.cantidad
//             })),
//             total: cantidadTotal,
//             nombre,
//             apellido,
//             telefono,
//             email
//         };

//         //Paso 2: Guardamos la orden en la base de datos

//         addDoc(collection(db, "ordenes"), orden)
//             .then(docRef => {
//                 setOrdenId(docRef.id);
//                 vaciarCarrito();
//             })
//             .catch(error => {
//                 console.log("Error al crear la orden", error);
//                 setError("Se produjo un error al crear la orden, vuelva prontus");
//             })
//     }

//   return (
//     <div>
//         <h2>Checkout</h2>
//         <form onSubmit={manejadorFormulario}>
//             {carrito.map(producto => (
//                 <div key={producto.id}>
//                     <p>
//                         {producto.item.nombre} x {producto.cantidad}
//                     </p>
//                     <p>Precio $ {producto.item.precio} </p>
//                     <hr />
//                 </div>
//             ))}
//             <hr />

//                 <div>
//                     <label htmlFor="nombre"> Nombre </label>
//                     <input type="text" value={nombre} onChange={(e)=>setNombre(e.target.value)} />
//                 </div>

//                 <div>
//                     <label htmlFor=""> Apellido </label>
//                     <input type="text" value={apellido} onChange={(e)=>setApellido(e.target.value)} />
//                 </div>

//                 <div>
//                     <label htmlFor=""> Telefono </label>
//                     <input type="text" value={telefono} onChange={(e)=>setTelefono(e.target.value)} />
//                 </div>

//                 <div>
//                     <label htmlFor=""> Email </label>
//                     <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
//                 </div>

//                 <div>
//                     <label htmlFor=""> Email Confirmación </label>
//                     <input type="email" value={emailConfirmacion} onChange={(e)=>setEmailConfirmacion(e.target.value)} />
//                 </div>

//                 {
//                     error && <p style={{color:"red"}}> {error} </p>
//                 }

//                 <button type="submit"> Finalizar Compra </button>
//         </form>
//         {
//             orderId && (
//                 <strong>¡Gracias por tu compra! Tu número de orden es {orderId} </strong>
//             )
//         }


//     </div>
//   )
// }

// export default Checkout

/////////////////////////////////////

// Versión actualizando STOCK: 

import { useState, useContext } from "react";
import { CarritoContext } from '../../context/CarritoContext';
import { db } from "../../services/config";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import './Checkout.css'

const Checkout = () => {
    const { carrito, vaciarCarrito, cantidadTotal } = useContext(CarritoContext);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [emailConfirmacion, setEmailConfirmacion] = useState("");
    const [error, setError] = useState("");
    const [orderId, setOrdenId] = useState("");

    //Funciones y validaciones: 

    const manejadorFormulario = (e) => {
        e.preventDefault();

        //Verificamos que los campos esten completos: 
        if (!nombre || !apellido || !telefono || !email || !emailConfirmacion) {
            setError("Por favor complete todos los campos");
            return;
        }

        //Validamos que los campos del email coincidan: 
        if (email !== emailConfirmacion) {
            setError("Los campos del email no coinciden, maldito seas!!");
            return;
        }

        //Paso 1: Creamos el objeto de la orden. 
        const orden = {
            items: carrito.map(producto => ({
                id: producto.item.id,
                nombre: producto.item.nombre,
                cantidad: producto.cantidad
            })),
            total: cantidadTotal,
            nombre,
            apellido,
            telefono,
            email,
            fecha: new Date()
        };

        //Vamos a modificar el código para que ejecute varias promesas en parelelo, por un lado quiero que actualice el stock de productos y por otro lado quiero que genere una orden de compra. Promise.All me permite todo esto. 

        Promise.all(
            orden.items.map(async (productoOrden) => {
                const productoRef = doc(db, "productos", productoOrden.id);
                //Por cada producto en la coleecion "productos" obtengo una referencia.
                const productoDoc = await getDoc(productoRef);
                const stockActual = productoDoc.data().stock;
                //Data me permite acceder a la información del documento. 

                await updateDoc(productoRef, {
                    stock: stockActual - productoOrden.cantidad
                });
                //Modifico el stock y subo la información actualizada. 
            })
        )
            .then(() => {
                //Guardamos la orden en la base de datos: 
                addDoc(collection(db, "ordenes"), orden)
                    .then((docRef) => {
                        setOrdenId(docRef.id);
                        vaciarCarrito();
                    })
                    .catch((error) => {
                        console.log("Error al crear la orden", error);
                        setError("Error al crear la orden, vuelva más tarde");
                    })
            })
            .catch((error) => {
                console.log("Error al actualizar el stock. Dedicate a otra cosa", error);
                setError("Error al actualizar el stock. Intente nuevamente");
            })

    }

    return (
        <div>
            <h2>Checkout</h2>
            <form onSubmit={manejadorFormulario} className="formulario">
                {carrito.map(producto => (
                    <div key={producto.id}>
                        <p>
                            {producto.item.nombre} x {producto.cantidad}
                        </p>
                        <p>Precio $ {producto.item.precio} </p>
                        <hr />
                    </div>
                ))}
                <hr />

                <div className="form-group">
                    <label htmlFor="nombre"> Nombre </label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>

                <div className="form-group">
                    <label htmlFor=""> Apellido </label>
                    <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                </div>

                <div className="form-group">
                    <label htmlFor=""> Telefono </label>
                    <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>

                <div className="form-group">
                    <label htmlFor=""> Email </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="form-group">
                    <label htmlFor=""> Email Confirmación </label>
                    <input type="email" value={emailConfirmacion} onChange={(e) => setEmailConfirmacion(e.target.value)} />
                </div>

                {
                    error && <p style={{ color: "red" }}> {error} </p>
                }

                <button type="submit"> Finalizar Compra </button>
            </form>
            {
                orderId && (
                    <strong className="ordenId">¡Gracias por tu compra! Tu número de orden es {orderId} </strong>
                )
            }


        </div>
    )
}

export default Checkout