const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to fetch website source code
app.post('/fetch', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL format
        if (!url.match(/^https?:\/\//i)) {
            return res.status(400).json({ error: 'Invalid URL format. Include http:// or https://' });
        }

        const response = await fetch(url);
        const sourceCode = await response.text();

        // Parse source code into components
        const htmlMatch = sourceCode.match(/<html[\s\S]*<\/html>/i) || [''];
        const cssMatches = sourceCode.match(/<style[\s\S]*?>([\s\S]*?)<\/style>/gi) || [];
        const jsMatches = sourceCode.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi) || [];

        const cssContent = cssMatches.join('\n\n');
        const jsContent = jsMatches.join('\n\n');

        res.json({
            html: htmlMatch[0],
            css: cssContent,
            js: jsContent,
            full: sourceCode
        });
    } catch (error) {
        console.error('Error fetching website:', error);
        res.status(500).json({ error: 'Failed to fetch website source code' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
