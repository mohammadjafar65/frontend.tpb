import axios from "axios";
const { REACT_APP_API_URL, REACT_APP_UPLOAD_API_URL } = process.env;

const BASE_URL = `${REACT_APP_API_URL}`;

export const getAllPackages = () => axios.get(`${BASE_URL}/packages`);
export const getPackageById = (id) => axios.get(`${BASE_URL}/packages/id/${id}`);
export const deletePackage = (id) => axios.delete(`${BASE_URL}/packages/delete/${id}`);