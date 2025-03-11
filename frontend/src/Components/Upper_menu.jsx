import React from 'react';
import '/src/css/Upper_menu.css';

import self_photo from '../assets/self_photo.jpg';

const upper_menu = ({ setSidebar }) => {
  return (
    <div>
      <nav className="flex-div-upper flex-div">
        <div className="left-nav flex-div">
          <img
            className="upper-menu-icon"
            onClick={() =>
              setSidebar((prev) => (prev === false ? true : false))
            }
            src="src/assets/vision.png"
            alt=""
          />

          {/* <img className='logo' src="logo" alt="" /> */}
        </div>

        <div className="center-nav flex-div"></div>
        <div className="search-box flex-div">
          {/* <input type="text" name="" id=""  placeholder='Test-placeholder'/> */}
          {/* <img src={self_photo} alt="" /> */}
        </div>

        <div className="right-nav flex-nav">
          {/* <img src={self_photo} alt="" />
          <img src={self_photo} alt="" />
          <img src={self_photo} alt="" />
          <img src={self_photo} alt="" /> */}
        </div>
      </nav>
    </div>
  );
};

export default upper_menu;
