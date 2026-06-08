import React from "react";
import "./AddNews.css";
import { useState } from "react";

const AddNews = () => {
  const [mainImage, setMainImage] = useState(null);
  const API_URL = "https://esn-unipi-backend.onrender.com";
  const [additionalImages, setAdditionalImages] = useState([]);
  const [newsDetails, setNewsDetails] = useState({
    name: "",
    paragraph: "",
  });
  const [loading, setLoading] = useState(false);

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
      case "link":
        // Simple link insertion - wrap selected text in markdown link
        const linkUrl = "https://example.com"; // Default URL
        if (selectedText) {
          newText =
            newText.substring(0, start) +
            `[${selectedText}](${linkUrl})` +
            newText.substring(end);
          newCursorPos = start + selectedText.length + linkUrl.length + 4;
        } else {
          newText =
            newText.substring(0, start) +
            `[link text](${linkUrl})` +
            newText.substring(end);
          newCursorPos = start + 12 + linkUrl.length + 3; // Position after "link text"
        }
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

  // Quick link insertion for common URLs
  const addQuickLink = (url, text = null) => {
    const textarea = document.querySelector('textarea[name="paragraph"]');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newsDetails.paragraph.substring(start, end);

    const linkText = text || selectedText || "link";
    const markdownLink = `[${linkText}](${url})`;

    let newText = newsDetails.paragraph;

    if (selectedText && !text) {
      newText =
        newText.substring(0, start) + markdownLink + newText.substring(end);
    } else {
      newText =
        newText.substring(0, start) + markdownLink + newText.substring(start);
    }

    setNewsDetails({ ...newsDetails, paragraph: newText });

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + markdownLink.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const Add_New = async () => {
    if (!newsDetails.name || !newsDetails.paragraph) {
      alert("Please fill in all required fields");
      return;
    }

    if (!mainImage) {
      alert("Please select a main image");
      return;
    }

    setLoading(true);

    try {
      let mainImageUrl = "";
      let additionalImageUrls = [];

      // Upload main image
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

      // Upload additional images if any
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
          additionalImageUrls = additionalUploadData.image_urls;
        } else {
          console.warn(
            "Additional images upload failed, continuing without them"
          );
        }
      }

      // Add news to database
      const newThing = {
        name: newsDetails.name,
        image: mainImageUrl,
        additionalImages: additionalImageUrls,
        paragraph: newsDetails.paragraph,
      };

      const addResponse = await fetch(`${API_URL}/addnew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newThing),
      });

      const result = await addResponse.json();

      if (result.success) {
        alert("News added successfully!");
        // Reset form
        setNewsDetails({
          name: "",
          paragraph: "",
        });
        setMainImage(null);
        setAdditionalImages([]);
        // Clear file inputs
        document.querySelector('input[name="mainImage"]').value = "";
        document.querySelector('input[name="additionalImages"]').value = "";
      } else {
        throw new Error("Failed to add news to database");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add news: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addnews bg-white p-5 rounded-5 d-flex flex-column gap-1 shadow-sm">
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
          className="bi bi-plus"
          viewBox="0 0 16 16"
        >
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
        </svg>
        <p className="text-center m-0">Add New</p>
      </div>
      <hr />
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
            <div className="formatting-buttons d-flex gap-2 flex-wrap">
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
              <button
                type="button"
                className="btn btn-sm btn-outline-primary rounded-5"
                onClick={() => addFormatting("link")}
                title="Add Link (select text first)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="currentColor"
                  className="bi bi-link-45deg"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                </svg>
              </button>
            </div>
          </div>

          <textarea
            value={newsDetails.paragraph}
            onChange={changeHandler}
            className="rounded-5 p-3 border border-1 w-100"
            name="paragraph"
            placeholder="Enter news content. Use **bold**, *italic*, [links](https://example.com), and line breaks for formatting."
            rows="10"
            required
          />
          <small className="text-muted">
            Formatting: **bold** *italic* [links](https://example.com) • bullet
            points
          </small>
        </div>

        <div>
          <p className="fw-bold">Main Image *</p>
          <input
            onChange={mainImageHandler}
            type="file"
            name="mainImage"
            accept="image/*"
            className="form-control rounded-5"
            required
          />
          {mainImage && (
            <div className="mt-2">
              <small>Selected: {mainImage.name}</small>
            </div>
          )}
        </div>

        <div>
          <p className="fw-bold">Additional Images</p>
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
              <small>
                Selected {additionalImages.length} additional image(s):
              </small>
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
          onClick={Add_New}
          disabled={loading}
          className="btn btn-dark fw-bold rounded-5 p-2 shadow-sm"
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Adding News...
            </>
          ) : (
            "ADD NEWS"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddNews;
