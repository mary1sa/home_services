import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTools, FaTree, FaFaucet, FaBolt, FaHammer, 
  FaHome, FaPaintRoller, FaBroom, FaFan, 
  FaWindowMaximize, FaBuilding 
} from 'react-icons/fa';
import './Categories.css';

const Categories = ({ categories }) => {
  const navigate = useNavigate();

  // Map category names to icons
  const categoryIcons = {
    'Handyperson': <FaTools size={24} />,
    'Landscaping': <FaTree size={24} />,
    'Plumbing': <FaFaucet size={24} />,
    'Electrical': <FaBolt size={24} />,
    'Remodeling': <FaHammer size={24} />,
    'Roofing': <FaHome size={24} />,
    'Painting': <FaPaintRoller size={24} />,
    'Cleaning': <FaBroom size={24} />,
    'HVAC': <FaFan size={24} />,
    'Windows': <FaWindowMaximize size={24} />,
    'Concrete': <FaBuilding size={24} />
  };

  const handleCategoryClick = (categoryId) => {
    // Navigate to category services page
    navigate(`/categories/${categoryId}/services`);
  };

  return (
    <section id="categories" className="categories-section">
      <h2 className="section-title">Service Categories</h2>

      <div className="categories-grid">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="category-item"
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="category-icon">
              {categoryIcons[category.name] || <FaTools size={24} />}
            </div>
            <span className="category-name">{category.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;