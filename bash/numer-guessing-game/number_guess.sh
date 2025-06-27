#!/bin/bash

PSQL="psql --username=freecodecamp --dbname=number_guess -t --no-align -c"

echo "Enter your username:"
read USERNAME

USER=$($PSQL "SELECT username, number_of_games, best_game FROM users WHERE username='$USERNAME'")

if [[ -z $USER ]]
then
  $PSQL "INSERT INTO users(username) VALUES('$USERNAME')"
  echo "Welcome, $USERNAME! It looks like this is your first time here."
else
  IFS='|' read -r USERNAME GAMES_PLAYED BEST_GAME <<< "$USER"
  echo "Welcome back, $USERNAME! You have played $GAMES_PLAYED games, and your best game took $BEST_GAME guesses."
fi

RANDOM_NUMBER=$((RANDOM % 1000 + 1))
NUMBER_OF_GUESSES=0

echo "Guess the secret number between 1 and 1000:"

while true; do
  read GUESS
  
  if [[ ! $GUESS =~ ^[0-9]+$ ]]; then
    echo "That is not an integer, guess again:"
    continue
  fi
  
  ((NUMBER_OF_GUESSES++))

  if [[ $GUESS -eq $RANDOM_NUMBER ]]; then
    break
  elif [[ $GUESS -gt $RANDOM_NUMBER ]]; then
    echo "It's lower than that, guess again:"
  else
    echo "It's higher than that, guess again:"
  fi
done

echo "You guessed it in $NUMBER_OF_GUESSES tries. The secret number was $RANDOM_NUMBER. Nice job!"

# Actualizar base de datos
if [[ -z $USER ]]; then
  # Usuario nuevo
  $PSQL "UPDATE users SET number_of_games = 1, best_game = $NUMBER_OF_GUESSES WHERE username = '$USERNAME'" > /dev/null
else
  # Usuario existente
  NEW_GAMES_PLAYED=$((GAMES_PLAYED + 1))
  if [[ $NUMBER_OF_GUESSES -lt $BEST_GAME ]]; then
    $PSQL "UPDATE users SET number_of_games = $NEW_GAMES_PLAYED, best_game = $NUMBER_OF_GUESSES WHERE username = '$USERNAME'" > /dev/null
  else
    $PSQL "UPDATE users SET number_of_games = $NEW_GAMES_PLAYED WHERE username = '$USERNAME'" > /dev/null
  fi
fi
