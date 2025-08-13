// api/register.js
let users = []; // Memory storage

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, license } = req.body;

    if (!username || !license) {
        return res.status(400).json({ message: "Missing username or license" });
    }

    // Check if username already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Save to memory
    users.push({ username, license, hwid: null });
    console.log("Registered:", users);

    return res.status(200).json({ message: "Registered successfully" });
}

// Export the in-memory users for other API routes
export { users };
