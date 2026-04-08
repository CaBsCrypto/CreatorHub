export const getReviewTranslations = (lang: 'en' | 'es') => {
  const t = {
    en: {
      clientReport: "Campaign Report", live: "Live", posts: "Posts",
      totalViews: "Total Views", creators: "Creators", activeCreators: "Creators",
      filterByPlatform: "FILTER BY PLATFORM", allPlatforms: "ALL PLATFORMS",
      creatorDirectory: "CREATOR DIRECTORY", allCreators: "ALL CREATORS",
      publishedContent: "PUBLISHED CONTENT", views: "Views",
      loading: "Generating report...", notFound: "Report not found",
      notFoundDesc: "This report doesn't exist or the link has expired.",
      backHome: "Back to Home", anonymous: "Anonymous Creator",
      searchCreators: "Search creators...", platformDistribution: "Platforms",
      noResults: "No content matches the filters", viewAllPlatforms: "View all",
      engagement: "Engagement", top5Content: "Content Ranking",
      additionalInfo: "Campaign Info", close: "Close", allContent: "All Content"
    },
    es: {
      clientReport: "Reporte de Campaña", live: "En Vivo", posts: "Posts",
      totalViews: "Vistas Totales", creators: "Creadores", activeCreators: "Creadores",
      filterByPlatform: "FILTRAR POR RED", allPlatforms: "TODAS LAS REDES",
      creatorDirectory: "DIRECTORIO DE CREADORES", allCreators: "TODOS",
      publishedContent: "CONTENIDO PUBLICADO", views: "Vistas",
      loading: "Generando reporte...", notFound: "Enlace no disponible",
      notFoundDesc: "Este reporte no existe o el enlace ha caducado.",
      backHome: "Volver al inicio", anonymous: "Creador Anónimo",
      searchCreators: "Buscar creadores...", platformDistribution: "Plataformas",
      noResults: "Sin contenido para los filtros seleccionados", viewAllPlatforms: "Ver todo",
      engagement: "Engagement", top5Content: "Ranking de Contenido",
      additionalInfo: "Información", close: "Cerrar", allContent: "Todos"
    }
  };
  return t[lang];
};
