import api from './axios';

export const getStamp = async () => {
    const response = await api.get('/company/stamp');
    return response.data;
};

export const storeStamp = async (base64Image) => {
    const response = await api.post('/company/stamp', { stamp: base64Image });
    return response.data;
};

export const deleteStamp = async () => {
    const response = await api.delete('/company/stamp');
    return response.data;
};
