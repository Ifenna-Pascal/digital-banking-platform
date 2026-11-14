import React from "react";
import Features from "../Components/Features";
import Nav from "../Components/Nav";
import Parralax from "../Components/Parralax";
import Side_by_side from "../Components/Side_by_side";
import Twos from "../Components/Two";
import img1 from "../Util/herosvg.svg";
import img2 from "../Util/img3.svg";
import img3 from "../Util/img4.svg";

function Home() {
  return (
    <>
      <Nav />
      <Twos
        img={img1}
        text_h1="Banking that keeps up with you"
        reverse={true}
        text_p="Check your balance, send money to any account number and track every transaction, all from one dashboard."
        btn_text="Finish account setup"
      />
      <Features />
      <Side_by_side
        id="how-it-works"
        img={img3}
        btn_text="Finish setup"
        text_h1="Opened by the bank, set up by you"
        text_p="We open your account and give you a one-time setup code. Use it to choose your password, then set a 4-digit PIN that protects every transaction."
      />
      <Side_by_side
        img={img2}
        reverse={true}
        btn_text="Log in"
        btn_to="/login"
        text_h1="Works on any device"
        text_p="The dashboard works in any modern browser, on your phone, tablet or computer. Nothing to install."
      />
      <Parralax />
    </>
  );
}

export default Home;
