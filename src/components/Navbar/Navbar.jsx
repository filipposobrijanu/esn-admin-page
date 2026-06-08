import "./NavBar.css";
import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/esnunipi.png";
import nav_dropdown from "../../assets/nav_dropdown.png";
const NavBar = () => {
  const [hover, setHover] = useState(false);

  const location = useLocation();

  const menuRef = useRef();
  const menuRef1 = useRef();
  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    // Close Bootstrap dropdowns
    const dropdowns = document.querySelectorAll(".dropdown-menu.show");
    dropdowns.forEach((dropdown) => {
      const dropdownInstance = bootstrap.Dropdown.getInstance(
        dropdown.previousElementSibling
      );
      if (dropdownInstance) {
        dropdownInstance.hide();
      }
    });

    // Close mobile menu
    if (menuRef.current?.classList.contains("nav-menu-visible")) {
      menuRef.current.classList.remove("nav-menu-visible");
      menuRef1.current?.classList.remove("navbar-height");
    }
  };
  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle("nav-menu-visible");
    menuRef1.current.classList.toggle("navbar-height");
    e.target.classList.toggle("open");
  };
  // Enhanced click handler for all links
  const handleLinkClick = () => {
    closeAllDropdowns();
    scrollTo(0, 0);
  };

  // Replace the scroll effect with this for gradual scaling
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.pageYOffset || document.documentElement.scrollTop);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // Calculate scale factor based on scroll position
  const getScaleFactor = () => {
    const maxScroll = 100; // Adjust this value
    if (window.innerWidth < 576) return 1; // No scaling on small screens
    const scale = Math.max(0.9, 1 - (scrollY / maxScroll) * 0.2);
    return scale;
  };
  return (
    <>
      <main className="content">{/* Your page content */}</main>
      <div className="fixed-top bg-white">
        <div className="color-bar-container">
          <div className="color-bar">
            <div className="color-block blue"></div>
            <div className="color-block pink"></div>
            <div className="color-block green"></div>
            <div className="color-block orange"></div>
            <div className="color-block blue"></div>
            <div className="color-block pink"></div>
            <div className="color-block green"></div>
            <div className="color-block orange"></div>
            <div className="color-block blue"></div>
            <div className="color-block pink"></div>
            <div className="color-block green"></div>
            <div className="color-block orange"></div>
            <div className="color-block blue"></div>
            <div className="color-block pink"></div>
            <div className="color-block green"></div>
            <div className="color-block orange"></div>
            <div className="color-block blue"></div>
          </div>
        </div>
        <nav
          ref={menuRef1}
          className="navbar navbar-expand-lg bg-body-dark main-nav-bg p-0 py-2 px-2 px-lg-5"
        >
          <div className="container-fluid px-3 px-sm-5">
            <Link
              className="navbar-brand text-black fw-bold fs-5"
              to="/home"
              onClick={() => {}}
            >
              <img
                width={`${150 * getScaleFactor()}px`}
                style={{
                  transform: `scale(${getScaleFactor()})`,
                  transition: "all 0.3s ease-in-out",
                }}
                src={logo}
                alt=""
              />
            </Link>
            <ul
              ref={menuRef}
              className="nav-menu gap-0 navbar-nav me-auto mb-2 fs-6 px-2"
            >
              <li
                className="nav-item"
                style={{
                  textDecoration: "none",
                }}
              >
                <div className="nav-item dropdown">
                  <Link style={{ textDecoration: "none" }} to="/">
                    <button
                      className="btn align-items-center d-flex py-1 rounded-4  fw-bold"
                      role="button"
                      aria-expanded="false"
                      onClick={() => {
                        handleLinkClick();
                      }}
                      style={{ color: "#919191ff" }}
                    >
                      <span>ADMIN</span>
                    </button>
                  </Link>
                </div>
              </li>
              <li
                className="nav-item"
                style={{
                  textDecoration: "none",
                }}
              >
                <div className="nav-item dropdown">
                  <Link style={{ textDecoration: "none" }} to="/emails">
                    <button
                      className="btn align-items-center d-flex py-1 rounded-4  fw-bold"
                      role="button"
                      aria-expanded="false"
                      onClick={() => {
                        handleLinkClick();
                      }}
                      style={{ color: "#919191ff" }}
                    >
                      <span>CONTACT EMAILS</span>
                    </button>
                  </Link>
                </div>
              </li>
              <li
                className="nav-item"
                style={{
                  textDecoration: "none",
                }}
              >
                <div className="nav-item dropdown">
                  <Link style={{ textDecoration: "none" }} to="/join-us-emails">
                    <button
                      className="btn align-items-center d-flex py-1 rounded-4  fw-bold"
                      role="button"
                      aria-expanded="false"
                      onClick={() => {
                        handleLinkClick();
                      }}
                      style={{ color: "#919191ff" }}
                    >
                      <span>JOIN US APPS</span>
                    </button>
                  </Link>
                </div>
              </li>
            </ul>
            <form className="d-flex gap-2" role="search">
              <button
                onClick={dropdown_toggle}
                className="nav-dropdown btn btn-light align-items-center d-flex rounded-5"
                type="button"
                style={{
                  background: "rgb(224, 224, 224)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="black"
                  className="bi bi-list"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                  />
                </svg>
              </button>
              <div className="d-flex gap-2">
                <Link to={"http://localhost:5173"} target="_blank">
                  <button
                    type="button"
                    className="btn border-0 rounded-5 justify-content-center btn-outline-dark align-items-center d-flex p-2"
                    style={{
                      width: "36px",
                      height: "36px",
                      backgroundColor: "#020202ff",
                    }}
                    onClick={() => {
                      scrollTo(0, 0);
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="white"
                      class="bi bi-person-circle"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                      <path
                        fill-rule="evenodd"
                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </nav>
      </div>
    </>
  );
};

export default React.memo(NavBar);
