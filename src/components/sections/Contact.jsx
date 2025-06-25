import { useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import '../../styles/sections/Contact.css';

const Contact = () => {
  const contactRef = useRef(null);
  const titleRef = useRef(null);
  const formRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    // WhatsApp functionality will be implemented later
    console.log('Form data:', formData);
  };

  return (
    <section ref={contactRef} className="contact section" id="contact">
      <div className="container">
        <h2 ref={titleRef} className="section-title">Contáctanos</h2>
        
        <div className="contact-content">
          <div className="contact-info">
            <h3>¿Tienes alguna pregunta?</h3>
            <p>Escríbenos y te responderemos lo antes posible. También puedes hacer tu pedido directamente por WhatsApp.</p>
          </div>
          
          <form ref={formRef} className="contact-form" onSubmit={handleWhatsAppSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Tu email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Tu teléfono"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Tu mensaje"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="btn-whatsapp">
              <FaWhatsapp className="whatsapp-icon" />
              Enviar por WhatsApp
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
