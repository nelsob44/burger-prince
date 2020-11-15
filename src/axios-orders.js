import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://burger-prince-81505.firebaseio.com/'
});

export default instance;