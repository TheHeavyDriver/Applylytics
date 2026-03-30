export const API_URL = "http://localhost:5000";

export const createApplication = async (data: any) => {
    const res = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
        
    });
    return res.json();
};

    export const getApplications = async () => {
        const res = await fetch(`${API_URL}/applications`);
        return res.json();
    };