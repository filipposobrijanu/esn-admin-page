import React from "react";
import { useState, useEffect } from "react";

const EditEvent = () => {
  const [eventsList, setEventsList] = useState([]);
  const [selectedEventsId, setSelectedEventsId] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);
  const API_URL = "https://esn-unipi-backend.onrender.com";
  const [eventsDetails, setEventsDetails] = useState({
    name: "",
    paragraph: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all events when component mounts
  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setFetchLoading(true);
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
      setFetchLoading(false);
    }
  };

  // Load events data when selection changes
  useEffect(() => {
    if (selectedEventsId) {
      loadEventsData(selectedEventsId);
    }
  }, [selectedEventsId]);

  const loadEventsData = async (eventsId) => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_URL}/events/${eventsId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const eventsData = await response.json();

      // Populate form with existing data
      setEventsDetails({
        name: eventsData.name || "",
        paragraph: eventsData.paragraph || "",
      });

      setExistingAdditionalImages(eventsData.additionalImages || []);
      setMainImage(null); // Reset new main image
      setAdditionalImages([]); // Reset new additional images
    } catch (error) {
      console.error("Error loading events data:", error);
      alert("Failed to load events data");
    } finally {
      setFetchLoading(false);
    }
  };

  const mainImageHandler = (e) => {
    setMainImage(e.target.files[0]);
  };

  const additionalImagesHandler = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImages(files);
  };

  const changeHandler = (e) => {
    setEventsDetails({ ...eventsDetails, [e.target.name]: e.target.value });
  };

  const removeAdditionalImage = (index) => {
    const newImages = [...additionalImages];
    newImages.splice(index, 1);
    setAdditionalImages(newImages);
  };

  const removeExistingAdditionalImage = (index) => {
    const newImages = [...existingAdditionalImages];
    newImages.splice(index, 1);
    setExistingAdditionalImages(newImages);
  };

  // Markdown formatting helpers
  const addFormatting = (type) => {
    const textarea = document.querySelector('textarea[name="paragraph"]');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = eventsDetails.paragraph.substring(start, end);

    let newText = eventsDetails.paragraph;
    let newCursorPos = start;

    switch (type) {
      case "bold":
        newText =
          newText.substring(0, start) +
          `**${selectedText}**` +
          newText.substring(end);
        newCursorPos = start + (selectedText ? selectedText.length + 4 : 2);
        break;
      case "italic":
        newText =
          newText.substring(0, start) +
          `*${selectedText}*` +
          newText.substring(end);
        newCursorPos = start + (selectedText ? selectedText.length + 2 : 1);
        break;
      case "linebreak":
        newText = newText.substring(0, start) + "\n\n" + newText.substring(end);
        newCursorPos = start + 2;
        break;
      case "bullet":
        newText =
          newText.substring(0, start) +
          "\n• " +
          (selectedText || "") +
          newText.substring(end);
        newCursorPos = start + (selectedText ? selectedText.length + 3 : 3);
        break;
      default:
        break;
    }

    setEventsDetails({ ...eventsDetails, paragraph: newText });

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const Update_Events = async () => {
    if (!selectedEventsId) {
      alert("Please select a events item to edit");
      return;
    }

    if (!eventsDetails.name || !eventsDetails.paragraph) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      let mainImageUrl = "";
      let additionalImageUrls = [...existingAdditionalImages];

      // Upload new main image if provided
      if (mainImage) {
        const mainFormData = new FormData();
        mainFormData.append("newthing", mainImage);

        const mainUploadResponse = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: mainFormData,
        });

        const mainUploadData = await mainUploadResponse.json();
        if (mainUploadData.success) {
          mainImageUrl = mainUploadData.image_url;
        } else {
          throw new Error("Main image upload failed");
        }
      }

      // Upload new additional images if any
      if (additionalImages.length > 0) {
        const additionalFormData = new FormData();
        additionalImages.forEach((image) => {
          additionalFormData.append("additionalImages", image);
        });

        const additionalUploadResponse = await fetch(
          `${API_URL}/upload-multiple`,
          {
            method: "POST",
            body: additionalFormData,
          }
        );

        const additionalUploadData = await additionalUploadResponse.json();
        if (additionalUploadData.success) {
          additionalImageUrls = [
            ...additionalImageUrls,
            ...additionalUploadData.image_urls,
          ];
        } else {
          console.warn(
            "Additional images upload failed, continuing without them"
          );
        }
      }

      // Get the current events to preserve existing image if no new one is uploaded
      const currentEventsResponse = await fetch(
        `${API_URL}/events/${selectedEventsId}`
      );
      const currentEvents = await currentEventsResponse.json();

      // Update events in database
      const updatedThing = {
        id: parseInt(selectedEventsId),
        name: eventsDetails.name,
        image: mainImageUrl || currentEvents.image, // Use new image or keep existing
        additionalImages: additionalImageUrls,
        paragraph: eventsDetails.paragraph,
      };

      // CORRECT - using events endpoint
      const updateResponse = await fetch(`${API_URL}/updateevent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedThing),
      });

      const result = await updateResponse.json();

      if (result.success) {
        alert("Events updated successfully!");
        // Refresh the events list
        fetchAllEvents();
        // Reset form selection
        setSelectedEventsId("");
        setEventsDetails({
          name: "",
          paragraph: "",
        });
        setMainImage(null);
        setAdditionalImages([]);
        setExistingAdditionalImages([]);
        // Clear file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => (input.value = ""));
      } else {
        throw new Error("Failed to update events in database");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update events: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on search term
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
    <div className="editevents bg-white p-5 rounded-5 d-flex flex-column gap-4 shadow-sm">
      <div className="fw-bold fs-3 d-flex gap-2 align-items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          className="bi bi-newspaper"
          viewBox="0 0 16 16"
        >
          <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5zM12 14c.37 0 .654-.211.853-.441.092-.106.147-.279.147-.531V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5z" />
          <path d="M2 3h10v2H2zm0 3h4v3H2zm0 4h4v1H2zm0 2h4v1H2zm5-6h2v1H7zm3 0h2v1h-2zM7 8h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-pencil-fill"
          viewBox="0 0 16 16"
        >
          <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
        </svg>
        <p className="text-center m-0">Edit Events</p>
      </div>
      <hr />

      {/* Search and Selection Section */}
      <div className="d-flex flex-column gap-3">
        <div className="d-flex flex-column gap-2">
          <label className="fw-semibold">Select Event to Edit:</label>
          <select
            className="form-select rounded-5"
            value={selectedEventsId}
            onChange={(e) => setSelectedEventsId(e.target.value)}
            disabled={fetchLoading}
          >
            <option value="">Choose an event item to edit...</option>
            {filteredEvents.map((events) => (
              <option key={events.id} value={events.id}>
                {events.name} - {formatDate(events.date)} (ID: {events.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Edit Form Section */}
      {selectedEventsId && (
        <div className="border rounded-4 p-4 bg-light">
          <h5 className="fw-bold mb-4">Edit Event Content</h5>

          <div className="d-flex flex-column gap-4">
            <div>
              <p className="fw-bold">Title *</p>
              <input
                value={eventsDetails.name}
                onChange={changeHandler}
                className="rounded-5 p-3 border border-1 w-100"
                type="text"
                name="name"
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <p className="fw-bold mb-0">Content *</p>
                <div className="formatting-buttons d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark rounded-5"
                    onClick={() => addFormatting("bold")}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark rounded-5"
                    onClick={() => addFormatting("italic")}
                    title="Italic"
                  >
                    <em>i</em>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark rounded-5"
                    onClick={() => addFormatting("linebreak")}
                    title="Line Break"
                  >
                    ↵
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark rounded-5"
                    onClick={() => addFormatting("bullet")}
                    title="Bullet Point"
                  >
                    •
                  </button>
                </div>
              </div>
              <textarea
                value={eventsDetails.paragraph}
                onChange={changeHandler}
                className="rounded-5 p-3 border border-1 w-100"
                name="paragraph"
                placeholder="Enter event content. Use **bold**, *italic*, and line breaks for formatting."
                rows="10"
                required
              />
              <small className="text-muted">
                Formatting: **bold** *italic* • bullet points
              </small>
            </div>

            <div>
              <p className="fw-bold">Update Main Image</p>
              <input
                onChange={mainImageHandler}
                type="file"
                name="mainImage"
                accept="image/*"
                className="form-control rounded-5"
              />
              {mainImage && (
                <div className="mt-2">
                  <small>New image selected: {mainImage.name}</small>
                </div>
              )}
              <small className="text-muted">
                Leave empty to keep the current main image
              </small>
            </div>

            <div>
              <p className="fw-bold">Existing Additional Images</p>
              {existingAdditionalImages.length > 0 ? (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {existingAdditionalImages.map((imageUrl, index) => (
                    <div key={index} className="position-relative">
                      <img
                        src={imageUrl}
                        alt={`Additional ${index + 1}`}
                        className="rounded-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-5"
                        style={{ transform: "translate(25%, -25%)" }}
                        onClick={() => removeExistingAdditionalImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No additional images</p>
              )}

              <p className="fw-bold mt-3">Add More Additional Images</p>
              <input
                onChange={additionalImagesHandler}
                type="file"
                name="additionalImages"
                accept="image/*"
                multiple
                className="form-control rounded-5"
              />
              {additionalImages.length > 0 && (
                <div className="mt-2">
                  <small>{additionalImages.length} new image(s) selected</small>
                  <div className="mt-1">
                    {additionalImages.map((image, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center gap-2 mb-1"
                      >
                        <span>{image.name}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-5"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={Update_Events}
              disabled={loading}
              className="btn btn-primary fw-bold rounded-5 p-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating Event...
                </>
              ) : (
                "UPDATE EVENT"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {fetchLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading events data...</p>
        </div>
      )}
    </div>
  );
};

export default EditEvent;
