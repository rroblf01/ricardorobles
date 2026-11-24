export const content = `
## Introducción

Cada vez que un proyecto necesitaba que un LLM consultara datos internos (tickets, facturas, usuarios...) acababa escribiendo las mismas herramientas una y otra vez: una función para el agente de este servicio, otra casi igual para el de aquel. Con varios proyectos en paralelo, mantener esa lógica duplicada se vuelve un problema.

El **Model Context Protocol (MCP)** resuelve justo eso: defines tus herramientas una vez, en un servidor, y cualquier agente compatible las usa sin saber cómo están implementadas. Es lo que hago en mi día a día para compartir lógica y recursos entre proyectos, y en este artículo te enseño a montar un servidor MCP en Python, con Pydantic AI para la parte de IA y para el agente que lo consume.

Todo el código está probado con **Pydantic AI 2.71**, **FastMCP 4.2** y el **SDK oficial de MCP 2.3**.

## ¿Qué es MCP?

MCP es un protocolo abierto que estandariza cómo una aplicación con LLM (el *cliente*) se conecta a fuentes de datos y acciones externas (el *servidor*). Un servidor MCP puede exponer tres cosas:

- **Tools (herramientas)**: funciones que el modelo puede invocar, con parámetros tipados. Por ejemplo, \`buscar_tickets\` o \`crear_ticket\`.
- **Resources (recursos)**: datos de solo lectura identificados por una URI, como un documento o una configuración.
- **Prompts**: plantillas de prompt reutilizables.

La comunicación viaja por un **transporte**. Los dos que vas a usar casi siempre son:

- **stdio**: el cliente lanza el servidor como un subproceso y hablan por la entrada y salida estándar. Ideal para desarrollo local y herramientas de escritorio.
- **HTTP (streamable HTTP)**: el servidor es un servicio web normal. Es lo que quieres cuando varios proyectos o equipos comparten el mismo servidor.

La gracia está en el desacoplamiento: el servidor no sabe qué modelo hay al otro lado, y el agente no sabe si las herramientas consultan Postgres, una API externa u otro LLM.

## Dónde encaja Pydantic AI

Antes de escribir código conviene aclarar el reparto de papeles, porque el ecosistema ha cambiado bastante en los últimos meses:

- **El servidor** lo escribimos con **FastMCP**. Es la misma librería sobre la que Pydantic AI construye su cliente MCP (\`MCPToolset\`), así que todo encaja sin fricción.
- **Pydantic AI** aparece en dos sitios: *dentro* del servidor, para las herramientas que necesitan un LLM y deben devolver datos estructurados, y *fuera*, como el agente que consume el servidor.

**Ojo con los tutoriales antiguos:** en la versión 2 del SDK oficial de MCP, la clase \`FastMCP\` de \`mcp.server.fastmcp\` pasó a llamarse \`MCPServer\` (\`mcp.server.mcpserver\`). El \`FastMCP\` que usamos aquí es el proyecto independiente \`fastmcp\`. Y en Pydantic AI, las antiguas clases \`MCPServerStdio\` y \`MCPServerStreamableHTTP\` se sustituyen por \`MCPToolset\`.

## Instalación

Con [uv](/blog/integra-uv-en-tus-aplicaciones-de-python/):

\`\`\`bash
uv add fastmcp "pydantic-ai-slim[mcp,anthropic]"
\`\`\`

El extra \`mcp\` instala el cliente MCP de Pydantic AI y \`anthropic\` el proveedor que usaremos para el LLM. Si usas otro proveedor, cambia el extra.

## El servidor: herramientas con tipos

Vamos a construir un servidor de soporte técnico con tickets. Primero, los modelos y dos herramientas normales, sin IA:

\`\`\`python
# servidor.py
from datetime import datetime
from enum import StrEnum

from fastmcp import FastMCP
from pydantic import BaseModel, Field

mcp = FastMCP("Soporte", instructions="Herramientas para gestionar tickets de soporte.")


class Prioridad(StrEnum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"


class Ticket(BaseModel):
    id: int
    titulo: str
    prioridad: Prioridad
    abierto: bool = True
    creado: datetime = Field(default_factory=datetime.now)


TICKETS: dict[int, Ticket] = {
    1: Ticket(id=1, titulo="Error 500 al exportar facturas", prioridad=Prioridad.ALTA),
    2: Ticket(id=2, titulo="Cambiar el logo del email", prioridad=Prioridad.BAJA),
}


@mcp.tool
def buscar_tickets(prioridad: Prioridad | None = None, solo_abiertos: bool = True) -> list[Ticket]:
    """Devuelve los tickets, filtrando opcionalmente por prioridad y estado."""
    return [
        t for t in TICKETS.values()
        if (prioridad is None or t.prioridad == prioridad) and (t.abierto or not solo_abiertos)
    ]


@mcp.tool
def crear_ticket(titulo: str, prioridad: Prioridad = Prioridad.MEDIA) -> Ticket:
    """Crea un ticket nuevo y lo devuelve."""
    ticket = Ticket(id=max(TICKETS) + 1, titulo=titulo, prioridad=prioridad)
    TICKETS[ticket.id] = ticket
    return ticket
\`\`\`

En una aplicación real, \`TICKETS\` sería tu base de datos. Fíjate en todo lo que obtenemos solo con los tipos:

- **El docstring es la descripción de la herramienta.** Es lo que lee el modelo para decidir cuándo usarla, así que merece la pena escribirlo bien.
- **Los type hints generan el JSON Schema de los parámetros.** Al usar el enum \`Prioridad\`, el modelo solo puede enviar \`"baja"\`, \`"media"\` o \`"alta"\`. Cualquier otro valor se rechaza antes de llegar a tu código.
- **El tipo de retorno también se publica.** Al devolver modelos de Pydantic, el cliente recibe *structured content*: JSON validado, no texto que haya que parsear.

## Recursos: contexto de solo lectura

Los recursos sirven para exponer información que el agente puede leer pero no modificar:

\`\`\`python
@mcp.resource("soporte://politica-prioridades")
def politica_prioridades() -> str:
    """Criterios que usa el equipo para asignar prioridades."""
    return (
        "alta: el cliente no puede trabajar o hay pérdida de datos.\\n"
        "media: funcionalidad degradada con alternativa.\\n"
        "baja: mejoras y cambios cosméticos."
    )
\`\`\`

## Una herramienta con IA dentro: respuestas estructuradas

Aquí es donde Pydantic AI brilla. Imagina que quieres una herramienta que lea la descripción libre de una incidencia y proponga prioridad, categoría y un resumen. Con un agente de Pydantic AI cuyo \`output_type\` es un modelo, la salida del LLM se valida contra ese modelo y, si no encaja, Pydantic AI le pide al modelo que lo corrija.

Añade \`from pydantic_ai import Agent\` a los imports del principio de \`servidor.py\`, y este código después de lo anterior:

\`\`\`python
class Clasificacion(BaseModel):
    prioridad: Prioridad
    categoria: str = Field(description="Área afectada: facturación, login, UI...")
    resumen: str = Field(description="Resumen en una frase")


clasificador = Agent(
    "anthropic:claude-opus-5-5",
    output_type=Clasificacion,
    defer_model_check=True,  # no exige ANTHROPIC_API_KEY al importar (útil en tests)
    instructions=(
        "Clasificas incidencias de soporte. alta = el cliente no puede trabajar "
        "o hay pérdida de datos; media = funcionalidad degradada; baja = cosmético."
    ),
)


@mcp.tool
async def clasificar_incidencia(descripcion: str) -> Clasificacion:
    """Analiza el texto de una incidencia y propone prioridad, categoría y resumen."""
    resultado = await clasificador.run(descripcion)
    return resultado.output
\`\`\`

Este patrón tiene varias ventajas:

- **El prompt vive en un solo sitio.** Si mañana cambian los criterios de prioridad, actualizas el servidor y todos los proyectos que lo usan reciben el cambio.
- **Los clientes reciben datos, no texto.** Quien llama a \`clasificar_incidencia\` obtiene un objeto con \`prioridad\`, \`categoria\` y \`resumen\` ya validados, perfecto para la comunicación entre microservicios.
- **Puedes elegir el modelo por herramienta.** Una clasificación sencilla puede ir a un modelo pequeño y barato, y un análisis complejo a uno más potente, sin que el cliente lo note.

Para terminar, el punto de entrada:

\`\`\`python
if __name__ == "__main__":
    mcp.run()
\`\`\`

## Arrancar el servidor

Por defecto, \`mcp.run()\` usa el transporte **stdio**, así que no hace falta arrancarlo a mano: el cliente lo lanzará como subproceso.

Para compartirlo por red, cambia a HTTP:

\`\`\`python
if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=8000)
\`\`\`

El servidor quedará escuchando en \`http://localhost:8000/mcp\`, y puedes desplegarlo como cualquier otro servicio: en un contenedor, detrás de tu proxy, en Kubernetes...

## Consumirlo desde un agente de Pydantic AI

En el lado del cliente, el servidor MCP es un *toolset* más del agente:

\`\`\`python
# cliente.py
import asyncio

from pydantic_ai import Agent
from pydantic_ai.mcp import MCPToolset

soporte = MCPToolset("servidor.py")  # stdio: lanza el script como subproceso

agent = Agent(
    "anthropic:claude-opus-5-5",
    toolsets=[soporte],
    instructions="Eres el asistente del equipo de soporte.",
)


async def main():
    result = await agent.run("¿Qué tickets de prioridad alta siguen abiertos?")
    print(result.output)


if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

\`MCPToolset\` acepta una ruta a un script, una URL o directamente una instancia de \`FastMCP\`. Para conectarte al servidor HTTP basta con cambiar una línea:

\`\`\`python
soporte = MCPToolset("http://localhost:8000/mcp")
\`\`\`

Al ejecutar el agente, Pydantic AI se conecta al servidor, descubre sus herramientas (\`buscar_tickets\`, \`crear_ticket\`, \`clasificar_incidencia\`) y deja que el modelo decida cuáles usar. El agente no contiene ni una línea de lógica de tickets: toda vive en el servidor.

## Tests sin gastar tokens

Un servidor MCP es código de backend y se testea como tal. FastMCP permite conectar un cliente **en memoria** pasándole la instancia del servidor, sin subprocesos ni puertos, y Pydantic AI incluye \`TestModel\`, un modelo falso que no llama a ninguna API:

\`\`\`python
# test_servidor.py
import pytest
from fastmcp import Client
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPToolset
from pydantic_ai.models.test import TestModel

from servidor import clasificador, mcp

pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def test_buscar_tickets_filtra_por_prioridad():
    async with Client(mcp) as client:
        result = await client.call_tool("buscar_tickets", {"prioridad": "alta"})

    assert [t["titulo"] for t in result.structured_content["result"]] == [
        "Error 500 al exportar facturas"
    ]


async def test_clasificar_incidencia_devuelve_datos_estructurados():
    with clasificador.override(model=TestModel()):
        async with Client(mcp) as client:
            result = await client.call_tool(
                "clasificar_incidencia", {"descripcion": "No puedo entrar en la app"}
            )

    assert set(result.structured_content) == {"prioridad", "categoria", "resumen"}


async def test_el_agente_ve_las_herramientas_del_servidor():
    agent = Agent(TestModel(), toolsets=[MCPToolset(mcp)])

    with clasificador.override(model=TestModel()):
        result = await agent.run("Lista los tickets")

    llamadas = [
        part.tool_name
        for message in result.all_messages()
        for part in message.parts
        if part.part_kind == "tool-call"
    ]
    assert "buscar_tickets" in llamadas
\`\`\`

Tres niveles de prueba:

1. **La herramienta aislada**, llamándola por el protocolo MCP como lo haría cualquier cliente.
2. **La herramienta con IA**, sustituyendo el modelo real por \`TestModel\` con \`override\`. \`TestModel\` genera una salida válida para el esquema, así que comprobamos el contrato sin pagar tokens.
3. **La integración agente + servidor**: \`TestModel\` llama a todas las herramientas disponibles, lo que confirma que el agente las descubre.

Fíjate en que una herramienta que devuelve una lista llega envuelta en \`{"result": [...]}\`, porque el *structured content* de MCP siempre es un objeto JSON.

Estos tests se ejecutan en un par de segundos, así que puedes meterlos en tu CI sin problema.

## ¿Y el sampling?

Si has leído sobre MCP, quizá conozcas el **sampling**: el servidor le pide al *cliente* que haga la llamada al LLM, de forma que el servidor no necesita API key propia. Pydantic AI lo soporta con \`MCPSamplingModel\`, pero **la especificación de MCP lo marcó como obsoleto el 28 de julio de 2026** (SEP-2577), y el SDK ya avisa al usarlo.

Mi recomendación hoy: si una herramienta necesita un LLM, dale al servidor su propio modelo, como en \`clasificar_incidencia\`. Si no quieres que el servidor dependa de un proveedor, devuelve los datos y deja que razone el agente cliente.

## Buenas prácticas

Después de montar unos cuantos servidores MCP, estas son las reglas que sigo:

- **Herramientas pequeñas y con un propósito claro.** Al modelo le cuesta menos elegir entre \`buscar_tickets\` y \`crear_ticket\` que adivinar los parámetros de una herramienta \`gestionar_tickets\` que lo hace todo.
- **Docstrings pensados para el modelo.** Explica *cuándo* usar la herramienta, no solo qué hace. Es el prompt más infravalorado del sistema.
- **Restringe los parámetros con tipos.** Enums, \`Literal\`, \`Field(ge=1)\`... Cada valor inválido que rechaza el esquema es una alucinación que no llega a tu base de datos.
- **Cuidado con lo que expones.** Un servidor MCP por HTTP es una API más: necesita autenticación (FastMCP la soporta con el parámetro \`auth\`) y no debería exponer operaciones destructivas sin control.
- **Errores que ayuden a reintentar.** Por defecto, \`MCPToolset\` devuelve al modelo los errores de las herramientas para que corrija la llamada (\`tool_error_behavior="retry"\`). Lanza excepciones con mensajes claros, como "el ticket 42 no existe", y el modelo se recuperará solo.
- **Testea como cualquier backend.** Con el cliente en memoria y \`TestModel\` no hay excusa.

## Conclusión

MCP convierte las herramientas de tus agentes en un servicio compartido: las defines una vez, con tipos, y cualquier proyecto las reutiliza. Con FastMCP el servidor ocupa unas pocas líneas, y Pydantic AI aporta lo que más valoro en producción: **respuestas estructuradas y validadas** dentro de las herramientas y un cliente que se conecta al servidor con una sola línea.

Si ya tienes una API interna, un buen primer paso es envolver sus tres o cuatro operaciones más usadas en un servidor MCP y conectarlo a un agente. En una tarde tendrás un asistente que trabaja con tus datos reales, y la próxima vez que otro proyecto necesite esas herramientas, ya estarán ahí.
`;
