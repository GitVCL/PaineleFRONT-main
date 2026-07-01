import { useState, useEffect } from 'react';
import { getUsuario } from '../../utils/usuario';
import api from '../../services/api';

export const AuthDebug = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [apiTest, setApiTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugAuth();
  }, []);

  const debugAuth = async () => {
    try {
      // 1. Check localStorage user data
      const localUser = getUsuario();
      console.log('🔍 LocalStorage User:', localUser);
      
      // 2. Test API with current token
      let apiResult = null;
      try {
        const response = await api.get('/api/debug/user-info');
        apiResult = {
          success: true,
          data: response.data
        };
        console.log('✅ API Debug Response:', response.data);
      } catch (error) {
        apiResult = {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status
        };
        console.log('❌ API Debug Error:', error.response?.data || error.message);
      }

      // 3. Test funcionarios endpoint specifically
      let funcionariosTest = null;
      try {
        const response = await api.get('/api/funcionarios');
        funcionariosTest = {
          success: true,
          data: response.data
        };
        console.log('✅ Funcionarios API Success:', response.data);
      } catch (error) {
        funcionariosTest = {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status
        };
        console.log('❌ Funcionarios API Error:', error.response?.data || error.message);
      }

      setUserInfo({
        localStorage: localUser,
        hasToken: !!localUser?.token,
        userType: localUser?.tipo,
        isPrincipal: localUser?.tipo === 'PRINCIPAL'
      });

      setApiTest({
        debugEndpoint: apiResult,
        funcionariosEndpoint: funcionariosTest
      });

    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading debug info...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      {/* User Info */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">User Information</h2>
        <div className="space-y-2">
          <p><strong>Has Token:</strong> {userInfo?.hasToken ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User Type:</strong> {userInfo?.userType || 'Not set'}</p>
          <p><strong>Is Principal:</strong> {userInfo?.isPrincipal ? '✅ Yes' : '❌ No'}</p>
          <details className="mt-3">
            <summary className="cursor-pointer font-medium">Full User Data</summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(userInfo?.localStorage, null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {/* API Tests */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">API Tests</h2>
        
        {/* Debug Endpoint */}
        <div className="mb-4">
          <h3 className="font-medium">Debug Endpoint (/api/debug/user-info)</h3>
          {apiTest?.debugEndpoint?.success ? (
            <div className="text-green-600">
              ✅ Success
              <details className="mt-2">
                <summary className="cursor-pointer">Response Data</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(apiTest.debugEndpoint.data, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-red-600">
              ❌ Failed (Status: {apiTest?.debugEndpoint?.status})
              <details className="mt-2">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(apiTest?.debugEndpoint?.error, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Funcionarios Endpoint */}
        <div className="mb-4">
          <h3 className="font-medium">Funcionarios Endpoint (/api/funcionarios)</h3>
          {apiTest?.funcionariosEndpoint?.success ? (
            <div className="text-green-600">
              ✅ Success
              <details className="mt-2">
                <summary className="cursor-pointer">Response Data</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(apiTest.funcionariosEndpoint.data, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-red-600">
              ❌ Failed (Status: {apiTest?.funcionariosEndpoint?.status})
              <details className="mt-2">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(apiTest?.funcionariosEndpoint?.error, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Recommendations</h2>
        <ul className="space-y-2">
          {!userInfo?.hasToken && (
            <li className="text-red-600">• No authentication token found. Please log in.</li>
          )}
          {!userInfo?.isPrincipal && userInfo?.userType && (
            <li className="text-red-600">• User type is "{userInfo.userType}" but "PRINCIPAL" is required for funcionarios access.</li>
          )}
          {apiTest?.funcionariosEndpoint?.status === 403 && (
            <li className="text-red-600">• 403 Forbidden error suggests authentication or authorization issue.</li>
          )}
          {apiTest?.funcionariosEndpoint?.status === 401 && (
            <li className="text-red-600">• 401 Unauthorized error suggests invalid or missing token.</li>
          )}
        </ul>
      </div>

      <button 
        onClick={debugAuth}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Debug Info
      </button>
    </div>
  );
};

export default AuthDebug;