import Image from 'next/image'
import Hero from './Components/Hero'
import AboutSection from './Components/AboutUs'

export default function Home() {
  return (
    <div>
      <main>
        <Hero />
        <AboutSection />
      </main>
    </div>
  )
}