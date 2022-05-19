import { createContext, ReactNode, useState } from "react";
import { api } from "../services/api";
import Router from 'next/router'
import { setCookie } from 'nookies'

type User = {
	email: string;
	permissions: string[];
	roles: string[];
}

type SignInCredentials = {
	email: string;
	password: string;
};

type AuthContextData = {
	signIn(credentials: SignInCredentials): Promise<void>;
	user: User;
	isAuthenticated: boolean;
};

type AuthProviderProps = {
	children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User>()
	const isAuthenticated = !!user;

	async function signIn({ email, password }: SignInCredentials) {//Sempre colocar try & catch quando for requisicoes de api
		try {
			const response = await api.post('sessions', {
				email,
				password,
			})

			const { token, refreshToken, permissions, roles } = response.data;

			setCookie(undefined, 'nextauth.token', token, {
				maxAge: 60 * 60 * 24 * 30, //? 30 dias
				path: '/' //? qualquer endereco da aplicacao vai ter acesso
			})

			setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
				maxAge: 60 * 60 * 24 * 30, //? 30 dias
				path: '/' //? qualquer endereco da aplicacao vai ter acesso
			})


			setUser({
				email,
				permissions,
				roles
			})

			Router.push('/dashboard')

		} catch (err) {
			console.log(err)
		}
	}

	return (
		<AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
			{children}
		</AuthContext.Provider>
	);
}
