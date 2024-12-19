import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

interface Contrato {
  id_contrato: number;
  rotulo: string;
  ente?: string;
  cbu: string;
  type: 'Haberes' | 'Beneficios' | 'Proveedores' | 'Judiciales' | 'Honorarios';
  organismoId: number;
}

interface Organismo {
  id: number;
  name: string;
}

interface ContratoManagementProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

export default function ContratoManagement({ showAlert }: ContratoManagementProps) {
  const [organismos] = useState<Organismo[]>(
    Array.from({ length: 130 }, (_, i) => ({
      id: i + 1,
      name: `Organismo ${i + 1}`,
    }))
  );

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContrato, setCurrentContrato] = useState<Contrato>({
    id_contrato: 0,
    rotulo: '',
    cbu: '',
    type: 'Haberes',
    organismoId: 0,
  });

  const [formErrors, setFormErrors] = useState<{ rotulo?: string; cbu?: string; organismoId?: string }>({});

  const validateForm = (): boolean => {
    const errors: { rotulo?: string; cbu?: string; organismoId?: string } = {};
    if (!currentContrato.organismoId) errors.organismoId = 'Debe seleccionar un organismo';
    if (!currentContrato.rotulo) errors.rotulo = 'Rótulo es obligatorio';
    if (!currentContrato.cbu) errors.cbu = 'CBU es obligatorio';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const newContrato = { ...currentContrato, id_contrato: contratos.length + 1 };
      setContratos((prev) => [...prev, newContrato]);
      showAlert('Contrato agregado exitosamente', 'success');
      resetForm();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentContrato({ ...currentContrato, [name]: name === 'organismoId' ? parseInt(value) : value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleEdit = (contrato: Contrato) => {
    setCurrentContrato(contrato);
    setIsEditing(true);
    setFormErrors({});
  };

  const handleDelete = (id: number) => {
    setContratos((prevContratos) =>
      prevContratos.filter((contrato) => contrato.id_contrato !== id)
    );
  };

  const resetForm = () => {
    setCurrentContrato({
      id_contrato: 0,
      rotulo: '',
      cbu: '',
      type: 'Haberes',
      organismoId: 0,
    });
    setFormErrors({});
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Administración de Contratos</h2>

      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8">
        {/* Select Organismo */}
        <div className="mb-4">
          <label htmlFor="organismo" className="block text-gray-700 font-bold mb-2">
            Seleccionar Organismo:
          </label>
          <select
            id="organismo"
            name="organismoId"
            value={currentContrato.organismoId || ''}
            onChange={handleInputChange}
            className={`shadow border rounded w-full py-2 px-3 ${
              formErrors.organismoId ? 'border-red-500' : ''
            }`}
          >
            <option value="">-- Seleccione un organismo --</option>
            {organismos.map((organismo) => (
              <option key={organismo.id} value={organismo.id}>
                {organismo.name}
              </option>
            ))}
          </select>
          {formErrors.organismoId && <p className="text-red-500 text-sm">{formErrors.organismoId}</p>}
        </div>

        {/* Select Tipo Contrato */}
        <div className="mb-4">
          <label htmlFor="type" className="block text-gray-700 font-bold mb-2">
            Tipo de Contrato:
          </label>
          <select
            id="type"
            name="type"
            value={currentContrato.type}
            onChange={handleInputChange}
            className="shadow border rounded w-full py-2 px-3"
          >
            <option value="Haberes">Haberes</option>
            <option value="Beneficios">Beneficios</option>
            <option value="Proveedores">Proveedores</option>
            <option value="Judiciales">Judiciales</option>
            <option value="Honorarios">Honorarios</option>
          </select>
        </div>

        {/* Input Rótulo */}
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
            className={`shadow border rounded w-full py-2 px-3 ${
              formErrors.rotulo ? 'border-red-500' : ''
            }`}
          />
          {formErrors.rotulo && <p className="text-red-500 text-sm">{formErrors.rotulo}</p>}
        </div>

        {/* Input Ente (Opcional) */}
        {(currentContrato.type === 'Haberes' || currentContrato.type === 'Beneficios') && (
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
              className="shadow border rounded w-full py-2 px-3"
            />
          </div>
        )}

        {/* Input CBU */}
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
            className={`shadow border rounded w-full py-2 px-3 ${
              formErrors.cbu ? 'border-red-500' : ''
            }`}
          />
          {formErrors.cbu && <p className="text-red-500 text-sm">{formErrors.cbu}</p>}
        </div>

        {/* Botón de agregar */}
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Agregar Contrato
        </button>
      </form>

      {/* Tabla de Contratos */}
      <table className="w-full border-collapse bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Organismo</th>
            <th className="border p-2">Tipo</th>
            <th className="border p-2">Rótulo</th>
            <th className="border p-2">Ente</th>
            <th className="border p-2">CBU</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contratos.map((contrato) => (
            <tr key={contrato.id_contrato}>
              <td className="border p-2">
                {organismos.find((org) => org.id === contrato.organismoId)?.name || 'Desconocido'}
              </td>
              <td className="border p-2">{contrato.type}</td>
              <td className="border p-2">{contrato.rotulo}</td>
              <td className="border p-2">{contrato.ente || '-'}</td>
              <td className="border p-2">{contrato.cbu}</td>
              <td className="border p-2 flex space-x-2">
                <button
                  onClick={() => handleEdit(contrato)}
                  className="text-black-500 hover:text-black-700 mr-2"
                  aria-label="Edit contrato"
                >
                </button>
                <FontAwesomeIcon icon={faEdit} />
                <button
                  onClick={() => handleDelete(contrato.id_contrato)}
                  className="text-black-500 hover:text-black-700 mr-2"
                  aria-label="Edit contrato"
                >
                <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

