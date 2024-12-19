import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

// Mock data para probar
const mockOrganismos = [
  {
    ID_Organismo: 1,
    Sucursal_Bapro: 'Sucursal Quilmes',
    Nombre: 'MUNICIPALIDAD DE QUILMES',
    Cuit: '33999001643',
    Direccion_Calle: 'Av. Hipólito Yrigoyen',
    Direccion_Numero: '1234',
    Direccion_Localidad: 'Quilmes',
    Dirección_Código_Postal: '1878',
  },
  {
    ID_Organismo: 2,
    Sucursal_Bapro: 'Sucursal Avellaneda',
    Nombre: 'MUNICIPALIDAD DE AVELLANEDA',
    Cuit: '33999001567',
    Direccion_Calle: 'Calle Mitre',
    Direccion_Numero: '5678',
    Direccion_Localidad: 'Avellaneda',
    Dirección_Código_Postal: '1870',
  },
  {
    ID_Organismo: 3,
    Sucursal_Bapro: 'Sucursal Almirante Brown',
    Nombre: 'MUNICIPALIDAD DE ALMIRANTE BROWN',
    Cuit: '33999001489',
    Direccion_Calle: 'Calle Brown',
    Direccion_Numero: '9101',
    Direccion_Localidad: 'Almirante Brown',
    Dirección_Código_Postal: '1856',
  },
];

interface Organismo {
  ID_Organismo: number;
  Sucursal_Bapro: string;
  Nombre: string;
  Cuit: string;
  Direccion_Calle: string;
  Direccion_Numero: string;
  Direccion_Localidad: string;
  Dirección_Código_Postal: string;
}

const initialOrganismo: Organismo = {
  ID_Organismo: 0,
  Sucursal_Bapro: '',
  Nombre: '',
  Cuit: '',
  Direccion_Calle: '',
  Direccion_Numero: '',
  Direccion_Localidad: '',
  Dirección_Código_Postal: '',
};

const OrganismoManagement = () => {
  const [organismos, setOrganismos] = useState<Organismo[]>([]);
  const [currentOrganismo, setCurrentOrganismo] = useState<Organismo>(initialOrganismo);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Organismo>>({});

  useEffect(() => {
    // Cargar los datos de prueba al montar el componente
    setOrganismos(mockOrganismos);
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<Organismo> = {};

    if (!currentOrganismo.Sucursal_Bapro) {
      errors.Sucursal_Bapro = 'Sucursal es obligatoria';
    }

    if (!currentOrganismo.Nombre) {
      errors.Nombre = 'Nombre es obligatorio';
    }

    if (!currentOrganismo.Cuit) {
      errors.Cuit = 'CUIT es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isEditing) {
        setOrganismos((prevOrganismos) =>
          prevOrganismos.map((org) =>
            org.ID_Organismo === currentOrganismo.ID_Organismo ? currentOrganismo : org
          )
        );
      } else {
        const newOrganismo = { ...currentOrganismo, ID_Organismo: Date.now() };
        setOrganismos((prevOrganismos) => [...prevOrganismos, newOrganismo]);
      }
      resetForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentOrganismo({ ...currentOrganismo, [name]: value });
  };

  const handleEdit = (organismo: Organismo) => {
    setCurrentOrganismo(organismo);
    setIsEditing(true);
  };

  const handleDelete = (id: number) => {
    setOrganismos((prevOrganismos) =>
      prevOrganismos.filter((organismo) => organismo.ID_Organismo !== id)
    );
  };

  const resetForm = () => {
    setCurrentOrganismo(initialOrganismo);
    setIsEditing(false);
    setFormErrors({});
  };

  return (
    <div className="tailwind-scope container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Administración de Usuarios</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          
          <h2 className="text-2xl font-bold mb-4"> Datos del organismo </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <input
              type="text"
              name="Nombre"
              value={currentOrganismo.Nombre}
              onChange={handleInputChange}
              placeholder="Nombre de la organización"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <input
              type="number"
              name="Sucursal_Bapro"
              value={currentOrganismo.Sucursal_Bapro}
              onChange={handleInputChange}
              placeholder="Número Sucursal Bapro"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Sucursal_Bapro && <p className="text-red-500 text-xs italic">{formErrors.Sucursal_Bapro}</p>}
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
              name="Direccion_Calle"
              value={currentOrganismo.Direccion_Calle}
              onChange={handleInputChange}
              placeholder="Calle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Direccion_Calle && <p className="text-red-500 text-xs italic">{formErrors.Direccion_Calle}</p>}
          </div>

          <div>
            <input
              type="number"
              name="Direccion_Numero"
              value={currentOrganismo.Direccion_Numero}
              onChange={handleInputChange}
              placeholder="Número de Calle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Direccion_Numero && <p className="text-red-500 text-xs italic">{formErrors.Direccion_Numero}</p>}
          </div>
          <div>
            <input
              type="text"
              name="Direccion_Localidad"
              value={currentOrganismo.Direccion_Localidad}
              onChange={handleInputChange}
              placeholder="Localidad"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Direccion_Localidad && <p className="text-red-500 text-xs italic">{formErrors.Direccion_Localidad}</p>}
          </div>
          <div>
            <input
              type="number"
              name="Dirección_Código_Postal"
              value={currentOrganismo.Dirección_Código_Postal}
              onChange={handleInputChange}
              placeholder="Código Postal"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Dirección_Código_Postal && <p className="text-red-500 text-xs italic">{formErrors.Dirección_Código_Postal}</p>}
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
      <th className="border p-2">Nombre</th>
      <th className="border p-2">Cuit</th>
      <th className="border p-2">Sucursal Bapto</th>
      <th className="border p-2">Codigo postal</th>
      <th className="border p-2">Localidad</th>
      <th className="border p-2">Acciones</th>
    </tr>
  </thead>
  
  <tbody>
    {organismos.map(organismo => (
      <tr key={organismo.ID_Organismo} className="hover:bg-gray-100">
        <td className="border p-2">{organismo.Nombre}</td>
        <td className="border p-2">{organismo.Cuit}</td>
        <td className="border p-2">{organismo.Sucursal_Bapro}</td>
        <td className="border p-2">{organismo.Dirección_Código_Postal}</td>
        <td className="border p-2">{organismo.Direccion_Localidad}</td>
        <td className="border p-2">
          <button
            onClick={() => handleEdit(organismo)}
            className="text-black-500 hover:text-black-700 mr-2"
            aria-label="Edit organismo"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={() => handleDelete(organismo.ID_Organismo)}
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

export default OrganismoManagement;
