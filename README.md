# DojoApp Frontend

Frontend de gestión de gimnasio de artes marciales. Construido con **Vite + React + Tailwind CSS**.

---

## Requisitos previos

- Node.js 18+
- El backend corriendo en `http://localhost:5000`

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno (no es estrictamente necesario en dev)
cp .env.example .env

# 3. Arrancar en modo desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx       ← Sidebar + header de navegación
│   │   └── ProtectedRoute.jsx  ← Guards de rutas por rol
│   └── ui/
│       └── index.jsx           ← Todos los componentes compartidos (Modal, Avatar, etc.)
├── context/
│   └── AuthContext.jsx         ← Estado global de autenticación (JWT)
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx  ← Stats + gráficos + alertas
│   │   ├── AdminStudents.jsx   ← CRUD alumnos + subida foto
│   │   ├── AdminPayments.jsx   ← Alertas de impago + reporte mensual
│   │   └── AdminEvents.jsx     ← CRUD eventos
│   └── student/
│       ├── StudentDashboard.jsx ← Dashboard personal + progresión cinturón
│       ├── StudentProfile.jsx   ← Perfil editable + foto
│       ├── StudentPayments.jsx  ← Historial de pagos
│       └── StudentEvents.jsx    ← Eventos visibles
├── services/
│   ├── api.js                  ← Axios con interceptores (token + 401)
│   ├── authService.js
│   └── index.js                ← Todos los servicios agrupados por dominio
├── utils/
│   └── helpers.js              ← Constantes, formateo de fechas, cinturones, etc.
├── App.jsx                     ← Router principal
├── main.jsx
└── index.css                   ← Tailwind + variables de diseño
```

---

## Rutas de la aplicación

| Ruta                    | Acceso     | Página                       |
|-------------------------|------------|------------------------------|
| `/login`                | Público    | Inicio de sesión             |
| `/register`             | Público    | Registro de cuenta           |
| `/admin`                | Admin      | Dashboard administrador      |
| `/admin/students`       | Admin      | Gestión de alumnos           |
| `/admin/payments`       | Admin      | Gestión de pagos y alertas   |
| `/admin/events`         | Admin      | Gestión de eventos           |
| `/student`              | Alumno     | Dashboard personal           |
| `/student/profile`      | Alumno     | Perfil y foto                |
| `/student/payments`     | Alumno     | Mis pagos                    |
| `/student/events`       | Alumno     | Eventos del gimnasio         |

---

## Tecnologías

| Paquete            | Uso                                |
|--------------------|------------------------------------|
| `react-router-dom` | Enrutado + protección por rol      |
| `axios`            | Cliente HTTP con interceptores JWT |
| `recharts`         | Gráficos del dashboard             |
| `react-hot-toast`  | Notificaciones                     |
| `lucide-react`     | Iconografía                        |
| `date-fns`         | Formateo de fechas en español      |
| `tailwindcss`      | Estilos utilitarios                |

---

## Notas importantes para el backend

- El proxy de Vite (`vite.config.js`) redirige automáticamente `/api/*` → `http://localhost:5000/api/*`. **No necesitas configurar CORS adicional en desarrollo.**
- El token JWT se guarda en `localStorage` con la clave `dojo_token`.
- Si el backend devuelve `401`, el interceptor de Axios redirige automáticamente a `/login`.
- Las imágenes se suben como `multipart/form-data` con el campo `foto`.

---

## Build para producción

```bash
npm run build
# Los archivos generados estarán en /dist
```

Para producción, configura tu servidor para que sirva `index.html` en todas las rutas (SPA routing).
