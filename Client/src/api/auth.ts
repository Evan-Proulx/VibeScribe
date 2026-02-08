import api from "./axios.ts";

export const authenticateGoogle = () => {
    try {
        const response = api.post('/users/onboard');
        console.log(response);
        return response;
    }catch(err) {
        console.log(err);
    }
}

export const getGeminiResponse = () => {
    try {
        const response = api.post('/users/gemini')
        console.log(response);
        return response;
    }catch(err) {
        console.log(err);
    }
}