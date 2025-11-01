"use strict";

const express = require("express");
const app = express();
const multer = require("multer");

app.use(multer().none());
app.use(express.urlencoded({ extended:true}));
app.use(express.json());
app.use(express.static("public"));

require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// i. GET endpoint at /jokebook/categories that responds with a list of possible categories in a jokebook database
app.get("/jokebook/categories", async function(req, res){
    const queryText = "SELECT DISTINCT category FROM jokes ORDER BY category";
    try{
        const result = await pool.query(queryText);
        res.json(result.rows);
    } catch(err){
        console.error(err);
        res.status(500).send("Server error");
    }
});

// ii. GET endpoint at /jokebook/category/:category that responds with a list of jokes from a specific category
app.get("/jokebook/category/:category", async function(req, res){
    let category = req.params.category;
    let limit = req.query.limit;

    if(!category){
        res.status(400).send("Invalid category parameter");
    }

    let queryText = "SELECT * FROM jokes WHERE category = $1";
    let values = [category];

    if(limit){
        queryText += " LIMIT $2";
        values.push(limit);
    }

    try{
        const result = await pool.query(queryText, values);
        if(result.rows.length === 0){
            res.status(400).send("Invalid category. Please try a valid category.");
            return;
        }
        res.json(result.rows);
    } catch(err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// iii. GET endpoint at /jokebook/random that responded with on joke from the database at random
app.get("/jokebook/random", async function (req, res){
    const queryText = "SELECT * FROM jokes ORDER BY RANDOM() LIMIT 1";
    try{
        const result = await pool.query(queryText);
        res.json(result.rows[0]);
    } catch(err){
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// iv. POST endpoint at /jokebook/joke/add that requires three attributes 
app.post("/jokebook/joke/add", async function (req, res){
    let category = req.body.category;
    let setup = req.body.setup;
    let delivery = req.body.delivery;

    if(!category || !setup || !delivery){
        res.status(400).send("Missing required parameters");
        return;
    }

    const insertQuery = "INSERT INTO jokes (category, setup, delivery) VALUES ($1, $2, $3) RETURNING *"
    const insertValues = [category, setup, delivery];

    try{
        await pool.query(insertQuery, insertValues);

        // Respond with the updated jokebook for that category
        const selectQuery = "SELECT * FROM jokes WHERE category = $1";
        const result = await pool.query(selectQuery, [category]);
        res.json(result.rows);
    }catch(err){
        console.log(err);
        res.status(500).send("Server error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
    console.log("Sever listening on port: " + PORT + "!");
});