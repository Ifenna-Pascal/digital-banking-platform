import React from "react";
import { Link } from "react-router-dom";

interface IProps {
  img?: string;
  text_p?: string;
  text_h1?: string;
  reverse?: boolean;
  btn_text?: string;
  btn_to?: string;
}

// Hero: big headline, short pitch and one call to action, beside an illustration.
const Twos: React.FC<IProps> = ({
  img,
  text_p,
  text_h1,
  reverse,
  btn_text = "Get started",
  btn_to = "/register",
}) => {
  return (
    <div className="md:py-24 md:px-12 py-10 flex md:mb-8 flex-col items-center">
      <div
        className={`container flex flex-col ${
          reverse ? "lg:flex-row-reverse" : "lg:flex-row"
        } items-center justify-center gap-x-24 gap-y-8`}
      >
        <div className="flex md:basis-1/2 justify-center">
          <img className="w-full sm:w-3/4 md:w-full" src={img} alt="" />
        </div>
        <div className="flex px-3 flex-1 flex-col sm:gap-5 gap-3 items-center lg:items-start">
          <h1 className="sm:text-5xl text-4xl leading-tight text-center lg:text-left font-Poppins font-bold text-indigo-500">
            {text_h1}
          </h1>
          <p className="text-gray-500 font-Poppins text-lg my-2 sm:my-4 text-center lg:text-left lg:w-3/4">
            {text_p}
          </p>
          <Link to={btn_to}>
            <button type="button" className="text-sm">
              {btn_text}{" "}
              <i
                className="text-sm ml-1 text-white fas fa-angle-right"
                aria-hidden="true"
              ></i>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Twos;
