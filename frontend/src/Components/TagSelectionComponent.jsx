import React from 'react';
import '/src/css/TagSelectionComponent.css';

const TagSelectionComponent = ({ tags, setDisplayedTags }) => {
  const handleTagChange = (event) => {
    const tag = event.target.value;
    setDisplayedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  return (
    <div className="tag-selection-component">
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
    </div>
  );
};

export default TagSelectionComponent;
