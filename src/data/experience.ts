export interface Job {
  place: string;
  title: string;
  start: string;
  end: string;
  logo: string;
  description: string[];
  techs: string[];
}

export const experience: Job[] = [
  {
    place: "Paradigma Digital",
    logo: "/assets/company-paradigma.svg",
    title: "Programador Back-end",
    start: "06/2026",
    end: "Actualidad",
    description: [
      "Desarrollo de backends asíncronos con FastAPI, cubiertos con tests en Pytest.",
      "Optimización del rendimiento en proyectos Django, reduciendo y optimizando las consultas del ORM.",
      "Malla agéntica que integra varios LLM y selecciona el más adecuado para cada caso de uso.",
      "Servidores MCP para compartir lógica y recursos entre proyectos.",
    ],
    techs: ["Python", "FastAPI", "Django", "Pytest", "LangChain", "MCP", "PostgreSQL", "Docker"],
  },
  {
    place: "QDQmedia",
    logo: "/assets/company-qdq.webp",
    title: "Programador Back-end",
    start: "02/2022",
    end: "06/2026",
    description: [
      "Microservicios y flujos de trabajo con Django, Django REST Framework y FastAPI.",
      "Agentes de IA con LangChain y Pydantic AI desde 2023, con respuestas estructuradas para la comunicación entre microservicios.",
      "Procesamiento de tareas pesadas en workers independientes con Celery y RabbitMQ.",
      "Manifiestos de Kubernetes y despliegue en GCP de los microservicios que desarrollaba.",
      "Interfaces con Vue o con HTML, CSS y JavaScript vanilla.",
    ],
    techs: [
      "Python",
      "Django",
      "DRF",
      "FastAPI",
      "Pydantic AI",
      "LangChain",
      "Celery",
      "RabbitMQ",
      "PostgreSQL",
      "Docker",
      "Kubernetes",
      "GCP",
      "GitLab",
      "Vue",
      "TypeScript",
    ],
  },
  {
    place: "HP SCDS",
    logo: "/assets/company-hp-scds.webp",
    title: "Ingeniero del Software",
    start: "06/2020",
    end: "02/2022",
    description: [
      "Desarrollo de los flujos de trabajo de las impresoras relacionados con los cartuchos de tinta.",
      "Ciclo completo de cada flujo: definición de requisitos con el cliente, planificación, desarrollo y tests.",
    ],
    techs: ["Python", "C++", "JavaScript", "GitHub", "SVN"],
  },
  {
    place: "Salbis",
    logo: "/assets/company-salbis.webp",
    title: "Full-Stack",
    start: "10/2019",
    end: "01/2020",
    description: ["Aplicación full-stack de web scraping."],
    techs: ["Vue", "Node.js", "PostgreSQL"],
  },
];
