
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// New Auth Strategy: Refresh Token Flow (Acts as the User)
async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string) {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        const data = await response.json();
        if (!data.access_token) {
            throw new Error(`Google Refresh Token Error: ${JSON.stringify(data)}`);
        }
        return data.access_token;
    } catch (err: any) {
        throw new Error(`Auth Config Error: ${err.message}`);
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Parse Secrets
        // We now use OAuth credentials instead of Service Account
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');
        const folderId = Deno.env.get('DRIVE_TARGET_FOLDER_ID');

        // Fallback support for Service Account (if user hasn't updated yet, though it won't work for upload)
        // But we will enforce the new variables to ensure they fix it.
        if (!clientId || !clientSecret || !refreshToken || !folderId) {
            throw new Error('Missing Secrets. Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, DRIVE_TARGET_FOLDER_ID');
        }

        // 2. Parse Request
        let body;
        try {
            body = await req.json();
        } catch (e) {
            throw new Error(`Invalid Request Body: ${e.message}`);
        }

        const { action, payload } = body;

        // 3. Get Auth Token
        const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);

        // 4. Dispatch Action
        let result;

        if (action === 'list') {
            const query = `'${folderId}' in parents and trashed=false`;
            const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,size,mimeType,webViewLink,thumbnailLink,createdTime)&orderBy=createdTime desc`;

            const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
            const text = await res.text();

            if (!res.ok) throw new Error(`Drive List Failed (${res.status}): ${text}`);
            result = JSON.parse(text);
        }

        else if (action === 'upload') {
            const { name, base64, mimeType } = payload;

            // Resumable Upload
            const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Type': mimeType,
                    'X-Upload-Content-Length': String(atob(base64).length)
                },
                body: JSON.stringify({
                    name,
                    parents: [folderId],
                    mimeType
                })
            });

            if (!initRes.ok) {
                const err = await initRes.text();
                throw new Error(`Upload Init Failed (${initRes.status}): ${err}`);
            }

            const uploadUrl = initRes.headers.get('Location');
            if (!uploadUrl) throw new Error('No Upload Location Header from Drive.');

            // Convert Base64 to Uint8Array
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': mimeType,
                    'Content-Length': String(bytes.length)
                },
                body: bytes
            });

            const text = await uploadRes.text();
            if (!uploadRes.ok) {
                if (uploadRes.status !== 308) {
                    throw new Error(`Upload Put Failed (${uploadRes.status}): ${text}`);
                }
            }

            result = JSON.parse(text);
        }

        else if (action === 'delete') {
            const { fileId } = payload;
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!res.ok && res.status !== 404) {
                const text = await res.text();
                throw new Error(`Delete Failed (${res.status}): ${text}`);
            }
            result = { success: true };
        }

        else if (action === 'quota') {
            const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const text = await res.text();
            if (!res.ok) throw new Error(`Quota Failed (${res.status}): ${text}`);
            result = JSON.parse(text);
        }

        else {
            throw new Error(`Unknown Action: ${action}`);
        }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
