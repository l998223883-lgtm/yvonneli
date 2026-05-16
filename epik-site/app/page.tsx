import Nav from "@/components/Nav";
import Hero from "./sections/Hero";
import Work from "./sections/Work";
import Experience from "./sections/Experience";
import Practice from "./sections/Practice";
import Notes from "./sections/Notes";
import Contact from "./sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Experience />
        <Practice />
        <Notes />
        <Contact />
      </main>
    </>
  );
}
