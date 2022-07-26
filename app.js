const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getAllPlayers = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName,
    jersey_number AS jerseyNumber,
    role
    FROM 
    cricket_team;`;
  const allPlayers = await db.all(getAllPlayers);
  response.send(allPlayers);
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addPlayer = `
  INSERT INTO 
  cricket_team (player_name, jersey_number, role) 
  VALUES 
  ('${playerName}', '${jerseyNumber}', '${role}');`;
  const addedPlayer = await db.run(addPlayer);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayer = `
  SELECT 
  player_id AS playerId,
  player_name AS playerName,
  jersey_number AS jerseyNumber,
  role
  FROM 
  cricket_team 
  WHERE 
  player_id = ${playerId};`;

  const player = await db.get(getPlayer);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayer = `
    UPDATE 
    cricket_team 
    SET 
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
    WHERE 
    player_id = ${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayer = `
    DELETE FROM 
    cricket_team 
    WHERE
    player_id = ${playerId};`;

  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
