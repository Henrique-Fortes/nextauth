import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'

interface AxiosErrorResponse {
    code?: string;
}

let cookies = parseCookies()
let isRefreshing = false;
let failedRequestQueue = [];

export const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        Authorization: `Bearer ${cookies['nextauth.token']}`
    }
})

api.interceptors.response.use(response => {
    return response;
}, (error: AxiosError<AxiosErrorResponse>) => {
    if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {
            //renovar o token
            cookies = parseCookies();

            const { 'nextauth.refreshToken': refreshToken } = cookies;

            if (!isRefreshing) {
                isRefreshing = true;
                api.post('/refresh', {
                    refreshToken,
                }).then(response => {
                    const { token } = response.data;

                    setCookie(undefined, 'nextauth.token', token, {
                        maxAge: 60 * 60 * 24 * 30, //? 30 dias
                        path: '/' //? qualquer endereco da aplicacao vai ter acesso
                    })

                    setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
                        maxAge: 60 * 60 * 24 * 30, //? 30 dias
                        path: '/' //? qualquer endereco da aplicacao vai ter acesso
                    })

                    api.defaults.headers['Authorization'] = `Bearer ${token}`
                    return new Promise((resolve, reject) => {
                        failedRequestQueue.push({
                            onSuccess: (token: string) => {

                            },
                            onFailure: () => {

                            }
                        })
                    })

                })
            }

        } else {
            //deslogar o usuario

        }
    }

})