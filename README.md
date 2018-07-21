# office-competition-ranking
Full stack app that uses the Elo rating system for intra-office activities like ping pong

## Overview
New users can sign up under their organization to create a new account. They can then record games that they've played against other registered users. With each new recorded game, the players' Elo ratings are updated. The leaderboard shows how each player is ranked and includes data for their Elo rating, number of games played, number of wins, and number of losses.

## Technologies used
- Node/Express (Backend to handle routing and API requests)
- Passport (Authentication)
- Mongo/Mongoose (Database)
- HTML/CSS/jQuery (Frontend UI)

## Cloning the repo
If you'd like to clone this repo and run this on your own server, go ahead! After cloning the repo you'll need to do the following:
- `npm install` to get all the Node modules
- create an `.env` file to store your session secret
- create a MongoDB database called `officeCompetitionRankingDB`
- create a `users` collection and a `games` collection within that database

## Feature requests and bug reports
If you've found a bug or would like to request a feature, please file an issue on this repo. PRs are welcome!
