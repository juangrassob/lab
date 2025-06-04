import time
import jwt
import requests
from typing import Optional, List
from requests.exceptions import HTTPError


class RemedyforceClient:
    def __init__(
        self,
        consumer_key: str,
        username: str,
        login_url: str,
        private_key: str,
        api_version: str = "v60.0",
    ):
        self.consumer_key = consumer_key
        self.username = username
        self.login_url = login_url
        self.private_key = private_key  # clave en memoria
        self.api_version = api_version

        self.access_token = None
        self.instance_url = None
        self.token_expiration = 0  # epoch en segundos

        self._authenticate()

    def _authenticate(self):
        now = int(time.time())
        expiration = now + 300  # 5 minutos
        payload = {
            "iss": self.consumer_key,
            "sub": self.username,
            "aud": self.login_url,
            "exp": expiration,
        }

        assertion = jwt.encode(payload, self.private_key, algorithm="RS256")

        response = requests.post(
            f"{self.login_url}/services/oauth2/token",
            data={
                "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                "assertion": assertion,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if response.status_code != 200:
            raise Exception(f"Auth error: {response.status_code} - {response.text}")

        data = response.json()
        self.access_token = data["access_token"]
        self.instance_url = data["instance_url"]
        self.token_expiration = time.time() + 270  # buffer de 30 segs

    def _ensure_token(self):
        if time.time() >= self.token_expiration:
            self._authenticate()

    def query_salesforce(self, soql: str) -> List[dict]:
        self._ensure_token()
        headers = {"Authorization": f"Bearer {self.access_token}"}
        all_records = []

        url = f"{self.instance_url}/services/data/{self.api_version}/query"
        params = {"q": soql}

        while url:
            response = requests.get(
                url, headers=headers, params=params if "q" in url else None
            )
            if response.status_code != 200:
                raise HTTPError(
                    f"Query error: {response.status_code} - {response.text}"
                )

            result = response.json()
            all_records.extend(result.get("records", []))

            if result.get("done"):
                break

            url = f"{self.instance_url}{result['nextRecordsUrl']}"
            params = None

        return all_records

    def get_api_limits(self) -> dict:
        """
        Consulta el consumo actual de la API REST en Salesforce.
        Devuelve un diccionario con los límites y el uso.
        """
        self._ensure_token()
        url = f"{self.instance_url}/services/data/{self.api_version}/limits"
        headers = {"Authorization": f"Bearer {self.access_token}"}

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(
                f"Error al obtener los límites de API: {response.status_code} - {response.text}"
            )
