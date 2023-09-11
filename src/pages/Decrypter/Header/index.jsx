import React from "react";
import { Link } from "react-router-dom";
import "./Header.scss";


const Header = () => {
  return (
    <div className="flex space-between header">
      <div className="tekieLogo">
        <Link to="/">
          <div
            style={{
              width: "100px",
              height: "30px",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          ></div>
        </Link>
      </div>
      {/* <span>Decryptor</span> */}
      {/* <span>{SpySquad()}</span> */}
    </div>
  );
};

export default Header;
