import api from './axios';

export const getSignature = async () => {
    const response = await api.get('/signature');
    return response.data;
};

export const storeSignature = async (base64Image) => {
    const response = await api.post('/signature', { signature: base64Image });
    return response.data;
};

export const deleteSignature = async () => {
    const response = await api.delete('/signature');
    return response.data;
};
