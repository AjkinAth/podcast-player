const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const CryptoJS = require("crypto-js");
const fetch = require("node-fetch");

dotenv.config();

const app = express();

const PORT = process.env.PORT ?? 3000;
const authKey = process.env.AUTH_KEY;
const secretKey = process.env.SECRET_KEY;
const userAgent = process.env.USER_AGENT;
const apiEndpoint = process.env.API_ENDPOINT;

//serves static files from public to Browser when requested
app.use(express.static(path.join(__dirname, "public")));

// Authentication Headers according to https://github.com/Podcastindex-org/docs-api/tree/master/Postman%20Docs
// embedded in Postman

function authHeaders() {
  const apiHeaderTime = new Date().getTime() / 1000;
  const hash = CryptoJS.SHA1(authKey + secretKey + apiHeaderTime).toString(
    CryptoJS.enc.Hex
  );

  return {
    "User-Agent": userAgent,
    "X-Auth-Key": authKey,
    "X-Auth-Date": apiHeaderTime.toString(),
    Authorization: hash,
  };
}
//fetch podcasts by Name
app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
  const headers = authHeaders();
  try {
    const response = await fetch(
      `${apiEndpoint}/search/byterm?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: headers,
      }
    );
    if (
      response.ok &&
      response.headers.get("content-type").includes("application/json")
    ) {
      const data = await response.json();
      res.json(data);
    } else {
      const rawText = await response.text();
      console.log("Raw Response", rawText);
      res.status(500).json({ error: "Invalid response from API", rawText });
    }
  } catch (error) {
    console.error("Error fetching API:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//fetch podcasts by ID
app.get("/api/searchID", async (req, res) => {
  const query = req.query.id;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
  const headers = authHeaders();
  try {
    const response = await fetch(
      `${apiEndpoint}/podcasts/byfeedid?id=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: headers,
      }
    );
    if (
      response.ok &&
      response.headers.get("content-type").includes("application/json")
    ) {
      const data = await response.json();
      res.json(data);
    } else {
      const rawText = await response.text();
      console.log("Raw Response", rawText);
      res.status(500).json({ error: "Invalid response from API", rawText });
    }
  } catch (error) {
    console.error("Error fetching API:", error.message);
    res.status(500).json({ error: error.message });
  }
});
//fetch episodes by id
app.get("/api/search/episodes", async (req, res) => {
  const id = req.query.id;
  const max = req.query.max;
  if (!id) {
    return res.status(400).json({ error: "ID parameter is required" });
  }
  const headers = authHeaders();
  try {
    const response = await fetch(
      `${apiEndpoint}/episodes/byfeedid?id=${encodeURIComponent(
        id
      )}&max=${encodeURIComponent(max)}`,
      {
        method: "GET",
        headers: headers,
      }
    );
    if (
      response.ok &&
      response.headers.get("content-type").includes("application/json")
    ) {
      const data = await response.json();
      res.json(data);
    } else {
      const rawText = await response.text();
      console.log("Raw Response", rawText);
      res.status(500).json({ error: "Invalid response from API", rawText });
    }
  } catch (error) {
    console.error("Error fetching API:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(
    `Server is running on http://localhost:${PORT} pointing to ${apiEndpoint}`
  );
});
