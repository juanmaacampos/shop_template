import { useRef } from 'react';
import '../../styles/ui/MenuItem.css';

const MenuItem = ({ item }) => {
  const itemRef = useRef(null);

  return (
    <div ref={itemRef} className="menu-item">
      <div className="menu-item-image">
        <img src={item.image} alt={item.title} />
      </div>
      <div className="menu-item-content">
        <h4 className="menu-item-title">{item.title}</h4>
        <p className="menu-item-description">{item.description}</p>
        <div className="menu-item-price">{item.price}</div>
      </div>
    </div>
  );
};

export default MenuItem;
