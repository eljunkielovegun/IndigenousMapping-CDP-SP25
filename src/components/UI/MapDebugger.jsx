import { useState, useEffect } from 'react';
import { MAPBOX_TOKEN } from '../../config/mapbox';

// Create a direct token for testing - you can replace this with a public token if needed
const DIRECT_TOKEN = 'pk.eyJ1Ijoic3R1ZGlvLW9ycGltZW50IiwiYSI6ImNtOTFxZGI1ZzAzdDEycnBzbHZhNHdvbHMifQ.4z6bo58xtenHNY2vwt39Gg';

// Don't use the public token since it appears to be revoked

export default function MapDebugger() {
  const [logs, setLogs] = useState([]);
  const [tokenValid, setTokenValid] = useState(null);
  const [activeToken, setActiveToken] = useState(MAPBOX_TOKEN);
  
  useEffect(() => {
    appendLog(`Environment token: ${MAPBOX_TOKEN}`);
    appendLog(`Direct token: ${DIRECT_TOKEN}`);
  }, []);
  
  const appendLog = (message) => {
    setLogs(prevLogs => [...prevLogs, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  const testMapboxToken = (token = activeToken) => {
    appendLog(`Testing Mapbox token: ${token.substring(0, 10)}...`);
    
    fetch(`https://api.mapbox.com/tokens/v2?access_token=${token}`)
      .then(response => {
        appendLog(`Token validation response: ${response.status}`);
        if (response.ok) {
          setTokenValid(true);
          appendLog('✅ Token is valid');
        } else {
          setTokenValid(false);
          appendLog('❌ Token validation failed with status: ' + response.status);
        }
        return response.json().catch(e => appendLog(`Error parsing response: ${e.message}`));
      })
      .then(data => {
        if (data) appendLog(`API Response: ${JSON.stringify(data)}`);
      })
      .catch(error => {
        setTokenValid(false);
        appendLog(`❌ Error testing token: ${error.message}`);
      });
  };
  
  const testStyle = (styleId = 'streets-v12', token = activeToken) => {
    appendLog(`Testing access to style: ${styleId} with token: ${token.substring(0, 10)}...`);
    
    fetch(`https://api.mapbox.com/styles/v1/mapbox/${styleId}?access_token=${token}`)
      .then(response => {
        appendLog(`Style API response status: ${response.status}`);
        if (response.ok) {
          appendLog('✅ Style API access successful');
        } else {
          appendLog('❌ Style API access failed with status: ' + response.status);
        }
        return response.json().catch(e => appendLog(`Error parsing response: ${e.message}`));
      })
      .then(data => {
        if (data) appendLog(`Style has ${data?.layers?.length || 0} layers`);
      })
      .catch(error => {
        appendLog(`❌ Error accessing style API: ${error.message}`);
      });
  };
  
  const testStyleWithOrigin = () => {
    appendLog('Testing style API with explicit origin...');
    
    const headers = new Headers({
      'Origin': window.location.origin,
    });
    
    fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${activeToken}`, { 
      headers,
      mode: 'cors'
    })
      .then(response => {
        appendLog(`Style API response status with origin header: ${response.status}`);
        return response.text();
      })
      .then(text => {
        appendLog(`Response length: ${text.length} chars`);
      })
      .catch(error => {
        appendLog(`❌ Error with origin: ${error.message}`);
      });
  };
  
  const testUsingDefaultToken = () => {
    appendLog('⚠️ Testing with environment token...');
    setActiveToken(MAPBOX_TOKEN);
    testMapboxToken(MAPBOX_TOKEN);
    testStyle('streets-v12', MAPBOX_TOKEN);
  };
  
  const testUsingDirectToken = () => {
    appendLog('⚠️ Testing with direct token...');
    setActiveToken(DIRECT_TOKEN);
    testMapboxToken(DIRECT_TOKEN);
    testStyle('streets-v12', DIRECT_TOKEN);
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  return (
    <div className="debug-container">
      <h3>Mapbox Debug Panel</h3>
      <div>
        <button className="debug-button" onClick={() => testMapboxToken()}>Test Current Token</button>
        <button className="debug-button" onClick={() => testStyle()}>Test Style</button>
        <button className="debug-button" onClick={testStyleWithOrigin}>Test with Origin</button>
        <button className="debug-button" onClick={testUsingDefaultToken}>Use Env Token</button>
        <button className="debug-button" onClick={testUsingDirectToken}>Use Direct Token</button>
        <button className="debug-button" onClick={clearLogs}>Clear</button>
      </div>
      <div>
        <p>Current Token: {activeToken.substring(0, 12)}... 
          <span style={{marginLeft: '10px'}}>
            {tokenValid === true ? '✅ Valid' : tokenValid === false ? '❌ Invalid' : '❓ Unknown'}
          </span>
        </p>
        <pre style={{ maxHeight: '200px', overflow: 'auto', marginTop: '10px', fontSize: '12px', background: '#f5f5f5', padding: '5px' }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}