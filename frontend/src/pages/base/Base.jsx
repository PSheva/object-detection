import React from 'react';
import '/src/css/Base.css';
import Sidebar from '../../Components/Sidebar';
import PlayManager from '../../Components/PlayManager';

const Base = ({
  Upper_menu, 
  sidebar,
  sidebarContent,
  setSidebarContent,
  tags,
  displayedTags,
  setDisplayedTags,
  filteredTags,
  setFilteredTags
}) => {
  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = JSON.parse(e.target.result);
        setSidebarContent(json);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      {Upper_menu && <Upper_menu setSidebar={setSidebarContent} />}

      <Sidebar
        sidebar={sidebar}
        sidebarContent={sidebarContent}
        handleJsonUpload={handleJsonUpload}
        displayedTags={displayedTags} // Передаємо у Sidebar.jsx
        setDisplayedTags={setDisplayedTags} 
        filteredTags={filteredTags}
        setFilteredTags={setFilteredTags}
      />
      
      <div className={`container ${sidebar ? 'opened-sidebar' : ''}`}>
        <PlayManager 
          displayedTags={displayedTags} // Передаємо у PlayManager.jsx
          filteredTags={filteredTags} // Передаємо у PlayManager.jsx (майбутній функціонал)
          setSidebarContent={setSidebarContent} 
        />
      </div>
    </>
  );
};

export default Base;
