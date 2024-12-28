import React, { useState } from 'react';
import '/src/css/FilterComponent.css';

const FilterComponent = ({ tags, filterVideos }) => {
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagChange = (event) => {
    const tag = event.target.value;
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleFilter = () => {
    filterVideos(selectedTags);
  };

  return (
    <div className="filter-component">
      <h3>Filter Videos by Tags</h3>
      {tags.map((tag) => (
        <div key={tag} className="tag-option">
          <input
            type="checkbox"
            value={tag}
            onChange={handleTagChange}
          />
          <label>{tag}</label>
        </div>
      ))}
      <button onClick={handleFilter}>Filter</button>
    </div>
  );
};

export default FilterComponent;
