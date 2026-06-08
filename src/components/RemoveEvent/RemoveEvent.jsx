import React from "react";
import { useState } from "react";

const RemoveEvent = () => {
  const [eventsList, setEventsList] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [eventsToDelete, setEventsToDelete] = useState(null);
  const API_URL = "https://esn-unipi-backend.onrender.com";
  React.useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/allevents`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEventsList(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEvents = async () => {
    if (!selectedEvents) {
      alert("Please select a events item to delete");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/removeevent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: parseInt(selectedEvents),
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Events deleted successfully!");
        setSelectedEvents("");
        setSearchTerm("");
        setShowConfirmation(false);
        setEventsToDelete(null);
        fetchAllEvents();
      } else {
        throw new Error("Failed to delete events");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete events: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = eventsList.filter(
    (events) =>
      events.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      events.paragraph.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="removeevents bg-white p-5 rounded-5 d-flex flex-column gap-4 shadow-sm">
      <div className="fw-bold fs-3 d-flex gap-2 align-items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          class="bi bi-calendar-fill"
          viewBox="0 0 16 16"
        >
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5h16V4H0V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="black"
          class="bi bi-dash"
          viewBox="0 0 16 16"
        >
          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
        </svg>
        <p className="text-center m-0">Remove Event</p>
      </div>
      <hr />

      <div className="d-flex flex-column gap-2">
        <label className="fw-semibold">Select Events to Delete:</label>
        <select
          className="form-select rounded-5"
          value={selectedEvents}
          onChange={(e) => setSelectedEvents(e.target.value)}
        >
          <option value="">Choose an event item...</option>
          {filteredEvents.map((events) => (
            <option key={events.id} value={events.id}>
              {events.name} - {formatDate(events.date)}
            </option>
          ))}
        </select>
      </div>

      {selectedEvents && (
        <div className="border rounded-5 p-3 bg-light">
          <h6 className="fw-bold">Selected Events:</h6>
          {eventsList
            .filter((events) => events.id.toString() === selectedEvents)
            .map((events) => (
              <div key={events.id}>
                <img
                  src={events.image}
                  style={{ maxWidth: "200px" }}
                  className="rounded-5 mb-2 mt-1"
                  alt=""
                />
                <p className="mb-1">
                  <strong>Title:</strong> {events.name}
                </p>
                <p className="mb-1">
                  <strong>Date:</strong> {formatDate(events.date)}
                </p>
                <p className="mb-1">
                  <strong>Content Preview:</strong>
                </p>
                <p className="text-muted small">
                  {events.paragraph.length > 150
                    ? events.paragraph.substring(0, 150) + "..."
                    : events.paragraph}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Delete Button */}
      <button
        className={`rounded-5 btn btn-danger  fw-bold ${
          loading ? "disabled" : ""
        }`}
        onClick={() => {
          const selected = eventsList.find(
            (events) => events.id.toString() === selectedEvents
          );
          if (selected) {
            setEventsToDelete(selected);
            handleRemoveEvents();
          }
        }}
        disabled={!selectedEvents || loading}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            DELETING...
          </>
        ) : (
          <>DELETE SELECTED EVENT</>
        )}
      </button>
    </div>
  );
};

export default RemoveEvent;
