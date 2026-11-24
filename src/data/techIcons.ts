export interface TechIcon {
  path: string;
  /** Dark monochrome logo that needs inverting to be visible in dark mode. */
  invertInDark?: boolean;
}

/** Logo for each technology name used in the experience section. */
export const techIcons: Record<string, TechIcon> = {
  Python: { path: "/assets/python.svg" },
  Django: { path: "/assets/django.svg" },
  DRF: { path: "/assets/drf.svg" },
  FastAPI: { path: "/assets/fastapi.svg" },
  Pytest: { path: "/assets/pytest.svg" },
  "Pydantic AI": { path: "/assets/pydantic-ai.svg" },
  LangChain: { path: "/assets/langchain.svg" },
  Celery: { path: "/assets/celery.svg" },
  RabbitMQ: { path: "/assets/rabbitmq.svg" },
  PostgreSQL: { path: "/assets/postgresql.svg" },
  Docker: { path: "/assets/docker.svg" },
  Kubernetes: { path: "/assets/kubernetes.svg" },
  GCP: { path: "/assets/gcp.svg" },
  GitLab: { path: "/assets/gitlab.svg" },
  GitHub: { path: "/assets/github.svg", invertInDark: true },
  SVN: { path: "/assets/svn.svg" },
  Vue: { path: "/assets/vue.svg" },
  JavaScript: { path: "/assets/javascript.svg" },
  TypeScript: { path: "/assets/typescript.svg" },
  "Node.js": { path: "/assets/nodejs.svg" },
  "C++": { path: "/assets/cplusplus.svg" },
};
