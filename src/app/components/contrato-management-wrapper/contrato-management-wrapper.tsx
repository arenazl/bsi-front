import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';

interface Contrato {
  id_contrato: number;
  rotulo: string;
  ente?: string;
  cbu: string;
  modalidadId: number;
  organismoId: number;
}

interface Organismo {
  ID_Organismo: number;
  Nombre: string;
  CUIT: string;
}

interface Modalidad {
  Id_Modalidad: number;
  Modalidad: string;
  Texto_Boton: string;
  requiere_ente?: boolean;
}

interface ModalidadFormData {
  rotulo: string;
  ente: string;
  cuenta_debito: string;
}

interface Props {
  getUsers: () => Promise<Contrato[]>;
  createUser: (user: Contrato) => Promise<Contrato>;
  updateUser: (id: number, user: Contrato) => Promise<Contrato>;
  deleteUser: (id: number) => Promise<void>;
  showAlert: (message: string, type: 'success' | 'error') => void;
  postSelectGenericSP: (payload: any) => Promise<any>;
  postInsertGenericSP?: (payload: any) => Promise<any>;
}

export default function ContratoManagement({ getUsers, createUser, updateUser, deleteUser, showAlert, postSelectGenericSP, postInsertGenericSP }: Props) {

  const [organismos, setOrganismos] = useState<Organismo[]>([]);
  const [modalidades, setModalidades] = useState<Modalidad[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [organismoSeleccionado, setOrganismoSeleccionado] = useState<number>(0);
  const [modalidadForms, setModalidadForms] = useState<Record<number, ModalidadFormData>>({});
  const [formErrors, setFormErrors] = useState<Record<number, { rotulo?: string; cuenta_debito?: string; ente?: string }>>({});

  // Cargar organismos desde el SP
  const loadOrganismos = useCallback(async () => {
    try {
      const payload = {
        sp_name: "ORGANISMO_OBTENER_LISTA",
        body: {}
      };

      const response = await postSelectGenericSP(payload);
      
      if (response.estado === 1) {
        setOrganismos(response.data);
        console.log('Organismos cargados:', response.descripcion);
      } else {
        console.error('Error cargando organismos:', response.descripcion);
        setOrganismos([]);
        showAlert('Error al cargar organismos', 'error');
      }
    } catch (error) {
      console.error('Error al cargar organismos:', error);
      setOrganismos([]);
      showAlert('Error al cargar organismos', 'error');
    }
  }, [postSelectGenericSP, showAlert]);

  // Cargar modalidades desde el SP
  const loadModalidades = useCallback(async () => {
    try {
      const payload = {
        sp_name: "GetModalidades",
        body: {}
      };

      const response = await postSelectGenericSP(payload);
      
      if (response.estado === 1) {
        console.log('Datos modalidades raw:', response.data);
        setModalidades(response.data);
        // Inicializar formularios para cada modalidad
        const initialForms: Record<number, ModalidadFormData> = {};
        response.data.forEach((modalidad: any) => {
          console.log('Modalidad individual:', modalidad);
          const modalidadId = modalidad.Id_Modalidad || modalidad.id_modalidad || modalidad.ID_Modalidad;
          initialForms[modalidadId] = {
            rotulo: '',
            ente: '',
            cuenta_debito: ''
          };
        });
        setModalidadForms(initialForms);
        console.log('Modalidades cargadas:', response.descripcion);
      } else {
        console.error('Error cargando modalidades:', response.descripcion);
        setModalidades([]);
        showAlert('Error al cargar modalidades', 'error');
      }
    } catch (error) {
      console.error('Error al cargar modalidades:', error);
      setModalidades([]);
      showAlert('Error al cargar modalidades', 'error');
    }
  }, [postSelectGenericSP, showAlert]);

  // Cargar contratos al montar el componente
  const fetchContratos = useCallback(async () => {
    try {
      const fetchedContratos = await getUsers();
      setContratos(fetchedContratos);
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      showAlert('Error al cargar contratos', 'error');
    }
  }, [getUsers, showAlert]);

  useEffect(() => {
    loadOrganismos();
    loadModalidades();
    fetchContratos();
  }, [loadOrganismos, loadModalidades, fetchContratos]);

  // Manejar cambios en formularios de modalidades
  const handleModalidadInputChange = (modalidadId: number, field: keyof ModalidadFormData, value: string) => {
    setModalidadForms(prev => ({
      ...prev,
      [modalidadId]: {
        ...prev[modalidadId],
        [field]: value
      }
    }));

    // Limpiar errores al escribir
    setFormErrors(prev => ({
      ...prev,
      [modalidadId]: {
        ...prev[modalidadId],
        [field]: undefined
      }
    }));
  };

  // Validar todos los formularios
  const validateAllForms = (): boolean => {
    if (!organismoSeleccionado) {
      showAlert('Debe seleccionar un organismo primero', 'error');
      return false;
    }

    let hasErrors = false;
    const allErrors: Record<number, { rotulo?: string; cuenta_debito?: string; ente?: string }> = {};

    modalidades.forEach(modalidad => {
      const formData = modalidadForms[modalidad.Id_Modalidad];
      if (!formData) return;

      const errors: { rotulo?: string; cuenta_debito?: string; ente?: string } = {};
      
      if (formData.rotulo && !formData.rotulo.trim()) errors.rotulo = 'Rótulo es obligatorio';
      if (formData.cuenta_debito && !formData.cuenta_debito.trim()) errors.cuenta_debito = 'Cuenta Débito es obligatorio';
      if (modalidad.requiere_ente && formData.ente && !formData.ente.trim()) errors.ente = 'Ente es obligatorio';

      if (Object.keys(errors).length > 0) {
        allErrors[modalidad.Id_Modalidad] = errors;
        hasErrors = true;
      }
    });

    setFormErrors(allErrors);
    return !hasErrors;
  };

  // Guardar todos los contratos
  const handleSaveAll = async () => {
    if (!validateAllForms()) return;

    if (!postInsertGenericSP) {
      showAlert('La función postInsertGenericSP no está disponible', 'error');
      return;
    }

    try {
      const contratoData = {
        ID_Organismo: organismoSeleccionado,
        modalidades: modalidades
          .filter(modalidad => {
            const formData = modalidadForms[modalidad.Id_Modalidad];
            return formData && (formData.rotulo.trim() || formData.cuenta_debito.trim() || formData.ente.trim());
          })
          .map(modalidad => {
            const formData = modalidadForms[modalidad.Id_Modalidad];
            return {
              id_modalidad: modalidad.Id_Modalidad,
              rotulo: formData.rotulo.trim(),
              cuenta_debito: formData.cuenta_debito.trim(),
              ente: formData.ente.trim()
            };
          })
      };

      // Usar postInsertGenericSP para insertar los contratos
      const payload = {
        sp_name: "InsertContratos",
        body: contratoData
      };

      console.log('Datos a guardar:', payload);
      
      const response = await postInsertGenericSP(payload);
      
      if (response.estado === 1) {
        showAlert('Contratos guardados exitosamente', 'success');
        await fetchContratos();
      } else {
        showAlert(response.descripcion || 'Error al guardar los contratos', 'error');
        return;
      }
      
      // Limpiar todos los formularios
      const clearedForms: Record<number, ModalidadFormData> = {};
      modalidades.forEach(modalidad => {
        clearedForms[modalidad.Id_Modalidad] = {
          rotulo: '',
          ente: '',
          cuenta_debito: ''
        };
      });
      setModalidadForms(clearedForms);
      
    } catch (error) {
      console.error('Error al guardar contratos:', error);
      showAlert('Error al guardar los contratos', 'error');
    }
  };

  return (
    <div className="col-md-8 offset-md-2">
      <div className="card">
        <div className="card-header pt-3 d-flex align-items-center">
          <button className="btn p-0 me-2" onClick={() => setOrganismoSeleccionado(0)}>
            <FontAwesomeIcon 
              icon={faArrowCircleLeft} 
              style={{fontSize: '170%', color: 'black', opacity: 0.7}}
            />
          </button>
          <h5 className="m-0">Administración de Contratos</h5>
        </div>
        <div className="card-body">

          {/* Selección de Organismo - Siempre visible */}
          <div className="mb-4">
            <h6 className="mb-3">Seleccionar Organismo</h6>
            <select
              value={organismoSeleccionado || ''}
              onChange={(e) => setOrganismoSeleccionado(parseInt(e.target.value))}
              className="form-control"
            >
              <option value="">-- Seleccione un organismo --</option>
              {organismos.map((organismo) => (
                <option key={organismo.ID_Organismo} value={organismo.ID_Organismo}>
                  {organismo.Nombre} ({organismo.CUIT})
                </option>
              ))}
            </select>
          </div>

          {/* Paneles de Modalidades */}
          {organismoSeleccionado > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {modalidades.map((modalidad) => {
                  const formData = modalidadForms[modalidad.Id_Modalidad] || { rotulo: '', ente: '', cuenta_debito: '' };
                  const errors = formErrors[modalidad.Id_Modalidad] || {};
                  
                  return (
                    <div key={`modalidad-${modalidad.Id_Modalidad}`} className="bg-white shadow-md rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-2 text-blue-600">{modalidad.Modalidad}</h3>
                      <p className="text-gray-600 text-sm mb-4">{modalidad.Texto_Boton}</p>
                      
                      {/* Rótulo */}
                      <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Rótulo:</label>
                        <input
                          type="text"
                          value={formData.rotulo}
                          onChange={(e) => handleModalidadInputChange(modalidad.Id_Modalidad, 'rotulo', e.target.value)}
                          className={`shadow border rounded w-full py-2 px-3 ${
                            errors.rotulo ? 'border-red-500' : ''
                          }`}
                          placeholder="Ingrese el rótulo"
                        />
                        {errors.rotulo && <p className="text-red-500 text-sm mt-1">{errors.rotulo}</p>}
                      </div>

                      {/* Ente */}
                      <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Ente:</label>
                        <input
                          type="text"
                          value={formData.ente}
                          onChange={(e) => handleModalidadInputChange(modalidad.Id_Modalidad, 'ente', e.target.value)}
                          className={`shadow border rounded w-full py-2 px-3 ${
                            errors.ente ? 'border-red-500' : ''
                          }`}
                          placeholder="Ingrese el ente"
                        />
                        {errors.ente && <p className="text-red-500 text-sm mt-1">{errors.ente}</p>}
                      </div>

                      {/* Cuenta Débito */}
                      <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Cuenta Débito:</label>
                        <input
                          type="text"
                          value={formData.cuenta_debito}
                          onChange={(e) => handleModalidadInputChange(modalidad.Id_Modalidad, 'cuenta_debito', e.target.value)}
                          className={`shadow border rounded w-full py-2 px-3 ${
                            errors.cuenta_debito ? 'border-red-500' : ''
                          }`}
                          placeholder="Ingrese la cuenta débito"
                        />
                        {errors.cuenta_debito && <p className="text-red-500 text-sm mt-1">{errors.cuenta_debito}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón Guardar único */}
              <div className="d-flex justify-content-center mt-4">
                <button
                  onClick={handleSaveAll}
                  className="btn btn-primary btn-lg px-5"
                  style={{fontSize: '18px'}}
                >
                  Guardar Contratos
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Tabla de Contratos Existentes */}
      {contratos.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mt-4">
          <h3 className="text-xl font-bold mb-4">Contratos Existentes</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Organismo</th>
                <th className="border p-2">Modalidad</th>
                <th className="border p-2">Rótulo</th>
                <th className="border p-2">Ente</th>
                <th className="border p-2">CBU</th>
                <th className="border p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((contrato, index) => (
                <tr key={`contrato-${contrato.id_contrato || index}`}>
                  <td className="border p-2">
                    {organismos.find((org) => org.ID_Organismo === contrato.organismoId)?.Nombre || 'Desconocido'}
                  </td>
                  <td className="border p-2">
                    {modalidades.find((mod) => mod.Id_Modalidad === contrato.modalidadId)?.Modalidad || 'Desconocido'}
                  </td>
                  <td className="border p-2">{contrato.rotulo}</td>
                  <td className="border p-2">{contrato.ente || '-'}</td>
                  <td className="border p-2">{contrato.cbu}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => {
                        deleteUser(contrato.id_contrato);
                        fetchContratos();
                      }}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Eliminar contrato"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
