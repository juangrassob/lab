## 1. Crear y activar el entorno virtual (venv)

```bash
python3 -m venv venv

# Activar el entorno virtual:
source venv/bin/activate

```

---

## 2. Instalar dependencias desde requirements.txt

```bash
pip install -r requirements.txt
```

---

## 3. Levantar Redis y Flower (si no están corriendo ya)

```bash
docker-compose up -d
```

> Flower quedará accesible en [http://localhost:5555](http://localhost:5555)

---

## 4. Ejecutar 2 workers con nombres personalizados

Abre dos terminales nuevas (con el entorno virtual activado en cada una) y ejecuta:

```bash
# Terminal 1
celery -A tasks worker --loglevel=info --hostname=worker1@%h

# Terminal 2
celery -A tasks worker --loglevel=info --hostname=worker2@%h
```

---

## 5. Ejecutar el script main.py para enviar tareas

```bash
python main.py
```

---

# Resumen rápido

```bash
python3 -m venv venv
source venv/bin/activate           # o .\venv\Scripts\Activate.ps1 en Windows
pip install -r requirements.txt
docker-compose up -d

celery -A tasks worker --loglevel=info --hostname=worker1@%h
celery -A tasks worker --loglevel=info --hostname=worker2@%h

python main.py
```

---
