export const content = `
## Introducción

Hay dos formas de escribir y mantener código: la forma en que solo importa que funcione, y la forma en que consideras que otras personas (o tú dentro de 6 meses) van a tener que leer y modificar ese código.

Clean Code no es un lujo ni una moda. Es una cuestión de economía: el tiempo de lectura es mucho mayor que el tiempo de escritura. Según estudios, los desarrolladores pasan ~60% de su tiempo leyendo código existente y ~20% escribiendo código nuevo. Invertir en claridad es invertir en velocidad a largo plazo.

En este artículo no voy a repetir el libro de Robert Martin. Voy a cubrir los principios que he visto marcar la diferencia en equipos reales.

## Nombres que comunican

### Malo

\`\`\`python
def proc(d):
    r = []
    for i in d:
        if i[1] > 0:
            r.append(i[0])
    return r
\`\`\`

### Bueno

\`\`\`python
def obtener_usuarios_activos(usuarios):
    return [u.id for u in usuarios if u.esta_activo]
\`\`\\]

### Reglas para nombres

1. **Comunican intención**: Un nombre debe responder "¿qué hace esto?" sin mirar el cuerpo.
2. **Busca y reemplaza**: \`get_user_by_email\` > \`get_user\` (específico > genérico).
3. **Longitud proporcional al ámbito**: \`i\` en un list comprehension de 1 línea está bien. \`i\` en una función de 50 líneas no.
4. **Consistencia**: Si usas \`crear_usuario\`, no uses \`generate_user\` en otra parte.

## Funciones pequeñas con una responsabilidad

### Malo

\`\`\`python
def procesar_pedido(pedido):
    # Validar
    if not pedido.items:
        raise ValueError("Pedido vacío")
    if pedido.total <= 0:
        raise ValueError("Total inválido")
    
    # Calcular impuestos
    impuesto = pedido.total * 0.16
    
    # Guardar en BD
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO pedidos ...", pedido)
    
    # Enviar email
    send_email(pedido.usuario.email, "Pedido confirmado")
\`\`\`

### Bueno

\`\`\`python
def procesar_pedido(pedido):
    validar_pedido(pedido)
    pedido.impuesto = calcular_impuesto(pedido)
    guardar_pedido(pedido)
    notificar_pedido_confirmado(pedido)
\`\`\`

Cada subfunción se prueba por separado, se lee sin contexto, y se modifica sin riesgo de romper otras partes.

## Evita efectos secundarios

\`\`\`python
# Malo: modifica el argumento y retorna algo
def procesar_usuarios(usuarios):
    for u in usuarios:
        u.procesado = True  # efecto secundario
    return usuarios

# Bueno: separa mutación de consulta
def marcar_como_procesados(usuarios):
    for u in usuarios:
        u.procesado = True

def obtener_marcados(usuarios):
    return [u for u in usuarios if u.procesado]
\`\`\`

## Manejo de errores explícito

\`\`\`python
# Malo
def get_user(user_id):
    try:
        return db.query(User).filter(id=user_id).one()
    except:
        return None

# Bueno
def get_user(user_id):
    try:
        return db.query(User).filter(id=user_id).one()
    except NoResultFound:
        return None
    except MultipleResultsFound:
        logger.error(f"Múltiples usuarios con id {user_id}")
        raise
\`\`\`

- No captures Exception genéricamente
- No silencies errores
- Usa excepciones específicas

## Comentarios: menos es más

### Comentarios que sobran

\`\`\`python
# Suma a y b
def suma(a, b):
    return a + b
\`\`\`

### Comentarios útiles

\`\`\`python
# La API externa retorna códigos en lugar de HTTP status
# Mapeo según documentación v2.3 sección 4.1
CODIGOS_ERROR = {0: "ok", 1: "error_autenticacion", 2: "error_validacion"}
\`\`\\)

## Principio DRY con cuidado

DRY (Don't Repeat Yourself) es importante, pero la abstracción prematura es peor que la duplicación.

\`\`\`python
# Duplicación aceptable (solo 2 veces)
def calcular_precio_base(producto):
    return producto.precio * (1 - producto.descuento)

def calcular_precio_con_envio(producto):
    base = producto.precio * (1 - producto.descuento)
    return base + producto.costo_envio
\`\`\`

vs:

\`\`\`python
# Abstracción prematura
def aplicar_descuento(precio, descuento, costo_envio=0):
    return precio * (1 - descuento) + costo_envio
\`\`\`

La regla: **la tercera vez que repites algo, abstrae**. Las dos primeras veces, la duplicación es más barata que la abstracción incorrecta.

## Niveles de abstracción

Cada función debe operar a un solo nivel de abstracción:

\`\`\`python
# Malo: mezcla niveles
def init_app():
    config = load_config()  # alto nivel
    db_url = f"postgres://{config['db_user']}:{config['db_pass']}@localhost/db"  # bajo nivel
    engine = create_engine(db_url)  # alto nivel
    print("App iniciada")  # bajo nivel

# Bueno: separa niveles
def init_app():
    config = load_config()
    engine = crear_conexion_db(config)
    loggear_inicio()

def crear_conexion_db(config):
    db_url = construir_url_db(config)
    return create_engine(db_url)

def construir_url_db(config):
    return f"postgres://{config['db_user']}:{config['db_pass']}@localhost/db"

def loggear_inicio():
    print("App iniciada")
\`\`\`

## Principio de mínima sorpresa

El código debería comportarse como se espera:

\`\`\`python
# Sorprendente: append retorna None
lista = [1, 2, 3]
nueva = lista.append(4)  # nueva es None

# No sorprendente: sorted retorna nueva lista
ordenada = sorted([3, 1, 2])  # [1, 2, 3]
\`\`\`

## Conclusión

Clean Code no es perfección. Es pragmatismo. Código limpio es código que:
- Se lee como una buena prosa
- Hace una cosa y la hace bien
- Es fácil de cambiar sin romper otras partes
- Comunica intención sin necesidad de comentarios

La próxima vez que escribas una función de 200 líneas con variables de una letra y efectos secundarios, pregúntate: ¿cómo me sentiría si tuviera que debuggear esto a las 3 AM?
`;