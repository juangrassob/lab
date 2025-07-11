from celery import Celery

# Redis como broker y también como backend de resultados
app = Celery(
    "tasks", broker="redis://localhost:6379/0", backend="redis://localhost:6379/0"
)


@app.task
def add(x, y):
    return x + y
