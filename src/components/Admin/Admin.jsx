import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import AddNews from "../AddNews/AddNews";
import AddEvents from "../AddEvents/AddEvents";
import RemoveNew from "../RemoveNew/RemoveNew";
import RemoveEvent from "../RemoveEvent/RemoveEvent";
import EditNews from "../EditNews/EditNews";
import EditEvent from "../EditEvent/EditEvent";

const Admin = () => {
  return (
    <div className="d-flex flex-wrap align-items-start justify-content-center py-5 gap-4">
      <Sidebar />
      <Routes>
        <Route path="/addnews" element={<AddNews />} />
        <Route path="/addevents" element={<AddEvents />} />
        <Route path="/removenew" element={<RemoveNew />} />
        <Route path="/removeevent" element={<RemoveEvent />} />
        <Route path="/editnew" element={<EditNews />} />
        <Route path="/editevent" element={<EditEvent />} />
      </Routes>
    </div>
  );
};

export default Admin;
