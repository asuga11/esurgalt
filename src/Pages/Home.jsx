import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HomeHero from "./HomeHero";
import SurgaltHome from "../components/Surgalt/SurgaltHome";
import SorilHome from "../components/Soril/SorilHome";

const Home = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash !== "#featured-courses") return;
    const heading = document.getElementById("featured-courses");
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView();
  }, [hash]);

  return (
    <div>
      <HomeHero />
      <SurgaltHome />
      <SorilHome />
    </div>
  );
};

export default Home;
