import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LabelList } from 'recharts';

interface Props {
  showAlert: (message: string, type: 'success' | 'error') => void; // Nueva prop
}

  const municipios = [
    'Marcos Paz', 'Moreno', 'Luján', 'Chacabuco', 'Junín',
    'Pergamino', 'Chivilcoy', 'Mercedes', 'San Andrés de Giles', 'Zárate',
    'Campana', 'Escobar', 'Pilar', 'San Miguel', 'José C. Paz',
    'Malvinas Argentinas', 'Tigre', 'San Fernando', 'San Isidro', 'Vicente López',
    'La Matanza', 'Merlo', 'Morón', 'Hurlingham', 'Ituzaingó'
  ];
  

  const generateFictitiousData = (count: number): FictitiousData[] => {
    return Array.from({ length: count }, () => ({
      municipio: municipios[Math.floor(Math.random() * municipios.length)],
      year: Math.floor(Math.random() * 4) + 2020,
      month: Math.floor(Math.random() * 12) + 1,
      exito: Math.random() > 0.3,
      monto: Math.floor(Math.random() * 10000) + 1000,
    }));
  };

  interface MunicipioStat {
    total: number;
    exitos: number;
    fracasos: number;
    montoTotal: number;
  }
  
  interface ProcessedMunicipioData {
    municipio: string;
    ratioExito: number;
    ratioFracaso: number;
    casosExitosos: number;
    casosFracaso: number;
    montoTotal: number;
    cargasTotal: number;
  }


  interface FictitiousData {
    municipio: string;
    year: number;
    month: number;
    exito: boolean;
    monto: number;
  }
  

  const fictitiousData = generateFictitiousData(5000);
  
  
  const processData = (data: FictitiousData[]): ProcessedMunicipioData[] => {
    const municipioStats = data.reduce((acc, item) => {
      if (!acc[item.municipio]) {
        acc[item.municipio] = { total: 0, exitos: 0, fracasos: 0, montoTotal: 0 };
      }
      acc[item.municipio].total++;
      acc[item.municipio].montoTotal += item.monto;
      if (item.exito) {
        acc[item.municipio].exitos++;
      } else {
        acc[item.municipio].fracasos++;
      }
      return acc;
    }, {} as Record<string, MunicipioStat>);
  
    return Object.entries(municipioStats)
      .map(([municipio, stats]) => ({
        municipio,
        ratioExito: Number(((stats.exitos / stats.total) * 100).toFixed(2)),
        ratioFracaso: Number(((stats.fracasos / stats.total) * 100).toFixed(2)),
        casosExitosos: stats.exitos,
        casosFracaso: stats.fracasos,
        montoTotal: stats.montoTotal,
        cargasTotal: stats.total,
      }))
      .sort((a, b) => b.cargasTotal - a.cargasTotal);
  };
  
  const data = processData(fictitiousData);
  
  const usageByYear = fictitiousData.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = 0;
    }
    acc[item.year]++;
    return acc;
  }, {} as Record<number, number>);
  
  const usageData = Object.entries(usageByYear)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);
  
  const topMunicipios = data.slice(0, 5);
  

  const GRADIENTS = {
    exito: ['#4CAF50', '#81C784'],
    fracaso: ['#FF5722', '#FF8A65'],
    ratioExito: ['#4CAF50', '#81C784'],  // Mismo color que 'exito'
    ratioFracaso: ['#E91E63', '#F06292'],  // Nuevo color para 'ratioFracaso'
    casosExitosos: ['#2196F3', '#64B5F6'],
    casosFracaso: ['#FFC107', '#FFD54F'],
    usage: ['#9C27B0', '#BA68C8'],
  };

  
  const CustomBarShape = (props: any) => {
    const { fill, x, y, width, height } = props;
    if (x === undefined || y === undefined || width === undefined || height === undefined) {
      return null;
    }
    return (
      <g>
        <defs>
          <linearGradient id={`gradientBar${fill}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GRADIENTS[fill as keyof typeof GRADIENTS]?.[0] || '#000000'} />
            <stop offset="100%" stopColor={GRADIENTS[fill as keyof typeof GRADIENTS]?.[1] || '#000000'} />
          </linearGradient>
        </defs>
        <rect x={x} y={y} width={width} height={height} fill={`url(#gradientBar${fill})`} />
      </g>
    );
  };
  
  const CustomLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <ul className="flex justify-center items-center space-x-4">
        {payload.map((entry: any, index: number) => {
          if (!entry || !entry.dataKey) return null;
          return (
            <li key={`item-${index}`} className="flex items-center">
              <span
                className="w-4 h-4 mr-2 rounded"
                style={{
                  background: `linear-gradient(to bottom, ${GRADIENTS[entry.dataKey as keyof typeof GRADIENTS]?.[0] || '#000000'}, ${GRADIENTS[entry.dataKey as keyof typeof GRADIENTS]?.[1] || '#000000'})`,
                }}
              ></span>
              <span style={{
                background: `linear-gradient(to right, ${GRADIENTS[entry.dataKey as keyof typeof GRADIENTS]?.[0] || '#000000'}, ${GRADIENTS[entry.dataKey as keyof typeof GRADIENTS]?.[1] || '#000000'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {entry.value}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  
  export default function DashboardReact() 
  {
    if (!data || data.length === 0) {
      return <div>No hay datos disponibles</div>;
    }
  
    return (
      <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Dashboard de Estadísticas de Pagos por Municipio</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-center">Ratio de Éxito y Fracaso por Municipio (Top 10)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                
                <XAxis dataKey="municipio" angle={-45} textAnchor="end" interval={0} height={100} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />

                <Legend content={<CustomLegend />} />

                <Bar yAxisId="left" dataKey="ratioExito" name="Ratio Éxito (%)" shape={<CustomBarShape fill="ratioExito" />}>
                  <LabelList dataKey="ratioExito" position="top" formatter={(value: number) => `${value.toFixed(2)}%`} />
                </Bar>
                <Bar yAxisId="left" dataKey="ratioFracaso" name="Ratio Fracaso (%)" shape={<CustomBarShape fill="ratioFracaso" />}>
                  <LabelList dataKey="ratioFracaso" position="top" formatter={(value: number) => `${value.toFixed(2)}%`} />
                </Bar>                                    
                <Bar yAxisId="right" dataKey="casosExitosos" name="Casos Exitosos" shape={<CustomBarShape fill="casosExitosos" />}>
                  <LabelList dataKey="casosExitosos" position="top" />
                </Bar>
                <Bar yAxisId="right" dataKey="casosFracaso" name="Casos Fracaso" shape={<CustomBarShape fill="casosFracaso" />}>
                  <LabelList dataKey="casosFracaso" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-center">Cargas por Año</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Cantidad de Cargas" stroke={GRADIENTS.usage[0]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-center">Top 5 Municipios con Más Cargas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMunicipios} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="municipio" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cargasTotal" name="Cantidad de Cargas" shape={<CustomBarShape fill="usage" />}>
                  <LabelList dataKey="cargasTotal" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">Detalle de Estadísticas por Municipio</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">Municipio</th>
                  <th className="px-4 py-2">Ratio de Éxito</th>
                  <th className="px-4 py-2">Ratio de Fracaso</th>
                  <th className="px-4 py-2">Casos Exitosos</th>
                  <th className="px-4 py-2">Casos Fracaso</th>
                  <th className="px-4 py-2">Total Cargas</th>
                  <th className="px-4 py-2">Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                    <td className="border px-4 py-2">{item.municipio}</td>
                    <td className="border px-4 py-2">
                      <span style={{background: `linear-gradient(to right, ${GRADIENTS.exito[0]}, ${GRADIENTS.exito[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        {item.ratioExito.toFixed(2)}%
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <span style={{background: `linear-gradient(to right, ${GRADIENTS.fracaso[0]}, ${GRADIENTS.fracaso[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        {item.ratioFracaso.toFixed(2)}%
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <span style={{background: `linear-gradient(to right, ${GRADIENTS.casosExitosos[0]}, ${GRADIENTS.casosExitosos[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        {item.casosExitosos}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <span style={{background: `linear-gradient(to right, ${GRADIENTS.casosFracaso[0]}, ${GRADIENTS.casosFracaso[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        {item.casosFracaso}
                      </span>
                    </td>
                    <td className="border px-4 py-2">{item.cargasTotal}</td>
                    <td className="border px-4 py-2">${item.montoTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

}


