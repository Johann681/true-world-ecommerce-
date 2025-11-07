"use client"
import Checkout from "../components/Checkout"
import { CartProvider } from "../components/Homepage/CartContext"


const checkout = () => {
  return (
    <div>
        <CartProvider>

        <Checkout/>
            
        </CartProvider>
    
    </div>
  )
}

export default checkout