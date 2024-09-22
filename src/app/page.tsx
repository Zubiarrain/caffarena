"use client"

import { Pizza, Clock, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { NavBar } from '@/components/shared/NavBar'

export default function Home() {

  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar/>

      <main className="pt-20">
        <section className="hero bg-black text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Probá la Diferencia</h2>
            <p className="text-xl mb-8">Pizzas artenasales hechas con pasión y los mejores ingredientes</p>
            <Link href="/menu" className="bg-yellow-500 text-black text-lg px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors">
              Ver menú
            </Link>
          </div>
        </section>

        <section id="menu" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Las más aclamadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {['Caffarena', 'Napolitana', 'Cheddar y panceta'].map((pizza) => (
                <div key={pizza} className="bg-gray-100 p-6 rounded-lg">
                  <Pizza className="w-16 h-16 mb-4 text-yellow-500" />
                  <h3 className="text-xl font-bold mb-2">{pizza}</h3>
                  <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-black text-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Caffarena Pizza</h2>
            <div className="flex flex-col md:flex-row items-center md:space-x-5">
              <div className="md:w-1/2 mb-8 md:mb-0 flex justify-center">
                <Image 
                src="/oso-caffarena.jpeg" 
                alt="Caffarena Pizza Mascota" 
                className="rounded-lg shadow-lg" 
                width={350}
                height={350}
                />
              </div>
              <div className="md:w-1/2 md:pl-4">
                <p className="text-xl mb-4">
                En Caffarena Pizza, creemos en el poder de la buena comida para unir a las personas. Nuestro viaje comenzó con la pasión por crear la pizza perfecta, y desde entonces hemos estado sirviendo sonrisas.
                </p>
                <p className="text-xl">
                Usando solo los ingredientes más frescos y técnicas tradicionales, elaboramos cada pizza con cuidado y atención a los detalles. ¡Vení y probá la diferencia en Caffarena Pizza!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Contáctanos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold mb-2">Horarios</h3>
                <p>Lun-Vie: 12hs - 15hs y 19hs - 23hs</p>
                <p>Sábados: 19hs - 23hs</p>
              </div>
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold mb-2">Ubicación</h3>
                <p>62 esquina 2</p>
                <p>La Plata, Buenos Aires</p>
              </div>
              <div className="text-center">
                <Phone className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold mb-2">Teléfono</h3>
                <p>2215455016</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Caffarena Pizza. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}