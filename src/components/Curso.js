import React, { useEffect, useState } from "react";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { useNavigate, useParams } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import LoadingSpinner from "./LoadingSpinner";
import "./Curso.css";

const Curso = () => {
  const { cursoId } = useParams();
  const [cursoArchivos, setCursoArchivos] = useState([]);
  const [progreso, setProgreso] = useState(0); // Progreso en porcentaje
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(0); // Índice del archivo seleccionado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const storage = getStorage();
        const cursoRef = ref(storage, `cursos/${cursoId}`);
        const listaCarpetas = await listAll(cursoRef);
  
        // Mapear IDs de carpetas a títulos
        const titulosCarpetas = {
          "1": "1 Introducción",
          "2": "2 Desarrollo",
          "3": "3 Conclusión",
          // Agrega más títulos según sea necesario
        };
  
        // Obtener los archivos de cada carpeta y asignarles un título
        const carpetasConArchivos = await Promise.all(
          listaCarpetas.prefixes.map(async (subcarpeta) => {
            const subcarpetaId = subcarpeta.name;
            const subcarpetaTitulo = titulosCarpetas[subcarpetaId] || `Carpeta ${subcarpetaId}`;
  
            const listaArchivos = await listAll(subcarpeta);
            const archivos = await Promise.all(
              listaArchivos.items.map(async (item) => {
                const url = await getDownloadURL(item);
                const metadatos = await getMetadata(item);
                const contentType = metadatos.contentType || "";
  
                return {
                  url,
                  titulo: metadatos.customMetadata?.titulo || "Sin título",
                  descripcion: metadatos.customMetadata?.descripcion || "",
                  tipo: contentType.startsWith("image/")
                    ? "imagen"
                    : contentType.startsWith("video/")
                    ? "video"
                    : "otro",
                };
              })
            );
  
            return {
              carpetaId: subcarpetaId,
              carpetaTitulo: subcarpetaTitulo,
              archivos,
            };
          })
        );
  
        console.log(carpetasConArchivos);
        setCursoArchivos(carpetasConArchivos);
      } catch (err) {
        console.error("Error al obtener los archivos del curso:", err);
        setError(
          "No existe este curso o hubo un problema al cargar los archivos."
        );
      } finally {
        setLoading(false);
      }
    };
  
    fetchCurso();
  }, [cursoId]);
  

  // Actualiza el progreso y el scroll spy
  useEffect(() => {
    const handleScroll = () => {
      let scrollTop = window.scrollY; // Desplazamiento actual del documento
      let scrollHeight = document.documentElement.scrollHeight; // Altura total del documento
      let clientHeight = window.innerHeight; // Altura visible de la ventana

      // Asegurarse de que no haya valores inválidos para la altura
      if (clientHeight > 0 && scrollHeight > clientHeight) {
        const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
        setProgreso(progress);
      } else {
        // Si no hay suficiente contenido para hacer scroll, el progreso es 100%
        setProgreso(0);
      }

      // Detectar cuál sección está visible
      let cursoItems = document.querySelectorAll(".curso-section");
      let indexToSelect = null;

      cursoItems.forEach((item, index) => {
        let rect = item.getBoundingClientRect();
        let isVisible = rect.top >= 0 && rect.top <= window.innerHeight / 2;
        if (isVisible && indexToSelect === null) {
          indexToSelect = index; // Seleccionar solo la primera sección visible
        }
      });

      if (indexToSelect !== null) {
        setArchivoSeleccionado(indexToSelect);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Llamar a handleScroll de inmediato en caso de que ya haya un desplazamiento
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll al archivo seleccionado desde el sidebar
  const handleSeleccionArchivo = (index) => {
    let element = document.querySelector(`#archivo-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setArchivoSeleccionado(index); // Actualiza manualmente el índice
  };

  // Resetear el progreso a 0 antes de navegar
  const handleNavigate = () => {
    setProgreso(0); // Reinicia el progreso
    navigate("/biblioteca");
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (!cursoArchivos.length) return <div>No se encontró el curso.</div>;

  return (
    <div className="curso-layout">
      <AnnouncementBar />
      {/* Sidebar */}
      <aside className="curso-sidebar">
        <button className="back-button secondary" onClick={handleNavigate}>
          ← Cursos
        </button>
        <div className="sidebar-progress">
          <div className="progress-bar">
            <div
              className="progress-indicator"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
          <p>Progreso: {Math.round(progreso)}%</p>
        </div>
        <ul className="sidebar-list">
          {cursoArchivos.map((carpeta, carpetaIndex) => (
            <li key={carpetaIndex} className="sidebar-folder">
              <strong>{carpeta.carpetaTitulo}</strong>
              <ul>
                {carpeta.archivos.map((archivo, archivoIndex) => {
                  const globalIndex = `${carpetaIndex}-${archivoIndex}`; // Índice único por carpeta y archivo
                  return (
                    <li
                      key={globalIndex}
                      className={`sidebar-item ${
                        globalIndex === archivoSeleccionado ? "active" : ""
                      }`}
                      onClick={() => handleSeleccionArchivo(globalIndex)}
                    >
                      {archivo.titulo}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </aside>
  
      {/* Contenido principal */}
      <main className="curso-content">
        {cursoArchivos.map((carpeta, carpetaIndex) => (
          <div key={carpetaIndex} className="curso-folder">
            {/* <h2 className="folder-title">{carpeta.carpetaTitulo}</h2> */}
            {carpeta.archivos.map((archivo, archivoIndex) => {
              const globalIndex = `${carpetaIndex}-${archivoIndex}`;
              return (
                <div
                  id={`archivo-${globalIndex}`}
                  key={globalIndex}
                  className="curso-section"
                >
                   <h3 className="folder-title">{archivo.titulo}</h3>
                  <div className="curso-media">
                    {archivo.tipo === "imagen" && (
                      <img src={archivo.url} alt={archivo.titulo} />
                    )}
                    {archivo.tipo === "video" && (
                      <video src={archivo.url} controls width="100%"></video>
                    )}
                    {archivo.tipo === "otro" && (
                      <a
                        href={archivo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Descargar archivo
                      </a>
                    )}
                  </div>
                  <p>{archivo.descripcion}</p>
                </div>
              );
            })}
          </div>
        ))}
      </main>
    </div>
  );
};

export default Curso;
