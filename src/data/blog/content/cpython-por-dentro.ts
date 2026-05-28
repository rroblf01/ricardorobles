export const content = `
## Introducción

CPython es el intérprete Python por defecto y el más utilizado. Está escrito en C y traduce tu código Python a bytecode que luego ejecuta en una máquina virtual basada en pila. Entender cómo funciona internamente te da una ventaja enorme para escribir código más eficiente y depurar problemas de rendimiento.

En este artículo vamos a hacer un tour por las entrañas de CPython: cómo se compila el código, cómo se ejecuta el bytecode, cómo se gestiona la memoria de los objetos y qué ocurre realmente cuando ejecutas una función.

## El pipeline de ejecución

Cuando ejecutas \`python script.py\`, ocurren varias fases:

1. **Lexing**: El código fuente se convierte en tokens
2. **Parsing**: Los tokens se convierten en un AST (Abstract Syntax Tree)
3. **Compilación**: El AST se compila a bytecode
4. **Ejecución**: La máquina virtual ejecuta el bytecode instrucción por instrucción

### Lexing y parsing

El lexer (en \`Parser/lexer.c\`) tokeniza el código. Cada token representa un elemento: nombre de variable, operador, palabra clave, etc. Luego el parser (generado por PEG desde \`Grammar/python.gram\`) construye el AST.

### Compilación a bytecode

El compilador (\`Python/compile.c\`) recorre el AST y genera instrucciones de bytecode. Cada instrucción tiene un opcode (código de operación) y opcionalmente un argumento.

### La máquina virtual

La máquina virtual de CPython (\`Python/ceval.c\`) es un bucle infinito que lee instrucciones de bytecode y las ejecuta. Usa una pila para pasar argumentos entre instrucciones.

## El bytecode en acción

Veamos un ejemplo concreto. Definimos una función simple y examinamos su bytecode:

\`\`\`python
import dis

def suma(a, b):
    return a + b

dis.dis(suma)
\`\`\`

Salida:

\`\`\`
  2           0 RESUME                   0
              2 LOAD_FAST                0 (a)
              4 LOAD_FAST                1 (b)
              6 BINARY_OP                0 (+)
             10 RETURN_VALUE
\`\`\`

Cada instrucción:

- **RESUME**: Punto de entrada para generadores y corrutinas
- **LOAD_FAST**: Carga una variable local en la pila
- **BINARY_OP**: Saca dos valores de la pila, suma, y mete el resultado
- **RETURN_VALUE**: Devuelve el valor que está en la cima de la pila

El modelo es de pila: las operaciones toman sus operandos de la pila y dejan el resultado en la pila.

## El ciclo de vida de un objeto

### Creación

Cuando CPython encuentra \`x = 42\`, ocurre:

1. Se llama a \`PyLong_FromLong(42)\` que crea un objeto \`PyLongObject\`
2. Se asigna memoria en el heap mediante \`PyObject_Malloc\`
3. El contador de referencias se inicializa a 1
4. La variable \`x\` se guarda en el diccionario de variables locales apuntando al objeto

### Gestión de memoria

CPython usa dos estrategias:

1. **Contador de referencias**: Cada objeto tiene un \`ob_refcnt\` que se incrementa al crear una nueva referencia y decrementa al eliminarla. Cuando llega a 0, el objeto se libera inmediatamente.

2. **GC generacional**: Para detectar ciclos de referencias, CPython tiene un garbage collector que divide los objetos en tres generaciones. Los objetos nuevos van a la generación 0. Si sobreviven a una recolección, suben a la siguiente generación.

### Pool de memoria

Para objetos pequeños (< 512 bytes), CPython usa un sistema propio de pools llamado \`pymalloc\`. Divide la memoria en bloques, pools y arenas. Esto reduce la fragmentación y mejora el rendimiento comparado con llamar a \`malloc\` del sistema para cada objeto.

### Liberación

Cuando \`ob_refcnt\` llega a 0:

1. Se llama a la función \`tp_dealloc\` del tipo de objeto
2. Si el objeto tiene referencias a otros objetos, se decrementan sus contadores
3. La memoria se devuelve al pool de pymalloc o al sistema

## Optimizaciones internas

### Caché de objetos pequeños

CPython cachea ciertos objetos inmutables para reutilizarlos:

- Enteros entre -5 y 256 (\`small_ints\`)
- Strings cortos (internado)
- Tuplas vacías

\`\`\`python
a = 256
b = 256
print(a is b)  # True

c = 257
d = 257
print(c is d)  # False (depende de la implementación)
\`\`\`

### Internado de strings

Cuando dos strings idénticos aparecen en el código fuente, CPython los internó (comparte la misma memoria). También puedes internar strings manualmente con \`sys.intern()\`.

### Peephole optimizer

El compilador aplica optimizaciones simples llamadas "peephole optimization":

- Plegado de constantes: \`3 + 5\` se convierte en \`8\` en tiempo de compilación
- Eliminación de código muerto
- Simplificación de secuencias de bytecode

## Implicaciones prácticas

Conocer CPython por dentro te ayuda a entender por qué ciertas cosas son lentas:

- **Los bucles en Python puro son lentos**: Cada iteración implica múltiples operaciones de bytecode, creación de objetos y llamadas a funciones
- **Las listas son arrays de punteros**: No arrays de valores. Cada elemento es un puntero a un objeto Python
- **Los atributos de objeto son dicts**: Acceder a \`obj.attr\` implica una búsqueda en diccionario

## Conclusión

CPython no es solo "el intérprete de Python". Es una máquina virtual sofisticada con décadas de optimizaciones. Entender su funcionamiento interno te permite escribir código que se ejecute de forma predecible y eficiente.

Para profundizar, el código fuente de CPython está en https://github.com/python/cpython. Los archivos más interesantes son \`Python/ceval.c\` (bucle principal), \`Objects/object.c\` (ciclo de vida) y \`Include/object.h\` (estructuras de datos).
`;