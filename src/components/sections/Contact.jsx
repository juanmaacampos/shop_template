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
    
    // Construir mensaje para WhatsApp
    let message = `¡Hola! Me gustaría hacer una consulta:\n\n`;
    message += `👤 *Nombre:* ${formData.name}\n`;
    message += `📞 *Teléfono:* ${formData.phone}\n`;
    message += `📧 *Email:* ${formData.email}\n\n`;
    
    if (formData.message.trim()) {
      message += `💬 *Mensaje:*\n${formData.message}\n\n`;
    }
    
    message += `¡Gracias!`;
    
    // Crear URL de WhatsApp
    const phoneNumber = "5493492648488"; // Cambiar por el número del restaurante
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    console.log('Form data:', formData);
    console.log('WhatsApp message:', message);
  };

  return (
    <section ref={contactRef} className="contact section" id="contact">
      <div className="container">
        <h2 ref={titleRef} className="section-title">Contáctanos</h2>
        
        <div className="contact-content">
          <div className="contact-info">
            <h3>¿Tienes alguna consulta?</h3>
            <p>Completa el formulario y te responderemos por WhatsApp.</p>
          </div>
          
          <form ref={formRef} className="contact-form" onSubmit={handleWhatsAppSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Tu mensaje"
                rows="4"
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
