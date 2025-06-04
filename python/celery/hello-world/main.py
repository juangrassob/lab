from tasks import add

if __name__ == "__main__":

    for i in range(10):
        result = add.delay(i, i)

        print("Tarea enviada, esperando resultado...")

        # Espera y obtiene el resultado (bloqueante)
        print("Resultado:", result.get(timeout=10))
