const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'passwd',
    database: 'school'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session management
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using HTTPS
}));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Authentication endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Query to fetch user data from the database
    const sql = 'SELECT * FROM users WHERE username = ?';
    connection.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Error querying user:', error);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];

        // Compare password
        bcrypt.compare(password, user.hashed_password, (err, match) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ error: 'Internal error' });
            }

            if (match) {
                req.session.user = user.username;
                res.status(200).json({ message: 'Login successful' });
            } else {
                res.status(401).json({ error: 'Invalid username or password' });
            }
        });
    });
});

// Endpoint to check authentication
app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ message: 'Authenticated' });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

// Serve the timetable page
app.get('/stud_tt.html', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/stud_tt.html');
});

// Define the API endpoint to fetch the schedule
app.get('/api/schedule', isAuthenticated, (req, res) => {
    const sql = "SELECT * FROM schedule WHERE day >= CURDATE() AND day < CURDATE() + INTERVAL 14 DAY AND DAYOFWEEK(day) != 1";
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching schedule:', error);
            res.status(500).json({ error: 'Database query error' });
            return;
        }
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

