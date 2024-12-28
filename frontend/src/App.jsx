import Upper_menu from './Components/Upper_menu.jsx'
import { Route, Routes} from "react-router-dom"
import Base from './pages/base/Base' 
import { useState } from 'react'





function App() {

  const [sidebar, setSidebar] = useState(true)
  const [sidebarContent, setSidebarContent] = useState(null);
  const [tags, setTags] = useState([]); 
  const [displayedTags, setDisplayedTags] = useState([]); 


  return (
    <>
    <div>
      <Upper_menu setSidebar={setSidebar}/>      
      <Routes>
          <Route path='/' element ={<Base sidebar={sidebar} 
                                          sidebarContent={sidebarContent}
                                          setSidebarContent={setSidebarContent} 
                                          tags={tags}
                                          setDisplayedTags={setDisplayedTags}/>} />
          
      </Routes>
      


    </div>
      
    </>
  )
}

export default App
