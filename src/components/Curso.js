import React, { useEffect, useState } from "react";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { useNavigate, useParams } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import LoadingSpinner from "./LoadingSpinner";
import "./Curso.css";

const Curso = () => {
  const { cursoId } = useParams();
  const [cursoArchivos, setCursoArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const storage = getStorage();
        const cursoRef = ref(storage, `cursos/${cursoId}`);
        const listaCarpetas = await listAll(cursoRef);
        const titulosCarpetas = {
          "1": "1 Introducción",
          "2": "2 Desarrollo",
          "3": "3 Conclusión",
        };
        const carpetasConArchivos = await Promise.all(
          listaCarpetas.prefixes.map(async (subcarpeta) => {
            const subcarpetaId = subcarpeta.name;
            const listaArchivos = await listAll(subcarpeta);
            const subcarpetaTitulo = titulosCarpetas[subcarpetaId] || `Carpeta ${subcarpetaId}`;
            const archivos = await Promise.all(
              listaArchivos.items.map(async (item) => {
                const url = await getDownloadURL(item);
                const metadatos = await getMetadata(item);
                return {
                  url,
                  titulo: metadatos.customMetadata?.titulo || "Sin título",
                  descripcion: metadatos.customMetadata?.descripcion || "",
                  tipo: metadatos.contentType.startsWith("image/")
                    ? "imagen"
                    : metadatos.contentType.startsWith("video/")
                    ? "video"
                    : "otro",
                };
              })
            );
            return {
              carpetaId: subcarpeta.name,
              archivos,
              carpetaTitulo: subcarpetaTitulo
            };
          })
        );

        setCursoArchivos(carpetasConArchivos);
        if (carpetasConArchivos.length > 0 && carpetasConArchivos[0].archivos.length > 0) {
          setArchivoSeleccionado(carpetasConArchivos[0].archivos[0]);
        }
      } catch (err) {
        setError("No existe este curso o hubo un problema al cargar los archivos.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurso();
  }, [cursoId]);

  const handleSeleccionArchivo = (archivo) => {
    setArchivoSeleccionado(archivo);
  };

  const handleNavigate = () => {
    navigate("/biblioteca");
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (!cursoArchivos.length) return <div>No se encontró el curso.</div>;

  return (
    <div className="curso-layout">
      <AnnouncementBar />
      <aside className="curso-sidebar">
        <button className="back-button secondary" onClick={handleNavigate}>
          ← Cursos
        </button>
        
        <ul className="sidebar-list">
          {cursoArchivos.map((carpeta, carpetaIndex) => (
            <li key={carpetaIndex} className="sidebar-folder">
              <strong className="folder-title">{carpeta.carpetaTitulo}</strong>
              <ul>
                {carpeta.archivos.map((archivo, archivoIndex) => (
                  <li
                    key={archivoIndex}
                    className={`sidebar-item ${archivo === archivoSeleccionado ? "active" : ""}`}
                    onClick={() => handleSeleccionArchivo(archivo)}
                  >
                    {archivo.titulo}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </aside>

      <main className="curso-content">
        {archivoSeleccionado && (
          <div className="curso-section">
            <h3 className="folder-title">{archivoSeleccionado.titulo}</h3>
            <div className="curso-media">
              {archivoSeleccionado.tipo === "imagen" && (
                <img src={archivoSeleccionado.url} alt={archivoSeleccionado.titulo} />
              )}
              {archivoSeleccionado.tipo === "video" && (
                <video src={archivoSeleccionado.url} controls width="100%"></video>
              )}
              {archivoSeleccionado.tipo === "otro" && (
                <a href={archivoSeleccionado.url} target="_blank" rel="noopener noreferrer">
                  Descargar archivo
                </a>
              )}
            </div>
            <p>{archivoSeleccionado.descripcion}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Curso;
