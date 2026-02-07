import axios from "axios";
const token = localStorage.getItem("token");
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 1000,
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token} },`

}});
// Authorization: `Bearer ${token}`
export default api;