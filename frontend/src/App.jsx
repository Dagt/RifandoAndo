import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RifaDetalle from "./pages/RifaDetalle";
import SeleccionBoletos from "./pages/SeleccionBoletos";
import ConfirmarCompra from "./pages/ConfirmarCompra";
import Layout from "./components/Layout";
import ConfirmacionFinal from "./pages/ConfirmacionFinal";
import Verificador from "./pages/Verificador";
import Ganadores from "./pages/Ganadores";
import Proximas from "./pages/Proximas";
import UsarLink from "./pages/UsarLink";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import RutaProtegida from "./utils/RutaProtegida";
import CrearRifa from "./pages/CrearRifa";
import CrearRifaExclusiva from "./pages/CrearRifaExclusiva";
import CodigosPromocionales from "./pages/CodigosPromocionales";
import Estadisticas from "./pages/Estadisticas";
import EditarRifa from "./pages/EditarRifa"
import EditarRifaExclusiva from "./pages/EditarRifaExclusiva.jsx"
import RifasAdminExclusivas from "./pages/RifasAdminExclusivas.jsx"
import RifasAdmin from "./pages/RifasAdmin";
import NotFound from "./pages/NotFound";
import PanelTransacciones from "./pages/PanelTransacciones";
import BuscadorBoletos from "./pages/BuscadorBoletos";
import InstruccionesPago from "./pages/InstruccionesPago";
import InstruccionesTransferencia from "./pages/InstruccionesTransferencia";
import FalloPago from "./pages/FalloPago";
import PoliticasCondiciones from "./pages/PoliticasCondiciones";
import Contacto from "./pages/Contacto";
import ComoFunciona from "./pages/ComoFunciona";
import ConfiguracionReferidosAdmin from "./pages/ConfiguracionReferidosAdmin.jsx";
import SimuladorCajasSorpresa from "./pages/SimuladorCajaSorpresa.jsx";
import Caja3D from "./components/Caja3D.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rifa/:id" element={<RifaDetalle />} />
          <Route path="/rifa/:id/participar" element={<SeleccionBoletos />} />
          <Route path="/rifa/:id/confirmar" element={<ConfirmarCompra />} />
          <Route path="/compra-exitosa" element={<ConfirmacionFinal />} />
          <Route path="/verificador" element={<Verificador />} />
          <Route path="/ganadores" element={<Ganadores />} />
          <Route path="/proximas-rifas" element={<Proximas />} />
          <Route path="/lgn" element={<Login />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/fallo-pago" element={<FalloPago />} />
          <Route path="/instrucciones-pago" element={<InstruccionesPago />} />
          <Route path="/terminos" element={<PoliticasCondiciones />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/usar-link/:codigo" element={<UsarLink />} />
          <Route path="/instrucciones-transferencia" element={<InstruccionesTransferencia />} />
          <Route path="/adm-panel" element={<RutaProtegida><AdminPanel /></RutaProtegida>} />
          <Route path="/panel/crear-rifa" element={<RutaProtegida> <CrearRifa /></RutaProtegida>} />
          <Route path="/panel/crear-rifa-eclusiva" element={<RutaProtegida> <CrearRifaExclusiva /></RutaProtegida>} />
          <Route path="/panel/codigos-promocion" element={<RutaProtegida> <CodigosPromocionales /></RutaProtegida>} />
          <Route path="/panel/estadisticas" element={<RutaProtegida> <Estadisticas /></RutaProtegida>} />
          <Route path="/panel/rifa/:id/editar" element={<RutaProtegida><EditarRifa /></RutaProtegida>} />
          <Route path="/panel/rifa-exclusiva/:id/editar" element={<RutaProtegida><EditarRifaExclusiva /></RutaProtegida>} />
          <Route path="/panel/editar-rifas-exclusivas" element={<RutaProtegida><RifasAdminExclusivas /></RutaProtegida>} />
          <Route path="/panel/rifas" element={<RutaProtegida><RifasAdmin /></RutaProtegida>} />
          <Route path="/panel/transacciones" element={<RutaProtegida><PanelTransacciones /></RutaProtegida>} />
          <Route path="/panel/buscador-boletos" element={<RutaProtegida><BuscadorBoletos /></RutaProtegida>} />
          <Route path="/panel/links-referidos" element={<RutaProtegida><ConfiguracionReferidosAdmin /></RutaProtegida>} />
          <Route path="/panel/simular-caja-sorpresa" element={<RutaProtegida><SimuladorCajasSorpresa /></RutaProtegida>} />
          <Route path="/caja3D" element={<Caja3D />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
