import Image from 'next/image'
import Hero from './Components/Hero'
// import AboutSection from './Components/AboutUs'
import OurService from './Components/OurService'
import Offer from './Components/Offer'

export default function Home() {
  return (
    <div>
      <main>
        <Hero />
        {/* <AboutSection /> */}
        <OurService />
        <Offer />

      </main>
    </div>
  )
}