import { useRef } from 'react';
import { FaMapMarkerAlt, FaClock, FaPhone, FaInstagram } from 'react-icons/fa';
import '../../styles/sections/Location.css';

const Location = () => {
  const locationRef = useRef(null);
  const titleRef = useRef(null);
  const infoRef = useRef(null);
  const mapRef = useRef(null);

  return (
    <section ref={locationRef} className="location section" id="location">
      <div className="container">
        <h2 ref={titleRef} className="section-title">Encontranos:</h2>
        
        <div className="location-content">
          <div ref={infoRef} className="location-info">
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <h3>Dirección</h3>
                <p>123 Main Street<br />Downtown, City</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaClock className="info-icon" />
              <div>
                <h3>Horarios</h3>
                <p>Lunes a domingo<br />11:00 AM - 11:00 PM</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaPhone className="info-icon" />
              <div>
                <h3>Contacto</h3>
                <p>+54 11 1123-4567</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaInstagram className="info-icon" />
              <div>
                <h3>Síguenos</h3>
                <p>@restaurant</p>
              </div>
            </div>
          </div>
          
          <div ref={mapRef} className="location-map" style={{ width: '100%', height: '100%' }}>
            <iframe
              title="Ubicación en Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105558.2618251795!2d-58.955988950000005!3d-34.23078795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bb723060430bad%3A0xaa31c9f685c849bf!2sCampana%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1750823038951!5m2!1ses-419!2sar"
              width="100%"
              height="400"
              style={{ border: 0, width: '100%', height: 400 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
