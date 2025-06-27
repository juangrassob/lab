#!/bin/bash
PSQL="psql --username=freecodecamp --dbname=number_guess -t --no-align -c"

echo -e "Enter your username: "
read USERNAME

USER=$($PSQL "SELECT * FROM users WHERE username='$USERNAME';")

if [[ -z $USER ]]
then
  $($PSQL "INSERT INTO users(username) VALUES('$USERNAME');")
  USER=$($PSQL "SELECT * FROM users WHERE username='$USERNAME';")
  echo Welcome, $USERNAME! It looks like this is your first time here.
fi

IFS='|' read -r USER_ID USERNAME GAMES_PLAYED BEST_GAME <<< "$USER"

echo -e "Welcome back, $USERNAME! You have played $GAMES_PLAYED games, and your best game took $BEST_GAME guesses., with $USERNAME being a users name from the database, $GAMES_PLAYED being the total number of games that user has played, and $BEST_GAME being the fewest number of guesses it took that user to win the game"

RANDOM_NUMBER=$(($RANDOM%(1000-1)))
NUMBER_OF_GUESSES=0

echo -e "\nGuess the secret number between 1 and 1000:"

while [[ -z "$GUESS" || "$GUESS" -ne "$RANDOM_NUMBER" ]]; do
  ((NUMBER_OF_GUESSES++))
  read GUESS

  if [[ ! "$GUESS" =~ ^[0-9]+$ ]]; then
    echo "That is not an integer, guess again:"
    continue
  fi

  if [[ $GUESS -gt $RANDOM_NUMBER ]]; then
    echo "It's lower than that, guess again:"
  elif [[ $GUESS -lt $RANDOM_NUMBER ]]; then
    echo "It's higher than that, guess again:"
  fi
done

echo "You guessed it in $NUMBER_OF_GUESSES tries. The secret number was $RANDOM_NUMBER. Nice job!"

NEW_GAMES_PLAYED=$((GAMES_PLAYED + 1))

if [[ $NUMBER_OF_GUESSES -lt $BEST_GAME ]];
then
  $PSQL "UPDATE users SET number_of_games = $NEW_GAMES_PLAYED, best_game = $NUMBER_OF_GUESSES WHERE username = '$USERNAME';"
else
  $PSQL "UPDATE users SET number_of_games = $NEW_GAMES_PLAYED WHERE username = '$USERNAME';"
fi
