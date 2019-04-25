'use strict';

let repoSearch = document.getElementById('repo-search');
let loadMore = document.getElementById('load-more');
let loadMoreEl = document.querySelector('.load-more');
let currentUser;
let currentPage;
let reposList;
const PAGESIZE = 5;


repoSearch.onclick = getRepos;
loadMore.onclick = loadMoreRepos;

function getRepos (event) {
    event.preventDefault();
    currentUser = document.getElementById('find-repo').value;
    currentPage = 1;
    let url = `https://api.github.com/users/${currentUser}/repos?page=${currentPage}&per_page=${PAGESIZE}`;

    Promise.resolve(url)
        .then( (url)=> httpGet(url))
        .then(JSON.parse)
        .then(function showRepos(githubUserRepos) {

            reposList = githubUserRepos;
            renderRepoData();

            loadMoreEl.style.display = "block";
        })
        .catch(function repoError(error) {
            if (error.code == 404) {
                alert("No Github repo");
            } else {
                throw error;
            }
        });
}

function loadMoreRepos(event) {
    event.preventDefault();
    currentPage++;
    let url = `https://api.github.com/users/${currentUser}/repos?page=${currentPage}&per_page=${PAGESIZE}`;

    Promise.resolve(url)
        .then( (url)=> httpGet(url))
        .then(JSON.parse)
        .then(function showRepos(githubUserRepos) {
            if (githubUserRepos.length == 0) {
                loadMoreEl.style.display = "none";
            } else {
                reposList = reposList.concat(githubUserRepos);
                renderRepoData();
            }
        })
        .catch(function repoError(error) {
            if (error.code == 404) {
                alert("No Github repo");
            } else {
                throw error;
            }
        });
}


function renderRepoData() {
    let repoCards = document.querySelectorAll(".item");

    Array.from(repoCards).filter ( (item)=> {
        return item.id !== "item0";
    }).forEach( (repoCard) => {
        repoCard.parentNode.removeChild(repoCard)
    });

    reposList.forEach( (repo) => {
        let repoCards = document.querySelector(".items-list");
        let repoCard = document.querySelector(".item");
        let repoCardClone = repoCard.cloneNode(true);
        repoCard.setAttribute("id", repo.id);
        repoCards.appendChild(repoCardClone);

        let a = document.querySelector(".repo-link");
        a.innerText = repo.name;
        a.setAttribute("href", repo.html_url);

        let repoDescription = document.querySelector(".repo-description");
        repoDescription.innerText = repo.description;

        let repoLanguage = document.querySelector(".repo-language");
        repoLanguage.innerText = repo.language;

        let repoStar = document.querySelector(".repo-star");
        repoStar.innerText = repo.stargazers_count;

        let repoFork = document.querySelector(".repo-fork");
        repoFork.innerText = repo.fork ? "Fork": "Source";

        let repoLastDate = document.querySelector(".repo-last-date");
        repoLastDate.innerText = formatDate(Date.parse(repo.updated_at));

    });
}

function httpGet(url) {

    return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function() {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                var error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };

        xhr.onerror = function() {
            reject(new Error("Network Error"));
        };

         xhr.send();
    });
}

function formatDate(date) {

    let d = new Date(date);
    d = [
        '0' + d.getDate(),
        '0' + (d.getMonth() + 1),
        '' + d.getFullYear(),
    ];

    for (let i = 0; i < d.length; i++) {
        d[i] = d[i].slice(-2);
    }

    return d.slice(0, 3).join('.') + ' ' + d.slice(3).join(':');
}
