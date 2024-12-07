import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Contrato {
  id_contrato: number;
  rotulo: string;
  ente?: string;
  cbu: string;
  type: 'Haberes' | 'Beneficios' | 'Proveedores' | 'Judiciales' | 'Honorarios';
}

interface ContratoManagementProps {
  getContratos: () => Promise<Contrato[]>;
  createContrato: (contrato: Contrato) => Promise<Contrato>;
  updateContrato: (id_contrato: number, contrato: Contrato) => Promise<Contrato>;
  deleteContrato: (id_contrato: number) => Promise<void>;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

export default function ContratoManagement({
  getContratos,
  createContrato,
  updateContrato,
  deleteContrato,
  showAlert,
}: ContratoManagementProps) {

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para almacenar el contrato actual que se está editando
  const [currentContrato, setCurrentContrato] = useState<Contrato>({
    id_contrato: 0,
    rotulo: '',
    cbu: '',
    type: 'Haberes',
  });

  const [isEditing, setIsEditing] = useState(false);

  const [formErrors, setFormErrors] = useState<{ rotulo?: string; cbu?: string }>({});

  const fetchContratos = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedContratos = await getContratos();
      setContratos(fetchedContratos);
      setError(null);
    } catch (err) {
      setError('Failed to fetch contratos. Please try again later.');
      console.error('Error fetching contratos:', err);
    } finally {
      setLoading(false);
    }
  }, [getContratos]);

  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  const valid_contratoateForm = useCallback((): boolean => {
    const errors: { rotulo?: string; cbu?: string } = {};

    if (!currentContrato.rotulo) {
      errors.rotulo = 'Rotulo is required';
    }
    if (!currentContrato.cbu) {
      errors.cbu = 'CBU is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentContrato]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (valid_contratoateForm()) {
        try {
          let updatedContrato: Contrato;
          if (isEditing) {
            updatedContrato = await updateContrato(currentContrato.id_contrato, currentContrato);
            setContratos((prevContratos) =>
              prevContratos.map((contrato) => (contrato.id_contrato === updatedContrato.id_contrato ? updatedContrato : contrato))
            );
          } else {
            updatedContrato = await createContrato(currentContrato);
            setContratos((prevContratos) => [...prevContratos, updatedContrato]);
          }

          await fetchContratos(); 
          setError(null);
          showAlert(isEditing ? 'Contrato actualizado exitosamente' : 'Contrato creado exitosamente', 'success');
        } catch (error) {
          console.error('Error al guardar el contrato:', error);
          setError('Hubo un error al guardar el contrato. Por favor, intente de nuevo.');
          showAlert('Hubo un error al guardar el contrato. Por favor, intente de nuevo.', 'error');
        }
      }
    },
    [valid_contratoateForm, isEditing, currentContrato, updateContrato, createContrato, showAlert, fetchContratos]
  );

  // Función para manejar el cambio en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentContrato({ ...currentContrato, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  // Función para editar un contrato existente
  const handleEdit = (contrato: Contrato) => {
    setCurrentContrato(contrato);
    setIsEditing(true);
    setFormErrors({});
  };

  // Función para eliminar un contrato
  const handleDelete = async (id_contrato: number) => {
    try {
      await deleteContrato(id_contrato);
      setContratos((prevContratos) => prevContratos.filter((contrato) => contrato.id_contrato !== id_contrato));
      setError(null);
      showAlert('Organismo eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar el organismo:', error);
      setError('Hubo un error al eliminar el organismo. Por favor, intente de nuevo.');
      showAlert('Hubo un error al eliminar el organismo. Por favor, intente de nuevo.', 'error');
    }
  };

  // Función para restablecer el formulario
  const resetForm = () => {
    setCurrentContrato({
      id_contrato: 0,
      rotulo: '',
      cbu: '',
      type: 'Haberes',
    });
    setIsEditing(false);
    setFormErrors({});
  };

  // Renderizar el componente
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    

    <div className="tailwind-scope container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Administración de Contratos</h2>

      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Contratos bancarios</h2>

        <div className="mb-4">
          <label htmlFor="rotulo" className="block text-gray-700 font-bold mb-2">
            Rótulo:
          </label>
          <input
            type="text"
            id="rotulo"
            name="rotulo"
            value={currentContrato.rotulo}
            onChange={handleInputChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              formErrors.rotulo ? 'border-red-500' : ''
            }`}
            placeholder="Contrato Rótulo"
          />
          {formErrors.rotulo && <p className="text-red-500">{formErrors.rotulo}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="cbu" className="block text-gray-700 font-bold mb-2">
            CBU:
          </label>
          <input
            type="text"
            id="cbu"
            name="cbu"
            value={currentContrato.cbu}
            onChange={handleInputChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              formErrors.cbu ? 'border-red-500' : ''
            }`}
            placeholder="Contrato CBU"
          />
          {formErrors.cbu && <p className="text-red-500">{formErrors.cbu}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="type" className="block text-gray-700 font-bold mb-2">
            Contrato Type:
          </label>
          <select
            id="type"
            name="type"
            value={currentContrato.type}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="Haberes">Haberes</option>
            <option value="Beneficios">Beneficios</option>
            <option value="Proveedores">Proveedores</option>
            <option value="Judicialeses">Judicialeses</option>
            <option value="Honorarios">Honorarios</option>
          </select>
        </div>

        {currentContrato.type === 'Haberes' || currentContrato.type === 'Beneficios' ? (
          <div className="mb-4">
            <label htmlFor="ente" className="block text-gray-700 font-bold mb-2">
              Ente:
            </label>
            <input
              type="text"
              id="ente"
              name="ente"
              value={currentContrato.ente || ''}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Contrato Ente"
            />
          </div>
        ) : null}

        <div className="mt-4 flex items-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          >
            <FontAwesomeIcon icon={isEditing ? faEdit : faPlus} className="mr-2" />
            {isEditing ? 'Update Contrato' : 'Add Contrato'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2 flex items-center"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Rótulo</th>
              <th className="border p-2">Ente</th>
              <th className="border p-2">CBU</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map((contrato) => (
              <tr key={contrato.id_contrato}>
                <td className="border p-2">{contrato.id_contrato}</td>
                <td className="border p-2">{contrato.rotulo}</td>
                <td className="border p-2">{contrato.ente || '-'}</td>
                <td className="border p-2">{contrato.cbu}</td>
                <td className="border p-2">{contrato.type}</td>
                <td className="border p-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mr-2"
                    onClick={() => handleEdit(contrato)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleDelete(contrato.id_contrato)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}