import Image from 'next/image'
import Hero from './Components/Hero'
import AboutSection from './Components/AboutUs'
import OurService from './Components/OurService'

export default function Home() {
  return (
    <div>
      <main>
        <Hero />
        <AboutSection />
        <OurService />

      </main>
    </div>
  )
}