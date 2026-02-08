import api from "./axios.ts";

interface DocumentResponse {
    userId: string,
    imageUrl: string,
    markdownContent: string,
}

export const authenticateGoogle = () => {
    try {
        const response = api.post('/users/onboard');
        console.log(response);
        return response;
    }catch(err) {
        console.log(err);
    }
}

export const fileUpload = (imgUrl: string) => {
    try{
        const response = api.post('/users/scan');
        console.log(response);
        return response as DocumentResponse | any;
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