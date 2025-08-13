// api/server.js

let users = [];

export default function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    try {
        if (req.method !== "POST") {
            return res.status(405).json({ message: "Method not allowed" });
        }

        const action = req.query.action;
        const { username, license, hwid } = req.body;

        if (action === "register") {
            if (!username || !license) {
                return res.status(400).json({ message: "Missing username or license" });
            }

            const existingUser = users.find(u => u.username === username);
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }

            users.push({ username, license, hwid: null });
            console.log("Registered:", users);
            return res.status(200).json({ message: "Registered successfully" });
        }

        if (action === "check") {
            if (!username || !license || !hwid) {
                return res.status(400).json({ message: "Missing fields" });
            }

            const user = users.find(u => u.username === username && u.license === license);
            if (!user) {
                return res.status(401).json({ message: "INVALID" });
            }

            if (!user.hwid) {
                user.hwid = hwid;
                return res.status(200).json({ message: "VALID" });
            }

            if (user.hwid !== hwid) {
                return res.status(403).json({ message: "HWID MISMATCH" });
            }

            return res.status(200).json({ message: "VALID" });
        }

        return res.status(400).json({ message: "Unknown action" });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
