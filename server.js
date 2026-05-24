const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const myApp = express();
myApp.use(cors());
myApp.use(express.json());


const JW_SEC = "Qq+ey2iDeCHE6LxZJMU2pkgZa5aJd7k1ROWId7qc078=";


const dataBaseCnx = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'flashcard_advanced_db'
});

// get cards here 
myApp.get('/api/cards', verifyTokenOfUser, (q, rs) => {
    dataBaseCnx.query("SELECT * FROM cards", (er, rxx) => {
        rs.send(rxx);
    });
});

myApp.post('/api/history', verifyTokenOfUser, (q, rs) => {
    const c_id = q.body.card_id;
    const u_id = q.user.id;
    dataBaseCnx.query("INSERT INTO history (user_id, card_id) VALUES (?, ?)", [u_id, c_id], (er, rx) => {
        rs.send({ msg: "History recorded" });
    });
});

// DB connection 
dataBaseCnx.connect(er => {
    if (er) console.log("DB Error", er);
    else console.log("MySQL DB Connected With Success");
});

myApp.post('/api/login', (q, rs) => {
    const { username, password } = q.body;
    let sq = "SELECT * FROM users WHERE username = ?";

    dataBaseCnx.query(sq, [username], async (er, rst) => {
        if (er || rst.length === 0) return rs.status(400).send({ error: "User not found" });

        const curr_usr = rst[0];
        const chk_psd = await bcrypt.compare(password, curr_usr.password_hash);

        if (!chk_psd) return rs.status(400).send({ error: "Wrong password!" });

        const tk = jwt.sign({ id: curr_usr.id, username: curr_usr.username, role: curr_usr.role }, JW_SEC, { expiresIn: '2h' });
        rs.send({ message: "Login OK", token: tk, role: curr_usr.role, username: curr_usr.username });
    });
});

myApp.delete('/api/cards/:id', verifyTokenOfUser, (q, rs) => {
    dataBaseCnx.query("DELETE FROM cards WHERE id = ?", [q.params.id], (er, rxx) => {
        rs.send({ msg: "Deleted" });
    });
});

// the auth function 
function verifyTokenOfUser(q, rs, nx) {
    const tk = q.headers['authorization'];
    if (!tk) return rs.status(403).send("No token provided");

    jwt.verify(tk.split(' ')[1], JW_SEC, (er, dcd) => {
        if (er) return rs.status(401).send("Oops its not authorized!");
        q.user = dcd;
        nx();
    });
}

myApp.post('/api/register', async (q, rs) => {
    const { username, password } = q.body;
    try {
        const hshPw = await bcrypt.hash(password, 10);
        let sq = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
        dataBaseCnx.query(sq, [username, hshPw], (er, rx) => {
            if (er) return rs.status(400).send({ error: "Username already exist!" });
            rs.send({ message: "Registered OK!" });
        });
    } catch (er) {
        rs.status(500).send("Server Error");
    }
});

myApp.put('/api/cards/:id', verifyTokenOfUser, (q, rs) => {
    dataBaseCnx.query("UPDATE cards SET question=?, answer=? WHERE id=?", [q.body.q, q.body.a, q.params.id], (er, rxx) => {
        rs.send({ msg: "Updated" });
    });
});

myApp.get('/api/admin/history', verifyTokenOfUser, (q, rs) => {
    if (q.user.role !== 'admin') return rs.status(403).send("Admins only!");

    let sq = `SELECT h.viewed_at, u.username, c.question 
               FROM history h 
               JOIN users u ON h.user_id = u.id 
               JOIN cards c ON h.card_id = c.id 
               ORDER BY h.viewed_at DESC`;

    dataBaseCnx.query(sq, (er, rxx) => {
        rs.send(rxx);
    });
});

myApp.post('/api/cards', verifyTokenOfUser, (q, rs) => {
    dataBaseCnx.query("INSERT INTO cards (question, answer) VALUES (?, ?)", [q.body.q, q.body.a], (er, rxx) => {
        rs.send({ msg: "Added" });
    });
});

myApp.listen(3000, () => console.log("Backend running on port 3000"));