// src/components/Cursos.js
import React, { useEffect, useState } from "react";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import  AnnouncementBar from "./AnnouncementBar";
import './Cursos.css'
import LoadingSpinner from './LoadingSpinner'
import Footer from "./Footer";
const Cursos = () => {
  // const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        
        // setUserEmail(user.email);
        setUserName(user.email);
        fetchCursos();
      } else {
        window.location.href = "/";
      }
      setLoading(true);
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchCursos = async () => {
    const directorios = ["mystake"];
    const fetchedCursos = [];

    for (const directorio of directorios) {
      const storage = getStorage();
      const cursoRef = ref(storage, `cursos/${directorio}`);
      const listaCursos = await listAll(cursoRef);

      if (listaCursos.items.length > 0) {
        const archivoRef = listaCursos.items[0]; // Usa solo el primer archivo del directorio
        const url = await getDownloadURL(archivoRef);
        const metadatos = await getMetadata(archivoRef);

        fetchedCursos.push({
          id: directorio,
          nombre: metadatos.customMetadata.titulo || "Sin título",
          descripcion: metadatos.customMetadata.descripcion || "",
          imagen: url,
        });
      }
    }

    setCursos(fetchedCursos);
    setLoading(false);
  };

  const handleCursoClick = (cursoId) => {
    setLoading(true)
    navigate(`/curso/${cursoId}`);
    
  };

  if (loading) {
    return <LoadingSpinner/>;
  }

  return (
    <> 
       <AnnouncementBar/>
 
    <div className="cursos-container">
       
      <h2>Bienvenido, {userName}</h2>
      <h3 className="cursos-titulo">Tu acceso</h3>
      <div className="cursos-list">
        {cursos.map((curso) => (
          <div key={curso.id} className="curso-item">
           
            <img src={curso.imagen} alt={curso.nombre} />
            <div>
            <h4>{curso.nombre}</h4>
            <span>{curso.descripcion}</span>
            </div>
            <button onClick={() => handleCursoClick(curso.id)} className="primary">Entrar al Curso</button>
          </div>
        ))}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Cursos;
