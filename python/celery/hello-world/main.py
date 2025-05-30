from tasks import add

if __name__ == "__main__":
    # Envía una tarea de forma asíncrona
    # result = add.delay(5, 3)

    for i in range(10):
        result = add.delay(i, i)

        print("Tarea enviada, esperando resultado...")

        # Espera y obtiene el resultado (bloqueante)
        print("Resultado:", result.get(timeout=10))
