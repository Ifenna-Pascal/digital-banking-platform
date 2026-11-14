import React from "react";
import { Link } from "react-router-dom";

interface IProps {
  id?: string;
  img?: string;
  text_p?: string;
  text_h1?: string;
  reverse?: boolean;
  btn_text?: string;
  btn_to?: string;
}

const Side_by_side: React.FC<IProps> = ({
  id,
  img,
  btn_text,
  btn_to = "/register",
  text_p,
  text_h1,
  reverse,
}) => {
  return (
    <section
      id={id}
      className="w-full py-12 px-6 sm:px-12 flex flex-col bg-gray-100 items-center"
    >
      <div
        className={`container flex flex-col mb-8 mt-6 ${
          reverse ? "lg:flex-row-reverse" : "lg:flex-row"
        } items-center justify-center gap-x-24 gap-y-6`}
      >
        <div className="flex flex-1 justify-center">
          <img className="w-full sm:w-3/4 md:w-full" src={img} alt="" />
        </div>
        <div className="flex px-3 flex-1 flex-col sm:gap-5 gap-3 items-center lg:items-start">
          <h2 className="sm:text-5xl text-3xl leading-tight text-center lg:text-left font-Poppins font-bold text-indigo-500">
            {text_h1}
          </h2>
          <p className="text-gray-500 font-Poppins text-md sm:text-lg my-2 sm:my-4 text-center lg:text-left lg:w-3/4">
            {text_p}
          </p>
          {btn_text && (
            <Link to={btn_to}>
              <button type="button" className="text-sm">
                {btn_text}
                <i
                  className="text-sm ml-1 text-white fas fa-angle-right"
                  aria-hidden="true"
                ></i>
              </button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Side_by_side;
