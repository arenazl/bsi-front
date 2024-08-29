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
}

const initialUser: User = {
  ID_USER: 0,
  User_Name: '',
  Apellido: '',
  Nombre: '',
  Email: '',
  Telefono: '',
  Cargo_Funcion: '',
  Perfil: ''
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
      setUsers(fetchedUsers);
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
      errors.User_Name = 'Username is required';
    }
    
    if (!currentUser.Apellido.trim() || !/^[a-zA-Z\s]+$/.test(currentUser.Apellido)) {
      errors.Apellido = 'Last name is required and must contain only letters';
    }
    
    if (!currentUser.Nombre.trim() || !/^[a-zA-Z\s]+$/.test(currentUser.Nombre)) {
      errors.Nombre = 'First name is required and must contain only letters';
    }
    
    if (!currentUser.Email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentUser.Email)) {
      errors.Email = 'Valid email is required';
    }
    
    if (!currentUser.Telefono.trim() || !/^\d+$/.test(currentUser.Telefono)) {
      errors.Telefono = 'Phone number is required and must contain only numbers';
    }
    
    if (!currentUser.Cargo_Funcion) {
      errors.Cargo_Funcion = 'Position is required';
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
          <div>
            <input
              type="text"
              name="User_Name"
              value={currentUser.User_Name}
              onChange={handleInputChange}
              placeholder="Username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            {formErrors.User_Name && <p className="text-red-500 text-xs italic">{formErrors.User_Name}</p>}
          </div>
          <div>
            <input
              type="text"
              name="Apellido"
              value={currentUser.Apellido}
              onChange={handleInputChange}
              placeholder="Last Name"
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
              placeholder="First Name"
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
              type="tel"
              name="Telefono"
              value={currentUser.Telefono}
              onChange={handleInputChange}
              placeholder="Phone"
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

              <option value="">Select Position</option>
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
              placeholder="Profile"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
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
      <th className="border p-2">Username</th>
      <th className="border p-2">Name</th>
      <th className="border p-2">Email</th>
      <th className="border p-2">Phone</th>
      <th className="border p-2">Position</th>
      <th className="border p-2">Profile</th>
      <th className="border p-2">Actions</th>
    </tr>
  </thead>
  
  <tbody>
    {users.map(user => (
      <tr key={user.ID_USER} className="hover:bg-gray-100">
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