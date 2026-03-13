import { useEffect } from "react";
import api from "./api/axios";

export default function App() {

  useEffect(() => {
    api.get("/test")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <h1>React connect ke Laravel</h1>
  );
}