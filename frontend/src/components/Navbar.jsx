import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/logo.svg';

function CustomNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <Navbar className="bg-body-tertiary" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src={logo}
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt="KU Hangout logo"
          />
          <span 
            className="fw-bold"
            style={{
              fontSize: '1.4rem',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              letterSpacing: '0.5px',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ color: '#28a745' }}>KU</span>
            <span style={{ color: '#2d2d2dff' }}> Hangout</span>
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              // แสดงเมนูสำหรับผู้ใช้ที่ล็อกอินแล้ว
              <>
                <Nav.Link as={Link} to="/home" className={location.pathname === '/home' ? 'active' : ''}>
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                  Profile
                </Nav.Link>
                <Nav.Link onClick={logout} className="text-danger">
                  Logout
                </Nav.Link>
              </>
            ) : (
              // แสดงเมนูสำหรับผู้ใช้ที่ยังไม่ได้ล็อกอิน
              <>
                <Nav.Link as={Link} to="/login" className={location.pathname === '/login' ? 'active' : ''}>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className={location.pathname === '/register' ? 'active' : ''}>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
