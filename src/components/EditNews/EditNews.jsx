import React from "react";
import { useState, useEffect } from "react";

const EditNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [selectedNewsId, setSelectedNewsId] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);
  const [newsDetails, setNewsDetails] = useState({
    name: "",
    paragraph: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const API_URL = "https://esn-unipi-backend.onrender.com";

  // Fetch all news when component mounts
  useEffect(() => {
    fetchAllNews();
  }, []);

  const fetchAllNews = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_URL}/allnews`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNewsList(data);
    } catch (error) {
      console.error("Error fetching news:", error);
      alert("Failed to load news");
    } finally {
      setFetchLoading(false);
    }
  };

  // Load news data when selection changes
  useEffect(() => {
    if (selectedNewsId) {
      loadNewsData(selectedNewsId);
    }
  }, [selectedNewsId]);

  const loadNewsData = async (newsId) => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_URL}/news/${newsId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newsData = await response.json();

      // Populate form with existing data
      setNewsDetails({
        name: newsData.name || "",
        paragraph: newsData.paragraph || "",
      });

      setExistingAdditionalImages(newsData.additionalImages || []);
      setMainImage(null); // Reset new main image
      setAdditionalImages([]); // Reset new additional images
    } catch (error) {
      console.error("Error loading news data:", error);
      alert("Failed to load news data");
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
    setNewsDetails({ ...newsDetails, [e.target.name]: e.target.value });
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
    const selectedText = newsDetails.paragraph.substring(start, end);

    let newText = newsDetails.paragraph;
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

    setNewsDetails({ ...newsDetails, paragraph: newText });

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const Update_News = async () => {
    if (!selectedNewsId) {
      alert("Please select a news item to edit");
      return;
    }

    if (!newsDetails.name || !newsDetails.paragraph) {
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

      // Get the current news to preserve existing image if no new one is uploaded
      const currentNewsResponse = await fetch(
        `${API_URL}/news/${selectedNewsId}`
      );
      const currentNews = await currentNewsResponse.json();

      // Update news in database
      const updatedThing = {
        id: parseInt(selectedNewsId),
        name: newsDetails.name,
        image: mainImageUrl || currentNews.image, // Use new image or keep existing
        additionalImages: additionalImageUrls,
        paragraph: newsDetails.paragraph,
      };

      const updateResponse = await fetch(`${API_URL}/updatenew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedThing),
      });

      const result = await updateResponse.json();

      if (result.success) {
        alert("News updated successfully!");
        // Refresh the news list
        fetchAllNews();
        // Reset form selection
        setSelectedNewsId("");
        setNewsDetails({
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
        throw new Error("Failed to update news in database");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update news: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter news based on search term
  const filteredNews = newsList.filter(
    (news) =>
      news.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.paragraph.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="editnews bg-white p-5 rounded-5 d-flex flex-column gap-4 shadow-sm">
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
        <p className="text-center m-0">Edit News</p>
      </div>
      <hr />

      {/* Search and Selection Section */}
      <div className="d-flex flex-column gap-3">
        <div className="d-flex flex-column gap-2">
          <label className="fw-semibold">Select News to Edit:</label>
          <select
            className="form-select rounded-5"
            value={selectedNewsId}
            onChange={(e) => setSelectedNewsId(e.target.value)}
            disabled={fetchLoading}
          >
            <option value="">Choose a news item to edit...</option>
            {filteredNews.map((news) => (
              <option key={news.id} value={news.id}>
                {news.name} - {formatDate(news.date)} (ID: {news.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Edit Form Section */}
      {selectedNewsId && (
        <div className="border rounded-4 p-4 bg-light">
          <h5 className="fw-bold mb-4">Edit News Content</h5>

          <div className="d-flex flex-column gap-4">
            <div>
              <p className="fw-bold">Title *</p>
              <input
                value={newsDetails.name}
                onChange={changeHandler}
                className="rounded-5 p-3 border border-1 w-100"
                type="text"
                name="name"
                placeholder="Enter news title"
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
                value={newsDetails.paragraph}
                onChange={changeHandler}
                className="rounded-5 p-3 border border-1 w-100"
                name="paragraph"
                placeholder="Enter news content. Use **bold**, *italic*, and line breaks for formatting."
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
              onClick={Update_News}
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
                  Updating News...
                </>
              ) : (
                "UPDATE NEWS"
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
          <p className="mt-2 text-muted">Loading news data...</p>
        </div>
      )}
    </div>
  );
};

export default EditNews;
