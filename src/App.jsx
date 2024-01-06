import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Homepage from "./pages/homepage/index.jsx";
import CreateEvent from "./pages/create-event/index.jsx";
import MyEvents from "./pages/my-events/index.jsx";
import EventPage from "./pages/event-page/index.jsx";
import MyTickets from "./pages/my-tickets/index.jsx";
import Header from "./pages/components/content/Header.jsx";
import Sidebar from "./pages/components/content/Sidebar.jsx";
import { useState} from "react";
function App() {
    const [data, setData] = useState("");

    // Function to update state with API response
    const handleAccountChange = (data) => {
        setData(data);
    };

  return (
    <>
      <div className="h-full bg-gray-800">
          <div>
              <Header onAccountChange ={handleAccountChange}/>
          </div>
          <div id="body" className="h-full w-full flex">
              <Sidebar/>
              <BrowserRouter>
                  <Routes>
                      <Route path="/" element={<Homepage/>} />
                      <Route path="/create-event" element={<CreateEvent/>} />
                      <Route path="/my-events" element={<MyEvents data={data}/>} />
                      <Route path="/events/:id"  element={<EventPage data={data}/>} />
                      <Route path="/tickets" element={<MyTickets data={data}/>} />
                  </Routes>
              </BrowserRouter>
          </div>
      </div>
    </>
  )
}

export default App
