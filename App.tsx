
import React, { useState } from 'react';
import Header from './components/Header';
import DetectionOverlay from './components/DetectionOverlay';
import StatsPanel from './components/StatsPanel';
import { analyzeImage, resolveLocation } from './services/geminiService';
import { AppState, LocationData } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    isAnalyzing: false,
    results: null,
    location: null,
    isLocating: false,
    error: null,
  });

  const [locationQuery, setLocationQuery] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setState(prev => ({ ...prev, error: "Please upload a valid image file." }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setState({
          image: e.target?.result as string,
          isAnalyzing: false,
          results: null,
          location: null,
          isLocating: false,
          error: null,
        });
        setLocationQuery('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = async () => {
    if (!state.image) return;
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      const results = await analyzeImage(state.image);
      setState(prev => ({ ...prev, results, isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message }));
    }
  };

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: "Geolocation not supported." }));
      return;
    }
    setState(prev => ({ ...prev, isLocating: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState(prev => ({ 
          ...prev, 
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
            address: "Current Device GPS"
          }, 
          isLocating: false 
        }));
      },
      (error) => {
        setState(prev => ({ ...prev, isLocating: false, error: "Location permission denied." }));
      }
    );
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;

    setState(prev => ({ ...prev, isLocating: true, error: null }));
    try {
      const location = await resolveLocation(locationQuery);
      setState(prev => ({ ...prev, location, isLocating: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLocating: false, error: err.message }));
    }
  };

  const reset = () => {
    setState({
      image: null,
      isAnalyzing: false,
      results: null,
      location: null,
      isLocating: false,
      error: null,
    });
    setLocationQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!state.image ? (
          <div className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed border-gray-300 rounded-3xl bg-white p-12 text-center transition-all hover:border-yellow-400 group">
            <div className="bg-yellow-50 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Road Image</h2>
            <p className="text-gray-500 mb-8 max-w-sm">Capture or upload a photo of the road surface to identify potholes.</p>
            <label className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">
              Choose File
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Visual Analysis
                </h2>
                <button onClick={reset} className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors">
                  Clear & New
                </button>
              </div>

              {!state.results ? (
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                  <img src={state.image} alt="Target" className="w-full h-auto block" />
                </div>
              ) : (
                <DetectionOverlay imageSrc={state.image} detections={state.results.potholes} />
              )}

              <div className="pt-4 space-y-4">
                {!state.results && !state.isAnalyzing && (
                  <button
                    onClick={handleDetect}
                    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-[0.98]"
                  >
                    RUN DETECTION SYSTEM
                  </button>
                )}
                {state.isAnalyzing && (
                  <div className="w-full bg-gray-100 text-gray-600 font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-3">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full" />
                    <span>AI ANALYZING...</span>
                  </div>
                )}
              </div>

              {state.error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-sm text-red-700 font-medium">
                  {state.error}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Location & Geotagging
                </h2>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <form onSubmit={handleManualSearch} className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Place or Address</label>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="e.g. London, Paris, or City Name"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                      />
                      <button 
                        type="submit"
                        disabled={state.isLocating || !locationQuery}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        Find
                      </button>
                    </div>
                  </form>

                  <div className="flex items-center space-x-4">
                    <div className="flex-grow h-px bg-gray-100" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">OR</span>
                    <div className="flex-grow h-px bg-gray-100" />
                  </div>

                  <button 
                    onClick={handleGetGPSLocation}
                    disabled={state.isLocating}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 bg-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Use Current GPS</span>
                  </button>
                </div>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Inspection Report
                </h2>
                {!state.results ? (
                  <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center">
                    <p className="text-gray-400 text-sm">Waiting for detection results...</p>
                  </div>
                ) : (
                  <StatsPanel results={state.results} location={state.location} />
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
