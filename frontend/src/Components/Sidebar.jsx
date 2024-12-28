import React from 'react';
import '/src/css/Sidebar.css';

const Sidebar = ({ sidebar, sidebarContent, handleJsonUpload }) => {
  return (
    <div className={`sidebar ${sidebar ? '' : 'hover-sidebar'}`}>
      <div className='json-report'>
        <img src="" alt="" className="json-logo" />
        <div className="sidebar-json-upload">
          <label>Upload JSON Report:</label>
          <input type="file" accept=".json" onChange={handleJsonUpload} />
        </div>
        <h3> JSON REPORT </h3>
        
        {sidebarContent ? (
          <pre>{JSON.stringify(sidebarContent, null, 2)}</pre>
        ) : (
          <p>No content available</p>
        )}
        <hr />
        
      </div>
      <div className='hashtags'>
        <h3> Check hashtags to display</h3>
        <ul className='tags-list'>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Aeroplan</p>
          </li>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Bird</p>
          </li>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Bus</p>
          </li>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Car</p>
          </li>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Person</p>
          </li>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Train</p>
          </li>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Tvmonitor</p>
          </li>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Motorbike</p>
          </li>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Bicycle</p>
          </li>
          <li className='tag-div'>
            <input type='checkbox' />
            <p>Horse</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
