"use strict";
(function () {

const BASE_URL = "/jokebook";

window.addEventListener("load", init);

function init(){
    loadRandomJoke();

    showCategories();

    id("search-btn").addEventListener("click", searchByCategory);
    id("add-joke-form").addEventListener("submit", addJoke);
}

// Load a random joke
function loadRandomJoke(){
    fetch(BASE_URL + "/random")
        .then(checkStatus)
        .then((joke) => {
            displayRandomJoke(joke);
        })
        .catch((error) => {
            console.error("Error loading random joke:", error);
            id("random-joke").textContent = "Error loading joke";
        });
}

function displayRandomJoke(joke){
    let container = id("random-joke");
    container.textContent = "";

    let setup = document.createElement("p");
    setup.textContent = joke.setup;

    let delivery = document.createElement("p");
    delivery.textContent = joke.delivery;

    let category = document.createElement("p");
    category.textContent = joke.category;

    container.appendChild(setup);
    container.appendChild(delivery);
    container.appendChild(category);
}

// Show joke categories
function showCategories(){
    fetch(BASE_URL + "/categories")
        .then(checkStatus)
        .then((categories) => {
            displayCategories(categories);
        })
        .catch((error) => {
            console.error("Error loading categories", error);
            let container = id("categories-list");
            container.textContent = "";
            let errorP = document.createElement("p");
            errorP.className = "error";
            errorP.textContent = "Error loading categories.";
            container.appendChild(errorP);
        });
}

function displayCategories(categories){
    let container = id("categories-list");
    container.textContent = "";

    for(const cat of categories){
        let categoryBtn = document.createElement("button");
        categoryBtn.textContent = cat.category;
        categoryBtn.addEventListener("click", function(){
            loadJokesByCategory(cat.category);
        });
        container.appendChild(categoryBtn);
    }
}

// Search for joke by category name
function searchByCategory(){
    let category = id("category-search").value.trim();
    if(!category){
        let container = id("search-results");
        container.textContent = "";
        let errorP = document.createElement("p");
        errorP.className = "error";
        errorP.textContent = "Please enter a category name.";
        container.appendChild(errorP);
        return;
    }
    loadJokesByCategory(category);
}

function loadJokesByCategory(category){
    fetch(BASE_URL + "/category/" + category)
        .then(checkStatus)
        .then((jokes) => {
            displayJokes(jokes, "search-results");
        })
        .catch((error) => {
            console.error("Error:", error);
            let container = id("search-results");
            container.textContent = "";
            let errorP = document.createElement("p");
            errorP.className = "error";
            errorP.textContent = "Category not found or error loading jokes";
            container.appendChild(errorP);
        });
}

function displayJokes(jokes, containerId){
    let container = id(containerId);
    container.textContent = "";

    for (const joke of jokes){
        let jokeCard = document.createElement("div");
        jokeCard.className= "joke-card";

        let setup = document.createElement("p");
        setup.textContent = joke.setup;

        let delivery = document.createElement("p");
        delivery.textContent = joke.delivery;

        jokeCard.appendChild(setup);
        jokeCard.appendChild(delivery);
        container.appendChild(jokeCard);
    }
}

function addJoke(event) {
    event.preventDefault();
    
    let category = id("new-category").value.trim();
    let setup = id("new-setup").value.trim();
    let delivery = id("new-delivery").value.trim();
    
    if (!category || !setup || !delivery) {
        let container = id("add-result");
        container.textContent = "";
        let errorP = document.createElement("p");
        errorP.className = "error";
        errorP.textContent = "All fields are required!";
        container.appendChild(errorP);
        return;
    }
    
    let data = new FormData();
    data.append("category", category);
    data.append("setup", setup);
    data.append("delivery", delivery);
    
    fetch(BASE_URL + "/joke/add", {
        method: "POST",
        body: data
    })
        .then(checkStatus)
        .then((updatedJokes) => {
            let container = id("add-result");
            container.textContent = "";
            
            // Success message
            let successP = document.createElement("p");
            successP.className = "success";
            successP.textContent = "Joke added successfully!";
            container.appendChild(successP);
            
            // Display updated jokes
            displayJokes(updatedJokes, "add-result");
            
            // Clear the form
            id("add-joke-form").reset();
            
            // Refresh categories in case it's a new category
            showCategories();
        })
        .catch((error) => {
            console.error("Error adding joke:", error);
            let container = id("add-result");
            container.textContent = "";
            let errorP = document.createElement("p");
            errorP.className = "error";
            errorP.textContent = "Error adding joke.";
            container.appendChild(errorP);
        });
}


function id(idName) {
    return document.getElementById(idName);
}

function checkStatus(response) {
    if (!response.ok) {
        throw Error("Error in request: " + response.statusText);
    }
    return response.json();
}

})
();