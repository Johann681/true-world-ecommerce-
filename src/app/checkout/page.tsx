"use client"
import Checkout from "../components/Checkout"
import { CartProvider } from "../components/Homepage/CartContext"
import GlassNavbar from "../components/Homepage/NavBar"
import Footer from "../components/Homepage/Footer"

const checkout = () => {
  return (
    <div>
        <CartProvider>
          <GlassNavbar/>

        <Checkout/>
            
        </CartProvider>
        <Footer/>
    
    </div>
  )
}

export default checkout