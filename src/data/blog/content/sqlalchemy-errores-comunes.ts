export const content = `
## Introducción

SQLAlchemy es el estándar de facto para ORM en Python. Es potente, flexible, y a veces frustrante. La mayoría de los problemas con SQLAlchemy vienen de no entender cómo funciona por debajo.

En este artículo voy a cubrir los errores más comunes que he visto (y cometido) con SQLAlchemy y cómo evitarlos.

## Error 1: N+1 Queries

### El problema

\`\`\`python
# models.py
class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nombre = Column(String)
    pedidos = relationship("Pedido", back_populates="usuario")

class Pedido(Base):
    __tablename__ = "pedidos"
    id = Column(Integer, primary_key=True)
    usuario_id = Column(ForeignKey("usuarios.id"))
    total = Column(Numeric)
    usuario = relationship("Usuario", back_populates="pedidos")

# views.py
def obtener_pedidos_por_usuario():
    usuarios = session.query(Usuario).all()
    for usuario in usuarios:
        print(len(usuario.pedidos))  # ¡Query separado para cada usuario!
\`\`\`

Esto genera 1 query para traer usuarios + N queries para contar pedidos (una por usuario).

### La solución

\`\`\`python
from sqlalchemy.orm import joinedload, subqueryload, selectinload

# eager loading con JOIN
usuarios = session.query(Usuario).options(
    joinedload(Usuario.pedidos)
).all()

# O con selectinload (2 queries, mejor para colecciones grandes)
usuarios = session.query(Usuario).options(
    selectinload(Usuario.pedidos)
).all()

# Para relaciones muchos-a-muchos, selectinload suele ser mejor
selectinload(Usuario.pedidos)

# Con with_expression para queries complejas
from sqlalchemy.orm import with_expression, selectinload

usuarios = session.query(Usuario).options(
    selectinload(Usuario.pedidos),
    with_expression(Usuario.total_pedidos, select(func.count())....)
)
\`\`\`

## Error 2: Session management incorrecto

### El problema

\`\`\`python
# Sin contexto: la sesión nunca se cierra
def get_user(user_id):
    session = Session()
    user = session.query(User).get(user_id)
    return user  # session no se cierra
\`\`\`

### La solución

\`\`\`python
from contextlib import contextmanager

@contextmanager
def get_session():
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# Uso
with get_session() as session:
    user = session.query(User).get(user_id)
\`\`\`

### Con FastAPI/Starlette

\`\`\`python
from starlette.middleware.base import BaseHTTPMiddleware

class DBSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        session = Session()
        request.state.db = session
        try:
            response = await call_next(request)
            session.commit()
            return response
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
\`\`\`

## Error 3: Consultas ineficientes

### SELECT * cuando necesitas 3 columnas

\`\`\`python
# Malo: trae todas las columnas (pueden ser 50+)
usuario = session.query(Usuario).filter(Usuario.id == 1).first()

# Bueno: solo las columnas necesarias
usuario = session.query(
    Usuario.id, Usuario.nombre, Usuario.email
).filter(Usuario.id == 1).first()
\`\`\`

### Filtro en columna sin índice

\`\`\`python
# Malo: LOWER() impide usar índice (a menos que sea funcional)
usuarios = session.query(Usuario).filter(
    func.lower(Usuario.email) == "test@ejemplo.com"
).all()

# Bueno: buscar exacto (usa índice en email)
usuarios = session.query(Usuario).filter(
    Usuario.email == "test@ejemplo.com"
).all()
\`\`\`

### Ordenar por columna sin índice

\`\`\`python
# Malo: filesort en disco si fecha no tiene índice
pedidos = session.query(Pedido).order_by(Pedido.fecha).all()

# Bueno: índice en fecha (ORDER BY usa índice)
# Crear índice: CREATE INDEX idx_pedidos_fecha ON pedidos(fecha)
pedidos = session.query(Pedido).order_by(Pedido.fecha).all()
\`\`\`

## Error 4: Bulk operations una por una

### El problema

\`\`\`python
# Un INSERT por cada item
for item in items:
    session.add(Pedido(**item))
session.commit()
\`\`\`

### La solución

\`\`\`python
# INSERT masivo en una sola consulta
session.bulk_insert_mappings(Pedido, items)
session.commit()

# UPDATE masivo
session.query(Usuario).filter(
    Usuario.ultimo_acceso < hace_un_mes
).update({"activo": False})
session.commit()

# DELETE masivo
session.query(Log).filter(
    Log.fecha < hace_un_anio
).delete()
session.commit()
\`\`\`

## Error 5: Lazy loading fuera de sesión

\`\`\`python
# views.py
def get_pedidos(user_id):
    session = Session()
    user = session.query(Usuario).get(user_id)
    session.close()
    return user.pedidos  # LazyLoadingError: la sesión está cerrada
\`\`\`

### Soluciones

1. Eager loading con joinedload/selectinload
2. Mantener sesión abierta
3. Serializar los datos antes de cerrar

## Error 6: Transacciones demasiado largas

### El problema

\`\`\`python
def procesar_lote(items):
    session = Session()
    for item in items:
        procesar_item(item)  # puede tardar segundos por item
        session.add(Procesamiento(item=item))
    session.commit()  # transacción abierta por minutos
\`\`\`

### La solución: commits intermedios

\`\`\`python
def procesar_lote(items):
    session = Session()
    try:
        for i, item in enumerate(items):
            procesar_item(item)
            session.add(Procesamiento(item=item))
            if i % 100 == 0:  # commit cada 100 items
                session.commit()
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
\`\`\`

## Error 7: No usar índices compuestos

\`\`\`python
# Consulta común en la app
pedidos = session.query(Pedido).filter(
    Pedido.usuario_id == 1,
    Pedido.estado == "pendiente"
).order_by(Pedido.fecha.desc()).all()

# Índice compuesto para esta consulta
class Pedido(Base):
    __tablename__ = "pedidos"
    __table_args__ = (
        Index("idx_usuario_estado_fecha", "usuario_id", "estado", "fecha"),
    )
\`\`\`

## Conclusión

SQLAlchemy es una herramienta increíble cuando la entiendes. Los errores más comunes se reducen a:

1. **Sobrecarga de queries**: Usa eager loading
2. **Gestión de sesión**: Context managers
3. **Ineficiencia**: SELECT específicos, filtros con índices
4. **Bulk operations**: bulk_insert_mappings
5. **Lazy loading**: Carga lo que necesitas antes de cerrar

La clave: entiende qué SQL genera SQLAlchemy. Usa \`echo=True\` o \`logging\` para ver las queries reales y optimiza donde haga falta.
`;