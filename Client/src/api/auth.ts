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

export const fileUpload = (imgUrl: string, token: string) => {
    try{
        const response = api.post('/users/scan', {imageUrl: imgUrl}, {headers: {Authorization: `Bearer ${token}`}})
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

export const getDocuments = async (token: string | null) => {
    try{
        const response = api.post('/documents', {}, {headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`}} );
        console.log(response);
        return response
    }catch(err) {
        console.log(err);
    }
}