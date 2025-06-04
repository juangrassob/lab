#! /bin/bash

PSQL="psql --username=freecodecamp --dbname=salon -t --no-align -c"

echo -e "\n~~~~~ MY SALON ~~~~~"

echo -e "\nWelcome to My Salon, how can I help you?"

# Mostrar lista de servicios
DISPLAY_SERVICES() {
  $PSQL "SELECT service_id, name FROM services ORDER BY service_id" | while IFS="|" read SERVICE_ID NAME
  do
    echo "$SERVICE_ID) $NAME"
  done
}

# Pedir un servicio válido
GET_SERVICE_ID() {
  DISPLAY_SERVICES
  read SERVICE_ID_SELECTED

  SERVICE_NAME=$($PSQL "SELECT name FROM services WHERE service_id = $SERVICE_ID_SELECTED")

  while [[ -z $SERVICE_NAME ]]
  do
    echo -e "\nI could not find that service. What would you like today?"
    DISPLAY_SERVICES
    read SERVICE_ID_SELECTED
    SERVICE_NAME=$($PSQL "SELECT name FROM services WHERE service_id = $SERVICE_ID_SELECTED")
  done
}

GET_CUSTOMER_INFO() {
  # Pedir número de teléfono
  echo -e "\nWhat's your phone number?"
  read CUSTOMER_PHONE

  # Buscar cliente
  CUSTOMER_NAME=$($PSQL "SELECT name FROM customers WHERE phone = '$CUSTOMER_PHONE'")

  # Si no existe, pedir nombre
  if [[ -z $CUSTOMER_NAME ]]
  then
    echo -e "\nWhat's your name?"
    read CUSTOMER_NAME
    $PSQL "INSERT INTO customers(phone, name) VALUES('$CUSTOMER_PHONE', '$CUSTOMER_NAME')"
  fi

  CUSTOMER_ID=$($PSQL "SELECT customer_id FROM customers WHERE phone = '$CUSTOMER_PHONE'")
}

SCHEDULE_APPOINTMENT() {
  echo -e "\nWhat time would you like your $SERVICE_NAME, $CUSTOMER_NAME?"
  read SERVICE_TIME

  $PSQL "INSERT INTO appointments(customer_id, service_id, time) VALUES($CUSTOMER_ID, $SERVICE_ID_SELECTED, '$SERVICE_TIME')"

  echo -e "\nI have put you down for a $SERVICE_NAME at $SERVICE_TIME, $CUSTOMER_NAME."
}

# Flujo principal
GET_SERVICE_ID
GET_CUSTOMER_INFO
SCHEDULE_APPOINTMENT

