import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import HomePage from '../home/homepage';

function Header() {

    const [isChecked, setIsChecked] = useState(false);
    const [divHeight, setDivHeight] = useState('0px');
    const { pathname } = useLocation();

    useEffect(() => {
        const handleScroll = () => {
        setDivHeight('0px');
        setIsChecked(false);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
        window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleChange = (e) => {
        if (e.target.checked) {
        setDivHeight('220px');
        setIsChecked(true);
        } else {
        setDivHeight('0px');
        setIsChecked(false);
        }
    };

    const getPageName = () => {
        switch (pathname) {
            case '/':
                return 'Home';
            case '/about':
                return 'About';
            case '/contact':
                return 'Contact';
            case '/allpackages':
                return 'Packages';
            default:
                return '';
        }
    };

    // const { pathname } = useLocation();

    const imageUrl = `https://thepilgrimbeez.com/img/tpb-logo.png`;

    return (
        <section id="header">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12 xs-center col-md-12 col-12">
                        <div className="header_bar">
                            <div className="logo">
                                <Link to="/" className="btn">
                                    <img src={imageUrl} alt=''/>
                                </Link>
                                {/* <h3>TPB</h3> */}
                            </div>
                            <div className='primary_menu'>
                                <ul>
                                    <li 
                                        className={pathname === "/" ? "active" : ""}>
                                        <a 
                                        aria-current="page"
                                        href="/">Home</a>
                                    </li>
                                    <li
                                        className={pathname === "/about" ? "active" : ""}>
                                        <a aria-current="page"
                                        href="/about">About</a></li>
                                    <li 
                                        className={pathname === "/allpackages" ? "active" : ""}>
                                        <a aria-current="page" 
                                        href="/allpackages">Packages <iconify-icon
                                                icon="ph:arrow-up-right"></iconify-icon></a></li>
                                    <li 
                                        className={pathname === "/contact" ? "active" : ""}>
                                        <a aria-current="page" 
                                        href="/contact">Contact</a></li>
                                </ul>
                            </div>
                            <div className="action_btn">
                                <a href='#'>+91 9989897675</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Header;