import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

interface User {
  ID_USER: number;
  User_Name: string;
  Apellido: string;
  Nombre: string;
  Email: string;
  Telefono: string;
  Cargo_Funcion: string;
  Perfil: string;
  Cuil: string;
  Sexo: string;
  Fecha_nac: string;

  Nro_Suc_Bapro: string;
  Nombre_Org: string;
  Cuit: string;
  Calle: string;
  NumeroCalle: string;
  Localidad: string;
  Cod_postal: string;
  contratos: contrato[];
}

const TipoContrato = [
  'Haberes',
  'Beneficios',
  'Proveedores',
  'Judiciales',
  'Honorarios',
]

interface contrato {
  rotulo: string;
  ente: string;
  cbu: string; 
  tipoContrato: typeof TipoContrato;
  
}


const initialUser: User = {
  ID_USER: 0,
  User_Name: '',
  Apellido: '',
  Nombre: '',
  Email: '',
  Telefono: '',
  Cargo_Funcion: '',
  Perfil: '',
  Cuil: '',
  Sexo: '',
  Fecha_nac: '',

  Nro_Suc_Bapro: '',
  Nombre_Org: '',
  Cuit: '',
  Calle: '',
  NumeroCalle: '',
  Localidad: '',
  Cod_postal: '',
  contratos: [] as contrato[],
};

interface Props {
  getUsers: () => Promise<User[]>;
  createUser: (user: User) => Promise<User>;
  updateUser: (id: number, user: User) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  showAlert: (message: string, type: 'success' | 'error') => void; // Nueva prop
}

const puestosArgentina = [
  'Gerente General',
  'Gerente de Ventas',
  'Gerente de Marketing',
  'Gerente de Recursos Humanos',
  'Contador',
  'Abogado',
  'Ingeniero',
  'Médico',
  'Profesor',
  'Administrativo',
  'Técnico',
  'Operario',
  'Vendedor',
  'Recepcionista',
  'Analista de Sistemas',
  'Diseñador Gráfico',
  'Periodista',
  'Chef',
  'Arquitecto',
  'Psicólogo'
];

const Sexo = [
  'Masculino',
  'Femenino',
  'Otro',
]

export default function UserManagement({ getUsers, createUser, updateUser, deleteUser, showAlert}: Props) {
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<User>>({});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedUsers = await getUsers();
      //@ts-ignore
      setUsers(fetchedUsers.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<User> = {};

    
    if (!currentUser.User_Name.trim()) {
      errors.User_Name = 'Nombre usuario obligatorio';
    }
    
    if (!currentUser.Apellido.trim() || !/^[a-zA-Z\s]+$/.test(currentUser.Apellido)) {
      errors.Apellido = 'Apellido es obligatorio y solo puede contener letras';
    }
    
    if (!currentUser.Nombre.trim() || !/^[a-zA-Z\s]+$/.test(currentUser.Nombre)) {
      errors.Nombre = 'Nombre es obligatorio y solo puede contener letras';
    }
    
    if (!currentUser.Email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentUser.Email)) {
      errors.Email = 'Email es obligatorio';
    }
    
    if (!currentUser.Telefono.trim() || !/^\d+$/.test(currentUser.Telefono)) {
      errors.Telefono = 'Teléfono es obligatorio y solo puede contener números';
    }
    
    if (!currentUser.Cargo_Funcion) {
      errors.Cargo_Funcion = 'Posicion es obligatorio';
    }

    if (!currentUser.Cuil) {
      errors.Cuil = 'Cuil es obligatorio';
    }

    if (!currentUser.Sexo) {
      errors.Sexo = 'Sexo es obligatorio';
    }

    if (!currentUser.Fecha_nac) {
      errors.Fecha_nac = 'Fecha de nacimiento es obligatorio';
    }

    if (!currentUser.Nro_Suc_Bapro) {
      errors.Nro_Suc_Bapro = 'Número de sucursal es obligatorio';
    }

    if (!currentUser.Nombre_Org) {
      errors.Nombre_Org = 'Nombre de la organización es obligatorio';
    }

    if (!currentUser.Cuit) {
      errors.Cuit = 'Cuit es obligatorio';
    }

    if (!currentUser.Calle) {
      errors.Calle = 'Calle es obligatorio';
    }

    if (!currentUser.NumeroCalle) {
      errors.NumeroCalle = 'Número de calle es obligatorio';
    }

    if (!currentUser.Localidad) {
      errors.Localidad = 'Localidad es obligatorio';
    }

    if (!currentUser.Cod_postal) {
      errors.Cod_postal = 'Código postal es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentUser]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        let updatedUser: User;
        if (isEditing) {
          updatedUser = await updateUser(currentUser.ID_USER, currentUser);
          setUsers(prevUsers => prevUsers.map(user => user.ID_USER === updatedUser.ID_USER ? updatedUser : user));
        } else {
          updatedUser = await createUser(currentUser);
          setUsers(prevUsers => [...prevUsers, updatedUser]);
        }

        await fetchUsers();

        //resetForm();
        
        setError(null);
        
        showAlert(isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente', 'success');
      } catch (error) {
        console.error('Error al guardar el usuario:', error);
        setError('Hubo un error al guardar el usuario. Por favor, intente de nuevo.');
        showAlert('Hubo un error al guardar el usuario. Por favor, intente de nuevo.', 'error');
      }
    }
  }, [validateForm, isEditing, currentUser, updateUser, createUser, showAlert]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentUser({ ...currentUser, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };


  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    setFormErrors({});
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers(users.filter(user => user.ID_USER !== id));
      setError(null);
      showAlert('Usuario eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      setError('Hubo un error al eliminar el usuario. Por favor, intente de nuevo.');
    }
  };

  const resetForm = () => {
    setCurrentUser(initialUser);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="text-2xl font-bold mb-4">Datos del usuario </h2>
          <div>
          </div>
          <div>
            <input
              type="id"
              name="CodigoUsuario"
              value={currentUser.ID_USER}
              onChange={handleInputChange}
              placeholder="Codigo de usuario"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            {formErrors.ID_USER && <p className="text-red-500 text-xs italic">{formErrors.ID_USER}</p>}
          </div>
          <div>
            <input
              type="text"
              name="Usuario"
              value={currentUser.User_Name}
              onChange={handleInputChange}
              placeholder="Usuario"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
      
          </div>
          <div>
            <input
              type="text"
              name="Apellido"
              value={currentUser.Apellido}
              onChange={handleInputChange}
              placeholder="Apellido"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            {formErrors.Apellido && <p className="text-red-500 text-xs italic">{formErrors.Apellido}</p>}
          </div>
          <div>
            <input
              type="text"
              name="Nombre"
              value={currentUser.Nombre}
              onChange={handleInputChange}
              placeholder="Nombre"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            {formErrors.Nombre && <p className="text-red-500 text-xs italic">{formErrors.Nombre}</p>}
          </div>
          <div>
            <input
              type="email"
              name="Email"
              value={currentUser.Email}
              onChange={handleInputChange}
              placeholder="Email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            {formErrors.Email && <p className="text-red-500 text-xs italic">{formErrors.Email}</p>}
          </div>
          <div>
            <input
              type="number"
              name="Telefono"
              value={currentUser.Telefono}
              onChange={handleInputChange}
              placeholder="Teléfono"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            {formErrors.Telefono && <p className="text-red-500 text-xs italic">{formErrors.Telefono}</p>}
          </div>
          <div>
            <select
              name="Cargo_Funcion"
              value={currentUser.Cargo_Funcion}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Cargo / Función</option>
              {puestosArgentina.map((puesto, index) => (
                <option key={index} value={puesto}>{puesto}</option>
              ))}
            </select>
            {formErrors.Cargo_Funcion && <p className="text-red-500 text-xs italic">{formErrors.Cargo_Funcion}</p>}
          </div>
          <div>
            <input
              type="text"
              name="Perfil"
              value={currentUser.Perfil}
              onChange={handleInputChange}
              placeholder="Perfil"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Perfil && <p className="text-red-500 text-xs italic">{formErrors.Perfil}</p>}
          </div>
          <div>
            <select
              name="Sexo"
              value={currentUser.Sexo}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Seleccione Sexo</option>
              {Sexo.map(sexo => (
                <option key={sexo} value={sexo}>{sexo}</option>
              ))}
            </select>
            {formErrors.Sexo && <p className="text-red-500 text-xs italic">{formErrors.Sexo}</p>}
          </div>
          <div>
            <input
              type="date"
              name="Fecha_nac"
              value={currentUser.Fecha_nac.toString().split('T')[0]}
              onChange={handleInputChange}
              placeholder="Fecha de Nacimiento"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Fecha_nac && <p className="text-red-500 text-xs italic">{formErrors.Fecha_nac}</p>}
          </div>
          <div>
            <input
              type="number"
              name="Cuil"
              value={currentUser.Cuil}
              onChange={handleInputChange}
              placeholder="Cuil"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Cuil && <p className="text-red-500 text-xs italic">{formErrors.Cuil}</p>}
          </div>
        </div>

          <br />
          <br />
          <br />


          <h2 className="text-2xl font-bold mb-4"> Datos del organismo </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              name="Nro_Suc_Bapro"
              value={currentUser.Nro_Suc_Bapro}
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
              value={currentUser.Nombre_Org}
              onChange={handleInputChange}
              placeholder="Nombre de la organización"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <input
              type="number"
              name="Cuit"
              value={currentUser.Cuit}
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
              value={currentUser.Calle}
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
              value={currentUser.NumeroCalle}
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
              value={currentUser.Localidad}
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
              value={currentUser.Cod_postal}
              onChange={handleInputChange}
              placeholder="Código Postal"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.Cod_postal && <p className="text-red-500 text-xs italic">{formErrors.Cod_postal}</p>}
          </div>

        </div>

        <br />
        <br />

        <div className="container mt-4">
          <h2 className="text-2xl font-bold mb-4">Contratos bancarios</h2>

          <div className="row align-items-center mb-3">
            <div className="col-md-1">
              <label htmlFor="haberesRotulo" className="form-label">Haberes:</label>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="haberesRotulo"
                placeholder="Rótulo"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="haberesEnte"
                placeholder="Ente"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="haberesCbu"
                placeholder="CBU Débito"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
          </div>

          <div className="row align-items-center mb-3">
            <div className="col-md-1">
              <label htmlFor="beneficiosRotulo" className="form-label">Beneficios:</label>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="beneficiosRotulo"
                placeholder="Rótulo"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="beneficiosEnte"
                placeholder="Ente"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="beneficiosCbu"
                placeholder="CBU Débito"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
          </div>

          <div className="row align-items-center mb-3">
            <div className="col-md-1">
              <label htmlFor="proveedoresRotulo" className="form-label">Proveedores:</label>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="proveedoresRotulo"
                placeholder="Rótulo"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="proveedoresCbu"
                placeholder="CBU Débito"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
          </div>

          <div className="row align-items-center mb-3">
            <div className="col-md-1">
              <label htmlFor="judicialesRotulo" className="form-label">Judiciales:</label>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="judicialesRotulo"
                placeholder="Rótulo"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="judicialesCbu"
                placeholder="CBU Débito"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
          </div>


          <div className="row align-items-center mb-3">
            <div className="col-md-1">
              <label htmlFor="honorariosRotulo" className="form-label">Honorarios:</label>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="honorariosRotulo"
                placeholder="Rótulo"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="honorariosCbu"
                placeholder="CBU Débito"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              />
            </div>
          </div>
        </div>

        
        <div className="mt-4 flex items-center">
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          >
            <FontAwesomeIcon icon={isEditing ? faEdit : faPlus} className="mr-2" />
            {isEditing ? 'Update User' : 'Add User'}
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
    {users.map(user => (
      <tr key={user.ID_USER} className="hover:bg-gray-100">
        <td className="border p-2">{user.ID_USER}</td>
        <td className="border p-2">{user.User_Name}</td>
        <td className="border p-2">{`${user.Nombre} ${user.Apellido}`}</td>
        <td className="border p-2">{user.Email}</td>
        <td className="border p-2">{user.Telefono}</td>
        <td className="border p-2">{user.Cargo_Funcion}</td>
        <td className="border p-2">{user.Perfil}</td>
        <td className="border p-2">
          <button
            onClick={() => handleEdit(user)}
            className="text-black-500 hover:text-black-700 mr-2"
            aria-label="Edit user"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={() => handleDelete(user.ID_USER)}
            className="text-black-500 hover:text-black-700"
            aria-label="Delete user"
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