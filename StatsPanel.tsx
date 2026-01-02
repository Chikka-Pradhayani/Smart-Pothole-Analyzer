
import React from 'react';
import { DetectionResult, Severity, LocationData } from '../types';

interface Props {
  results: DetectionResult;
  location: LocationData | null;
}

const StatsPanel: React.FC<Props> = ({ results, location }) => {
  const counts = results.potholes.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-red-600 text-xs font-bold uppercase tracking-wider">Critical</p>
          <p className="text-3xl font-black text-red-700">{counts[Severity.HIGH] || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
          <p className="text-yellow-600 text-xs font-bold uppercase tracking-wider">Moderate</p>
          <p className="text-3xl font-black text-yellow-700">{counts[Severity.MEDIUM] || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Minor</p>
          <p className="text-3xl font-black text-green-700">{counts[Severity.LOW] || 0}</p>
        </div>
      </div>

      {location && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg mt-1 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-grow">
              <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Geotagged Location</p>
              {location.address && (
                <p className="text-sm font-bold text-blue-900 leading-tight mb-1">{location.address}</p>
              )}
              {location.latitude && location.longitude && (
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-blue-700">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                  <a 
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-blue-600 hover:underline underline-offset-2"
                  >
                    VIEW ON MAP
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-tight">AI Assessment Summary</h3>
        <p className="text-gray-600 text-sm leading-relaxed italic">
          "{results.summary}"
        </p>
      </div>

      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Confidence</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {results.potholes.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-500">#{idx + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${p.severity === Severity.HIGH ? 'bg-red-100 text-red-800' : 
                      p.severity === Severity.MEDIUM ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {p.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {Math.round(p.confidence * 100)}%
                </td>
              </tr>
            ))}
            {results.potholes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">No potholes detected.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsPanel;
