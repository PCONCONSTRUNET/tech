const serverUrl = "https://server.btzap.com.br";
const instance = "digitech";
const token = "0efb84ef-5b35-4acc-b16b-612c81fdbe6a";

async function test() {
  const url = `${serverUrl}/instance/connect/${instance}`;
  console.log("Fetching", url);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": token,
        "Authorization": `Bearer ${token}`
      }
    });
    
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}

test();
