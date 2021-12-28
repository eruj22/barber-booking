import axios from "axios";
import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";

function Success() {
  const [getGifs, setGetGifs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const randomNumber = Math.floor(Math.random() * 50);

  useEffect(() => {
    axios
      .get(
        "https://api.giphy.com/v1/gifs/search?api_key=KeTn0RgXZQF8EDkUGgQmSaJYuWPEz5mI&q=barber"
      )
      .then((response) => {
        setGetGifs(response.data.data);
        setIsLoading(false);
      })
      .catch((error) => console.log(error));
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="success">
      <div className="container">
        <h1 className="success__title">success</h1>

        <img
          className="success__image"
          src={getGifs[randomNumber]?.images.fixed_height.url}
          alt=""
        />
      </div>
    </section>
  );
}

export default Success;
