import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Organismo {
  ID_ORGANISMO: number;
  Nro_Suc_Bapro: string;
  Nombre_Org: string;
  Cuit: string;
  Calle: string;
  NumeroCalle: string;
  Localidad: string;
  Cod_postal: string;
}

const initialOrganismo: Organismo = {
  ID_ORGANISMO: 0,
  Nro_Suc_Bapro: '',
  Nombre_Org: '',
  Cuit: '',
  Calle: '',
  NumeroCalle: '',
  Localidad: '',
  Cod_postal: '',
};

interface Props {
  getOrganismos: () => Promise<Organismo[]>;
  createOrganismo: (organismo: Organismo) => Promise<Organismo>;
  updateOrganismo: (id: number, organismo: Organismo) => Promise<Organismo>;
  deleteOrganismo: (id: number) => Promise<void>;
  showAlert: (message: string, type: 'success' | 'error') => void; // Nueva prop
}


export default function OrganismoManagement({ getOrganismos, createOrganismo, updateOrganismo, deleteOrganismo, showAlert}: Props) {
  
  const [organismos, setOrganismos] = useState<Organismo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOrganismo, setCurrentOrganismo] = useState<Organismo>(initialOrganismo);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Organismo>>({});

  const fetchOrganismos = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedOrganismos = await getOrganismos();
      setOrganismos(fetchedOrganismos);
      setError(null);
    } catch (err) {
      setError('Failed to fetch organismos. Please try again later.');
      console.error('Error fetching organismos:', err);
    } finally {
      setLoading(false);
    }
  }, [getOrganismos]);

  useEffect(() => {
    fetchOrganismos();
  }, [fetchOrganismos]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Organismo> = {};

    if (!currentOrganismo.Nro_Suc_Bapro) {
      errors.Nro_Suc_Bapro = 'Número de sucursal es obligatorio';
    }

    if (!currentOrganismo.Nombre_Org) {
      errors.Nombre_Org = 'Nombre de la organización es obligatorio';
    }

    if (!currentOrganismo.Cuit) {
      errors.Cuit = 'Cuit es obligatorio';
    }

    if (!currentOrganismo.Calle) {
      errors.Calle = 'Calle es obligatorio';
    }

    if (!currentOrganismo.NumeroCalle) {
      errors.NumeroCalle = 'Número de calle es obligatorio';
    }

    if (!currentOrganismo.Localidad) {
      errors.Localidad = 'Localidad es obligatorio';
    }

    if (!currentOrganismo.Cod_postal) {
      errors.Cod_postal = 'Código postal es obligatorio';
    }

    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentOrganismo]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        let updatedOrganismo: Organismo;
        if (isEditing) {
          updatedOrganismo = await updateOrganismo(currentOrganismo.ID_ORGANISMO, currentOrganismo);
          setOrganismos(prevOrganismos => prevOrganismos.map(organismo => organismo.ID_ORGANISMO === updatedOrganismo.ID_ORGANISMO ? updatedOrganismo : organismo));
        } else {
          updatedOrganismo = await createOrganismo(currentOrganismo);
          setOrganismos(prevOrganismos => [...prevOrganismos, updatedOrganismo]);
        }

        await fetchOrganismos();

        //resetForm();
        
        setError(null);
        
        showAlert(isEditing ? 'Contrato actualizado exitosamente' : 'Contrato creado exitosamente', 'success');
      } catch (error) {
        console.error('Error al guardar el contrato:', error);
        setError('Hubo un error al guardar el contrato. Por favor, intente de nuevo.');
        showAlert('Hubo un error al guardar el contrato. Por favor, intente de nuevo.', 'error');
      }
    }
  }, [validateForm, isEditing, currentOrganismo, updateOrganismo, createOrganismo, showAlert]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentOrganismo({ ...currentOrganismo, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };


  const handleEdit = (organismo: Organismo) => {
    setCurrentOrganismo(organismo);
    setIsEditing(true);
    setFormErrors({});
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOrganismo(id);
      setOrganismos(organismos.filter(organismo => organismo.ID_ORGANISMO !== id));
      setError(null);
      showAlert('Organismo eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar el organismo:', error);
      setError('Hubo un error al eliminar el organismo. Por favor, intente de nuevo.');
    }
  };

  const resetForm = () => {
    setCurrentOrganismo(initialOrganismo);
    setIsEditing(false);
    setFormErrors({});
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="tailwind-scope container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Administración de Usuarios</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          
          <h2 className="text-2xl font-bold mb-4"> Datos del organismo </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              name="Nro_Suc_Bapro"
              value={currentOrganismo.Nro_Suc_Bapro}
              onChange={handleInputChange}
              placeholder="Número Sucursal Bapro"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Nro_Suc_Bapro && <p className="text-red-500 text-xs italic">{formErrors.Nro_Suc_Bapro}</p>}
          </div>
          <div>
            <input
              type="text"
              name="Nombre_Org"
              value={currentOrganismo.Nombre_Org}
              onChange={handleInputChange}
              placeholder="Nombre de la organización"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <input
              type="number"
              name="Cuit"
              value={currentOrganismo.Cuit}
              onChange={handleInputChange}
              placeholder="Cuit"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Cuit && <p className="text-red-500 text-xs italic">{formErrors.Cuit}</p>}
          </div>
          <div>
            <input
              type="text"
              name="Calle"
              value={currentOrganismo.Calle}
              onChange={handleInputChange}
              placeholder="Calle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Calle && <p className="text-red-500 text-xs italic">{formErrors.Calle}</p>}
          </div>

          <div>
            <input
              type="number"
              name="NumeroCalle"
              value={currentOrganismo.NumeroCalle}
              onChange={handleInputChange}
              placeholder="Número de Calle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.NumeroCalle && <p className="text-red-500 text-xs italic">{formErrors.NumeroCalle}</p>}
          </div>
          <div>
            <input
              type="text"
              name="Localidad"
              value={currentOrganismo.Localidad}
              onChange={handleInputChange}
              placeholder="Localidad"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Localidad && <p className="text-red-500 text-xs italic">{formErrors.Localidad}</p>}
          </div>
          <div>
            <input
              type="number"
              name="Cod_postal"
              value={currentOrganismo.Cod_postal}
              onChange={handleInputChange}
              placeholder="Código Postal"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Cod_postal && <p className="text-red-500 text-xs italic">{formErrors.Cod_postal}</p>}
          </div>

        </div>

        
        <div className="mt-4 flex items-center">
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          >
            <FontAwesomeIcon icon={isEditing ? faEdit : faPlus} className="mr-2" />
            {isEditing ? 'Update Organismo' : 'Add Organismo'}
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
      <th className="border p-2">N° Usuario</th>
      <th className="border p-2">Usuario</th>
      <th className="border p-2">Nombre</th>
      <th className="border p-2">Email</th>
      <th className="border p-2">Teléfono</th>
      <th className="border p-2">Posición</th>
      <th className="border p-2">Perfil</th>
      <th className="border p-2">Acciones</th>
    </tr>
  </thead>
  
  <tbody>
    {organismos.map(organismo => (
      <tr key={organismo.ID_ORGANISMO} className="hover:bg-gray-100">
        <td className="border p-2">{organismo.Nombre_Org}</td>
        <td className="border p-2">{organismo.Cuit}</td>
        <td className="border p-2">{organismo.Nro_Suc_Bapro}</td>
        <td className="border p-2">{organismo.Calle}</td>
        <td className="border p-2">{organismo.NumeroCalle}</td>
        <td className="border p-2">{organismo.Cod_postal}</td>
        <td className="border p-2">{organismo.Localidad}</td>
        <td className="border p-2">
          <button
            onClick={() => handleEdit(organismo)}
            className="text-black-500 hover:text-black-700 mr-2"
            aria-label="Edit organismo"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={() => handleDelete(organismo.ID_ORGANISMO)}
            className="text-black-500 hover:text-black-700"
            aria-label="Delete organismo"
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