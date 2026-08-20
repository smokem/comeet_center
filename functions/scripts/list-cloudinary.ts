/**
 * Lists all images in the Cloudinary account and prints their public_ids.
 * Run: _cloudinary_list.bat (from repo root)
 */
import https from "node:https";

const CLOUD_NAME = "pyw1vbvz";
const API_KEY = "651327213585551";
const API_SECRET = "SD24FvEUJSxrd0liaPQFr5zlwSI";

function httpsGet(url: string, auth: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "GET",
      headers: { Authorization: `Basic ${Buffer.from(auth).toString("base64")}` },
    }, (res) => {
      let body = "";
      res.on("data", (c: Buffer) => { body += c.toString(); });
      res.on("end", () => resolve(body));
    });
    req.on("error", reject);
    req.end();
  });
}

async function listAll() {
  // List all resources (first 500)
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?max_results=500&prefix=comeet`;
  const body = await httpsGet(url, `${API_KEY}:${API_SECRET}`);
  const data = JSON.parse(body) as { resources?: { public_id: string; format: string }[]; error?: { message: string } };

  if (data.error) {
    console.error("Error:", data.error.message);
    return;
  }

  const resources = data.resources ?? [];
  if (resources.length === 0) {
    // Try without prefix
    const url2 = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?max_results=500`;
    const body2 = await httpsGet(url2, `${API_KEY}:${API_SECRET}`);
    const data2 = JSON.parse(body2) as { resources?: { public_id: string; format: string }[] };
    const all = data2.resources ?? [];
    console.log(`\nAll images in account (${all.length} total):`);
    all.forEach((r) => console.log(" ", r.public_id));
    return;
  }

  console.log(`\nImages with prefix "comeet" (${resources.length} found):`);
  resources.forEach((r) => console.log(" ", r.public_id));
}

listAll().catch(console.error);
