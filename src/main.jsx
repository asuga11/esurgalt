import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { MainStore } from "./Context/MainContext";
import "@fontsource-variable/nunito";
import "./index.css";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter basename={basename}>
    <MainStore>
      <Toaster position="bottom-center" />
      <App />
    </MainStore>
  </BrowserRouter>
);
