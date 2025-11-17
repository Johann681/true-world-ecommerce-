"use client"
import Checkout from "../components/Checkout"
import { CartProvider } from "../components/Homepage/CartContext"
import GlassNavbar from "../components/Homepage/NavBar"


const checkout = () => {
  return (
    <div>
        <CartProvider>
          <GlassNavbar/>

        <Checkout/>
            
        </CartProvider>
    
    </div>
  )
}

export default checkout