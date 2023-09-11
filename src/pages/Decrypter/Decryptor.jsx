import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Header";
import Footer from "./Footer";
import "./Decryptor.scss";
import { Copy, Interchange } from "./svgs";
import Binary from "./Converter/Binary";
import English from "./Converter/English";

const Decrypter = () => {
  const [isActive, setIsActive] = useState("Eng");
  const [text, setText] = useState("");
  const [binText, setBinText] = useState("");

  function copyToClipboard(type) {
    let copyText = ""
    if (type === 'ENG') {
      copyText = text
    }
    if (type === 'BIN') {
      copyText = binText
    }
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(copyText).then(() => {
        toast.info("Copied to Clipboard", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "background",
          bodyClassName: "toastBody",
        });
      });
    }
  }
  function textToBinary() {
    let res = "";
    res = text
      .split("")
      .map((char) => {
        return char.charCodeAt(0).toString(2);
      })
      .join(" ");
    return res;
  }

  function binToText() {
    return binText
      .split(" ")
      .map((x) => String.fromCharCode(parseInt(x, 2)))
      .join("");
  }

  useEffect(() => {
    if (isActive === "Eng") {
      setBinText(textToBinary());
    } else {
      setText(binToText());
    }
  }, [binText, text]);

  function change() {
    setIsActive((prev) => {
      if (prev === "Eng") {
        return "Bin";
      } else {
        return "Eng";
      }
    });
  }

  function getEnglish() {
    return (
      <div className="w-50">
        <div className="converter-top flex">
          <span className="p-l-10">ENGLISH</span>
          <span className="icon flex">
            <span onClick={() => { copyToClipboard('ENG') }}>{Copy()}</span>
          </span>
        </div>
        <div className="converter-body">
          <English
            isActive={isActive === "Eng" ? true : false}
            text={text}
            setText={setText}
          />
        </div>
      </div>
    );
  }

  function getBinary() {
    return (
      <div className="w-50">
        <div className="converter-top flex">
          <span className="p-l-10">BINARY</span>
          <span className="icon flex">
            <span
              onClick={() => {
                copyToClipboard('BIN');
              }}
            >
              {Copy()}
            </span>
          </span>
        </div>
        <div className="converter-body">
          <Binary
            isActive={isActive !== "Eng" ? true : false}
            binText={binText}
            setBinText={setBinText}
            setText={setText}
          />
        </div>
      </div>
    );
  }
  return (
    <div className='decryptor-container'>
      <ToastContainer />
      <Header />
      <h2 className="heading">Here's your free Spy Tool!</h2>
      <div className="converter-wrapper flex">
        <p className="interchangeBtn">
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              change();
            }}
          >
            {Interchange()}
          </span>
        </p>

        {isActive === "Eng" ? getEnglish() : getBinary()}
        {isActive === "Eng" ? getBinary() : getEnglish()}
      </div>
      <Footer />
    </div>
  );
};

export default Decrypter;
