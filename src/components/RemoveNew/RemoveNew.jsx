import React from "react";
import { useState } from "react";

const RemoveNew = () => {
  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const API_URL = "https://esn-unipi-backend.onrender.com";
  // Fetch all news when component mounts
  React.useEffect(() => {
    fetchAllNews();
  }, []);

  const fetchAllNews = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleRemoveNews = async () => {
    if (!selectedNews) {
      alert("Please select a news item to delete");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/removenew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: parseInt(selectedNews),
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("News deleted successfully!");
        // Reset form and refresh news list
        setSelectedNews("");
        setSearchTerm("");
        setShowConfirmation(false);
        setNewsToDelete(null);
        fetchAllNews();
      } else {
        throw new Error("Failed to delete news");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete news: " + error.message);
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
    <div className="removenews bg-white p-5 rounded-5 d-flex flex-column gap-4 shadow-sm">
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
          width="24"
          height="24"
          fill="black"
          class="bi bi-dash"
          viewBox="0 0 16 16"
        >
          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
        </svg>
        <p className="text-center m-0">Remove New</p>
      </div>
      <hr />

      {/* News Selection */}
      <div className="d-flex flex-column gap-2">
        <label className="fw-semibold">Select News to Delete:</label>
        <select
          className="form-select rounded-5"
          value={selectedNews}
          onChange={(e) => setSelectedNews(e.target.value)}
        >
          <option value="">Choose a news item...</option>
          {filteredNews.map((news) => (
            <option key={news.id} value={news.id}>
              {news.name} - {formatDate(news.date)}
            </option>
          ))}
        </select>
      </div>

      {/* Selected News Preview */}
      {selectedNews && (
        <div className="border rounded-5 p-3 bg-light">
          <h6 className="fw-bold">Selected News:</h6>
          {newsList
            .filter((news) => news.id.toString() === selectedNews)
            .map((news) => (
              <div key={news.id}>
                <img
                  src={news.image}
                  style={{ maxWidth: "200px" }}
                  className="rounded-5 mb-2 mt-1"
                  alt=""
                />
                <p className="mb-1">
                  <strong>Title:</strong> {news.name}
                </p>

                <p className="mb-1">
                  <strong>Date:</strong> {formatDate(news.date)}
                </p>
                <p className="mb-1">
                  <strong>Content Preview:</strong>
                </p>
                <p className="text-muted small">
                  {news.paragraph.length > 150
                    ? news.paragraph.substring(0, 150) + "..."
                    : news.paragraph}
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
          const selected = newsList.find(
            (news) => news.id.toString() === selectedNews
          );
          if (selected) {
            setNewsToDelete(selected);
            handleRemoveNews();
          }
        }}
        disabled={!selectedNews || loading}
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
          <>DELETE SELECTED NEW</>
        )}
      </button>
    </div>
  );
};

export default RemoveNew;
