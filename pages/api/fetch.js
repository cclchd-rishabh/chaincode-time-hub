export default async function handler(req, res) {
  const API_URL = "http://localhost:4000/employees"; 

  try {
    if (req.method === "GET") {
      const response = await fetch(API_URL);
      const data = await response.json();
      return res.status(response.status).json(data);
    } 
    
    else if (req.method === "POST") {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } 
    
    else if (req.method === "PUT") {
      const { id } = req.query ;
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } 
    
    else if (req.method === "DELETE") {
      const { id } = req.query; 
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await response.json();
      return res.status(response.status).json(data);
    } 
    
    
    else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
