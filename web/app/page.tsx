import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { ConstellationDivider } from "@/components/sections/ConstellationDivider";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <ConstellationDivider />
      <Projects />
      <Contact />
    </>
  );
}
