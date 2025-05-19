#! /bin/bash

if [[ $1 == "test" ]]
then
  PSQL="psql --username=postgres --dbname=worldcuptest -t --no-align -c"
else
  PSQL="psql --username=freecodecamp --dbname=worldcup -t --no-align -c"
fi

echo "$($PSQL "TRUNCATE teams,games")"


# Do not change code above this line. Use the PSQL variable above to query your database.
cat games.csv |  while IFS=',' read -r YEAR ROUND WINNER OPPONENT WINNER_GOALS OPPONENT_GOALS
do
  if [[ $WINNER != winner ]]
  then
    # Ver si existe el team WINNER
    WINNER_TEAM_ID="$($PSQL "SELECT team_id FROM teams WHERE name='$WINNER'")"
    if [[ -z $WINNER_TEAM_ID ]]
    then
      WINNER_TEAM_QUERY="$($PSQL "INSERT INTO teams(name) VALUES('$WINNER')")"
      WINNER_TEAM_ID="$($PSQL "SELECT team_id FROM teams WHERE name='$WINNER'")"
    fi
  fi

  if [[ $OPPONENT != opponent ]]
  then
    # Ver si existe el team WINNER
    OPPONENT_TEAM_ID="$($PSQL "SELECT team_id FROM teams WHERE name='$OPPONENT'")"
    if [[ -z $OPPONENT_TEAM_ID ]]
    then
      OPPONENT_TEAM_QUERY="$($PSQL "INSERT INTO teams(name) VALUES('$OPPONENT')")"
      OPPONENT_TEAM_ID="$($PSQL "SELECT team_id FROM teams WHERE name='$OPPONENT'")"
    fi
  fi
  
  echo "$($PSQL "INSERT INTO games(year, round, winner_id, opponent_id, winner_goals, opponent_goals) VALUES('$YEAR','$ROUND','$WINNER_TEAM_ID','$OPPONENT_TEAM_ID','$WINNER_GOALS','$OPPONENT_GOALS');")"


done