//1) Voy a importar el hook useState y createContext que me permite crear un contexto que va a almacenar toda la lógica de mi carrillo de compras. 

import { useState, createContext } from "react";

//2) Creamos el nuevo contexto. 

export const CarritoContext = createContext({
    carrito: [],
    total: 0,
    cantidadTodal: 0
})

//3) Creamos un componente llamado "CarritoProvider". 
//También lo pueden encontrar como "proveedor de contextos". 

export const CarritoProvider = ({children}) => {
    //4) Creamos un estado local "carrito, total y cantidad total" con el hook useState.
    const [carrito, setCarrito] = useState([]);
    const [total, setTotal] = useState(0);
    const [cantidadTotal, setCantidadTotal] = useState(0);

    //No se olviden de esto: verifiquen el carrito por consola. 
    console.log(carrito);

    //5) Agregamos algunos métodos al proveedor de contexto para manipular el carrito de compras: 

    //Función agregar al carrito: 

    const agregarProducto = (item, cantidad) => {
        const productoExistente = carrito.find(prod => prod.item.id === item.id);

        if(!productoExistente) {
            setCarrito(prev => [...prev, {item, cantidad}]);
            //La sintaxis: prev => [...prev, {item, cantidad}] la uso para crear un nuevo array a partir del estado anterior del carrito (prev) y agregar un nuevo objeto que representa el nuevo producto. 
            setCantidadTotal(prev => prev + cantidad);
            setTotal(prev => prev + (item.precio * cantidad));
        } else {
            const carritoActualizado = carrito.map ( prod => {
                if(prod.item.id === item.id) {
                    return {...prod, cantidad: prod.cantidad + cantidad};
                } else {
                    return prod;
                }
            });
            setCarrito(carritoActualizado);
            setCantidadTotal(prev => prev + cantidad);
            setTotal(prev => (item.precio * cantidad));
        }
    }

    //Función para eliminar productos del carrito: 

    const eliminarProducto = (id) => {
        const productoEliminado = carrito.find( prod => prod.item.id === id);
        const carritoActualizado = carrito.filter(prod => prod.item.id !== id); 
        setCarrito(carritoActualizado);
        setCantidadTotal(prev => prev - productoEliminado.cantidad);
        setTotal(prev => prev - (productoEliminado.item.precio * productoEliminado.cantidad));
    }

    //Función para vaciar el carrito de compras: 

    const vaciarCarrito = () => {
        setCarrito([]);
        setCantidadTotal(0);
        setTotal(0);
    }


    //6) Usamos el componente CarritoContext.Provider para enviar el valor actual del carrito y los métodos a los componentes de mi aplicación que lo necesiten. 

    return (
        <CarritoContext.Provider value={{carrito, total, cantidadTotal, agregarProducto, eliminarProducto, vaciarCarrito}}>
            {children}
        </CarritoContext.Provider>
    )
}

//7) Children: propiedad especial que se utiliza para representar a todos aquellos componentes que pueden necesitar el carrito y sus métodos. 