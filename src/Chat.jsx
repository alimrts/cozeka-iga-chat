import React, { useRef, useEffect, useState } from "react";

import "./Llm.css";
import gptLogo from "./assets/iga-logotype.svg";
import addBtn from "./assets/add-30.png";
import msgIcon from "./assets/message.svg";
import saved from "./assets/bookmark.svg";
import addDoc from "./assets/uploadBtn.png";
import sendBtn from "./assets/send.svg";
import userIcon from "./assets/user-icon.png";
import gptImgLogo from "./assets/ai-icon.png";
import PdfPopup from "./PdfPopup";
import axios from "axios";
import systemPromt from "./defaultPrompt.json";

function Chat() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const API_KEY = process.env.REACT_APP_API_KEY;

  const msgEnd = useRef(null);

  const [testResponse, setTestResponse] = useState("");

  const [isTextTyped, setIsTextTyped] = useState(false);

  const [docsList, setDocsList] = useState([]);
  const [docsListLength, setDocsListLength] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  const [isDocLoading, setIsDocLoading] = useState(false);
  const [dosyaAddResultMessage, setDosyaAddResultMessage] = useState("");

  const [input, setInput] = useState("");

  const [message, setMessage] = useState("");

  const [selectedTab, setSelectedTab] = useState("chat");

  const [messages, setMessages] = useState([
    {
      text: "Merhaba, ben IGA Assist, size nasıl yardımcı olabilirim.",
      isBot: true,
    },
  ]);

  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [showPdf, setShowPdf] = useState(false);

  const openPdfPopup = (pdfUrl, pageNumber) => {
    setCurrentPdfUrl(pdfUrl);
    setCurrentPageNumber(pageNumber); // Set the current page number
    setShowPdf(true); // Show the PDF popup
  };

  const closePdfPopup = () => {
    setShowPdf(false);
    setCurrentPdfUrl(""); // Clear the URL when closing
    setCurrentPageNumber(1); // Reset the page number if desired
  };

  const [isKayitlarOpened, setIsKayitlarOpened] = useState(false);
  const [isAddDocOpened, setIsAddDocOpened] = useState(false);

  const textareaRef = useRef(null);
  useEffect(() => {
    msgEnd.current.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    const trimmedInput = input.trim();
    setIsTextTyped(trimmedInput !== "");
  }, [input]);

  const deleteFile = () => {};

  const handleSend = () => {
    setIsLoadingMessage(true);

    if (input.trim() === "") {
      alert("Lütfen bir mesaj girin.");
      setIsLoadingMessage(false);
      return;
    }

    const textI = input;
    var data = JSON.stringify({
      include_sources: true,
      prompt: textI,
      stream: false,
      system_prompt: systemPromt.defaultPrompt,
      use_context: true,
    });

    var config = {
      method: "post",
      // url: "http://127.0.0.1:8001/v1/completions",
      url: API_BASE_URL + "/v1/completions",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      data: data,
    };

    setMessages([...messages, { text: textI, isBot: false }]);
    setInput("");
    axios(config)
      .then(function (response) {
        const responseMessage = response.data.choices[0].message.content;
        const sources = response.data.choices[0].sources;
        console.log("sources: ", sources);
        // Format the message content by replacing \n with actual line breaks
        const formattedMessage = responseMessage
          .split("\n")
          .map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ));

        // Extract file names from sources and make them clickable
        const fileNames = sources.map((source, index) => {
          const fileName = source.document.doc_metadata.file_name;
          const pageNumber = source.document.doc_metadata.page_label;
          const pdfUrl = `/iga_files/${fileName}`; // Path to the public PDF files

          return (
            <React.Fragment key={index}>
              <div>
                Kaynak:{" "}
                <a
                  href="#"
                  style={{
                    color: "lightgreen",
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                  }}
                  onClick={() => openPdfPopup(pdfUrl, 1)}
                >
                  {fileName}
                </a>
                <br />
                <a
                  href="#"
                  style={{
                    color: "lightgreen",
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                  }}
                  onClick={() => openPdfPopup(pdfUrl, pageNumber)}
                >
                  {"Sayfa: " + pageNumber}
                </a>
              </div>
            </React.Fragment>
          );
        });

        // Update messages array with the formatted content and file names
        setMessages([
          ...messages,
          { text: textI, isBot: false },
          {
            text: (
              <div>
                {formattedMessage}
                {fileNames}
              </div>
            ),
            isBot: true,
          },
        ]);

        setIsLoadingMessage(false);
      })
      .catch(function (error) {
        setIsLoadingMessage(false);
        setInput("");
        if (error.response && error.response.status === 401) {
          setMessages([
            ...messages,
            { text: textI, isBot: false },
            {
              text: "Çalışma sürem doldu. CoZeka ile iletişime geçin.",
              isBot: true,
            },
          ]);
        } else {
          console.log(error);
        }
      });
  };

  const handleSendCasual = () => {
    setIsLoadingMessage(true);

    if (input.trim() === "") {
      // Alert the user or handle the empty input case as needed
      alert("Lütfen bir mesaj girin.");
      setIsLoadingMessage(false);
      return;
    }

    const textI = input;
    var data = JSON.stringify({
      include_sources: false,
      prompt: textI,
      stream: false,
      system_prompt:
        // "Always answer in Turkish. Never answer in any other language. You are a helpful, respectful and honest assistant. Always answer as helpfully as possible and follow ALL given instructions. Do not speculate or make up information. Always answer in Turkish.",
        systemPromt.defaultPrompt,
      use_context: false,
    });

    var config = {
      method: "post",
      url: API_BASE_URL + "/v1/completions",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      data: data,
    };

    setMessages([...messages, { text: textI, isBot: false }]);
    setInput("");
    axios(config)
      .then(function (response) {
        const responseMessage = response.data.choices[0].message.content;

        // Format the message content by replacing \n with actual line breaks
        const formattedMessage = responseMessage
          .split("\n")
          .map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ));

        // Update messages array with the formatted content and file names
        setMessages([
          ...messages,
          { text: textI, isBot: false },
          {
            text: <div>{formattedMessage}</div>,
            isBot: true,
          },
        ]);

        setIsLoadingMessage(false);
      })
      .catch(function (error) {
        setIsLoadingMessage(false);
        setInput("");
        console.log(error);
      });
  };

  const handleSearchDocs = () => {
    setIsLoadingMessage(true);

    if (input.trim() === "") {
      // Alert the user or handle the empty input case as needed
      alert("Lütfen bir mesaj girin.");
      setIsLoadingMessage(false);
      return;
    }

    const textI = input;
    var data = JSON.stringify({ text: textI, limit: 3, prev_next_chunks: 2 });

    var config = {
      method: "post",
      url: API_BASE_URL + "/v1/chunks",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      data: data,
    };

    setMessages([...messages, { text: textI, isBot: false }]);
    setInput("");
    axios(config)
      .then(function (response) {
        const formattedData = response.data.data.map((chunk) => ({
          file_name: chunk.document.doc_metadata.file_name,
          original_text: chunk.document.doc_metadata.original_text,
          pageNumber: chunk.document.doc_metadata.page_label,
        }));

        // Creating text messages from formattedData
        const textMessages = formattedData.map((data, index) => {
          const pdfUrl = `/iga_files/${data.file_name}`; // Path to the public PDF files

          return (
            <React.Fragment key={index}>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "lightgreen",
                }}
              >
                <span
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  Döküman adı:
                </span>{" "}
                {/* Make file name clickable */}
                <a
                  href="#"
                  onClick={() => openPdfPopup(pdfUrl, 1)} // Opens PDF on click
                  style={{ color: "lightgreen", cursor: "pointer" }}
                >
                  {" " + data.file_name}
                </a>
                <br />
                <a
                  href="#"
                  onClick={() => openPdfPopup(pdfUrl, data.pageNumber)} // Opens PDF on click
                  style={{ color: "lightgreen", cursor: "pointer" }}
                >
                  {"Sayfa: " + data.pageNumber}
                </a>
              </div>
              {/* Split the original_text by \n and format each line */}
              {data.original_text.split("\n").map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
              {index !== formattedData.length - 1 && <br />}{" "}
              {/* Add line break if not the last element */}
            </React.Fragment>
          );
        });

        setIsLoadingMessage(false);

        setMessages([
          ...messages,
          { text: textI, isBot: false },
          {
            text: textMessages,
            isBot: true,
          },
        ]);
      })
      .catch(function (error) {
        setIsLoadingMessage(false);
        setInput("");
        if (error.response && error.response.status === 401) {
          setMessages([
            ...messages,
            { text: textI, isBot: false },
            {
              text: "Çalışma sürem doldu. CoZeka ile iletişime geçin.",
              isBot: true,
            },
          ]);
        } else {
          console.log(error);
        }
      });
  };

  const getHealth = async () => {
    try {
      const response = await axios.get(API_BASE_URL + "/health", {
        headers: {
          accept: "application/json",
        },
      });

      console.log(response.data);
      // Handle the response data as needed
    } catch (error) {
      console.error(error);
      // Handle the error
    }
  };

  const handleAddDoc = () => {
    setIsAddDocOpened(true);
    setIsKayitlarOpened(false);
    setDosyaAddResultMessage("");
  };

  const handleListDocs = () => {
    setIsLoading(true);
    setIsKayitlarOpened(false);
    setIsAddDocOpened(false);

    var config = {
      method: "get",
      url: API_BASE_URL + "/v1/ingest/list",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
    };

    axios(config)
      .then(function (response) {
        console.log("docs: ", response.data.data);
        setIsLoading(false);

        // Create an object to hold unique file names with associated documents
        const groupedDocs = response.data.data.reduce((acc, doc) => {
          const fileName = doc.doc_metadata.file_name;
          const pageLabel = doc.doc_metadata.page_label;
          const docId = doc.doc_id;

          // Initialize the array for the fileName if it doesn't exist
          if (!acc[fileName]) {
            acc[fileName] = [];
          }
          // Push the current document's page label and doc id into the array
          acc[fileName].push({ pageLabel, docId });

          return acc;
        }, {});

        // Convert groupedDocs object into an array of entries for rendering
        setDocsList(Object.entries(groupedDocs));
        setIsKayitlarOpened(true);
        setIsAddDocOpened(false);
      })
      .catch(function (error) {
        setIsLoading(false);
        console.log(error);
        setIsKayitlarOpened(false);
        setIsAddDocOpened(false);
      });
  };

  const handleFileChange = (event) => {
    // Handle file selection, if needed
  };

  const uploadFile = () => {
    setDosyaAddResultMessage("");
    setIsDocLoading(true);

    const fileInput = document.getElementById("fileInput");

    if (!fileInput.files[0]) {
      // Handle the case where no file is selected
      alert("Lütfen bir dosya seçin.");
      setIsDocLoading(false);
      return;
    }

    const file = new FormData();
    file.append("file", fileInput.files[0]);

    const config = {
      method: "post",
      url: API_BASE_URL + "/v1/ingest/file",
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
        "X-API-Key": API_KEY,
      },
      data: file,
    };

    axios(config)
      .then(function (response) {
        console.log("File uploaded successfully:", response.data);
        setIsDocLoading(false);
        setDosyaAddResultMessage("Dosya başarıyla eklendi.");

        // Additional handling or updating state if needed
      })
      .catch(function (error) {
        setIsDocLoading(false);
        console.error("Error uploading file:", error);
        setDosyaAddResultMessage("Dosya ekleme hatası.");

        // Additional error handling if needed
      });
  };

  useEffect(() => {
    // This function will be called when the component is first mounted
    handleListDocs();
  }, []);

  useEffect(() => {
    // console.log("docsList: " + JSON.stringify(docsList));
    // console.log("length: " + docsList.length);
    setDocsListLength(docsList.length);
  }, [docsList]);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Set a maximum height, adjust as needed
      // getHealth();
      // getAllIngestedFiles();
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedTab === "chat") {
        handleSend();
      } else if (selectedTab === "casual") {
        handleSendCasual();
      } else {
        handleSearchDocs();
      }
    }
  };

  const handleQuery = async (e) => {
    setSelectedTab("chat");
    setIsLoadingMessage(true);

    if (e.target.value.trim() === "") {
      alert("Lütfen bir mesaj girin.");
      setIsLoadingMessage(false);
      return;
    }

    const text = e.target.value;
    const data = JSON.stringify({
      include_sources: true,
      prompt: text,
      stream: false,
      system_prompt: systemPromt.defaultPrompt,
      use_context: true,
    });

    const config = {
      method: "post",
      url: API_BASE_URL + "/v1/completions",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      data: data,
    };

    setMessages([...messages, { text: text, isBot: false }]);

    try {
      const response = await axios(config);
      const responseMessage = response.data.choices[0].message.content;
      const sources = response.data.choices[0].sources;

      // Format the message content by replacing \n with actual line breaks
      const formattedMessage = responseMessage
        .split("\n")
        .map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ));

      // Extract file names from sources and make them clickable
      const fileNames = sources.map((source, index) => {
        const fileName = source.document.doc_metadata.file_name;
        const pageNumber = source.document.doc_metadata.page_label;
        const pdfUrl = `/iga_files/${fileName}`; // Path to the public PDF files

        return (
          <React.Fragment key={index}>
            <div>
              Kaynak:{" "}
              <a
                href="#"
                style={{
                  color: "lightgreen",
                  fontSize: "1.4rem",
                  fontWeight: "bold",
                }}
                onClick={() => openPdfPopup(pdfUrl, 1)}
              >
                {fileName}
              </a>
              <br />
              <a
                href="#"
                style={{
                  color: "lightgreen",
                  fontSize: "1.4rem",
                  fontWeight: "bold",
                }}
                onClick={() => openPdfPopup(pdfUrl, pageNumber)}
              >
                {"Sayfa: " + pageNumber}
              </a>
            </div>
          </React.Fragment>
        );
      });

      // Update messages array with the formatted content and file names
      setMessages([
        ...messages,
        { text: text, isBot: false },
        {
          text: (
            <div>
              {formattedMessage}
              {fileNames}
            </div>
          ),
          isBot: true,
        },
      ]);

      setIsLoadingMessage(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessages([
          ...messages,
          { text: text, isBot: false },
          {
            text: "Çalışma sürem doldu, CoZeka ile iletişime geçin.",
            isBot: true,
          },
        ]);
        setIsLoadingMessage(false);
      } else {
        console.log(error);
      }
    }
  };

  /////////////////////////////////////////////////////////////

  return (
    <div className="bilgiNotuApp">
      <div className="sideBar">
        <div className="upperSide">
          <div className="upperSideTop">
            <img src={gptLogo} alt="" className="logo" />
            <span className="brand">IGA Assist AI</span>
          </div>
          <button
            className="midBtn"
            onClick={() => {
              window.location.reload();
            }}
          >
            {" "}
            <img src={addBtn} alt="" className="addBtn" />
            Yeni Sohbet
          </button>
          <div className="upperSideBottom">
            <button
              className="query"
              onClick={handleQuery}
              value={"İtfaiye raporu başvuru ve denetleme süreçleri nasıldır?"}
            >
              {" "}
              <img src={msgIcon} alt="" />
              İtfaiye raporu başvuru ve denetleme süreçleri nasıldır?
            </button>

            <button
              className="query"
              onClick={handleQuery}
              value={"Apron Yönetimi Prosedürü hakkında kısa bilgi ver?"}
            >
              {" "}
              <img src={msgIcon} alt="" />
              Apron Yönetimi Prosedürü hakkında kısa bilgi ver.
            </button>

            <button
              className="query"
              onClick={handleQuery}
              value={"Apron alanında operasyonel yönetim nasıldır?"}
            >
              {" "}
              <img src={msgIcon} alt="" />
              Apron alanında operasyonel yönetim nasıldır?
            </button>

            <button
              className="query"
              onClick={handleQuery}
              value={"Apron güvenlik kuralları nelerdir?"}
            >
              {" "}
              <img src={msgIcon} alt="" />
              Apron güvenlik kuralları nelerdir?
            </button>
          </div>
          {/*  */}
          <div className="lowerContainer">
            <div className="radioContainer">
              <label
                className={`tabLabel ${
                  selectedTab === "chat" ? "tabLabelActive" : ""
                }`}
                onClick={() => setSelectedTab("chat")}
              >
                Dökümanlarla Sohbet
              </label>
              <label
                className={`tabLabel ${
                  selectedTab === "search" ? "tabLabelActive" : ""
                }`}
                onClick={() => setSelectedTab("search")}
              >
                Dökümanlarda Arama
              </label>
              {/* <label
              className={`tabLabel ${
                selectedTab === "casual" ? "tabLabelActive" : ""
              }`}
              onClick={() => setSelectedTab("casual")}
            >
              Genel Sohbet
            </label> */}
            </div>
            {/*  */}
            <div className="lowerSideButtons">
              <div className="listItems" onClick={handleAddDoc}>
                <img src={addDoc} alt="" className="listItemsImg" />
                Döküman Ekle
              </div>
              <div className="listItems" onClick={handleListDocs}>
                <img className="listItemsImg2" src={saved} alt="" />
                Kayıtlı Dökümanlar
              </div>
            </div>
          </div>
        </div>
        <div className="lowerSide">
          <>
            {" "}
            {isAddDocOpened ? (
              isDocLoading ? (
                <>
                  <span style={{ fontSize: "1.4rem", marginLeft: "17rem" }}>
                    Döküman işleniyor
                  </span>
                  <div className="loaderForDoc"></div>
                </>
              ) : (
                <>
                  {" "}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      background: "none",
                    }}
                  >
                    {dosyaAddResultMessage}
                  </div>
                  <div className="file-upload-container">
                    <label htmlFor="fileInput" className="file-upload-label">
                      Döküman Ekle
                    </label>
                    <input
                      type="file"
                      accept=".pdf, .doc, .docx, txt, .pptx, .xlsx, xls"
                      id="fileInput"
                      className="file-input"
                      onChange={handleFileChange}
                    />
                    <button className="upload-button" onClick={uploadFile}>
                      EKLE
                    </button>
                  </div>
                </>
              )
            ) : isKayitlarOpened ? (
              <>
                <div className="lowerSideContent">
                  <div
                    className="listHeader"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Kayıtlı Dökümanlar</span>{" "}
                    <span>Adet: {docsListLength} </span>
                  </div>
                  <div className="lowerSideList">
                    <table className="docsTable">
                      <thead>
                        <tr></tr>
                      </thead>
                      <tbody>
                        {docsList.map(([fileName, index]) => (
                          <tr key={`${fileName}-${index}`}>
                            <td>{fileName}</td>

                            <td
                              className="rowButtons"
                              style={{ border: "none" }}
                            >
                              <button
                                className="deleteButton"
                                onClick={deleteFile}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div className="loader"></div>
              </div>
            )}
          </>
        </div>
      </div>
      <div className="main">
        <div className="chats">
          {messages.map((msg, i) => (
            <div key={i} className={`chat ${msg.isBot ? "bot" : "user"}`}>
              <img src={msg.isBot ? gptImgLogo : userIcon} alt="" />

              <div>
                <p className="txtHead">
                  {msg.isBot ? "Asistan AI" : "Kullanıcı"}
                </p>
                <p className="txt">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={msgEnd} />
        </div>

        <div className="chatFooter">
          <div className="inp">
            <textarea
              ref={textareaRef}
              placeholder="Mesaj gönder..."
              className="multiline-input"
              onInput={resizeTextarea}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={handleEnter}
            />
            <div className="sendMessage" style={{}}>
              {isLoadingMessage ? (
                <div className="loaderMessage" style={{}}></div>
              ) : (
                <button
                  className="send"
                  onClick={
                    selectedTab === "chat"
                      ? handleSend
                      : selectedTab === "casual"
                      ? handleSendCasual
                      : handleSearchDocs
                  }
                >
                  <img
                    src={sendBtn}
                    alt=""
                    style={{ filter: isTextTyped ? "brightness(2)" : "" }}
                  />
                </button>
              )}
            </div>
          </div>
          <p>
            Dökümanlar hakkında soru sorarken döküman içerisinde geçen
            kelimelerin kullanılması önerilir.
          </p>
        </div>
      </div>
      {showPdf && currentPdfUrl && currentPageNumber && (
        <PdfPopup
          pdfUrl={currentPdfUrl}
          pageNumber={currentPageNumber}
          onClose={closePdfPopup}
        />
      )}
    </div>
  );
}

export default Chat;
