import Hero from "../components/Hero";
import SEO from "../components/SEO";

const HomePage = () => {
  return (
    <>
      <SEO
        title="Home"
        description="Master programming languages, data structures, algorithms, and system design with codecript. Your ultimate resource for interview preparation and software engineering skills."
      />
      <Hero />
    </>
  );
};

export default HomePage;
