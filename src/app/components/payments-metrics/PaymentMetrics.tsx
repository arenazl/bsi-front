import React, { useState, useEffect } from 'react';

interface PaymentData {
  name: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

const paymentTypes = [
  'Pago de haberes',
  'Pago proveedores',
  'Pago de honorarios',
  'Pago beneficios',
  'Pago de embargos',
  'Pago de embargos otros bancos'
];

const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

const fetchData = (): Promise<PaymentData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = paymentTypes.map((type, index) => ({
        name: type,
        cantidad: Math.floor(Math.random() * 100) + 1,
        color: colors[index % colors.length]
      }));
      
      const maxCantidad = Math.max(...data.map(item => item.cantidad));
      
      resolve(data.map(item => ({
        ...item,
        porcentaje: (item.cantidad / maxCantidad) * 100
      })));
    }, 1000); // 2.5 seconds delay
  });
};

const PaymentProgressBar: React.FC<{ data: PaymentData }> = ({ data }) => {
  return (
    <div className="flex-1 min-w-[200px] p-2">
      <div className="bg-white shadow-md rounded-lg overflow-hidden h-full flex flex-col">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-medium leading-tight text-gray-900 truncate">{data.name}</h3>
        </div>
        <div className="p-4 flex-grow flex flex-col justify-center">
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full animate-progress-bar"
                style={{
                  width: `${data.porcentaje}%`,
                  backgroundColor: data.color
                }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold">{data.cantidad}</span>
            <span className="text-gray-600">({data.porcentaje.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PaymentMetrics: React.FC = () => {
  const [data, setData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData();
      setData(result);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Add global styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes progress-bar-animation {
        0% { width: 0; }
      }
      .animate-progress-bar {
        animation: progress-bar-animation 1s ease-out forwards;
      }
    `;
    document.head.appendChild(style);

    // Clean up function
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full mx-auto mt-8 px-4 text-center">
        <span className="text-1xl">Cargando estadísticas...</span>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mt-8 px-4">
      <div className="flex flex-wrap justify-center">
        {data.map((item, index) => (
          <PaymentProgressBar key={index} data={item} />
        ))}
      </div>
    </div>
  );
};