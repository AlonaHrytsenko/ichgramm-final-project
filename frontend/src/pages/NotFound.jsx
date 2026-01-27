import { Link } from 'react-router-dom'
import picture from '../assets/Background.jpg'
import './NotFound.css'

const NotFound = () => {
  return (
    <div className="not-found-container">
      <img src={picture} alt="Phones preview" className="phones-img" />
      <div>
        <h2>Oops! Page Not Found (404 Error)</h2>
        <p>
          We're sorry, but the page you're looking for doesn't seem to exist. If
          you typed the URL manually, please double-check the spelling. If you
          clicked on a link, it may be outdated or broken.
          <br />
          <Link to="/">Go back to ICHGRAM.</Link>
        </p>
      </div>
    </div>
  )
}

export default NotFound
