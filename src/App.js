import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  getFirestore,
  getDocs,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import app from "./firebase";
import logo from "./images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faLink } from "@fortawesome/free-solid-svg-icons";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 1 day in milliseconds

function App() {
  const [blogs, setBlogs] = useState([]);
  const [hub, setHub] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [articlesFound, setArticlesFound] = useState(true); // State to track if any articles were found in the search
  const db = getFirestore(app);

  const getArticles = useCallback(
    async (collectionName, setStateFunction) => {
      const collectionRef = query(
        collection(db, collectionName),
        orderBy("createdAt")
      );
      const collectionSnap = await getDocs(collectionRef);
      const arr = [];
      const arrId = [];
      collectionSnap.forEach((doc) => {
        arr.push(doc.data());
        arrId.push(doc.id);
      });

      const updatedArr = arr.map((item, index) => ({
        ...item,
        articleId: arrId[index],
      }));

      setStateFunction(updatedArr);
      localStorage.setItem(collectionName, JSON.stringify(updatedArr));
      localStorage.setItem(`${collectionName}_timestamp`, Date.now());
    },
    [db]
  );
  const updatedOn = useCallback(async () => {
    try {
      const collectionRef = collection(db, "lastUpdated");
      const collectionQuerySnapshot = await getDocs(collectionRef);

      collectionQuerySnapshot.forEach((doc) => {
        const createdAtTimestamp = doc.data().createdAt;
        const createdAtDate = createdAtTimestamp.toDate();

        const datePart = createdAtDate.toDateString();
        setLastUpdated(datePart);
      });
    } catch (error) {
      console.error("Error retrieving lastUpdated:", error);
    }
  }, [db]);

  const copyToClipboard = (text) => {
    copy(text);
    toast("😀 Link Copied!!", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  useEffect(() => {
    const cachedBlogs = JSON.parse(localStorage.getItem("blog"));
    const cachedHub = JSON.parse(localStorage.getItem("hub"));
    const blogTimestamp = localStorage.getItem("blog_timestamp");
    const hubTimestamp = localStorage.getItem("hub_timestamp");
    const currentTime = Date.now();
    if (
      cachedBlogs &&
      cachedHub &&
      currentTime - blogTimestamp < CACHE_EXPIRY_TIME &&
      currentTime - hubTimestamp < CACHE_EXPIRY_TIME
    ) {
      setBlogs(cachedBlogs);
      setHub(cachedHub);
    } else {
      getArticles("blog", setBlogs);
      getArticles("hub", setHub);
    }
    updatedOn();
  }, [getArticles, updatedOn]);

  useEffect(() => {
    const filteredArticles = [...hub, ...blogs].filter((item) =>
      item.title?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
    setArticlesFound(filteredArticles.length > 0);
  }, [hub, blogs, searchQuery]);

  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <img src={logo} className="navbar-brand" width="200" alt="Logo" />
          <div className="navbar-text text-center">
            <h5 style={{ marginRight: "10px", color: "#AEAEAE" }}>
              {lastUpdated}
            </h5>
          </div>
          <div className="navbar-text">
            <h3 style={{ marginRight: "10px", color: "#000000" }}>
              Articles Directory
            </h3>
          </div>
        </div>
      </nav>
      <div className="container p-4">
        <div className="row justify-content-center">
          <div className="col-10">
            <div className="input-group">
              <span className="input-group-text" id="basic-addon3">
                Search
              </span>
              <input
                type="text"
                className="form-control"
                id="basic-url"
                name="search"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container p-2">
        {searchQuery.trim() === "" ? (
          // Show a welcome statement when the search bar is empty
          <div className="text-center mt-4">
            <h2>Welcome to the Articles Directory!</h2>
            <p>Enter your search query above to find articles.</p>
          </div>
        ) : articlesFound ? (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Article Link</th>
                <th>Category</th>
                <th>Copy Link</th>
              </tr>
            </thead>
            <tbody>
              {[...hub, ...blogs]
                .filter((item) =>
                  item.title?.toLowerCase().includes(searchQuery?.toLowerCase())
                )
                .map((item) => (
                  <tr className="table-row" key={item.articleId}>
                    <td style={{ width: "70%" }}>{item.title}</td>
                    <td className="other">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        <FontAwesomeIcon icon={faLink} /> Link
                      </a>
                    </td>
                    <td className="other">{item.category}</td>
                    <td className="other" style={{ borderRight: 0 }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => copyToClipboard(item.link)}
                      >
                        <FontAwesomeIcon icon={faCopy} id="icon" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          // Show a message if no articles match the search query
          <div className="text-center mt-4">
            <h4>No articles found for the search query.</h4>
          </div>
        )}
      </div>

      <div>
        <ToastContainer />
      </div>
    </>
  );
}

export default App;
