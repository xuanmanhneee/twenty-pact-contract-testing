import http from "node:http";
const TARGET = process.env.TARGET || "http://localhost:3000";
http
  .createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const r = await fetch(TARGET + req.url, {
      method: req.method,
      headers: {
        "content-type": req.headers["content-type"] || "application/json",
        authorization: req.headers["authorization"] || "",
      },
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : Buffer.concat(chunks),
    });
    const text = (await r.text()).replaceAll('"city"', '"cityName"');
    res.writeHead(r.status, {
      "content-type": r.headers.get("content-type") || "application/json",
    });
    res.end(text);
  })
  .listen(4001, () => console.log("proxy đổi tên city → cityName ở cổng 4001"));
