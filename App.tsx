import React, { useState } from 'react';
import { Shield, Database, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, Upload, Trash2, Info, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface BackupDetails {
  duration: string;
  files: number;
  compression: string;
}

interface Backup {
  id: number;
  name: string;
  status: string;
  size: string;
  timestamp: Date;
  type: string;
  details?: BackupDetails;
}

// Mock data for backups
const backupData: Backup[] = [
  { id: 1, name: 'daily-backup-1', status: 'Completed', size: '2.5GB', timestamp: new Date('2024-03-10T10:00:00'), type: 'Full', details: { duration: '15m', files: 1250, compression: '65%' } },
  { id: 2, name: 'daily-backup-2', status: 'Failed', size: '2.3GB', timestamp: new Date('2024-03-09T10:00:00'), type: 'Full', details: { duration: '12m', files: 1100, compression: '62%' } },
  { id: 3, name: 'hourly-backup-1', status: 'In Progress', size: '1.2GB', timestamp: new Date('2024-03-10T09:00:00'), type: 'Incremental', details: { duration: '8m', files: 450, compression: '58%' } },
];

const backupStats = [
  { name: 'Successful', value: 45 },
  { name: 'Failed', value: 5 },
  { name: 'In Progress', value: 2 },
];

const storageData = [
  { name: 'Jan', size: 120 },
  { name: 'Feb', size: 150 },
  { name: 'Mar', size: 180 },
];

const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'Failed':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'In Progress':
      return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
    default:
      return null;
  }
};

function App() {
  const [selectedCluster, setSelectedCluster] = useState('production');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [backups, setBackups] = useState<Backup[]>(backupData);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  const simulateBackupCreation = async () => {
    const newBackup: Backup = {
      id: backups.length + 1,
      name: `backup-${new Date().getTime()}`,
      status: 'In Progress',
      size: '0GB',
      timestamp: new Date(),
      type: 'Full',
      details: {
        duration: '0m',
        files: 0,
        compression: '0%'
      }
    };

    setBackups([newBackup, ...backups]);
    setIsCreatingBackup(true);
    toast.loading('Creating new backup...', { id: 'backup-toast' });

    try {
      // Simulate backup process with progress updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackups(prev => prev.map(b => b.id === newBackup.id ? { ...b, size: '0.8GB', details: { ...b.details!, files: 400, duration: '5m', compression: '30%' } } : b));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackups(prev => prev.map(b => b.id === newBackup.id ? { ...b, size: '1.5GB', details: { ...b.details!, files: 800, duration: '10m', compression: '45%' } } : b));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const completedBackup: Backup = {
        ...newBackup,
        status: 'Completed',
        size: '2.1GB',
        details: {
          duration: '15m',
          files: 1200,
          compression: '60%'
        }
      };
      
      setBackups(prev => prev.map(backup => 
        backup.id === newBackup.id ? completedBackup : backup
      ));
      
      toast.success('Backup created successfully!', { id: 'backup-toast' });
    } catch (error) {
      const failedBackup = {
        ...newBackup,
        status: 'Failed',
      };
      
      setBackups(prev => prev.map(backup => 
        backup.id === newBackup.id ? failedBackup : backup
      ));
      
      toast.error('Failed to create backup', { id: 'backup-toast' });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleBackupCreate = () => {
    if (!isCreatingBackup) {
      simulateBackupCreation();
    }
  };

  const handleBackupRestore = () => {
    toast.loading('Restoring backup...', { id: 'restore-toast' });
    setTimeout(() => {
      toast.success('Backup restored successfully!', { id: 'restore-toast' });
    }, 2000);
  };

  const handleBackupDelete = (id: number) => {
    toast.loading('Deleting backup...', { id: `delete-${id}` });
    setTimeout(() => {
      setBackups(prev => prev.filter(backup => backup.id !== id));
      toast.success('Backup deleted successfully!', { id: `delete-${id}` });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Backup Details Modal */}
      <AnimatePresence>
        {selectedBackup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBackup(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Backup Details</h3>
                <button
                  onClick={() => setSelectedBackup(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{selectedBackup.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center">
                    {getStatusIcon(selectedBackup.status)}
                    <span className="ml-2 font-medium">{selectedBackup.status}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{selectedBackup.type}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Size</span>
                  <span className="font-medium">{selectedBackup.size}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{format(selectedBackup.timestamp, 'PPp')}</span>
                </div>
                {selectedBackup.details && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{selectedBackup.details.duration}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Files</span>
                      <span className="font-medium">{selectedBackup.details.files.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Compression</span>
                      <span className="font-medium">{selectedBackup.details.compression}</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">K8s Backup Dashboard</h1>
            </div>
            <div className="hidden md:block">
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="production">Production Cluster</option>
                <option value="staging">Staging Cluster</option>
                <option value="development">Development Cluster</option>
              </select>
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden py-4">
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="production">Production Cluster</option>
                <option value="staging">Staging Cluster</option>
                <option value="development">Development Cluster</option>
              </select>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Backups</p>
                <p className="text-2xl font-semibold text-gray-900">{backups.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Backup</p>
                <p className="text-2xl font-semibold text-gray-900">2h ago</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Failed Backups</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {backups.filter(b => b.status === 'Failed').length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Backup Status Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={backupStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {backupStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Backup Storage Trend</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="size" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Backup List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900">Recent Backups</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <motion.button 
                  onClick={handleBackupCreate}
                  disabled={isCreatingBackup}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto ${isCreatingBackup ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isCreatingBackup ? 'Creating...' : 'Create Backup'}
                </motion.button>
                <motion.button 
                  onClick={handleBackupRestore}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Restore
                </motion.button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {backups.map((backup) => (
                    <motion.tr
                      key={backup.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedBackup(backup)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{backup.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {getStatusIcon(backup.status)}
                          <span className="ml-2">{backup.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(backup.timestamp, 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <motion.button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBackupRestore();
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Download backup"
                          >
                            <Download className="h-5 w-5" />
                          </motion.button>
                          <motion.button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBackupDelete(backup.id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete backup"
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;