"Actúa como un Arquitecto Web Senior, Especialista en Experiencia de Usuario (UX/UI) y Desarrollador de Sistemas de Gestión del Aprendizaje (LMS) e Información Estudiantil (SIS). Tu tarea es generar el código, la estructura y el diseño de un sitio web educativo profesional y altamente funcional.

El sistema debe tener una arquitectura de información clara, una jerarquía plana para evitar que los usuarios se pierdan (máximo 3 clics para llegar a la información vital) e incluir 'migas de pan' (breadcrumbs) para facilitar la navegación.

El sitio se dividirá en dos ecosistemas: **Una web pública informativa** y un **Portal Privado Transaccional con Control de Acceso Basado en Roles (RBAC)**.

A continuación, detallo los parámetros y elementos obligatorios que debes diseñar y estructurar:

### **1\. SECCIONES PÚBLICAS DEL SITIO WEB**

Diseña una interfaz pública minimalista, utilizando el espacio en blanco de forma estratégica para evitar la sobreestimulación visual. Debe incluir:

* **Página de Inicio (Home):** Atractiva, con el logotipo, lema, imágenes dinámicas optimizadas (menos de 200kb), y un menú de navegación intuitivo con no más de 7 elementos.  
* **Quiénes Somos:** Historia, misión, visión, valores y testimonios reales.  
* **Información Académica y Admisiones:** Programas de estudio, metodologías, formularios de inscripción en línea descargables y requisitos.  
* **Vida Estudiantil y Novedades:** Actividades extracurriculares, blog educativo y un calendario escolar actualizado.  
* **Contacto:** Mapa interactivo, direcciones, números de teléfono y un formulario de contacto accesible.

### **2\. PORTAL PRIVADO (RBAC \- Control de Acceso por Roles)**

El sistema debe diferenciar estrictamente los permisos y visualizaciones dependiendo del usuario logueado:

* **Módulo para Padres/Tutores:** Un panel de control (dashboard) de solo lectura e interacción comunicativa. Los padres podrán ver el registro de asistencia, reportes de comportamiento, calendario de tareas pendientes y comunicarse directamente con el personal docente a través de mensajería interna segura.  
* **Módulo para Docentes:** Un panel de administración pedagógica donde los maestros pueden subir materiales, gestionar cursos, moderar foros y hacer el seguimiento individual de cada alumno.

### **3\. VENTANA CENTRAL: REGISTRO DE GRADO ACADÉMICO (Exclusivo Docentes)**

Diseña la interfaz de usuario (UI) y la estructura de base de datos para la **Ventana de Registro de Calificaciones**. Esta es la herramienta principal del docente y debe contener los siguientes componentes para una evaluación formativa y sumativa:

* **Datos Generales:** Selector de Año Escolar, Grado, Sección y Asignatura.  
* **Listado de Estudiantes:** Tabla ordenada alfabéticamente con el nombre completo y número de identificación de cada alumno.  
* **Módulo de Asistencia y Puntualidad:** Columnas para marcar el estatus diario utilizando una leyenda clara: Presente (P), Ausente (A), Tardanza (T) y Excusa (E), con cálculo automático del porcentaje de asistencia mensual.  
* **Matriz de Calificaciones por Períodos:** Columnas divididas en cuatro reportes de evaluación (P1, P2, P3, P4) donde el docente ingresará calificaciones numéricas (0 a 100).  
* **Recuperación Pedagógica (RP):** Casillas específicas habilitadas automáticamente si la nota del período es inferior a 70 puntos, para registrar la calificación de recuperación.  
* **Evaluación por Competencias:** Campos para valorar indicadores de logro específicos (ej. Competencia Comunicativa, Pensamiento Lógico, Resolución de Problemas) para que la calificación no sea solo un número, sino un reflejo del desarrollo integral.  
* **Cálculo Automático de Calificación Final:** Un algoritmo que promedie los períodos (ej. 70% de evaluaciones continuas y 30% de pruebas sumativas) para arrojar el estado final: Aprobado (A) o Reprobado (R).

### **4\. COMUNICACIÓN E INTERACCIÓN DIGITAL**

* **Ecosistema Multicanal:** Integra un sistema de notificaciones *Push* web y compatibilidad con SMS/Email para enviar alertas inmediatas a los padres sobre calificaciones subidas, ausencias o avisos de emergencia.  
* **Mensajería Segura:** Un canal bidireccional dentro del portal que evite el uso de plataformas externas no reguladas, protegiendo la privacidad de las conversaciones.

### **5\. SEGURIDAD, PRIVACIDAD Y CUMPLIMIENTO (PARÁMETROS CRÍTICOS)**

* **Cumplimiento Normativo:** La arquitectura debe cumplir con los estándares de privacidad estudiantil internacionales (como FERPA y COPPA), garantizando que la Información de Identificación Personal (PII) de los menores no sea accesible para terceros ni utilizada con fines comerciales.  
* **Ciberseguridad:** Implementa obligatoriamente Certificado SSL, encriptación de datos sensibles en tránsito y en reposo, y Autenticación de Doble Factor (2FA) para el acceso de maestros y administradores.  
* **Políticas de Privacidad:** Una sección visible donde los padres acepten los términos de uso y el consentimiento informado sobre los datos de sus hijos.

### **6\. PARÁMETROS TÉCNICOS Y RENDIMIENTO**

* **Diseño Mobile-First / Responsivo:** La plataforma debe reestructurarse automáticamente para funcionar a la perfección en smartphones, tablets y computadoras, ya que las familias suelen consultar esta información en movilidad.  
* **Optimización de Velocidad:** Minimización de scripts y optimización de bases de datos para garantizar tiempos de carga rápidos, lo cual es vital para la retención del usuario y el SEO.

Procede a generar la estructura de carpetas, el diseño de la base de datos relacional para el sistema de calificaciones y los *wireframes* descriptivos de las interfaces de Docente y Padre."

