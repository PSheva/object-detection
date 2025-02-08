import Upper_menu from './Components/Upper_menu.jsx'
import { Route, Routes } from "react-router-dom"
import Base from './pages/base/Base' 
import { useState } from 'react'

function App() {
  const [sidebar, setSidebar] = useState(true);
  const [sidebarContent, setSidebarContent] = useState(null);
  const [tags, setTags] = useState([]); 
  const [displayedTags, setDisplayedTags] = useState([]);  // Відповідає за bounding boxes
  const [filteredTags, setFilteredTags] = useState([]); // Відповідає за видимість відео

  return (
    <>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <Base
                Upper_menu={Upper_menu}
                sidebar={sidebar}
                sidebarContent={sidebarContent}
                setSidebarContent={setSidebarContent}
                tags={tags}
                setDisplayedTags={setDisplayedTags}
                displayedTags={displayedTags} // Передаємо в Base
                filteredTags={filteredTags} // Передаємо в Base
                setFilteredTags={setFilteredTags} 
              />
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
