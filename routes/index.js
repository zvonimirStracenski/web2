import express from 'express';
import pool from '../config/database.js';
import bcrypt from "bcrypt"

const router = express.Router();

async function getComments() {
    try {
        const result = await pool.query(`
                SELECT text FROM comments
            `);
        return result.rows;
    } catch(error) {
        console.error(error);
        return [];
    }
};

router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query(`
                SELECT text FROM comments
            `);
        res.render("index", {comments: result.rows, isSafe: false, bypassAdmin: Boolean(req.session?.bypassAdmin)});
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// xss checkbox
router.post("/", async (req, res, next) => {
    try{
        const isSafe = req.body.isSafe === "true";
        req.session.cookie.httpOnly = !isSafe;
        const comms = await getComments();
        res.render("index", {isSafe: isSafe, comments: comms, bypassAdmin: Boolean(req.session?.bypassAdmin)});
    } catch(error){
        next(error);
    }
});

async function addComment(comment){
    try {
        const result = await pool.query(
            `INSERT INTO comments (text)
             VALUES ($1)
             RETURNING *`,
            [comment]
        );

        return result.rows[0];

    } catch(error) {
        console.error(error);
        return null;
    }
}

async function deleteComments(){
    try {
        const result = await pool.query(
            `TRUNCATE TABLE comments`
        );
        return true;
    } catch(error) {
        console.error(error);
        return false;
    }
}

router.post("/comments", async (req, res) => {
    const comment = req.body.comment;
    const result = await addComment(comment);

    if (!result) {
        return res.status(500).send("Failed to add comment");
    }

    res.redirect('/');
});

router.post("/delete_comments", async (req, res) => {
    const delete_res = await deleteComments();

    if (!delete_res) {
        return res.status(500).send("Failed to delete comments");
    }
    res.redirect("/");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.redirect("/");
    }
    const isCorrectPass = await bcrypt.compare(password, user.password_hash);
    if (!isCorrectPass) {
      return res.redirect("/");
    } 
    else {
        req.session.userId = user.id;
    }
    if (user.username == "admin"){
        req.session.role = "admin";
        res.redirect("/admin");
    }
    else {
        req.session.role = "user";
        res.redirect("/user");
    }

  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

function isAdmin(req, res, next) {
    // pogresna provjera ovlasti
    if(req.session?.bypassAdmin === true) return next();

    if (!req.session.role || req.session.role !== "admin"){
        return res.status(403).send("Nemate administratorske ovlasti.");
    }
    next();
}

router.get("/admin", isAdmin, (req, res) => {
    res.render("admin");
});

router.get("/user", (req, res) => {
    res.render("user");
});

router.post("/wrong", (req, res) => {
    req.session.bypassAdmin = Boolean(req.body.bypass);
    res.sendStatus(200);
});

router.post("/attacker_comment", async (req, res) => {
    const attacker_comment = "<script>fetch('/comments', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ comment: document.cookie }) });</script>"
    const result = await addComment(attacker_comment);

    if (!result) {
        return res.status(500).send("Failed to add comment");
    }
    
    res.redirect('/');
});

export default router;