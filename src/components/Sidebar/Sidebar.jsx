import React from "react";
import "./Sidebar.css";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const locationurl = useLocation();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [emailsList, setEmailsList] = useState([]);
  const [joinUsList, setJoinUsList] = useState([]); // Separate state for Join Us
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedJoinUs, setSelectedJoinUs] = useState(""); // Separate state for Join Us selection
  const API_URL = "https://esn-unipi-backend.onrender.com";
  const fetchAllEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/allemails`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEmailsList(data);
    } catch (error) {
      console.error("Error fetching emails:", error);
      alert("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllJoinUs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/alljoinus`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJoinUsList(data);
    } catch (error) {
      console.error("Error fetching join us applications:", error);
      alert("Failed to load join us applications");
    } finally {
      setLoading(false);
    }
  };

  // Filter emails based on search term
  const filteredEmails = emailsList.filter(
    (email) =>
      email.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter join us applications based on search term
  const filteredJoinUs = joinUsList.filter(
    (application) =>
      application.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.uni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.howFound.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.whyWantJoin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  useEffect(() => {
    if (locationurl.pathname === "/emails") {
      fetchAllEmails();
      setSelectedEmail("");
    } else if (locationurl.pathname === "/join-us-emails") {
      fetchAllJoinUs();
      setSelectedJoinUs("");
    }
  }, [locationurl.pathname]);

  return (
    <>
      {locationurl.pathname === "/emails" ? (
        <div
          className="sidebar d-flex flex-column rounded-5 bg-white shadow-sm py-5 px-1"
          style={{ width: "100%", maxWidth: "850px" }}
        >
          <h5 className="fs-3 d-flex fw-bold align-items-center justify-content-center mx-auto gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-envelope"
              viewBox="0 0 16 16"
            >
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
            </svg>
            Contact Emails
          </h5>
          <hr />
          <div className="d-flex flex-column gap-4 mt-3 mx-3 mb-3">
            <div className="d-flex flex-column gap-2">
              <label className="fw-semibold">Select Email to View:</label>
              <select
                className="form-select form-select rounded-5 cursor-pointer"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
              >
                <option value="">Choose an email...</option>
                {filteredEmails.map((email) => (
                  <option key={email.id} value={email.id}>
                    {email.name} - {formatDate(email.date)}
                  </option>
                ))}
              </select>
            </div>
            {/* Selected Email Preview */}
            {selectedEmail && (
              <div className="border rounded-5 p-3 bg-light">
                <div className="d-flex gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    className="bi bi-envelope"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
                  </svg>
                  <h6 className="fw-bold fs-5">Email Details:</h6>
                </div>
                <hr className="m-0 mt-2 mb-2" />
                {emailsList
                  .filter((email) => email.id.toString() === selectedEmail)
                  .map((email) => (
                    <div key={email.id}>
                      <p className="mb-1">
                        <strong>From:</strong> {email.name}
                      </p>
                      <p className="mb-1">
                        <strong>Email:</strong>{" "}
                        <Link to={`mailto:${email.email}`}>{email.email}</Link>
                      </p>
                      <p className="mb-1">
                        <strong>Subject:</strong> {email.subject}
                      </p>
                      <p className="mb-1">
                        <strong>Message:</strong>
                      </p>
                      <p className="text-muted small">
                        {email.message.length > 150
                          ? email.message.substring(0, 150) + "..."
                          : email.message}
                      </p>
                      <p className="mb-1">
                        <strong>Date:</strong> {formatDate(email.date)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
            <hr />
            {/* Emails List */}
            <div className="mt-0">
              <h6 className="fw-bold mb-3">
                Recent Emails ({filteredEmails.length}):
              </h6>
              {loading ? (
                <div className="text-center">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredEmails.length === 0 ? (
                <p className="text-muted small text-center">No emails found</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {filteredEmails.slice(0, 5).map((email) => (
                    <div
                      id="side_but"
                      key={email.id}
                      className="border rounded-5 p-3 small cursor-pointer d-flex flex-column gap-2"
                      onClick={() => setSelectedEmail(email.id.toString())}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex gap-1 align-items-center">
                        <div className=" fw-semibold">{email.name}</div>|
                        <div className="fw-semibold">{email.email}</div>
                      </div>
                      <div className="text-muted">{email.subject}</div>
                      <div className="text-muted fw-light">
                        {formatDate(email.date)}
                      </div>
                    </div>
                  ))}
                  {filteredEmails.length > 5 && (
                    <div className="text-center text-muted small">
                      + {filteredEmails.length - 5} more emails
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : locationurl.pathname === "/join-us-emails" ? (
        <div
          className="sidebar d-flex flex-column rounded-5 bg-white shadow-sm py-5 px-1"
          style={{ width: "100%", maxWidth: "850px" }}
        >
          <h5 className="fs-3 d-flex fw-bold align-items-center justify-content-center mx-auto gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="black"
              className="bi bi-people-fill"
              viewBox="0 0 16 16"
            >
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
            </svg>
            Join Us Applications
          </h5>
          <hr />
          <div className="d-flex flex-column gap-4 mt-3 mx-3 mb-3">
            <div className="d-flex flex-column gap-2">
              <label className="fw-semibold">Select Application to View:</label>
              <select
                className="form-select form-select rounded-5 cursor-pointer"
                value={selectedJoinUs}
                onChange={(e) => setSelectedJoinUs(e.target.value)}
              >
                <option value="">Choose an application...</option>
                {filteredJoinUs.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.name} - {formatDate(application.date)}
                  </option>
                ))}
              </select>
            </div>
            {/* Selected Application Preview */}
            {selectedJoinUs && (
              <div className="border rounded-5 p-3 bg-light">
                <div className="d-flex gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    className="bi bi-person-badge-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm4.5 0a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6m5 2.755C12.146 12.825 10.623 12 8 12s-4.146.826-5 1.755V14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1z" />
                  </svg>
                  <h6 className="fw-bold fs-5">Application Details:</h6>
                </div>
                <hr className="m-0 mt-2 mb-2" />
                {joinUsList
                  .filter(
                    (application) =>
                      application.id.toString() === selectedJoinUs
                  )
                  .map((application) => (
                    <div key={application.id}>
                      <p className="mb-1">
                        <strong>Name:</strong> {application.name}
                      </p>
                      <p className="mb-1">
                        <strong>Email:</strong>{" "}
                        <Link to={`mailto:${application.email}`}>
                          {application.email}
                        </Link>
                      </p>
                      <p className="mb-1">
                        <strong>Phone:</strong> {application.phone}
                      </p>
                      <p className="mb-1">
                        <strong>University:</strong> {application.uni}
                      </p>
                      <p className="mb-1">
                        <strong>How they found us:</strong>
                      </p>
                      <p className="text-muted small mb-2">
                        {application.howFound}
                      </p>
                      <p className="mb-1">
                        <strong>Why they want to join:</strong>
                      </p>
                      <p className="text-muted small">
                        {application.whyWantJoin.length > 150
                          ? application.whyWantJoin.substring(0, 150) + "..."
                          : application.whyWantJoin}
                      </p>
                      <p className="mb-1 mt-2">
                        <strong>Date:</strong> {formatDate(application.date)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
            <hr />
            {/* Applications List */}
            <div className="mt-0">
              <h6 className="fw-bold mb-3">
                Recent Applications ({filteredJoinUs.length}):
              </h6>
              {loading ? (
                <div className="text-center">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredJoinUs.length === 0 ? (
                <p className="text-muted small text-center">
                  No applications found
                </p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {filteredJoinUs.slice(0, 5).map((application) => (
                    <div
                      id="side_but"
                      key={application.id}
                      className="border rounded-5 p-3 small cursor-pointer d-flex flex-column gap-2"
                      onClick={() =>
                        setSelectedJoinUs(application.id.toString())
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex gap-1 align-items-center">
                        <div className="fw-semibold">{application.name}</div>|
                        <div className="fw-semibold">{application.uni}</div>
                      </div>
                      <div className="text-muted">{application.email}</div>
                      <div className="text-muted fw-light">
                        {formatDate(application.date)}
                      </div>
                    </div>
                  ))}
                  {filteredJoinUs.length > 5 && (
                    <div className="text-center text-muted small">
                      + {filteredJoinUs.length - 5} more applications
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="sidebar d-flex flex-column rounded-5 bg-white shadow-sm py-5"
          style={{ width: "100%", maxWidth: "250px" }}
        >
          <h5 className="d-flex fw-bold align-items-center justify-content-center mx-auto gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-newspaper"
              viewBox="0 0 16 16"
            >
              <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5zM12 14c.37 0 .654-.211.853-.441.092-.106.147-.279.147-.531V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5z" />
              <path d="M2 3h10v2H2zm0 3h4v3H2zm0 4h4v1H2zm0 2h4v1H2zm5-6h2v1H7zm3 0h2v1h-2zM7 8h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2z" />
            </svg>
            News
          </h5>
          <div className="d-flex flex-column gap-4 mt-2 mx-5 mb-3">
            <Link
              id="side_but"
              className="d-flex rounded-5 border border-1 align-items-center justify-content-center mx-auto py-2 px-4"
              to={"/addnews"}
              style={{
                textDecoration: "none",
                width: "fit-content",
                color: "black",
              }}
            >
              <div className="sidebar-item d-flex gap-1 align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="black"
                  className="bi bi-plus"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                </svg>
                <p className="mb-0 fw-bold text-center">Add</p>
              </div>
            </Link>
            <Link
              id="side_but"
              className="d-flex rounded-5 border border-1 align-items-center justify-content-center mx-auto py-2 px-4"
              to={"/removenew"}
              style={{
                textDecoration: "none",
                width: "fit-content",
                color: "black",
              }}
            >
              <div className="sidebar-item d-flex gap-1 align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="black"
                  className="bi bi-dash"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                </svg>
                <p className="mb-0 fw-bold text-center">Remove</p>
              </div>
            </Link>
            <Link
              id="side_but"
              className="d-flex rounded-5 border border-1 align-items-center justify-content-center mx-auto py-2 px-4"
              to={"/editnew"}
              style={{
                textDecoration: "none",
                width: "fit-content",
                color: "black",
              }}
            >
              <div className="sidebar-item d-flex gap-1 align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="black"
                  className="bi bi-pencil-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                </svg>
                <p className="mb-0 fw-bold text-center">Edit</p>
              </div>
            </Link>
          </div>
          <hr />
          <h5 className="d-flex fw-bold align-items-center justify-content-center mx-auto mt-3 gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-calendar-fill"
              viewBox="0 0 16 16"
            >
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5h16V4H0V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5" />
            </svg>
            Events
          </h5>
          <div className="d-flex flex-column gap-4 mt-2 mx-5 mb-3">
            <Link
              id="side_but"
              className="d-flex rounded-5 border border-1 align-items-center justify-content-center mx-auto py-2 px-4"
              to={"/addevents"}
              style={{
                textDecoration: "none",
                width: "fit-content",
                color: "black",
              }}
            >
              <div className="sidebar-item d-flex gap-0 align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="black"
                  className="bi bi-plus"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                </svg>
                <p className="mb-0 fw-bold text-center">Add</p>
              </div>
            </Link>
            <Link
              id="side_but"
              className="d-flex rounded-5 border border-1 align-items-center justify-content-center mx-auto py-2 px-4"
              to={"/removeevent"}
              style={{
                textDecoration: "none",
                width: "fit-content",
                color: "black",
              }}
            >
              <div className="sidebar-item d-flex gap-0 align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="black"
                  className="bi bi-dash"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                </svg>
                <p className="mb-0 fw-bold text-center">Remove</p>
              </div>
            </Link>
            <Link
              id="side_but"
              className="d-flex rounded-5 border border-1 align-items-center justify-content-center mx-auto py-2 px-4"
              to={"/editevent"}
              style={{
                textDecoration: "none",
                width: "fit-content",
                color: "black",
              }}
            >
              <div className="sidebar-item d-flex gap-1 align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="black"
                  className="bi bi-pencil-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                </svg>
                <p className="mb-0 fw-bold text-center">Edit</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
