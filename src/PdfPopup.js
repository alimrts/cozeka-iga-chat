import React from "react";

const PdfPopup = ({ pdfUrl, pageNumber, onClose }) => {
  if (!pdfUrl) return null;

  // Construct the URL with the page number
  const formattedPdfUrl = `${pdfUrl}#page=${pageNumber}`;

  const handleOpenPdf = () => {
    // Open the PDF in a new tab
    window.open(formattedPdfUrl, "_blank");
  };

  // Check if the user is on a mobile device
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "6px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          Kapat
        </button>

        {isMobile ? (
          <button
            onClick={handleOpenPdf}
            style={{
              marginTop: "10px",
              backgroundColor: "blue",
              color: "white",
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            PDF Aç
          </button>
        ) : (
          <iframe
            src={formattedPdfUrl}
            style={{ width: "600px", height: "800px" }}
            frameBorder="0"
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default PdfPopup;
