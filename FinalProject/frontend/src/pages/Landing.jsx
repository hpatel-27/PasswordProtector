import { Link } from 'react-router-dom';
import '../styles/landing.css';

const logo = '/images/managerlogomedium.png';

export default function Landing() {
  return (
    <div className="landing-page">
      <header>
        <div className="main-header">
          <a className="btn btn-primary" role="button" id="logo-container">
            <img src={logo} alt="" id="logo-img" />
          </a>
        </div>
      </header>
      <main className="container text-center">
        <h1>Welcome to Password Protector</h1>
        <p>Your reliable and secure password management solution.</p>

        <div className="row mt-4">
          <div className="col">
            <p>
              Dont have an account?
              <br />
              <Link to="/signup" className="btn btn-primary" id="signupBtn">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="col">
            <p>
              Have an account?
              <br />
              <Link to="/login" className="btn btn-primary" id="loginBtn">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
