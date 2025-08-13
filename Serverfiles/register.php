import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, license } = req.body;

    if (!username || !license) {
        return res.status(400).json({ message: 'Missing username or license' });
    }

    const filePath = path.join(process.cwd(), 'data.json');
    let users = [];

    if (fs.existsSync(filePath)) {
        users = JSON.parse(fs.readFileSync(filePath));
    }

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    users.push({ username, license, hwid: null });
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    res.status(200).json({ message: 'Registered successfully!' });
}
