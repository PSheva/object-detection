import React from 'react';
import '/src/css/Base.css';
import Sidebar from '../../Components/Sidebar';
import PlayManager from '../../Components/PlayManager';

const Base = ({ sidebar, sidebarContent, setSidebarContent, tags, setDisplayedTags }) => {
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
      <Sidebar
        sidebar={sidebar}
        sidebarContent={sidebarContent}
        handleJsonUpload={handleJsonUpload}
      />
      <div className={`container ${sidebar ? 'opened-sidebar' : ''}`}>
        <PlayManager filterTags={tags} setSidebarContent={setSidebarContent} />
      </div>
    </>
  );
};

export default Base;
